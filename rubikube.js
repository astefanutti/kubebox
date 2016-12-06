// TODO: display uncaught exception in a popup
// TODO: retrieve k8s master URL from the env or as an arg

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const blessed  = require('blessed'),
      contrib  = require('blessed-contrib'),
      moment   = require('moment'),
      duration = require('moment-duration-format'),
      task     = require('./lib/task'),
      screen   = blessed.screen();

const session = {
  access_token : null,
  cancellations: new task.Cancellations(),
  namespace    : 'default',
  namespaces   : {},
  pod          : null,
  pods         : {}
};

// https://docs.openshift.org/latest/architecture/additional_concepts/authentication.html
// https://github.com/openshift/openshift-docs/issues/707
// TODO: try reading the token from ~/.kube/config
const authorize = {
  hostname: '192.168.64.3',
  protocol: 'https:',
  port    : 8443,
  path    : '/oauth/authorize?client_id=openshift-challenging-client&response_type=token',
  method  : 'GET',
  // TODO: prompt for credentials
  auth    : 'admin:admin'
};

const get_namespaces = token => ({
  hostname: '192.168.64.3',
  protocol: 'https:',
  port    : 8443,
  path    : '/api/v1/namespaces',
  method  : 'GET',
  headers : {
    'Authorization': `Bearer ${token}`,
    'Accept'       : 'application/json, text/plain, */*'
  }
});

const get_pods = (namespace, token) => ({
  hostname: '192.168.64.3',
  protocol: 'https:',
  port    : 8443,
  path    : `/api/v1/namespaces/${namespace}/pods`,
  method  : 'GET',
  headers : {
    'Authorization': `Bearer ${token}`,
    'Accept'       : 'application/json, text/plain, */*'
  }
});

const watch_pods = (namespace, token, resourceVersion) => ({
  hostname: '192.168.64.3',
  protocol: 'https:',
  port    : 8443,
  path    : `/api/v1/namespaces/${namespace}/pods?watch=true&resourceVersion=${resourceVersion}&access_token=${token}`,
  method  : 'GET',
  headers : {
    'Authorization': `Bearer ${token}`,
    'Accept'       : 'application/json, text/plain, */*'
  }
});

const get_logs = (namespace, pod, token) => ({
  hostname: '192.168.64.3',
  protocol: 'https:',
  port    : 8443,
  path    : `/api/v1/namespaces/${namespace}/pods/${pod}/log?follow=true&tailLines=10`,
  method  : 'GET',
  headers : {
    'Authorization': `Bearer ${token}`,
    'Accept'       : 'application/json, text/plain, */*'
  }
});

const grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

const table = grid.set(0, 0, 6, 6, blessed.listtable, {
  border       : 'line',
  align        : 'left',
  keys         : true,
  tags         : true,
  shrink       : false,
  noCellBorders: true,
  // FIXME: margin isn't incremented for child list in scrollable list table
  scrollbar    : {
    ch   : ' ',
    style: {bg: 'white'},
    track: {
      style: {bg: 'black'}
    }
  },
  style        : {
    border: {fg: 'white'},
    header: {fg: 'blue', bold: true},
    cell  : {fg: 'white', selected: {bg: 'blue'}}
  }
});

table.on('select', (item, i) => {
  const pod = session.pods.items[i - 1].metadata.name;
  if (pod === session.pod)
    return;
  session.cancellations.run('dashboard.logs');
  session.pod = pod;
  setTableData(session.pods);
  logs.setLabel('Logs');
  logs.logLines = [];
  logs.setItems([]);
  screen.render();
  // FIXME: provide container name for multi-containers pod
  const {promise, cancellation} = get(get_logs(session.namespace, pod, session.access_token), function*() {
    while (true) {
      logs.log((yield).toString('utf8'));
    }
  });
  session.cancellations.add('dashboard.logs', cancellation);
  promise
    .then(() => logs.setLabel(`Logs {grey-fg}[${pod}]{/grey-fg}`))
    .then(() => screen.render())
    .catch(console.error);
});
// work-around for https://github.com/chjj/blessed/issues/175
table.on('remove', () => table.removeLabel());
table.on('prerender', () => table.setLabel('Pods'));

function setTableData(pods) {
  const selected = table.selected;
  table.setData(pods.items.reduce((data, pod) => {
    data.push([
      pod.metadata.name === session.pod ? `{blue-fg}${pod.metadata.name}{/blue-fg}` : pod.metadata.name,
      // TODO: be more fine grained for the status
      pod.status.phase,
      // FIXME: negative duration is displayed when pod starts as clocks may not be synced
      formatDuration(moment.duration(moment().diff(moment(pod.status.startTime))))
    ]);
    return data;
  }, [['NAME', 'STATUS', 'AGE']]));
  table.select(selected);
}

function formatDuration(duration) {
  if (duration.years() > 0)
    return duration.format('y[y] M[M]');
  else if (duration.months() > 0)
    return duration.format('M[M] d[d]');
  else if (duration.days() > 0)
    return duration.format('d[d] h[h]');
  else if (duration.hours() > 0)
    return duration.format('h[h] m[m]');
  else if (duration.minutes() > 0)
    return duration.format('m[m] s[s]');
  else
    return duration.format('s[s]');
}

// TODO: enable user scrolling
const logs = grid.set(6, 0, 6, 12, contrib.log, {
  border: 'line',
  align : 'left',
  label : 'Logs',
  tags  : true,
  style : {
    border: {fg: 'white'}
  }
});
// work around the error thrown when logs are added while the widget is detached
logs.on('detach', () => {
  logs.scrollOnInput = false;
  logs._userScrolled = true;
});
logs.on('attach', () => {
  logs.scrollOnInput = true;
  logs.setScrollPerc(100);
  screen.render();
});

const debug = grid.set(0, 0, 12, 12, contrib.log, {
  label: 'Logs',
  style: {
    fg    : 'white',
    border: {fg: 'white'}
  }
});

// TODO: display a list table with some high level info about the namespaces
const list = blessed.list({
  top      : 'center',
  left     : 'center',
  width    : '50%',
  height   : '50%',
  label    : 'Namespaces',
  keys     : true,
  tags     : true,
  border   : {type: 'line'},
  scrollbar: {
    ch   : ' ',
    style: {bg: 'white'},
    track: {
      style: {bg: 'black'}
    }
  },
  style    : {
    fg      : 'white',
    border  : {fg: 'white'},
    selected: {bg: 'blue'}
  }
});
list.on('cancel', () => {
  list.detach();
  screen.render();
});
list.on('select', (item, i) => {
  list.detach();
  screen.render();
  const namespace = session.namespaces.items[i].metadata.name;
  if (namespace === session.namespace)
    return;
  // cancel current running tasks and open requests
  debug.log(`Cancelling background tasks for namespace ${session.namespace}`);
  session.cancellations.run('dashboard');
  // reset dashboard widgets
  table.clearItems();
  logs.setLabel('Logs');
  logs.logLines = [];
  logs.setItems([]);
  // switch dashboard to new namespace
  session.namespace = namespace;
  session.pod       = null;
  debug.log(`Switching to namespace ${session.namespace}`);
  screen.render();
  dashboard().catch(console.error);
});

screen.key(['n'], () => {
  screen.append(list);
  list.clearItems();
  list.focus();
  screen.render();
  // TODO: watch for namespace changes when the selection list is open
  get(get_namespaces(session.access_token))
    .then(response => JSON.parse(response.body.toString('utf8')))
    .then(namespaces => session.namespaces = namespaces)
    .then(namespaces => list.setItems(namespaces.items.reduce((data, namespace) => {
      data.push(namespace.metadata.name === session.namespace ?
        `{blue-fg}${namespace.metadata.name}{/blue-fg}` : namespace.metadata.name);
      return data;
    }, [])))
    .then(() => screen.render())
    .catch(console.error);
});

screen.key(['q', 'C-c'], (ch, key) => process.exit(0));

const carousel = new contrib.carousel([screen => {
  // TODO: restore selection if any
  screen.append(table);
  screen.append(logs);
  table.focus();
}, screen => screen.append(debug)], {
  screen     : screen,
  interval   : 0,
  controlKeys: true
});
carousel.start();

get(authorize)
  .then(response => response.headers.location.match(/access_token=([^&]+)/)[1])
  .then(token => session.access_token = token)
  .then(() => dashboard())
  .catch(console.error);

function dashboard(cancellations = session.cancellations) {
  return get(get_pods(session.namespace, session.access_token))
    .then(response => JSON.parse(response.body.toString('utf8')))
    .then(pods => session.pods = pods)
    .then(() => setTableData(session.pods))
    .then(() => debug.log(`Watching for pods changes in namespace ${session.namespace} ...`))
    .then(() => screen.render())
    .then(() => {
      const {promise, cancellation} = get(watch_pods(session.namespace, session.access_token, session.pods.metadata.resourceVersion), updatePodTable);
      cancellations.add('dashboard', cancellation);
      return promise;
    })
    .then(() => {
      const id = setInterval(refreshPodAges, 1000);
      cancellations.add('dashboard', () => clearInterval(id));
    });
}

function* updatePodTable() {
  let change, buffer = '';
  while (change = (yield).toString('utf8')) {
    buffer += change;
    try {
      change = JSON.parse(buffer);
      buffer = '';
    } catch (error) {
      continue
    }
    const index = object => session.pods.items.findIndex(pod => pod.metadata.uid === object.metadata.uid);
    switch (change.type) {
      case 'ADDED':
        session.pods.items.push(change.object);
        break;
      case 'MODIFIED':
        session.pods.items[index(change.object)] = change.object;
        break;
      case 'DELETED':
        session.pods.items.splice(index(change.object), 1);
        break;
    }
    setTableData(session.pods);
    screen.render();
  }
}

function refreshPodAges() {
  session.pods.items.forEach(pod => moment(pod.status.startTime).add(1, 's').toISOString());
  // we may want to avoid recreating the whole table data
  setTableData(session.pods);
  screen.render();
}

function get(options, generator, async = true) {
  return generator ? getStream(options, generator, async) : getBody(options);
}

// we may want to support cancellation of the returned pending promise
function getBody(options) {
  return new Promise((resolve, reject) => {
    const client = (options.protocol || 'http').startsWith('https') ? require('https') : require('http');
    client.get(options, response => {
      if (response.statusCode >= 400) {
        response.destroy(new Error(`Failed to get resource ${options.path}, status code: ${response.statusCode}`));
        return;
      }
      const body = [];
      response.on('data', chunk => body.push(chunk))
        .on('end', () => {
          response.body = Buffer.concat(body);
          resolve(response);
        });
    }).on('error', reject);
  })
}

function getStream(options, generator, async = true) {
  let request;
  const promise = new Promise((resolve, reject) => {
    const client = (options.protocol || 'http').startsWith('https') ? require('https') : require('http');
    request      = client.get(options, response => {
      if (response.statusCode >= 400) {
        // we may want to throw the generator if the request is aborted / closed
        response.destroy(new Error(`Failed to get resource ${options.path}, status code: ${response.statusCode}`));
        return;
      }
      const gen = generator();
      gen.next();
      response.on('data', chunk => {
        const res = gen.next(chunk);
        if (res.done) {
          // we may work on the http.ClientRequest if needed
          response.destroy();
          response.body = res.value;
          // ignored for async as it's already been resolved
          resolve(response);
        }
      });
      if (async) {
        resolve(response);
        response.on('end', () => {
          // ignored if the generator is done already
          gen.return();
        });
      } else {
        response.on('end', () => {
          const res = gen.next();
          if (!res.done) {
            response.body = res.value;
            resolve(response);
          }
        });
      }
    }).on('error', reject);
  });
  return {
    promise     : promise,
    // destroy the http.ClientRequest on cancellation
    cancellation: request ? () => request.abort() : () => void 0
  }
}