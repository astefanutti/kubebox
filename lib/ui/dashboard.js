'use strict';

const blessed  = require('blessed'),
      contrib  = require('blessed-contrib'),
      duration = require('moment-duration-format'),
      get      = require('../http-then').get,
      moment   = require('moment'),
      task     = require('../task'),
      util     = require('../util');

const { isNotEmpty, humanBytes } = util;

const { delay } = require('../promise');

//TODO: modularise sub-widgets
class Dashboard {

  constructor(screen, client, debug) {
    let current_namespace, pod_selected, container_selected, pods_list = [];
    /* let metrics = {
      pods: [],
    }; */
    const cancellations = new task.Cancellations();

    const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

    const pods_table = grid.set(0, 0, 6, 6, blessed.listtable, {
      border        : 'line',
      align         : 'left',
      keys          : true,
      tags          : true,
      mouse         : true,
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

    // work-around for https://github.com/chjj/blessed/issues/175
    pods_table.on('remove', () => pods_table.removeLabel());
    pods_table.on('prerender', () => pods_table.setLabel('Pods'));

    const memory_graph = grid.set(0, 6, 6, 6, contrib.line, {
      label  : 'Memory',
      tags   : true,
      legend : { width : 8 },
      style  : {
        border   : { fg: 'white' },
        text     : 'white',
        baseline : [80, 80, 80],
      },
      xLabelPadding : 1,
      xPadding      : 1,
      showLegend    : true,
      abbreviate    : humanBytes,
      numYLabels    : 5,
    });

    memory_graph.on('prerender', () => {
      if (memory_graph.stats) {
        memory_graph.setData(memory_graph.stats);
      }
    });

    memory_graph.reset = function () {
      this.setLabel('Memory');
      this.clear();
      delete this.stats;
      if (this.message) this.message.destroy();
    }

    // TODO: enable user scrolling
    const pod_log = grid.set(6, 0, 6, 12, contrib.log, {
      border : 'line',
      align  : 'left',
      label  : 'Logs',
      tags   : true,
      style  : {
        border : { fg: 'white' },
      },
      bufferLength: 50,
    });

    pod_log.reset = function () {
      this.setLabel('Logs');
      this.logLines = [];
      this.setItems([]);
    }

    pods_table.on('select', (item, i) => {
      // empty table!
      if (i === 0) return;
      // FIXME: logs resources are not available for pods in non running state
      const pod = pods_list.items[i - 1];
      const name = pod.metadata.name;
      const namespace = pod.metadata.namespace;
      const containers = pod.spec.containers;
      let container;
      if (containers.length === 1) {
          if (name === pod_selected) {
            return;
          } else {
            container = containers[0];
            container_selected = container.name;
          }
      } else {
        const i = containers.findIndex(c => c.name === container_selected);
        container = containers[(i + 1) % containers.length];
        container_selected = container.name;
      }
      pod_selected = name;
      cancellations.run('dashboard.pod');
      // just to update the table with the new selection
      updatePodsTable(pods_list);
      // reset the selected pod widgets
      memory_graph.reset();
      pod_log.reset();
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
          .then(() => get(client.get_pod(namespace, name)))
          .then(response => JSON.parse(response.body.toString('utf8')))
          .then(pod => {
            // TODO: checks should be done at the level of the container (like CrashLoopBackOff)
            // check if the pod is not terminated (otherwise the connection closes)
            if (pod.status.phase !== 'Running') return;
            // check if the pod is not terminating
            if (pod.metadata.deletionTimestamp) {
              pod_log.setLabel(`Logs {grey-fg}[${container_selected}]{/grey-fg} {red-fg}TERMINATING{/red-fg}`);
            } else {
              // TODO: max number of retries window
              // re-follow log from the latest timestamp received
              const { promise, cancellation } = get(client.follow_log(namespace, name, { container: container_selected, sinceTime: timestamp }), timestamp
                ? function*() {
                  // sub-second info from the 'sinceTime' parameter are not taken into account
                  // so just strip the info and add a 'startsWith' check to avoid duplicates
                  yield* logger(timestamp.substring(0, timestamp.indexOf('.')));
                }
                : logger);
              cancellations.add('dashboard.pod.logs', cancellation);
              return promise.then(() => debug.log(`Following log for ${pod_selected}/${container_selected} ...`));
            }
          })
          .catch(error => {
            // the pod might have already been deleted?
            if (!error.response || error.response.statusCode !== 404)
              console.error(error.stack);
          });
      };

      const { promise, cancellation } = get(client.follow_log(namespace, name, { container: container_selected }), logger);
      cancellations.add('dashboard.pod.logs', cancellation);
      promise
        .then(() => debug.log(`Following log for ${pod_selected}/${container_selected} ...`))
        .then(() => pod_log.setLabel(`Logs {grey-fg}[${container_selected}]{/grey-fg}`))
        .then(() => screen.render())
        .catch(error => console.error(error.stack));

      updateStatsFromCAdvisor(pod, container)
        .then(() => {
          const id = setInterval(pod => updateStatsFromCAdvisor(pod, container)
            .catch(error => {
              cancellations.run('dashboard.pod.stats');
              // the pod might have already been deleted?
              if (!error.response || error.response.statusCode !== 404) {
                console.error(error.stack);
              }
            }), 10000, pod);
          cancellations.add('dashboard.pod.stats', () => clearInterval(id));
        })
        .catch(error => {
          if (error.response) {
            let message;
            switch (error.response.statusCode) {
              case 403:
                message = 'Resources usage metrics unauthorized';
                break;
              default:
                message = 'Resources usage metrics unavailable';
            }
            memory_graph.message = blessed.text({
              parent  : memory_graph,
              tags    : true,
              top     : 'center',
              left    : 'center',
              width   : 'shrink',
              height  : 'shrink',
              align   : 'center',
              valign  : 'middle',
              bg      : 'red',
              content : message,
            });
          } else {
            console.error(error.stack);
          }
        });
    });

    function updatePodsTable(pods) {
      const selected = pods_table.selected;
      pods_table.setData(pods.items.reduce((data, pod) => {
        const name = pod.metadata.name;
        data.push([
          name === pod_selected ? `{blue-fg}${name}{/blue-fg}` : name,
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

    function updateStatsFromCAdvisor(pod, container) {
      let request;
      if (client.openshift) {
        request = get(client.container_stats(pod.spec.nodeName, pod.metadata.namespace, pod.metadata.name, pod.metadata.uid, container.name))
          .then(response => response.body.toString('utf8'))
      } else {
        request = get(client.cadvisor_container_stats(pod.spec.nodeName, pod.status.containerStatuses.find(c => c.name === container.name).containerID.slice(9)))
          .then(response => response.body.toString('utf8'))
          .then(response => response.slice(response.indexOf(':') + 1, -1))
      }
      return request
        .then(response => JSON.parse(response))
        .then(response => {
          memory_graph.setLabel(`Memory {grey-fg}[${container.name}]{/grey-fg}`);
          const timestamps = response.stats.map(s => moment(s.timestamp).format('HH:mm:ss'));
          const cache = {
            title : 'Cache',
            x     : timestamps,
            y     : response.stats.map(s => s.memory.cache),
            style : { line: 'yellow' },
          };
          const usage = {
            title : 'Usage',
            x     : timestamps,
            y     : response.stats.map(s => s.memory.usage),
            style : { line: 'blue' },
          };
          memory_graph.stats = [usage, cache];
          if (container.resources.limits && container.resources.limits.memory) {
            const limit = {
              title : 'Limit',
              x     : timestamps,
              y     : Array(timestamps.length).fill(response.spec.memory.limit),
              style : { line: 'red' },
            };
            memory_graph.stats.push(limit);
          }
          if (!memory_graph.detached) {
            memory_graph.setData(memory_graph.stats);
          }
        });
    }

    /* function pollStatsFromSummaryApi(pod) {
      return get(client.summary_stats(pod.spec.nodeName))
        .then(response => JSON.parse(response.body.toString('utf8')))
        .then(response => response.pods
          .filter(p => p.podRef.namespace === current_namespace)
          .forEach(p => {
            const m = metrics.pods.find(p1 => p1.podRef.uid === p.podRef.uid);
            if (m) {
              m.containers.push(...p.containers.filter(c1 =>
                !m.containers.find(c2 => c1.name === c2.name && c1.memory.time === c2.memory.time)));
            } else {
              metrics.pods.push(p);
            }
          }))
        .then(updateStatsChart);
    } */

    /* function updateStatsChart() {
      if (!pod_selected) return;

      const stats = metrics.pods
        .filter(p => p.podRef.uid === pod_selected.metadata.uid)
        .flatMap(p => p.containers)
        //TODO
        .filter(c => c.name === c.name);

      const memory = stats.map(c => c.memory);
      const timestamps = memory.map(m => moment(m.time).format('HH:mm:ss'));

      const available = {
        title : 'Avail.',
        x     : timestamps,
        y     : memory.map(m => m.availableBytes),
        style : { line: 'yellow' }
      };
      const usage = {
        title : 'Usage',
        x     : timestamps,
        y     : memory.map(m => m.usageBytes),
        style : { line: 'blue' }
      };
      memory_graph.stats = [available, usage];
      if (!memory_graph.detached) {
        memory_graph.setData(memory_graph.stats);
      }
    } */

    this.render = function () {
      // TODO: restore selection if any
      screen.append(pods_table);
      screen.append(memory_graph);
      if (memory_graph.stats) {
        memory_graph.setData(memory_graph.stats);
      }
      screen.append(pod_log);
      pod_log.setScrollPerc(100);
      pods_table.focus();
    }

    this.reset = function () {
      // cancel current running tasks and open requests
      cancellations.run('dashboard');
      current_namespace = null;
      pod_selected = null;
      container_selected = null;
      // reset dashboard widgets
      pods_table.setData([]);
      memory_graph.reset();
      pod_log.reset();
      // render
      screen.render();
    }

    this.run = function (namespace) {
      current_namespace = namespace;
      return get(client.get_pods(current_namespace))
        .then(response => {
          pods_list = JSON.parse(response.body.toString('utf8'));
          pods_list.items = pods_list.items || [];
        })
        .then(() => updatePodsTable(pods_list))
        .then(() => debug.log(`Watching for pods changes in namespace ${current_namespace} ...`))
        .then(() => screen.render())
        .then(() => {
          const id = setInterval(refreshPodAges, 1000);
          cancellations.add('dashboard.refreshPodAges', () => clearInterval(id));
        })
        .then(() => {
          const { promise, cancellation } = get(client.watch_pods(current_namespace, pods_list.metadata.resourceVersion), updatePodTable);
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
              // check if that's the selected pod and clean up
              if (change.object.metadata.name === pod_selected) {
                cancellations.run('dashboard.pod');
                memory_graph.setLabel(`Memory {red-fg}DELETED{/red-fg}`);
                pod_log.setLabel(`Logs {grey-fg}[${container_selected}]{/grey-fg} {red-fg}DELETED{/red-fg}`);
                pod_selected = null;
                container_selected = null;
              }
              break;
          }
          updatePodsTable(pods_list);
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
      updatePodsTable(pods_list);
      screen.render();
    }
  }
}

module.exports = Dashboard;
