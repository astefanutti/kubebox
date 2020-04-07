'use strict';

const blessed      = require('blessed'),
      EventEmitter = require('events'),
      moment       = require('moment'),
      NavBar       = require('./navbar'),
      task         = require('../task'),
      util         = require('../util');

const { highlight, plain } = require('cli-highlight');
const { setLabel, spinner: { until } } = require('./ui');

const NORMAL = 'Normal';
const WARNING = 'Warning';
const LAST_SEEN = 'Last Seen';
const TYPE = 'Type';

class Events extends EventEmitter {

  constructor ({ client, debug, namespace, status }) {
    super();
    const cancellations = new task.Cancellations();

    const label = namespace ? `Events {grey-fg}[${namespace}]{/grey-fg}` : 'Events {grey-fg}[Cluster]{/grey-fg}';

    const columns = {
      'Namespace': -1,
      'Last Seen': -1,
      'Name'     : -1,
      'Type'     : -1,
      'Reason'   : -1,
    };

    let event_selected, events_list = [], page_info = {};
    let sortEvents = () => events_list.rows.sort((r1, r2) => r2.lastMoment.diff(r1.lastMoment));

    // TODO: add filtering
    const events_table = blessed.listtable({
      label         : label,
      top           : 1,
      width         : '100%',
      height        : '50%-1',
      border        : 'line',
      align         : 'left',
      keys          : true,
      tags          : true,
      mouse         : true,
      noCellBorders : true,
      scrollbar     : {
        ch    : ' ',
        style : { bg: 'white' },
        track : {
          style : { bg: 'grey' },
        },
      },
      style : {
        label  : { bold: true },
        border : { fg: 'white' },
        header : { fg: 'grey' },
        cell   : { fg: 'white', selected: { bg: 'blue' } },
      },
    });

    const event_details = blessed.box({
      label         : 'Event description{grey-fg} [PRESS ENTER]{/grey-fg}',
      top           : '50%',
      bottom        : '1',
      width         : '100%',
      border        : 'line',
      align         : 'left',
      keys          : true,
      tags          : true,
      mouse         : true,
      noCellBorders : true,
      scrollable    : true,
      scrollbar     : {
        ch    : ' ',
        style : { bg: 'white' },
        track : {
          style : { bg: 'grey' },
        },
      },
      style : {
        label  : { bold: true },
        border : { fg: 'white' },
        header : { fg: 'grey' },
        cell   : { fg: 'white', selected: { bg: 'blue' } },
      },
    });

    // work around to preserve selection and scrolling
    events_table.on('detach', () => {
      const { selected, childBase, childOffset } = events_table;
      events_table.once('attach', () => {
        events_table.select(selected);
        Object.assign(events_table, { childBase, childOffset });
        events_table.scrollTo(selected);
      });
    });

    events_table.on('select', (_, i) => {
      const event = events_table.rows[i].event;
      const { namespace, name, uid } = event.object.metadata;

      if (i === 0 || event_selected === uid) return;

      cancellations.run('events.selected');
      event_details.setContent('');
      event_details.resetScroll();
      event_selected = uid;

      const { promise, cancellation } = client.event(namespace, name).asYaml().get({ cancellable: true, rejectOnAbort: true });
      cancellations.add('events.selected', cancellation);
      until(promise)
        .do(event_details, setLabel).spin(s => `${s} Event`).fail(_ => 'Event')
        .succeed(_ => `Event {grey-fg}[${name}]{/grey-fg} {inverse}${event.cells[columns[TYPE]]}{/inverse}`)
        .cancel(c => cancellations.add('events.selected', c))
        .then(response => {
          const event = response.body.toString('utf8');
          event_details.setContent(highlight(event, { language: 'yaml', ignoreIllegals: true, theme: { string: plain } }));
        }).catch(error => {
          if (!error) return;
          debug.log(`{red-fg}Error fetching event ${namespace}/${name}{/red-fg}`);
          event_details.setContent(`{red-fg}${error.toString()}{/red-fg}`);
        });
    });

    this.on(NavBar.SelectEvent, ({ screen }) => {
      screen.append(events_table);
      screen.append(event_details);
      screen.append(status);
      events_table.focus();
      if (events_list.rows) {
        // the events have already been loaded
        refreshEventTimes(screen);
        const id = setInterval(refreshEventTimes, 1000, screen);
        cancellations.add('events.refreshEventTimes', () => clearInterval(id));
      }
    });

    this.on(NavBar.DeselectEvent, ({ screen, page }) => {
      cancellations.run('events.refreshEventTimes');
      page_info.new_events_count = 0;
      delete page_info.new_events_type;
      updatePageTitle(page);
      screen.render();
    });

    this.on(NavBar.RemoveEvent, (_) => {
      cancellations.run('events');
    });

    this.on(NavBar.AddEvent, ({ screen, page }) => {
      page_info.title = page.name;
      const { promise, cancellation } = client.events(namespace).limit(500).asTable().get({ cancellable: true });
      cancellations.add('events.list', cancellation);
      until(promise)
        .do(events_table, setLabel).spin(s => `${s} ${label}`).done(_ => `${label}`)
        .then(response => {
          events_list = JSON.parse(response.body.toString('utf8'));
          // TODO: display column description on mouseover!
          events_list.columnDefinitions.forEach((column, index) => {
            if (column.name in columns) {
              columns[column.name] = index;
            }
          });
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
          const { promise, cancellation } = client.events(namespace).asTable().watch(events_list.metadata.resourceVersion).get({ generator: function* () { return yield* watchEventChanges(screen, page) } });
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
        page.name = `${page_info.title} {${style}}(+${page_info.new_events_count}){/${style}}`;
      } else {
        page.name = `${page_info.title}`;
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
      let { selected, childBase, childOffset } = events_table;

      events_table.setData(events_list.rows.reduce((rows, event) => {
        const row = [
          event.object.metadata.namespace,
          util.formatDuration(moment.duration(now.diff(event.lastMoment))),
          ...Object.entries(columns).filter(([col, i]) => i >= 0 && col !== LAST_SEEN).map(([_, i]) => event.cells[i])
        ];
        row.event = event;
        highlightEvent(row);
        rows.push(row);
        return rows;
      }, [Object.keys(columns)]));

      // refresh count
      events_table.setLabel(`${label} (${events_table.rows.length - 1})`);
      // restore selection and scrolling
      events_table.select(selected);
      Object.assign(events_table, { childBase, childOffset });
      events_table.scrollTo(selected);
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
              page_info.new_events_count += change.object.rows.length;
              if (change.object.rows.find(row => row.cells[columns[TYPE]] === WARNING)) {
                page_info.new_events_type = WARNING;
              }
              events_list.rows.push(...change.object.rows);
              break;
            }
            case 'MODIFIED': {
              if (change.object.rows.find(row => row.cells[columns[TYPE]] === WARNING)) {
                page_info.new_events_type = WARNING;
              }
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
          updatePageTitle(page);
          screen.render();
        }
      } catch (e) {
        // TODO: handle timed out watch requests
        debug.log(`{red-fg}Error updating event table ${e.toString()}{/red-fg}`);
      }
    }

    function refreshEventTimes(screen) {
      // we may want to avoid recreating the whole table data
      updateEventsTable();
      screen.render();
    }

    function highlightEvent(event) {
      if (event[3] === WARNING) {
        event.forEach((e, i) => event[i] = `{yellow-fg}${e}{/yellow-fg}`);
      }
    }
  }
}

module.exports = Events;
