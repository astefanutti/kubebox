'use strict';

const blessed  = require('blessed'),
      contrib  = require('blessed-contrib'),
      duration = require('moment-duration-format'),
      get      = require('../http-then').get,
      moment   = require('moment'),
      task     = require('../task'),
      util     = require('../util');

const { isNotEmpty } = util;

const { delay } = require('../promise');

class Dashboard {

  constructor(screen, client, debug) {
    let current_namespace, pod_selected, pods_list = [];
    const cancellations = new task.Cancellations();

    const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

    const pods_table = grid.set(0, 0, 6, 6, blessed.listtable, {
      border        : 'line',
      align         : 'left',
      keys          : true,
      tags          : true,
      shrink        : false,
      noCellBorders : true,
      // FIXME: margin isn't incremented for child list in scrollable list table
      scrollbar     : {
        ch    : ' ',
        style : { bg: 'white' },
        track : {
          style : { bg: 'black' }
        }
      },
      style : {
        border : { fg: 'white' },
        header : { fg: 'blue', bold: true },
        cell   : { fg: 'white', selected: { bg: 'blue' } }
      }
    });

    pods_table.on('select', (item, i) => {
      // empty table!
      if (i === 0) return;
      // FIXME: logs resources are not available for pods in non running state
      const name = pods_list.items[i - 1].metadata.name;
      if (name === pod_selected)
        return;
      cancellations.run('dashboard.logs');
      pod_selected = name;
      // just to update the table with the new selection
      setTableData(pods_list);
      // and reset the logs widget label until the log request succeeds
      pod_log.setLabel('Logs');
      pod_log.logLines = [];
      pod_log.setItems([]);
      screen.render();

      const logger = function*(sinceTime) {
        let log, timestamp;
        try {
          while (log = yield) {
            // skip empty data frame payload on connect!
            if (log.length === 0) continue;
            log = log.toString('utf8');
            log.split(/\r\n|\r|\n/).filter(isNotEmpty).forEach(line => {
              const i = line.indexOf(' ');
              timestamp = line.substring(0, i);
              const msg = line.substring(i + 1);
              // avoid scanning the whole buffer if the timestamp differs from the since time
              if (!timestamp.startsWith(sinceTime) || !pod_log.logLines.includes(msg))
                pod_log.log(msg);
            });
          }
        } catch (e) {
          // HTTP chunked transfer-encoding / streaming requests abort on timeout instead of being ended.
          // WebSocket upgraded requests end when timed out on OpenShift.
        }
        // wait 1s and retry the pod log follow request from the latest timestamp if any
        delay(1000)
          .then(() => get(client.get_pod(current_namespace, name)))
          .then(response => JSON.parse(response.body.toString('utf8')))
          .then(pod => {
            // TODO: checks should be done at the level of the container (like CrashLoopBackOff)
            // check if the pod is not terminated (otherwise the connection closes)
            if (pod.status.phase !== 'Running') return;
            // check if the pod is not terminating
            if (pod.metadata.deletionTimestamp) {
              pod_log.setLabel(`Logs {grey-fg}[${name}]{/grey-fg} {red-fg}TERMINATING{/red-fg}`);
            } else {
              // TODO: max number of retries window
              // re-follow log from the latest timestamp received
              const { promise, cancellation } = get(client.follow_log(current_namespace, name, timestamp), timestamp
                ? function*() {
                  // sub-second info from the 'sinceTime' parameter are not taken into account
                  // so just strip the info and add a 'startsWith' check to avoid duplicates
                  yield* logger(timestamp.substring(0, timestamp.indexOf('.')));
                }
                : logger);
              cancellations.add('dashboard.logs', cancellation);
              return promise.then(() => debug.log(`Following log for pod ${pod_selected} ...`));
            }
          })
          .catch(error => {
            // the pod might have already been deleted?
            if (!error.response || error.response.statusCode !== 404)
              console.error(error.stack);
          });
      };

      // FIXME: deal with multi-containers pod
      const { promise, cancellation } = get(client.follow_log(current_namespace, name), logger);
      cancellations.add('dashboard.logs', cancellation);
      promise
        .then(() => debug.log(`Following log for pod ${pod_selected} ...`))
        .then(() => pod_log.setLabel(`Logs {grey-fg}[${name}]{/grey-fg}`))
        .then(() => screen.render())
        .catch(error => console.error(error.stack));
    });
    // work-around for https://github.com/chjj/blessed/issues/175
    pods_table.on('remove', () => pods_table.removeLabel());
    pods_table.on('prerender', () => pods_table.setLabel('Pods'));

    function setTableData(pods) {
      const selected = pods_table.selected;
      pods_table.setData(pods.items.reduce((data, pod) => {
        data.push([
          pod.metadata.name === pod_selected ? `{blue-fg}${pod.metadata.name}{/blue-fg}` : pod.metadata.name,
          // TODO: be more fine grained for the status
          // TODO: add a visual hint depending on the status
          pod.status.phase,
          // FIXME: negative duration is displayed when pod starts as clocks may not be synced
          util.formatDuration(moment.duration(moment().diff(moment(pod.status.startTime))))
        ]);
        return data;
      }, [['NAME', 'STATUS', 'AGE']]));
      pods_table.select(selected);
    }

    // TODO: enable user scrolling
    const pod_log = grid.set(6, 0, 6, 12, contrib.log, {
      border : 'line',
      align  : 'left',
      label  : 'Logs',
      tags   : true,
      style  : {
        border : { fg: 'white' }
      },
      bufferLength: 50
    });

    this.render = function () {
      // TODO: restore selection if any
      screen.append(pods_table);
      screen.append(pod_log);
      pod_log.setScrollPerc(100);
      pods_table.focus();
    }

    this.reset = function () {
      // cancel current running tasks and open requests
      cancellations.run('dashboard');
      // reset dashboard widgets
      current_namespace = null;
      pod_selected = null;
      pods_table.setData([]);
      pod_log.setLabel('Logs');
      pod_log.logLines = [];
      pod_log.setItems([]);
      screen.render();
    }

    this.run = function (namespace) {
      current_namespace = namespace;
      return get(client.get_pods(current_namespace))
        .then(response => {
          pods_list = JSON.parse(response.body.toString('utf8'));
          pods_list.items = pods_list.items || [];
        })
        .then(() => setTableData(pods_list))
        .then(() => debug.log(`Watching for pods changes in namespace ${current_namespace} ...`))
        .then(() => screen.render())
        .then(() => {
          const id = setInterval(refreshPodAges, 1000);
          cancellations.add('dashboard.refreshPodAges', () => clearInterval(id));
        })
        .then(() => {
          const { promise, cancellation } = get(client.watch_pods(current_namespace,pods_list.metadata.resourceVersion), updatePodTable);
          cancellations.add('dashboard', cancellation);
          return promise;
        });
    }

    function* updatePodTable() {
      const index = object => pods_list.items.findIndex(pod => pod.metadata.uid === object.metadata.uid);
      let change;
      try {
        while (change = yield) {
          change = JSON.parse(change);
          switch (change.type) {
            case 'ADDED':
              pods_list.items.push(change.object);
              break;
            case 'MODIFIED':
              pods_list.items[index(change.object)] = change.object;
              break;
            case 'DELETED':
              pods_list.items.splice(index(change.object), 1);
              if (change.object.metadata.name === pod_selected) {
                // check if that's the selected pod and clean the selection
                pod_log.setLabel(`Logs {grey-fg}[${pod_selected}]{/grey-fg} {red-fg}DELETED{/red-fg}`);
                pod_selected = null;
              }
              break;
          }
          setTableData(pods_list);
          screen.render();
        }
      } catch (e) {
        // HTTP chunked transfer-encoding / streaming watch requests abort on timeout when the 'timeoutSeconds'
        // request parameter is greater than the '--min-request-timeout' server API option,
        // otherwise the connections just end normally (http://kubernetes.io/docs/admin/kube-apiserver/).
        // WebSocket upgraded watch requests (idle?) end when timed out on Kubernetes.
      }
      // retry the pods list watch request
      cancellations.run('dashboard.refreshPodAges');
      this.run(current_namespace).catch(error => console.error(error.stack));
    }

    function refreshPodAges() {
      pods_list.items.forEach(pod => moment(pod.status.startTime).add(1, 's').toISOString());
      // we may want to avoid recreating the whole table data
      setTableData(pods_list);
      screen.render();
    }
  }
}

module.exports = Dashboard;
