'use strict';

// TODO: display uncaught exception in a popup
// TODO: handle current namespace deletion nicely

const blessed    = require('blessed'),
      Client     = require('./client'),
      contrib    = require('blessed-contrib'),
      duration   = require('moment-duration-format'),
      fs         = require('fs'),
      get        = require('./http-then').get,
      moment     = require('moment'),
      os         = require('os'),
      path       = require('path'),
      task       = require('./task'),
      URI        = require('urijs'),
      util       = require('./util'),
      yaml       = require('js-yaml');

const KubeConfig = require('./config/manager');

const login      = require('./ui/login'),
      namespaces = require('./ui/namespaces');

const { isEmpty, isNotEmpty } = util;

const { call, delay, wait } = require('./promise');

class Kubebox {

  constructor(screen) {
    const session = {
      apis          : [],
      cancellations : new task.Cancellations(),
      namespace     : null,
      pod           : null,
      pods          : {},
      get openshift() {
        return this.apis.some(path => path === '/oapi' || path === '/oapi/v1');
      }
    };

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
      const name = session.pods.items[i - 1].metadata.name;
      if (name === session.pod)
        return;
      session.cancellations.run('dashboard.logs');
      session.pod = name;
      // just to update the table with the new selection
      setTableData(session.pods);
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
          .then(() => get(client.get_pod(session.namespace, name)))
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
              const { promise, cancellation } = get(client.follow_log(session.namespace, name, timestamp), timestamp
                ? function*() {
                  // sub-second info from the 'sinceTime' parameter are not taken into account
                  // so just strip the info and add a 'startsWith' check to avoid duplicates
                  yield* logger(timestamp.substring(0, timestamp.indexOf('.')));
                }
                : logger);
              session.cancellations.add('dashboard.logs', cancellation);
              return promise.then(() => debug.log(`Following log for pod ${session.pod} ...`));
            }
          })
          .catch(error => {
            // the pod might have already been deleted?
            if (!error.response || error.response.statusCode !== 404)
              console.error(error.stack);
          });
      };

      // FIXME: deal with multi-containers pod
      const { promise, cancellation } = get(client.follow_log(session.namespace, name), logger);
      session.cancellations.add('dashboard.logs', cancellation);
      promise
        .then(() => debug.log(`Following log for pod ${session.pod} ...`))
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
          pod.metadata.name === session.pod ? `{blue-fg}${pod.metadata.name}{/blue-fg}` : pod.metadata.name,
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

    // TODO: enable user scrolling and add timestamps
    const debug = grid.set(0, 0, 12, 12, contrib.log, {
      label : 'Logs',
      style : {
        fg     : 'white',
        border : { fg: 'white' }
      },
      bufferLength: 100
    });

    const log = message => new Promise(resolve => {
      debug.log(message);
      resolve();
    });

    // FIXME: the namespace selection handle should only be active
    // when the connection is established to the cluster
    screen.key(['n'], () => {
      namespaces.prompt(screen, session, client)
        .then(namespace => {
          if (namespace === session.namespace) return;
          resetDashboard();
          // switch dashboard to new namespace
          session.namespace = namespace;
          session.pod = null;
          debug.log(`Switching to namespace ${session.namespace}`);
          screen.render();
          return dashboard();
        })
        .catch(error => console.error(error.stack));
    });

    screen.key(['l', 'C-l'], (ch, key) =>
      logging().catch(error => console.error(error.stack))
    );

    const carousel = new contrib.carousel(
      [
        screen => {
          // TODO: restore selection if any
          screen.append(pods_table);
          screen.append(pod_log);
          pod_log.setScrollPerc(100);
          pods_table.focus();
        },
        screen => {
          screen.append(debug);
          debug.setScrollPerc(100);
        }
      ],
      {
        screen      : screen,
        interval    : 0,
        controlKeys : true
      }
    );
    carousel.start();

    const kube_config = new KubeConfig({ debug });
    const client = new Client();
    client.master_api = kube_config.current_context.getMasterApi();
    session.namespace = kube_config.current_context.namespace.name;

    // TODO: display login prompt with message on error
    if (client.master_api) {
      connect().catch(error => console.error(error.stack));
    } else {
      logging().catch(error => console.error(error.stack));
    }

    function connect(login) {
      // TODO: log more about client access workflow and info
      return get(client.get_apis())
        .then(response => session.apis = JSON.parse(response.body.toString('utf8')).paths)
        .catch(error => debug.log(`Unable to retrieve available APIs: ${error.message}`))
        .then(dashboard)
        .catch(error => error.response && [401, 403].includes(error.response.statusCode)
          ? log(`Authentication required for ${client.url} (openshift)`)
            .then(_ => login ? authenticate(login).then(_ => connect()) : logging())
          : Promise.reject(error));
    }

    function logging() {
      return login.prompt(screen, kube_config)
        // it may be better to reset the dashboard when authentication has succeeded
        .then(call(resetDashboard))
        .then(updateSessionAfterLogin)
        .then(connect);
    }

    function authenticate(login) {
      if (!session.openshift)
        return Promise.reject(Error(`No authentication available for: ${client.url}`));

      return (isNotEmpty(login.token) ? Promise.resolve(login.token)
        // try retrieving an OAuth access token from the OpenShift OAuth server
        : os.platform() === 'browser'
          ? get(client.oauth_authorize_web(login))
            .then(response => {
              const path = URI.parse(response.url).path;
              if (response.statusCode === 200 && path === '/oauth/token/display') {
                return response.body.toString('utf8').match(/<code>(.*)<\/code>/)[1];
              } else if (path === '/login') {
                const error = Error('Authentication failed!');
                // fake authentication error to emulate the implicit grant flow
                response.statusCode = 401;
                error.response = response;
                throw error;
              } else {
                throw Error('Unsupported authentication!');
              }
            })
          : get(client.oauth_authorize(login))
            .then(response => response.headers.location.match(/access_token=([^&]+)/)[1]))
        // test it authenticates ok
        .then(token => get(client.get_user(token))
          // then set the authorization header
          .then(call(_ => client.headers['Authorization'] = `Bearer ${token}`))
          // and return user details
          .then(response => JSON.parse(response.body.toString('utf8'))))
        // else reauthenticate
        .catch(error => error.response && error.response.statusCode === 401
            ? log(`Authentication failed for ${client.url} (openshift)!`)
                // throttle reauthentication
                .then(wait(1000))
                .then(logging)
            : Promise.reject(error));
    }

    function dashboard() {
      return (session.namespace ? Promise.resolve(session.namespace)
        : namespaces.prompt(screen, session, client, { promptAfterRequest : true })
          .then(namespace => session.namespace = namespace))
        .then(_ => get(client.get_pods(session.namespace)))
        .then(response => {
          session.pods = JSON.parse(response.body.toString('utf8'));
          session.pods.items = session.pods.items || [];
        })
        .then(() => setTableData(session.pods))
        .then(() => debug.log(`Watching for pods changes in namespace ${session.namespace} ...`))
        .then(() => screen.render())
        .then(() => {
          const id = setInterval(refreshPodAges, 1000);
          session.cancellations.add('dashboard.refreshPodAges', () => clearInterval(id));
        })
        .then(() => {
          const { promise, cancellation } = get(client.watch_pods(session.namespace,session.pods.metadata.resourceVersion), updatePodTable);
          session.cancellations.add('dashboard', cancellation);
          return promise;
        });
    }

    function resetDashboard() {
      // cancel current running tasks and open requests
      session.cancellations.run('dashboard');
      // reset dashboard widgets
      pods_table.setData([]);
      pod_log.setLabel('Logs');
      pod_log.logLines = [];
      pod_log.setItems([]);
      screen.render();
    }

    function* updatePodTable() {
      const index = object => session.pods.items.findIndex(pod => pod.metadata.uid === object.metadata.uid);
      let change;
      try {
        while (change = yield) {
          change = JSON.parse(change);
          switch (change.type) {
            case 'ADDED':
              session.pods.items.push(change.object);
              break;
            case 'MODIFIED':
              session.pods.items[index(change.object)] = change.object;
              break;
            case 'DELETED':
              session.pods.items.splice(index(change.object), 1);
              if (change.object.metadata.name === session.pod) {
                // check if that's the selected pod and clean the selection
                pod_log.setLabel(`Logs {grey-fg}[${session.pod}]{/grey-fg} {red-fg}DELETED{/red-fg}`);
                session.pod = null;
              }
              break;
          }
          setTableData(session.pods);
          screen.render();
        }
      } catch (e) {
        // HTTP chunked transfer-encoding / streaming watch requests abort on timeout when the 'timeoutSeconds'
        // request parameter is greater than the '--min-request-timeout' server API option,
        // otherwise the connections just end normally (http://kubernetes.io/docs/admin/kube-apiserver/).
        // WebSocket upgraded watch requests (idle?) end when timed out on Kubernetes.
      }
      // retry the pods list watch request
      session.cancellations.run('dashboard.refreshPodAges');
      dashboard().catch(error => console.error(error.stack));
    }

    function refreshPodAges() {
      session.pods.items.forEach(pod => moment(pod.status.startTime).add(1, 's').toISOString());
      // we may want to avoid recreating the whole table data
      setTableData(session.pods);
      screen.render();
    }

    function updateSessionAfterLogin(login) {
      kube_config.updateOrInsertContext(login);
      client.master_api = kube_config.current_context.getMasterApi();
      session.namespace = kube_config.current_context.namespace.name;
      return login;
    }
  }
}

module.exports = Kubebox;
