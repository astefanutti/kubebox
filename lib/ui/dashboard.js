'use strict';

const blessed  = require('blessed'),
      chart    = require('./chart'),
      debounce = require('lodash.debounce'),
      duration = require('moment-duration-format'),
      Events   = require('./events'),
      Exec     = require('./exec'),
      k8s      = require('../kubernetes'),
      moment   = require('moment'),
      scroll   = require('./blessed/scroll'),
      task     = require('../task'),
      util     = require('../util');

const { humanBytes, humanCores, humanNet } = util;

const { error } = require('../error');
const { pause } = require('../promise');
const { setLabel, spinner: { until } } = require('./ui');

const statsPollRateMs = 10000;

class Dashboard {

  constructor({ screen, navbar, status, client, debug }) {
    let current_namespace, pod_selected, container_selected, pods_list = [];
    const cancellations = new task.Cancellations();
    const dashboard = this;

    const pods_table = blessed.listtable({
      label  : 'Pods',
      parent : screen,
      left   : 0,
      top    : 1,
      width  : '50%',
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

    const resources = blessed.box({
      label  : 'Resources',
      parent : screen,
      left   : '50%',
      top    : 1,
      right  : 0,
      height : '50%-1',
      tags   : true,
      border : 'line',
      style  : {
        label : { bold: true },
      },
    });

    const tabs = blessed.listbar({
      parent : resources,
      top    : 1,
      left   : 1,
      right  : 1,
      height : 'shrink',
      mouse  : true,
      keys   : true,
      style : {
        bg : 'white',
        item : {
          fg : 'black',
          bg : 'white',
          hover : {
            fg   : 'white',
            bg   : 'grey',
            bold : true,
          },
        },
        selected : {
          fg : 'white',
          bg : 'blue',
        },
      },
      commands: {
        'Memory': {
          keys     : ['M', 'm'],
          callback : function () {
            graphs.find(g => g.visible).toggle();
            memory_graph.toggle();
          },
        },
        'CPU': {
          keys     : ['C', 'c'],
          callback : function () {
            graphs.find(g => g.visible).toggle();
            cpu_graph.toggle();
          },
        },
        'Net': {
          keys     : ['T', 't'],
          callback : function () {
            graphs.find(g => g.visible).toggle();
            net_graph.toggle();
          },
        },
        'FS': {
          keys     : ['F', 'f'],
          callback : function () {
            graphs.find(g => g.visible).toggle();
            fs_graph.toggle();
          },
        },
      },
    });

    const memory_graph = new chart(resources, { top: 2, left: 1, bottom: 1, right: 1, abbreviate: humanBytes });
    const cpu_graph = new chart(resources, { top: 2, left: 1, bottom: 1, right: 1, abbreviate: humanCores });
    const net_graph = new chart(resources, { top: 2, left: 1, bottom: 1, right: 1, abbreviate: humanNet });
    const fs_graph = new chart(resources, { top: 2, left: 1, bottom: 1, right: 1, abbreviate: humanBytes });
    const graphs = [memory_graph, cpu_graph, net_graph, fs_graph];
    graphs.slice(1).forEach(g => g.toggle());

    const pod_log = blessed.log({
      parent : screen,
      label  : 'Logs',
      top    : '50%',
      bottom : '1',
      align  : 'left',
      tags   : false,
      keys   : true,
      vi     : true,
      mouse  : true,
      border : 'line',
      style  : {
        label  : { bold: true },
      },
      scrollable : true,
      scrollbar  : {
        ch    : ' ',
        style : { bg: 'white' },
        track : {
          style : { bg: 'grey' },
        },
      },
    });
    // override default ScrollableBox scrolling
    scroll(pod_log);

    pod_log.reset = function () {
      this.setLabel('Logs');
      this.clear();
    }

    pods_table.key(['e'], () => {
      // no selection
      if (!pods_table.selected) return;
      const pod = pods_list.items[pods_table.selected - 1];
      const name = pod.metadata.name;

      const id = `events-${current_namespace}-${name}`;
      if (navbar.select(id)) {
        return;
      }
      const events_tab = new Events({ client, debug, status, namespace: current_namespace, involvedObject: pod.metadata });
      navbar.add({
        id       : id,
        title    : `Events ${name}`,
        listener : events_tab,
      }, { select: true, closable: true });
    });

    pods_table.key(['S-e'], () => {
      const id = `events-${current_namespace}`;
      if (navbar.select(id)) {
        return;
      }
      const events_tab = new Events({ client, debug, status, namespace: current_namespace });
      navbar.add({
        id       : id,
        title    : `Events ${current_namespace}`,
        listener : events_tab,
      }, { select: true, closable: true });
    });

    pods_table.key(['C-e'], () => {
      const id = 'events-cluster';
      if (navbar.select(id)) {
        return;
      }
      const events_tab = new Events({ client, debug, status });
      navbar.add({
        id       : id,
        title    : 'Events cluster',
        listener : events_tab,
      }, { select: true, closable: true });
    });

    pods_table.key(['r'], () => {
      // no selection
      if (!pods_table.selected) return;

      const pod = pods_list.items[pods_table.selected - 1];
      const name = pod.metadata.name;
      const namespace = pod.metadata.namespace;
      const container = pod.metadata.uid === pod_selected && container_selected
        ? container_selected
        : pod.spec.containers[0].name;
      const id = `${namespace}-${name}-${container}`;
      // check if connection already exists
      if (navbar.select(id)) return;
      // non-running pod
      if (!k8s.isContainerRunning(pod, container)) return;

      const exec = new Exec({ screen, status, debug });
      const { promise, _ } = client.pod(namespace, name).exec({ container, command: ['/bin/sh', '-c', `TERM=${exec.termName()} $( (type getent > /dev/null 2>&1 && getent passwd root | cut -d: -f7 2>/dev/null) || echo /bin/sh)`] }).get({ generator: exec.output, readable: exec });

      navbar.add({
        id     : id,
        title   : container,
        render : _ => exec.render(),
      }, { select: true });

      const watch = `terminal.${id}`;
      exec.on('exit', () => {
        cancellations.run(watch);
        navbar.remove(id);
      });

      until(promise)
        .do(exec.terminal, setLabel).spin(s => `${s} ${namespace}/${name}/${container}`).done(_ => `${namespace}/${name}/${container}`)
        .catch(error => {
          exec.terminal.write(`\x1b[31m${error}\x1b[m\r\n`);
          exec.terminal.write('Type Ctrl-C to close\r\n');
          exec.terminal.on('key C-c', () => {
            if (!exec.terminal.hasSelection()) {
              exec.terminal.dispose();
              navbar.remove(id);
            }
          });
          return Promise.reject();
        })
        .then(() => {
          debug.log(`{grey-fg}Remote shell into '${namespace}/${name}/${container}'{/grey-fg}`);
          // TODO: add retry on timeout
          const { promise, cancellation } = client.pods(namespace).fieldSelector(`metadata.name=${name}`).watch(pod.metadata.resourceVersion).get({ generator: function* () {
            let change;
            while (change = yield) {
              change = JSON.parse(change);
              const pod = change.object;
              switch (change.type) {
                case 'MODIFIED':
                  if (pod.metadata.deletionTimestamp) {
                    exec.terminal.setLabel(`${namespace}/${name}/${container} {red-fg}TERMINATING{/red-fg}`);
                    screen.render();
                  }
                  break;
                case 'DELETED':
                  exec.terminal.setLabel(`${namespace}/${name}/${container} {red-fg}DELETED{/red-fg}`);
                  screen.render();
                  break;
              }
            }
          }});
          cancellations.add(watch, cancellation);
          return promise;
        })
        .catch(error => {
          if (error) console.error(error.stack);
        });
    });

    pods_table.on('select', (item, i) => {
      // empty table!
      if (i === 0) return;
      const pod = pods_list.items[i - 1];
      const containers = pod.spec.containers.concat(pod.spec.initContainers || []);
      let container;
      if (containers.length === 1) {
        if (pod.metadata.uid === pod_selected && container_selected) {
          return;
        } else {
          container = containers[0];
          container_selected = container.name;
        }
      } else if (containers.length > 1) {
        if (pod.metadata.uid !== pod_selected) {
          container_selected = null;
        }
        const i = containers.findIndex(c => c.name === container_selected);
        container = containers[(i + 1) % containers.length];
        container_selected = container.name;
      }
      pod_selected = pod.metadata.uid;
      cancellations.run('dashboard.pod');
      // just to update the table with the new selection
      updatePodsTable();
      // reset the selected pod widgets
      resources.setLabel('Resources');
      graphs.forEach(g => g.reset());
      pod_log.reset();
      screen.render();

      // a container in a pod in Error or CrashLoopBackOff can be waiting, yet it is possible to query log from previous runs
      if (k8s.isContainerToBeRunning(pod, container)) {
        pod_log.setLabel(containerLogsLabel(pod, container));
        screen.render();
        // let's the pods watch request handler deal with the selected container once it's done initializing
        return;
      }

      selectContainer(pod, container);
    });

    function selectContainer(pod, container) {
      const namespace = pod.metadata.namespace;
      const logger = function* (sinceTime) {
        let data, timestamp;
        const lines = [];
        const log = debounce(() => {
          pod_log.log(lines);
          lines.length = 0;
        }, 100, { trailing: true });
        cancellations.add('dashboard.pod.logs', () => log.cancel());
        try {
          let line = '';
          while (data = yield) {
            // an initial ping frame with 0-length data is being sent
            if (data.length === 0) continue;
            data = data.toString('utf8');
            let l = data;
            // the current logic is affected by https://github.com/kubernetes/kubernetes/issues/77603
            if (line === '') {
              const i = data.indexOf(' ');
              timestamp = data.substring(0, i);
              l = data.substring(i + 1);
            }
            const n = l.indexOf('\n');
            if (n < 0) {
              line += l;
            } else {
              line += l.substring(0, n);
              // avoid scanning the whole buffer if the timestamp differs from the since time
              if (timestamp.startsWith(sinceTime) && pod_log._clines.fake.includes(line)) continue;
              lines.push(line);
              line = '';
              log();
            }
          }
        } catch (e) {
          // HTTP chunked transfer-encoding / streaming requests abort on timeout instead of being ended.
          // WebSocket upgraded requests end when timed out on OpenShift.
        }
        // wait 1s and retry the pod log follow request from the latest timestamp if any
        // TODO: max number of retries per time window
        pause(1000)
          .then(() => client.pod(namespace, pod.metadata.name).get())
          .then(response => {
            const pod = JSON.parse(response.body.toString('utf8'));
            // selection may have changed
            if (pod.metadata.uid !== pod_selected) return;
            // check if the pod is running
            if (!k8s.isContainerRunning(pod, container)) return;
            // re-follow log from the latest timestamp received
            const { promise, cancellation } = client.pod(namespace, pod.metadata.name).log({ container: container.name, sinceTime: timestamp }).get({ generator: timestamp
              ? function* () {
                // sub-second info from the 'sinceTime' parameter are not taken into account
                // so just strip the info and add a 'startsWith' check to avoid duplicates
                yield* logger(timestamp.substring(0, timestamp.indexOf('.')));
              }
              : logger });
            cancellations.add('dashboard.pod.logs', cancellation);
            return promise.then(() => debug.log(`{grey-fg}Following log for ${pod.metadata.name}/${container.name}{/grey-fg}`));
          })
          .catch(error => {
            // the pod might have already been deleted?
            if (!error.response || error.response.statusCode !== 404) {
              console.error(error.stack);
            }
          });
      };

      const logs = client.pod(namespace, pod.metadata.name).log({ container: container.name }).get({ generator: logger });
      cancellations.add('dashboard.pod.logs', logs.cancellation);
      until(logs.promise)
        .spin(s => pod_log.setLabel(`${s} Logs {grey-fg}[${container.name}]{/grey-fg}`))
        .cancel(c => cancellations.add('dashboard.pod.logs', c))
        .catch(error => {
          pod_log.setLabel(`Logs {grey-fg}[${container.name}]{/grey-fg}`);
          pod_log.log(`\x1b[31mError: ${error.message}\x1b[m`);
          screen.render();
          return Promise.reject();
        })
        .then(() => {
          debug.log(`{grey-fg}Following log for ${pod.metadata.name}/${container.name} ...{/grey-fg}`);
          const actual = getPodByUid(pod.metadata.uid);
          const tag = k8s.isPodTerminating(actual) ? { tag: 'TERMINATING', style: 'red-fg' } : {};
          pod_log.setLabel(containerLogsLabel(actual, container, tag));
          screen.render();
        })
        .catch(error => {
          if (error) console.error(error.stack);
        });

      let cancelled = false;
      let cancellation = () => {};
      cancellations.add('dashboard.pod.stats', () => {
        cancellation();
        cancelled = true;
      });
      const spec = specFromCAdvisor(pod);
      cancellation = spec.cancellation;
      until(spec.promise
        .then(spec => {
          if (cancelled) return Promise.reject();
          // map container names to cgroup pathes
          const cgroups = Object.entries(spec)
            .filter(([_, v]) => v.labels && v.labels['io.kubernetes.pod.uid'] === pod.metadata.uid)
            .reduce((s, [k, v]) => {
              if (v.has_network) {
                s['NET'] = k;
              } else {
                s[v.labels['io.kubernetes.container.name']] = k;
              }
              return s;
            }, {});
          // get the stats
          const { promise, cancellation: c } = updateStatsFromCAdvisor(spec, cgroups, pod, container);
          cancellation = c;
          return promise;
        }))
        .do(resources, setLabel).spin(s => `${s} Resources`).fail(() => 'Resources')
        .cancel(c => cancellations.add('dashboard.pod.stats', c))
        .then(({ spec, cgroups, pod, container }) => {
          if (cancelled) return Promise.reject();
          k8s.isPodTerminating(getPodByUid(pod.metadata.uid))
            ? resources.setLabel(`Resources {grey-fg}[${container.name}]{/grey-fg} {red-fg}TERMINATING{/red-fg}`)
            : resources.setLabel(`Resources {grey-fg}[${container.name}]{/grey-fg}`);
          screen.render();
          // poll the stats at regular interval
          return pause(statsPollRateMs).then(() => new Promise((resolve, reject) => {
            (function poll() {
              if (cancelled) return resolve();
              const { promise, cancellation: c } = updateStatsFromCAdvisor(spec, cgroups, pod, container);
              cancellation = c;
              promise.then(() => setTimeout(poll, statsPollRateMs)).catch(error => reject(error));
            })();
          }));
        })
        .catch(error => {
          // cancelled
          if (!error) return;

          // let's skip expected errors if the pod is being deleted
          if (k8s.isPodTerminating(getPodByUid(pod.metadata.uid)) && (error.name === 'Kubebox' || error.response)) {
            return;
          }

          if (error.name === 'Kubebox') {
            graphs.forEach(g => g.message(error.message));
          } else if (error.response) {
            let message;
            switch (error.response.statusCode) {
              case 403:
                message = 'Resources usage metrics unauthorized';
                break;
              default:
                message = 'Resources usage metrics unavailable';
            }
            graphs.forEach(g => g.message(message));
          } else {
            console.error(error.stack);
          }
        });
    }

    function getPodByUid(uid) {
      return pods_list.items.find(pod => pod.metadata.uid === uid);
    }

    function updatePodsTable() {
      const { selected, childBase, childOffset } = pods_table;
      const selectedRow = pods_table.rows[selected];

      pods_table.setData((pods_list.items || []).reduce((rows, pod) => {
        let row = [
          pod.metadata.name,
          // TODO: add a visual hint depending on the status
          k8s.podPhase(pod),
          // FIXME: negative duration is displayed when the pod gets created as clocks may not be synced
          util.formatDuration(moment.duration(moment().diff(moment(pod.metadata.creationTimestamp)))),
        ];
        if (pod.metadata.uid === pod_selected) {
          row = row.map(i => `{blue-fg}${i}{/blue-fg}`);
        }
        row.uid = pod.metadata.uid;
        rows.push(row);
        return rows;
      }, [['NAME', 'STATUS', 'AGE']]));

      // restore selection and scrolling
      if (selectedRow) {
        const index = pods_table.rows.slice(1).findIndex(r => r.uid === selectedRow.uid) + 1;
        pods_table.select(index);
        Object.assign(pods_table, { childBase: childBase + (index - selected), childOffset });
        pods_table.scrollTo(index);
      }
    }

    function specFromCAdvisor(pod) {
      const request = client.cadvisor_spec(pod).get({ cancellable: true, rejectOnAbort: true });
      const promise = request.promise.then(response => JSON.parse(response.body.toString('utf8')));
      return { promise, cancellation: request.cancellation };
    }

    function updateStatsFromCAdvisor(spec, cgroups, pod, container) {
      const cgroup = cgroups[container.name];
      if (!cgroup) {
        throw error(`No stats for container ${pod.metadata.name}/${container.name} in cAdvisor`);
      }
      // get the stats for the parent cgroup so that we can access the network container stats
      const request = client.cadvisor_stats(pod, cgroup.substring(0, cgroup.lastIndexOf('/')))
        .get({ cancellable: true, rejectOnAbort: true });
      const promise = request.promise
        .then(response => {
          const stats = JSON.parse(response.body.toString('utf8'));
          const containerStats = stats[cgroup];
          if (!containerStats) {
            // stats may be empty when the pod is deleted and the corresponding 'DELETED' event has yet to be processed
            return Promise.reject(error(`No stats for container ${pod.metadata.name}/${container.name} in cAdvisor`));
          }
          const timestamps = containerStats.map(s => moment(s.timestamp).format('HH:mm:ss'));

          // memory
          const memory_cache = {
            title : 'Cache',
            x     : timestamps,
            y     : containerStats.map(s => s.memory.cache),
            style : { line: 'yellow' },
          };
          const memory_usage = {
            title : 'Usage',
            x     : timestamps,
            y     : containerStats.map(s => s.memory.usage),
            style : { line: 'blue' },
          };
          const memory_stats = [memory_usage, memory_cache];
          if (container.resources.limits && container.resources.limits.memory) {
            const memory_limit = {
              title : 'Limit',
              x     : timestamps,
              y     : Array(timestamps.length).fill(spec[cgroup].memory.limit),
              style : { line: 'red' },
            };
            memory_stats.push(memory_limit);
          }
          memory_graph.setData(memory_stats);

          // CPU
          const periods = containerStats.map(s => moment(s.timestamp).format('X')).delta();
          const cpu_user = {
            title : 'User',
            x     : timestamps.slice(1),
            y     : containerStats.map(s => s.cpu.usage.user).delta().map((d, i) => d < 0 ? NaN : d / 1e+6 / periods[i]),
            style : { line: 'cyan' },
          };
          const cpu_total = {
            title : 'Total',
            x     : timestamps.slice(1),
            y     : containerStats.map(s => s.cpu.usage.total).delta().map((d, i) => d < 0 ? NaN : d / 1e+6 / periods[i]),
            style : { line: 'blue' },
          };
          const cpu_stats = [cpu_user, cpu_total];
          if (container.resources.limits && container.resources.limits.cpu) {
            const cpu_limit = {
              title : 'Limit',
              x     : timestamps.slice(1),
              y     : Array(timestamps.length - 1).fill(spec[cgroup].cpu.limit),
              style : { line: 'red' },
            };
            cpu_stats.push(cpu_limit);
          }
          cpu_graph.setData(cpu_stats);

          // network
          const netStats = (stats[cgroups['NET']] || []).filter(s => s.network.interfaces);
          if (netStats.length > 1) {
            // clear the message when network stats become available
            net_graph.message();

            const net_periods = netStats.map(s => moment(s.timestamp).format('X')).delta();
            const net_timestamps = netStats.map(s => moment(s.timestamp).format('HH:mm:ss')).slice(1);

            const interfaces = {};
            netStats.flatMap(s => s.network.interfaces).forEach(i => {
              // rx_bytes
              let name = `RX(${i.name})`;
              if (!interfaces[name]) {
                interfaces[name] = [];
              }
              interfaces[name].push(i.rx_bytes);
              // tx_bytes
              name = `TX(${i.name})`;
              if (!interfaces[name]) {
                interfaces[name] = [];
              }
              interfaces[name].push(i.tx_bytes);
            });

            const net_stats = Object.entries(interfaces).reduce((r, [name, series], i) => {
              r.push({
                title: name,
                x: net_timestamps,
                y: series.delta().map((d, j) => d < 0 ? NaN : d / net_periods[j]),
                // loop over the 8 bit colors, skipping black
                style: { line: i % (7 - 1) + 1 },
              });
              return r;
            }, []);

            const legendWidth = Math.max(...Object.keys(interfaces).map(i => i.length));
            net_graph.setOptions({ legend: { width: legendWidth } });
            net_graph.setData(net_stats);
          } else {
            net_graph.message('Network usage unavailable', { bg: 'yellow' });
          }

          // file system
          if (spec[cgroup].has_filesystem) {
            const fs_usage = {
              title : 'Usage',
              x     : timestamps,
              y     : containerStats.map(s => s.filesystem).map(s => s.reduce((r, v) => r + v.usage, 0)),
              style : { line: 'blue' },
            };
            fs_graph.setData([fs_usage]);
          } else {
            fs_graph.message('File system usage unavailable', { bg: 'yellow' });
          }

          screen.render();
          return { spec, cgroups, pod, container };
        });
      return { promise, cancellation: request.cancellation };
    }

    this.render = function () {
      screen.append(pods_table);
      screen.append(resources);
      screen.append(pod_log);
      pods_table.focus();
      updatePodsTable();
    }

    this.reset = function () {
      // cancel current running tasks and open requests
      cancellations.run('dashboard');
      current_namespace = null;
      pod_selected = null;
      container_selected = null;
      // reset dashboard widgets
      pods_table.setLabel('Pods');
      pods_table.setData([]);
      resources.setLabel('Resources');
      graphs.forEach(g => g.reset());
      pod_log.reset();
      // render
      screen.render();
    }

    // FIXME: handle current namespace deletion nicely
    this.run = function (namespace) {
      current_namespace = namespace;
      let listPodsError;
      // FIXME: should be cancellable
      const promise = until(client.pods(current_namespace).get())
        .do(pods_table, setLabel)
        .spin(s => `${s} Pods {grey-fg}[${current_namespace}]{/grey-fg}`)
        .succeed(_ => `Pods {grey-fg}[${current_namespace}]{/grey-fg}`)
        .then(response => {
          pods_list = JSON.parse(response.body.toString('utf8'));
          pods_list.items = pods_list.items || [];
          updatePodsTable();
        }).catch(error => {
          listPodsError = error;
          return Promise.reject(error);
        });

      promise
        .then(() => {
          debug.log(`{grey-fg}Watching for pods changes in namespace ${current_namespace} ...{/grey-fg}`);
          screen.render();
          const id = setInterval(refreshPodAges, 1000);
          cancellations.add('dashboard.refreshPodAges', () => clearInterval(id));
          const { promise, cancellation } = client.pods(current_namespace)
            .watch(pods_list.metadata.resourceVersion)
            .get({ generator: watchPodChanges });
          cancellations.add('dashboard', cancellation);
          return promise;
        })
        .catch(error => {
          if (!listPodsError) console.error(error.stack);
        });

      return promise;
    }

    function* watchPodChanges() {
      const index = object => pods_list.items.findIndex(pod => pod.metadata.uid === object.metadata.uid);
      let change;
      try {
        while (change = JSON.parse(yield)) {
          switch (change.type) {
            case 'ADDED': {
              pods_list.items.push(change.object);
              break;
            }
            case 'MODIFIED': {
              const i = index(change.object);
              const previous = pods_list.items[i];
              const pod = pods_list.items[i] = change.object;
              if (pod.metadata.uid === pod_selected) {
                if (k8s.isPodTerminating(pod)) {
                  resources.setLabel(`Resources {grey-fg}[${container_selected}]{/grey-fg} {red-fg}TERMINATING{/red-fg}`);
                }
                const tag = k8s.isPodTerminating(pod) ? { tag: 'TERMINATING', style: 'red-fg' } : {};
                pod_log.setLabel(containerLogsLabel(pod, container_selected, tag));

                // perform selection actions in case the selected container is transitioning out of initialization
                // TODO: we could imagine to auto-select the next init container when the selected pod is initializing
                if (k8s.isContainerToBeRunning(previous, container_selected) && !k8s.isContainerToBeRunning(pod, container_selected)) {
                  selectContainer(pod, pod.spec.containers.concat(pod.spec.initContainers || []).find(c => c.name === container_selected));
                }
              }
              break;
            }
            case 'DELETED': {
              const pod = change.object;
              pods_list.items.splice(index(pod), 1);
              // check if that's the selected pod and clean up
              if (pod.metadata.uid === pod_selected) {
                cancellations.run('dashboard.pod');
                if (container_selected) {
                  resources.setLabel(`Resources {grey-fg}[${container_selected}]{/grey-fg} {red-fg}DELETED{/red-fg}`);
                  pod_log.setLabel(containerLogsLabel(pod, container_selected, { tag: 'DELETED', style: 'red-fg' }));
                }
                pod_selected = null;
                container_selected = null;
              }
              break;
            }
          }
          updatePodsTable();
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
      dashboard.run(current_namespace).catch(error => console.error(error.stack));
    }

    function refreshPodAges() {
      // we may want to avoid recreating the whole table data
      updatePodsTable();
      screen.render();
    }

    setupToggle(screen, debug, [pods_table, pod_log]);
  }
}

function setupToggle (screen, debug, validElements) {
  validElements.forEach(validElement => {
    let element = getElementWithLabel(validElement.options.label);
    if (element) {
      element.on('focus', () => {
        element.style.border.fg = 'red';
      });
      element.on('blur', () => {
        element.set("selected", false);
        element.style.border.fg = "white";
      });
    }
  })

  screen.key(['tab', 'S-tab'], function (_, key) {
    let currentIndex = getIndexOfFocused()
    if (currentIndex >= 0) {
      let nextIndex = getNextIndex(currentIndex, validElements.length - 1, (key.shift && key.name === 'tab') ? -1 : 1)
      let target = getElementWithLabel(validElements[nextIndex].options.label)
      if (target) target.focus();
    }
  });
  
  function getIndexOfFocused() {
    const focused = screen.children.find(element => element.focused);
    for (let i = 0; i < validElements.length; i ++) {
      if (validElements[i].options.label === focused.options.label) return i;
    }
    return -1;
  }

  function getElementWithLabel(label) {
    return screen.children.find(element => element.options.label === label);
  }

  function getNextIndex(currentIndex, maxIndex, increment) {
    let nextIndex = currentIndex + increment;
    return (nextIndex < 0) ? maxIndex : (nextIndex > maxIndex) ? 0 : nextIndex;
  }
}

function containerLogsLabel(pod, container, { tag, style } = {}) {
  let label = `Logs {grey-fg}[${container.name || container}]{/grey-fg} {inverse}${k8s.containerStateWithDetails(pod, container) || k8s.podPhase(pod)}{/inverse}`;
  if (tag) {
    label += ` {${style}}${tag}{/${style}}`;
  }
  return label;
}

module.exports = Dashboard;
