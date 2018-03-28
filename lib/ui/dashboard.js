'use strict';

const blessed  = require('blessed'),
      chart    = require('./chart'),
      debounce = require('lodash.debounce'),
      duration = require('moment-duration-format'),
      Exec     = require('./exec'),
      get      = require('../http-then').get,
      moment   = require('moment'),
      spinner  = require('./spinner'),
      task     = require('../task'),
      util     = require('../util');

const { isNotEmpty, humanBytes } = util;

const { delay } = require('../promise');

class Dashboard {

  constructor({ screen, navbar, status, client, debug }) {
    let current_namespace, pod_selected, container_selected, pods_list = [];
    const cancellations = new task.Cancellations();
    const dashboard = this;
    const { until } = spinner(screen);

    const pods_table = blessed.listtable({
      label         : 'Pods',
      parent        : screen,
      left          : 0,
      top           : 1,
      width         : '50%',
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
        label  : { bold: true },
        border : { fg: 'white' },
        text   : 'white',
      },
    });

    const tabs = blessed.listbar({
      parent : resources,
      top    : 0,
      left   : 1,
      right  : 1,
      height : 'shrink',
      mouse  : true,
      keys   : true,
      style  : {
        bg   : 'white',
        item : {
          fg : 'blue',
          bg : 'white',
          hover : {
            fg : 'white',
            bg : 'lightblue',
          },
        },
        selected : {
          bg: 'blue',
        }
      },
      commands: {
        'Memory': {
          keys     : ['M', 'm'],
          callback : function () {
            graphs.find(g => g.visible).toggle();
            memory_graph.toggle();
          }
        },
        'CPU': {
          keys     : ['C', 'c'],
          callback : function () {
            graphs.find(g => g.visible).toggle();
            cpu_graph.toggle();
          } 
        },
        'Net': {
          keys     : ['T', 't'],
          callback : function () {
            graphs.find(g => g.visible).toggle();
            net_graph.toggle();
          }
        },
      }
    });

    const memory_graph = new chart(resources, { top: 1, abbreviate: humanBytes });
    const cpu_graph = new chart(resources, { top: 1 });
    const net_graph = new chart(resources, { top: 1 });
    const graphs = [memory_graph, cpu_graph, net_graph];
    graphs.slice(1).forEach(g => g.toggle());

    const pod_log = blessed.log({
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
        border : { fg: 'white' },
      },
      scrollable : true,
      scrollbar  : {
        ch    : ' ',
        style : { bg: 'white' },
        track : {
          style : { bg: 'grey' },
        }
      },
    });
    pod_log.setScrollPerc(100);

    pod_log.reset = function () {
      this.setLabel('Logs');
      this.clear();
    }

    pods_table.key(['r'], (_) => {
      const pod = pods_list.items[pods_table.selected - 1];
      const name = pod.metadata.name;
      const namespace = pod.metadata.namespace;
      // FIXME: select which container in pod
      const container = pod.spec.containers[0].name;
      
      const id = namespace + name + container;
      const byId = page => page.id === id;
      // check if connection already exists
      if (navbar.select(byId)) return;

      const exec = new Exec({ screen, status, namespace, pod: name, container });
      const { promise, cancellation } = get(client.exec(namespace, name, { container, command: ['/bin/sh', '-c', `TERM=${exec.termName()} sh`] }), { generator: () => exec.print(), readable: exec });

      exec.on('exit', () => {
        cancellation();
        exec.kill();
        navbar.remove(byId);
      });

      promise
        .then(() => debug.log(`{grey-fg}Remote shell into '${namespace}/${name}/${container}'{/grey-fg}`))
        .then(() => {
          navbar.add({
            id     : id,
            name   : container,
            render : screen => exec.render(),
          }, { select: true });
        })
        .catch(error => console.error(error.stack));
    });

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
      resources.setLabel('Resources');
      graphs.forEach(g => g.reset());
      pod_log.reset();
      screen.render();

      const logger = function*(sinceTime) {
        let data, timestamp;
        const lines = [];
        const log = debounce(() => {
          pod_log.log(lines);
          lines.length = 0;
        }, 100, { trailing: true });
        cancellations.add('dashboard.pod.logs', () => log.cancel());
        try {
          while (data = yield) {
            // skip empty data frame payload on connect!
            if (data.length === 0) continue;
            data = data.toString('utf8');
            data.split(/\r\n|\r|\n/).filter(isNotEmpty).forEach(line => {
              const i = line.indexOf(' ');
              timestamp = line.substring(0, i);
              const l = line.substring(i + 1);
              // avoid scanning the whole buffer if the timestamp differs from the since time
              if (!timestamp.startsWith(sinceTime) || !pod_log._clines.fake.includes(l)) {
                lines.push(l);
                log();
              }
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
              resources.setLabel(`Resources {grey-fg}[${container_selected}]{/grey-fg} {red-fg}TERMINATING{/red-fg}`);
              pod_log.setLabel(`Logs {grey-fg}[${container_selected}]{/grey-fg} {red-fg}TERMINATING{/red-fg}`);
            } else {
              // TODO: max number of retries window
              // re-follow log from the latest timestamp received
              const { promise, cancellation } = get(client.follow_log(namespace, name, { container: container_selected, sinceTime: timestamp }), { generator: timestamp
                ? function*() {
                  // sub-second info from the 'sinceTime' parameter are not taken into account
                  // so just strip the info and add a 'startsWith' check to avoid duplicates
                  yield* logger(timestamp.substring(0, timestamp.indexOf('.')));
                }
                : logger });
              cancellations.add('dashboard.pod.logs', cancellation);
              return promise.then(() => debug.log(`{grey-fg}Following log for ${pod_selected}/${container_selected} ...{/grey-fg}`));
            }
          })
          .catch(error => {
            // the pod might have already been deleted?
            if (!error.response || error.response.statusCode !== 404)
              console.error(error.stack);
          });
      };

      const logs = get(client.follow_log(namespace, name, { container: container_selected }), { generator: logger });
      cancellations.add('dashboard.pod.logs', logs.cancellation);
      until(logs.promise)
        .spin(s => pod_log.setLabel(`${s} Logs {grey-fg}[${container_selected}]{/grey-fg}`))
        .cancel(c => cancellations.add('dashboard.pod.logs', c))
        .then(() => debug.log(`{grey-fg}Following log for ${pod_selected}/${container_selected} ...{/grey-fg}`))
        .then(() => pod_log.setLabel(`Logs {grey-fg}[${container_selected}]{/grey-fg}`))
        .then(() => screen.render())
        .catch(error => console.error(error.stack));

      const stats = updateStatsFromCAdvisor(pod, container);
      cancellations.add('dashboard.pod.stats', stats.cancellation);
      until(stats.promise)
        .spin(s => resources.setLabel(`${s} Resources`))
        .cancel(c => cancellations.add('dashboard.pod.stats', c))
        .then(() => {
          resources.setLabel(`Resources {grey-fg}[${container.name}]{/grey-fg}`);
          const id = setInterval(pod => {
            const { promise, cancellation } = updateStatsFromCAdvisor(pod, container);
            cancellations.set('dashboard.pod.stats.poll', cancellation);
            promise.catch(error => {
              cancellations.run('dashboard.pod.stats');
              // the pod might have already been deleted?
              if (!error.response || error.response.statusCode !== 404) {
                console.error(error.stack);
              }
            });
          }, 10000, pod);
          cancellations.add('dashboard.pod.stats', () => clearInterval(id));
        })
        .catch(error => {
          resources.setLabel('Resources');
          if (error.response) {
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
      let promise, request;
      if (client.openshift) {
        request = get(client.container_stats(pod.spec.nodeName, pod.metadata.namespace, pod.metadata.name, pod.metadata.uid, container.name), { cancellable: true });
        promise = request.promise
          .then(response => response.body.toString('utf8'))
      } else {
        request = get(client.cadvisor_container_stats(pod.spec.nodeName, pod.status.containerStatuses.find(c => c.name === container.name).containerID.slice(9)), { cancellable: true });
        promise = request.promise
          .then(response => response.body.toString('utf8'))
          .then(response => response.slice(response.indexOf(':') + 1, -1))
      }
      promise = promise
        .then(response => JSON.parse(response))
        .then(response => {
          const timestamps = response.stats.map(s => moment(s.timestamp).format('HH:mm:ss'));
          // memory
          const memory_cache = {
            title : 'Cache',
            x     : timestamps,
            y     : response.stats.map(s => s.memory.cache),
            style : { line: 'yellow' },
          };
          const memory_usage = {
            title : 'Usage',
            x     : timestamps,
            y     : response.stats.map(s => s.memory.usage),
            style : { line: 'blue' },
          };
          const memory_stats = [memory_usage, memory_cache];
          if (container.resources.limits && container.resources.limits.memory) {
            const memory_limit = {
              title : 'Limit',
              x     : timestamps,
              y     : Array(timestamps.length).fill(response.spec.memory.limit),
              style : { line: 'red' },
            };
            memory_stats.push(memory_limit);
          }
          memory_graph.setData(memory_stats);
          // CPU
          const periods = response.stats.map(s => moment(s.timestamp).format('X')).delta();
          const cpu_user = {
            title : 'User',
            x     : timestamps.slice(1),
            y     : response.stats.map(s => s.cpu.usage.user).delta().map((d, i) => d / 1000000000 / periods[i]),
            style : { line: 'cyan' },
          };
          const cpu_total = {
            title : 'Total',
            x     : timestamps.slice(1),
            y     : response.stats.map(s => s.cpu.usage.total).delta().map((d, i) => d / 1000000000 / periods[i]),
            style : { line: 'blue' },
          };
          const cpu_stats = [cpu_user, cpu_total];
          if (response.spec.cpu.quota) {
            const cpu_limit = {
              title : 'Limit',
              x     : timestamps.slice(1),
              y     : Array(timestamps.length - 1).fill(response.spec.cpu.quota / response.spec.cpu.period),
              style : { line: 'red' },
            };
            cpu_stats.push(cpu_limit);
          }
          cpu_graph.setData(cpu_stats);
          // network
          if (response.spec.has_network) {
            const net_rx = {
              title : 'RX',
              x     : timestamps,
              y     : response.stats.map(s => s.network.rx_bytes),
              style : { line: 'green' },
            };
            const net_tx = {
              title : 'TX',
              x     : timestamps,
              y     : response.stats.map(s => s.network.tx_bytes),
              style : { line: 'cyan' },
            };
            const net_stats = [net_rx, net_tx];
            net_graph.setData(net_stats);
          } else {
            net_graph.message('Network usage unavailable', { bg: 'yellow' });
          }
        });
      return { promise, cancellation: request.cancellation };
    }

    this.render = function () {
      // TODO: restore selection if any
      screen.append(pods_table);
      screen.append(resources);
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
      resources.setLabel('Resources');
      graphs.forEach(g => g.reset());
      pod_log.reset();
      // render
      screen.render();
    }

    // FIXME: handle current namespace deletion nicely
    this.run = function (namespace) {
      current_namespace = namespace;
      // FIXME: should be cancellable
      return until(get(client.get_pods(current_namespace)))
        .spin(s => pods_table.setLabel(`${s} Pods`))
        .succeed(_ =>  pods_table.setLabel('Pods'))
        .then(response => {
          pods_list = JSON.parse(response.body.toString('utf8'));
          pods_list.items = pods_list.items || [];
        })
        .then(() => updatePodsTable(pods_list))
        .then(() => debug.log(`{grey-fg}Watching for pods changes in namespace ${current_namespace} ...{/grey-fg}`))
        .then(() => screen.render())
        .then(() => {
          const id = setInterval(refreshPodAges, 1000);
          cancellations.add('dashboard.refreshPodAges', () => clearInterval(id));
        })
        .then(() => {
          const { promise, cancellation } = get(client.watch_pods(current_namespace, pods_list.metadata.resourceVersion), { generator: updatePodTable });
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
                resources.setLabel(`Resources {grey-fg}[${container_selected}]{/grey-fg} {red-fg}DELETED{/red-fg}`);
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
      dashboard.run(current_namespace).catch(error => console.error(error.stack));
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
