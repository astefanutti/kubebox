process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var blessed  = require('blessed'),
    contrib  = require('blessed-contrib'),
    moment   = require('moment'),
    duration = require("moment-duration-format"),
    screen   = blessed.screen();

var session = {
  pods: {}
};

// https://docs.openshift.org/latest/architecture/additional_concepts/authentication.html
// https://github.com/openshift/openshift-docs/issues/707
var authorize = {
  hostname: '192.168.64.3',
  protocol: 'https:',
  port    : 8443,
  path    : '/oauth/authorize?client_id=openshift-challenging-client&response_type=token',
  method  : 'GET',
  auth    : 'admin:admin'
};

var get_pods = token => ({
  hostname: '192.168.64.3',
  protocol: 'https:',
  port    : 8443,
  path    : '/api/v1/namespaces/default/pods',
  method  : 'GET',
  headers : {
    'Authorization': `Bearer ${token}`,
    'Accept'       : 'application/json, text/plain, */*'
  }
});

var watch_pods = (token, resourceVersion) => ({
  hostname: '192.168.64.3',
  protocol: 'https:',
  port    : 8443,
  path    : `/api/v1/namespaces/default/pods?watch=true&resourceVersion=${resourceVersion}&access_token=${token}`,
  method  : 'GET',
  headers : {
    'Authorization': `Bearer ${token}`,
    'Accept'       : 'application/json, text/plain, */*'
  }
});

var grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

var table = grid.set(0, 0, 6, 6, contrib.table, {
  keys         : true,
  fg           : 'white',
  selectedFg   : 'white',
  selectedBg   : 'blue',
  interactive  : true,
  label        : 'Pods',
  width        : '50%',
  height       : '30%',
  border       : {type: 'line', fg: 'cyan'},
  columnSpacing: 3,
  columnWidth  : [32, 9, 15]
});

table.focus();

var log = grid.set(0, 6, 6, 6, contrib.log, {
  fg        : "green",
  selectedFg: "green",
  label     : 'Logs'
});

screen.key(['escape', 'q', 'C-c'], (ch, key) => process.exit(0));
screen.render();

get(authorize)
  .then(response => response.headers.location.match(/access_token=([^&]+)/)[1])
  .then(token => session.access_token = token)
  .then(token => get(get_pods(session.access_token)))
  .then(response => JSON.parse(response.body.toString('utf8')))
  .then(pods => {
    table.setData({
      headers: ['NAME', 'STATUS', 'AGE'],
      data   : pods.items.reduce((data, pod) => {
        data.push([
          pod.metadata.name,
          pod.status.phase,
          moment.duration(moment().diff(moment(pod.status.startTime))).format()
        ]);
        return data;
      }, [])
    });
    session.pods.resourceVersion = pods.metadata.resourceVersion;
  })
  .then(() => log.log('watching...'))
  .then(() => screen.render())
  .then(() => get(watch_pods(session.access_token, session.pods.resourceVersion)))
  .catch(console.error);

function get(options) {
  return new Promise((resolve, reject) => {
    const lib = (options.protocol || 'http').startsWith('https') ? require('https') : require('http');
    lib.get(options, response => {
      if (response.statusCode < 200 || response.statusCode >= 400) {
        reject(new Error('Failed to load page, status code: ' + response.statusCode));
      }
      // response.setEncoding('utf8');
      const body = [];
      response.on('data', chunk => {
        log.log(chunk.toString('utf8'));
        body.push(chunk);
      });
      // FIXME: do not resolve when the promise on end if already rejected!
      response.on('end', () => resolve({
        statusCode   : response.statusCode,
        statusMessage: response.statusMessage,
        headers      : response.headers,
        body         : Buffer.concat(body)
      }));
    }).on('error', reject);
  })
}