'use strict';

const blessed     = require('blessed'),
      moment      = require('moment'),
      { spinner } = require('./ui'),
      util        = require('../util');


class Events {
  constructor ({ screen, client, debug, cancellations, navbar, namespace }) {
    const key = namespace ? `Events {grey-fg}[${namespace}]{/grey-fg}` : 'Events {grey-fg}[Cluster]{/grey-fg}'; 
    const { until } = spinner(screen);
    // TODO: Add filtering
    const events_table = blessed.listtable({
      label         : key,
      parent        : screen,
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
        }
      },
      style : {
        label  : { bold: true },
        border : { fg: 'white' },
        header : { fg: 'grey' },
        cell   : { fg: 'white', selected: { bg: 'blue' } },
      }
    });
    const event_description = blessed.box({
      label         : 'Event description{grey-fg} [PRESS ENTER]{/grey-fg}',
      parent        : screen,
      top           : '50%',
      bottom        : '1',
      width         : '100%',
      height        : '50%-1',
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
        }
      },
      style : {
        label  : { bold: true },
        border : { fg: 'white' },
        header : { fg: 'grey' },
        cell   : { fg: 'white', selected: { bg: 'blue' } },
      }
    });


    // do not render when detached. 
    events_table._orender = events_table.render;
    events_table.render = function () {
      if (this.parent == null) {
        return;
      }  
      this._orender();
    };

    // work around to preserve selection and scrolling
    events_table.on('detach', () => {
      const { selected, childBase, childOffset } = events_table;
      events_table.once('attach', () => {
        events_table.select(selected);
        Object.assign(events_table, { childBase, childOffset });
        events_table.scrollTo(selected);
      });
    });

    events_table.on('key C-z', () => {
      cancellations.run(key);
      navbar.remove(key);
    });

    const { promise, cancellation } = client.events(namespace).get({ cancellable : true });
    cancellations.add(key, cancellation);
    until(promise)
    .spin(s => events_table.setLabel(`${s} ${key}`))
    .succeed(_ => events_table.setLabel(`${key}`))
    .then(response => {
      const events_list = JSON.parse(response.body.toString('utf8'));
      events_table.resource_version = events_list.metadata.resourceVersion;
      this.fill_events_table(events_list, events_table, cancellations, key);
    })
    .then(_ =>{
      const { promise, cancellation } = client.events(namespace)
      .watch(events_table.resource_version)
      .get({ generator: update_events_table.bind({ events_table, debug, highlightEvent })})
      cancellations.add(key, cancellation);
      return promise;
    }).catch(error => {
      debug.log(`{red-fg}Error creating Events tab: ${error}{/red-fg}`);
      if (error.response.statusCode == '403') {
        const unauthorized_msg = `{red-fg}It seems you don't have the rights to fetch ${key}. Please contact your Cluster administrator.{/red-fg}`;
        debug.log(unauthorized_msg);
        events_table.setData([[unauthorized_msg]]);
      }
    });

    events_table.on('select', (item, i) => {
      if (i === 0 || events_table.uid === events_table.rows[i].uid) return;
      this.describe_event(i);
    });

    this.describe_event = function(i) {
      event_description.setContent("");
      event_description.resetScroll();
      const namespace = events_table.rows[i].namespace;
      const name = events_table.rows[i].name;
      events_table.uid = events_table.rows[i].uid;
      const { promise, cancellation } = client.event(namespace, name).get({ cancellable : true });
      cancellations.add(key, cancellation);
      until(promise)
      .spin(s => event_description.setLabel(`${s} Event`))
      .succeed(_ => event_description.setLabel(`Event {grey-fg}[${name}]{/grey-fg} {inverse}${events_table.rows[i][4]}{/inverse}`))
      .then(response => {
        const events_description = response.body.toString('utf8');
        event_description.setContent(events_description);
      }).catch(error => {
        debug.log(`{red-fg}Error fetching Event ${name} in namespace ${namespace}`);
        event_description.setContent(error);
      });
    }

    this.convert_kube_duration_to_moment = function (kube_duration) {
      const creation_timestamp = moment();
      const years   = /(\d+)[yY]/g;
      const months  = /(\d+)M/g;
      const weeks   = /(\d+)[wW]/g;
      const days    = /(\d+)[dD]/g;
      const hours   = /(\d+)[hH]/g;
      const minutes = /(\d+)[m]/g;
      const seconds = /(\d+)[sS]/g;
      this.substact_time(creation_timestamp, years.exec(kube_duration), 'y');
      this.substact_time(creation_timestamp, months.exec(kube_duration), 'M');
      this.substact_time(creation_timestamp, weeks.exec(kube_duration), 'w');
      this.substact_time(creation_timestamp, days.exec(kube_duration), 'd');
      this.substact_time(creation_timestamp, hours.exec(kube_duration), 'h');
      this.substact_time(creation_timestamp, minutes.exec(kube_duration), 'm');
      this.substact_time(creation_timestamp, seconds.exec(kube_duration), 's');
      return creation_timestamp;
    }

    this.substact_time = function (creation_timestamp, match, unit) {
      if(match !== null) {
        creation_timestamp.subtract(match[1], unit);
      }
    }

    this.fill_events_table = function(events, events_table, cancellations, label) {
      const columns = {
        'Namespace': -1,
        'Last Seen': -1,
        'Name'     : -1,
        'Type'     : -1,
        'Reason'   : -1,
      };
      events.columnDefinitions.forEach((column, index) => {
        if (column.name in columns) {
          columns[column.name] = index;
        }
      });
      // sort rows by time
      events.rows.forEach(row => {
        row.object.last_seen_time = this.convert_kube_duration_to_moment(row.cells[[columns['Last Seen']]]);   
      });
      events.rows = events.rows.sort((b, a) => a.object.last_seen_time.diff(b.object.last_seen_time));
      const time_now = moment();
      events_table.setData(events.rows.reduce((rows, row) => {
        // TODO: on hover, display row.description would be cool !
        const event_row = [
          row.object.metadata.namespace,
          util.formatDuration(moment.duration(time_now.diff(row.object.last_seen_time))),
          row.cells[columns['Name']],
          row.cells[columns['Type']],
          row.cells[columns['Reason']]
        ];
        event_row.namespace = event_row[0];
        event_row.name = event_row[2];
        event_row.time = row.object.last_seen_time;
        event_row.uid = row.object.metadata.uid;
        highlightEvent(event_row);
        rows.push(event_row);
        return rows;
      }, [Object.keys(columns)]));
      events_table.setLabel(key + ' (' + (events_table.rows.length -1) + ')');
      const id = setInterval(update_time, 30000, events_table);
      cancellations.add(label, () => clearInterval(id));
    }

    this.render = function () {
      screen.append(events_table);
      screen.append(event_description);
      events_table.focus();
    }

    this.reset = function () {
      cancellations.run(key);
    }

    function update_time(events_table) {
      const now = moment();
      let { selected, childBase, childOffset } = events_table;
      events_table.rows.forEach( (row, i) => {
        if (i == 0) {
          return;
        }
        row[1] = util.formatDuration(moment.duration(now.diff(row.time)));
      });
      events_table.setData(events_table.rows);
      // restore selection and scrolling
      events_table.select(selected);
      Object.assign(events_table, { childBase, childOffset });
      events_table.scrollTo(selected);
    }
  
    function* update_events_table() {
      const index = object => {
        return events_table.rows.findIndex(row => row.uid === object.metadata.uid);
      };
      try {
        let change;
        while (change = yield) {
          let { selected, childBase, childOffset } = events_table;
          change = JSON.parse(change);
          const new_event = change.object;
          switch (change.type) {
            case 'ADDED': {
              const event = mergeEvent(new_event, []);
              events_table.rows.splice(1, 0, event);
              events_table.rows[1].uid = new_event.metadata.uid;
              events_table.setLabel(key + ' (' + (events_table.rows.length -1) + ')');
              selected++;
              break;
            }
            case 'MODIFIED': {
              let i = index(new_event);
              const previous = events_table.rows[i];
              mergeEvent(new_event, previous);
              // time bubble up
              while (i > 1 && events_table.rows[i].time.diff(events_table.rows[i-1].time) > 0) {
                [events_table.rows[i - 1], events_table.rows[i]] = [events_table.rows[i], events_table.rows[i - 1]];
                if (i == selected) {
                  selected--;
                }
                i--;
              }
              break;
            }
            case 'DELETED': {
              const i = index(new_event);
              if (i < selected) {
                selected--;
              } else if (i == selected){
                const deleted_event = events_table.rows[i];
                event_description.setLabel(`Event {grey-fg}[${deleted_event.name}]{/grey-fg} {red-fg}DELETED{/red-fg}`);
              }
              events_table.rows.splice(i, 1);
              events_table.setLabel(key + ' (' + (events_table.rows.length -1) + ')');
              break;
            }
          }
          events_table.setData(events_table.rows);
          // restore selection and scrolling
          events_table.select(selected);
          Object.assign(events_table, { childBase, childOffset });
          events_table.scrollTo(selected);
          events_table.render();
        }
      } catch (e) {
        this.debug.log(`{red-fg}Error updating event table ${e.toString()}{/red-fg}`);
      }
  
      function mergeEvent(new_event, old_event) {
        const last_seen = moment(new_event.lastTimestamp);
        old_event[0] = new_event.metadata.namespace;
        old_event[1] = util.formatDuration(moment.duration(moment().diff(last_seen)));
        old_event[2] = new_event.metadata.name;
        old_event[3] = new_event.type;
        old_event[4] = new_event.reason;
        old_event.time = last_seen;
        old_event.name = old_event[2];
        old_event.namespace = old_event[0];
        highlightEvent(old_event);
        return old_event;
      }
    }
  
    function highlightEvent(event) {
      if (event[3] && event[3].includes('Warn')) {
        event.forEach( (e,i) => event[i] = `{yellow-fg}${e}{/yellow-fg}`); 
      } else if (event[3] && event[3].includes('Fail')) {
        event.forEach( (e,i) => event[i] = `{red-fg}${e}{/red-fg}`); 
      }
    }
  }
} 

module.exports = Events;
