'use strict';

const blessed      = require('blessed'),
      chart        = require('./chart'),
      debounce     = require('lodash.debounce'),
      duration     = require('moment-duration-format'),
      EventEmitter = require('events'),
      Events       = require('./events'),
      Exec         = require('./exec'),
      k8s          = require('../kubernetes'),
      Logs         = require('./logs'),
      moment       = require('moment'),
      task         = require('../task'),
      util         = require('../util');

const { humanBytes, humanCores, humanNet } = util;
const { AddEvent, SelectEvent } = require('./navbar');
const { error } = require('../error');
const { pause } = require('../promise');
const { focus: { focusIndicator }, setLabel, spinner: { until } } = require('./ui');
const { scroll, throttle } = require('./blessed/scroll');

const statsPollRateMs = 10000;

class Dashboard extends EventEmitter {

  constructor({ screen, navbar, status, client }) {
    super();
    let current_namespace, pod_selected, container_selected, pods_list = {};
    const cancellations = new task.Cancellations();
    const dashboard = this;

    const pods_table = blessed.with(focusIndicator, scroll, throttle).listtable({
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

    let pods_table_text;
    function pods_table_message(text, options = {}) {
      if (pods_table_text) pods_table_text.destroy();
      pods_table_text = blessed.text(Object.assign({
        parent  : pods_table,
        tags    : true,
        top     : 'center',
        left    : 'center',
        content : text,
      }, options));
    }

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

    const pod_log = new Logs({
      label  : 'Logs',
      top    : '50%',
      bottom : '1',
      width  : '100%',
      align  : 'left',
      tags   : false,
      keys   : true,
      mouse  : true,
      border : 'line',
      style  : {
        label : { bold: true },
      },
      scrollbar : {
        ch    : ' ',
        style : { bg: 'white' },
        track : {
          style : { bg: 'grey' },
        },
      },
    }).with(focusIndicator, scroll, throttle);

    pods_table.key(['e'], () => {
      // no selection
      if (!pods_table.selected) return;
      const pod = pods_list.items[pods_table.selected - 1];
      const name = pod.metadata.name;

      const id = `events-${current_namespace}-${name}`;
      if (navbar.select(id)) {
        return;
      }
      const events_tab = new Events({ client, status, namespace: current_namespace, involvedObject: pod.metadata });
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
      const events_tab = new Events({ client, status, namespace: current_namespace });
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
      const events_tab = new Events({ client, status });
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

      const exec = new Exec({ screen, status });
      const { promise, _ } = client.pod(namespace, name).exec({ container, command: ['/bin/sh', '-c', `TERM=${exec.termName()} $( (type getent > /dev/null 2>&1 && getent passwd root | cut -d: -f7 2>/dev/null) || echo /bin/sh)`] }).get({ generator: exec.output, readable: exec });

      navbar.add({
        id     : id,
        title  : container,
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
          console.debug(`Remote shell into '${namespace}/${name}/${container}'`);
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
      pod_log.setLabel('Logs');
      pod_log.reset();
      screen.render();

      // a container in a pod in Error or CrashLoopBackOff can be waiting,
      // yet it's possible to query logs from previous runs
      const status = k8s.containerStatus(pod, container);
      if (k8s.isPodPending(pod) && (!status || status.restartCount == 0)) {
        pod_log.setLabel(containerLogsLabel(pod, container));
        screen.render();
        // let's the pods watch request handler deal with the selected container once it's done initializing
        return;
      }

      selectContainer(pod, container);
      pod_log.focus()
    });

    function selectContainer(pod, container) {
      const namespace = pod.metadata.namespace;
      let tail = [];
      const logger = function* (sinceTime) {
        let data, timestamp, retry = !!sinceTime;
        const chunks = [];
        const log = debounce(() => {
          pod_log.writeSync(chunks.join(''));
          chunks.length = 0;
        }, 100, { trailing: true });
        cancellations.add('dashboard.pod.logs', () => log.cancel());
        try {
          while (data = yield) {
            // an initial ping frame with 0-length data is being sent
            if (data.length === 0) continue;

            data = data.toString('utf8');
            const i = data.indexOf(' ');
            timestamp = data.substring(0, i);

            // maintain a cache for the lastest timestamp to de-duplicate entries on retry,
            // as sub-second info from the 'sinceTime' parameter are not taken into account
            const ts = timestamp.substring(0, timestamp.indexOf('.'));
            if (retry) {
              if (ts === sinceTime) {
                if (tail.includes(data)) continue;
              } else {
                retry = false;
              }
            }
            const j = tail.findIndex(l => !l.startsWith(ts));
            if (j > 0) {
              tail.length = j;
            }
            tail.unshift(data);

            const chunk = data.substring(i + 1);
            chunks.push(chunk);
            log();
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
            return promise.then(() => console.debug(`Following log for ${pod.metadata.name}/${container.name}`));
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
        .do(pod_log, pod_log.setLabel)
        .spin(s => `${s} Logs {grey-fg}[${container.name}]{/grey-fg}`)
        .cancel(c => cancellations.add('dashboard.pod.logs', c))
        .catch(error => {
          pod_log.setLabel(`Logs {grey-fg}[${container.name}]{/grey-fg}`);
          pod_log.writeSync(`\x1b[31mError: ${error.message}\x1b[m\n`);
          screen.render();
          return Promise.reject();
        })
        .then(() => {
          console.debug(`Following log for ${pod.metadata.name}/${container.name} ...`);
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
          screen.render();
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
          memory_graph.setData([memory_usage, memory_cache]);

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
          cpu_graph.setData([cpu_user, cpu_total]);

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

    this.on(AddEvent, ({ page }) => {
      page.focus = pods_table;
    });

    this.on(SelectEvent, ({ screen }) => {
      screen.append(pods_table);
      screen.append(resources);
      screen.append(pod_log);
      screen.append(status);
      updatePodsTable();
      screen.render();
    });

    this.reset = function (page) {
      // cancel current running tasks and open requests
      cancellations.run('dashboard');
      // reset state
      current_namespace = null;
      pod_selected = null;
      container_selected = null;
      pods_list = {};
      // reset dashboard widgets
      pods_table.setLabel('Pods');
      pods_table.setData([]);
      if (pods_table_text) {
        pods_table_text.destroy();
        pods_table_text = null;
      }
      // reset focus
      if (pods_table.detached) {
        page.focus = pods_table;
      } else {
        pods_table.focus();
      }
      resources.setLabel('Resources');
      graphs.forEach(g => g.reset());
      pod_log.setLabel('Logs');
      pod_log.reset();
      screen.render();
    }

    // FIXME: handle current namespace deletion nicely
    this.run = function (namespace) {
      current_namespace = namespace;
      let listPodsError;
      let { promise, cancellation } = client.pods(namespace).get({ cancellable: true });
      cancellations.add('dashboard.pods', cancellation);
      promise = until(promise)
        .do(pods_table, pods_table.setLabel)
        .spin(s => `${s} Pods {grey-fg}[${namespace}]{/grey-fg}`)
        .cancel(c => cancellations.add('dashboard.pods', c))
        .done(_ => `Pods {grey-fg}[${namespace}]{/grey-fg}`)
        .then(response => {
          pods_list = JSON.parse(response.body.toString('utf8'));
          pods_list.items = pods_list.items || [];
          updatePodsTable();
          screen.render();
        }).catch(error => {
          listPodsError = error;
          pods_table_message(`{red-bg}Error: ${error.message}{/red-bg}`);
          screen.render();
          return Promise.reject(error);
        });

      promise
        .then(() => {
          console.debug(`Watching for pods changes in namespace ${namespace} ...`);
          screen.render();
          const id = setInterval(refreshPodAges, 1000);
          cancellations.add('dashboard.refreshPodAges', () => clearInterval(id));
          const { promise, cancellation } = client.pods(namespace)
            .watch(pods_list.metadata.resourceVersion)
            .get({
              generator: function* () {
                yield* watchPodChanges(namespace);
              }
            });
          cancellations.add('dashboard.pods', cancellation);
          return promise;
        })
        .catch(error => {
          if (!listPodsError) {
            pods_table_message(`{red-bg}Error: ${error.message}{/red-bg}`);
            console.error(error.stack);
            screen.render();
          }
        });

      return promise;
    }

    function* watchPodChanges(namespace) {
      const index = object => pods_list.items.findIndex(pod => pod.metadata.uid === object.metadata.uid);
      let change;
      try {
        while (change = yield) {
          change = JSON.parse(change);
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
      dashboard.run(namespace).catch(error => console.error(error.stack));
    }

    function refreshPodAges() {
      // we may want to avoid recreating the whole table data
      updatePodsTable();
      screen.render();
    }
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
