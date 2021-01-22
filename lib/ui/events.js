'use strict';

const blessed      = require('blessed'),
      EventEmitter = require('events'),
      moment       = require('moment'),
      os           = require('os'),
      task         = require('../task'),
      util         = require('../util');

const { AddEvent, SelectEvent, DeselectEvent, RemoveEvent } = require('./navbar');
const { highlight, plain } = require('cli-highlight');
const { focus: { focusIndicator }, spinner: { until } } = require('./ui');
const { newLineReader } = require('../generators');
const { scroll, throttle } = require('./blessed/scroll');

const isWebBrowser = os.platform() === 'browser';

const NORMAL = 'Normal';
const WARNING = 'Warning';
const LAST_SEEN = 'Last Seen';
const TYPE = 'Type';

class Events extends EventEmitter {

  constructor({ client, debug, status, namespace, involvedObject }) {
    super();
    const cancellations = new task.Cancellations();

    const columns = namespace
      ? involvedObject
        ? ['Last Seen', 'Type', 'Reason', 'Message']
        : ['Last Seen', 'Type', 'Reason', 'Object', 'Message']
      : ['Namespace', 'Last Seen', 'Type', 'Reason', 'Object', 'Message'];
    const typeColumn = columns.indexOf(TYPE);
    const lastSeenColumn = columns.indexOf(LAST_SEEN);
    const label = namespace
      ? involvedObject
        ? `Events {grey-fg}[${namespace}/${involvedObject.name}]{/grey-fg}`
        : `Events {grey-fg}[${namespace}]{/grey-fg}`
      : 'Events {grey-fg}[cluster]{/grey-fg}';

    let event_selected, events_list = [], page_info = { new_events_count: 0 };
    let sortEvents = () => events_list.rows.sort((r1, r2) => r2.lastMoment.diff(r1.lastMoment));

    // TODO: add filtering
    const events_table = blessed.with(focusIndicator, scroll, throttle).listtable({
      label  : label,
      top    : 1,
      width  : '100%',
      height : '50%-1',
      border : 'line',
      align  : 'left',
      keys   : true,
      tags   : true,
      mouse  : true,
      noCellBorders  : true,
      invertSelected : false,
      scrollbar : {
        ch    : ' ',
        style : { bg: 'white' },
        track : {
          style : { bg: 'grey' },
        },
      },
      style : {
        label  : { bold: true },
        header : { fg: 'grey' },
        cell   : { selected: { bold: true, fg: 'black', bg: 'white' } },
      },
    });

    const event_details = blessed.with(focusIndicator, scroll, throttle).box({
      label  : 'Event {grey-fg}[PRESS ENTER]{/grey-fg}',
      top    : '50%',
      bottom : '1',
      width  : '100%',
      border : 'line',
      align  : 'left',
      keys   : true,
      tags   : true,
      mouse  : true,
      noCellBorders : true,
      scrollable    : true,
      scrollbar : {
        ch    : ' ',
        style : { bg: 'white' },
        track : {
          style : { bg: 'grey' },
        },
      },
      style : {
        label : { bold: true },
      },
    });

    events_table.on('select', (_, i) => {
      const event = events_table.rows[i].event;
      const { namespace, name, uid } = event.object.metadata;

      if (i === 0 || event_selected === uid) return;

      cancellations.run('events.selected');
      event_details.setContent('');
      event_details.resetScroll();
      event_selected = uid;
      // just to update the table with the new selection
      updateEventsTable();
      events_table.screen.render();
      const { promise, cancellation } = client.event(namespace, name).asYaml().get({ cancellable: true, rejectOnAbort: true });
      cancellations.add('events.selected', cancellation);
      until(promise)
        .do(event_details, event_details.setLabel).spin(s => `${s} Event`).fail(_ => 'Event')
        .succeed(_ => `Event {grey-fg}[${name}]{/grey-fg} {inverse}${event.cells[columns[TYPE]]}{/inverse}`)
        .cancel(c => cancellations.add('events.selected', c))
        .then(response => {
          const event = response.body.toString('utf8');
          event_details.setContent(highlight(event, { language: 'yaml', ignoreIllegals: true, theme: { string: plain } }));
          event_details.screen.render();
        }).catch(error => {
          if (!error) return;
          debug.log(`{red-fg}Error fetching event ${namespace}/${name}{/red-fg}`);
          event_details.setContent(`{red-fg}${error.toString()}{/red-fg}`);
          event_details.screen.render();
        });
    });

    this.on(SelectEvent, ({ screen }) => {
      screen.append(events_table);
      screen.append(event_details);
      screen.append(status);
      if (events_list.rows) {
        updateEventsTable();
        // the events have already been loaded
        refreshEventTimes(screen);
        const id = setInterval(refreshEventTimes, 1000, screen);
        cancellations.add('events.refreshEventTimes', () => clearInterval(id));
      }
    });

    this.on(DeselectEvent, ({ screen, page }) => {
      cancellations.run('events.refreshEventTimes');
      page_info.new_events_count = 0;
      delete page_info.new_events_type;
      updatePageTitle(page);
      screen.render();
    });

    this.on(RemoveEvent, (_) => {
      cancellations.run('events');
    });

    this.on(AddEvent, ({ screen, page }) => {
      page.focus = events_table;
      page_info.title = page.title;
      let request = client.events(namespace).limit(500).asTable();
      if (involvedObject) {
        request = request.fieldSelector(`involvedObject.uid=${involvedObject.uid}`);
      }
      const { promise, cancellation } = request.get({ cancellable: true });
      cancellations.add('events.list', cancellation);
      until(promise)
        .do(events_table, events_table.setLabel).spin(s => `${s} ${label}`).done(_ => `${label}`)
        .then(response => {
          events_list = JSON.parse(response.body.toString('utf8'));
          // TODO: display column description on mouseover!
          columns.forEach(c => columns[c] = events_list.columnDefinitions.findIndex(def => def.name === c));
          const now = Date.now();
          events_list.rows.forEach(row => withLastMoment(row, now));
          sortEvents();
          updateEventsTable();
          if (events_table.detached) {
            page_info.new_events_count = events_list.rows.length;
            page_info.new_events_type = events_list.rows.find(row => row.cells[columns[TYPE]] === WARNING) ? WARNING : NORMAL;
            updatePageTitle(page);
          }
          screen.render();
          const id = setInterval(refreshEventTimes, 1000, screen);
          cancellations.add('events.refreshEventTimes', () => clearInterval(id));
          // it's not possible to request table output as headers cannot be provided to the WebSocket API in Web browsers
          let request = client.events(namespace).asTable().watch(events_list.metadata.resourceVersion, { websocket: !isWebBrowser });
          if (involvedObject) {
            request = request.fieldSelector(`involvedObject.uid=${involvedObject.uid}`);
          }
          let generator = function* () { return yield* watchEventChanges(screen, page) };
          if (isWebBrowser) {
            generator = function* () { return yield* newLineReader(function* () { return yield* watchEventChanges(screen, page) }) };
          }
          const { promise, cancellation } = request.get({ generator });
          cancellations.add('events.watch', cancellation);
          return promise;
        }).catch(error => {
          const msg = error.message || error.toString();
          debug.log(`{red-fg}Error creating events tab: ${msg}{/red-fg}`);
          events_table.setData([[`{red-fg}${msg}{/red-fg}`]]);
        });
    });

    function updatePageTitle(page) {
      if (page_info.new_events_count > 0) {
        const style = page_info.new_events_type === WARNING ? 'yellow-fg' : 'green-fg';
        page.title = `${page_info.title} {${style}}(+${page_info.new_events_count}){/${style}}`;
      } else {
        page.title = `${page_info.title}`;
      }
    }

    function substractFromMoment(moment, duration) {
      const regex = /(\d+)([d|m|s])/g;
      let d;
      while ((d = regex.exec(duration)) !== null) {
        const [, n, u] = d;
        moment.subtract(parseInt(n, 10), u);
      }
      return moment;
    }

    function withLastMoment(event, now) {
      event.lastMoment = event.cells[columns[LAST_SEEN]] === '<unknown>'
        ? moment(event.object.metadata.creationTimestamp)
        : substractFromMoment(moment(now), event.cells[columns[LAST_SEEN]]);
      return event;
    }

    function updateEventsTable() {
      const now = moment();
      const { selected, childBase, childOffset } = events_table;
      const selectedRow = events_table.rows[selected];

      events_table.setData(events_list.rows.reduce((rows, event) => {
        let row = [
          util.formatDuration(moment.duration(now.diff(event.lastMoment))),
          ...columns.filter(c => columns[c] >= 0 && c !== LAST_SEEN).map(c => event.cells[columns[c]]),
        ];
        if (!namespace) {
          row = [event.object.metadata.namespace, ...row];
        }
        row.event = event;
        highlightRow(row);
        rows.push(row);
        return rows;
      }, [columns.map(c => c.toUpperCase())]));

      // refresh count
      events_table.setLabel(`${label} (${events_table.rows.length - 1})`);
      // restore selection and scrolling
      if (selectedRow) {
        const index = events_table.rows.slice(1).findIndex(r => r.event.object.metadata.uid === selectedRow.event.object.metadata.uid) + 1;
        events_table.select(index);
        Object.assign(events_table, { childBase: childBase + (index - selected), childOffset });
        events_table.scrollTo(index);
      }
    }

    function* watchEventChanges(screen, page) {
      const index = object => events_list.rows.findIndex(e => e.object.metadata.uid === object.object.metadata.uid);
      try {
        let change;
        while (change = JSON.parse(yield)) {
          const now = Date.now();
          change.object.rows.forEach(row => withLastMoment(row, now));
          switch (change.type) {
            case 'ADDED': {
              events_list.rows.push(...change.object.rows);
              break;
            }
            case 'MODIFIED': {
              change.object.rows.forEach(row => events_list.rows[index(row)] = row);
              break;
            }
            case 'DELETED': {
              change.object.rows.forEach(row => {
                events_list.rows.splice(index(row), 1);
                // check if that's the selected event and clean up
                if (row.object.metadata.uid === event_selected) {
                  cancellations.run('events.selected');
                  event_details.setLabel(`Event {grey-fg}[${row.object.metadata.name}]{/grey-fg} {red-fg}DELETED{/red-fg}`);
                  event_selected = null;
                }
              });
              break;
            }
          }
          // let's rely on the native Node.js sorting implementation
          sortEvents();
          updateEventsTable();
          if (['ADDED', 'MODIFIED'].includes(change.type)) {
            page_info.new_events_count += change.object.rows.length;
            if (change.object.rows.find(row => row.cells[columns[TYPE]] === WARNING)) {
              page_info.new_events_type = WARNING;
            }
            updatePageTitle(page);
          }
          screen.render();
        }
      } catch (e) {
        // TODO: handle timed out watch requests
        debug.log(`{red-fg}Error updating event table ${e.toString()}{/red-fg}`);
      }
    }

    function refreshEventTimes(screen) {
      const now = moment();
      const height = events_table.height - events_table.iheight;

      for (let i = events_table.childBase || 1; i < events_table.childBase + height && i < events_table.rows.length; i++) {
        const row = events_table.rows[i];
        let since = util.formatDuration(moment.duration(now.diff(row.event.lastMoment)));
        if (row.event.object.metadata.uid === event_selected) {
          since = `{blue-fg}${since}{/blue-fg}`;
        } else if (row.event.cells[columns[TYPE]] === WARNING) {
          since = `{yellow-fg}${since}{/yellow-fg}`;
        }
        row[lastSeenColumn] = since;
        events_table.setRow(i, row);
      }

      screen.render();
    }

    function highlightRow(row) {
      if (row.event.object.metadata.uid === event_selected) {
        row.forEach((e, i) => row[i] = `{blue-fg}${e}{/blue-fg}`);
        if (row.event.cells[columns[TYPE]] === WARNING) {
          row[typeColumn] = `{yellow-bg}${row[typeColumn]}{/yellow-bg}`;
        }
      } else if (row.event.cells[columns[TYPE]] === WARNING) {
        row.forEach((e, i) => row[i] = `{yellow-fg}${e}{/yellow-fg}`);
      }
    }
  }
}

module.exports = Events;
