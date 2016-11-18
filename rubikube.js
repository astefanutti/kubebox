process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var blessed  = require('blessed'),
    contrib  = require('blessed-contrib'),
    moment   = require('moment'),
    duration = require("moment-duration-format"),
    screen   = blessed.screen();

var authorize = {
  hostname: '192.168.64.3',
  protocol: 'https:',
  port    : 8443,
  path    : '/oauth/authorize?client_id=openshift-challenging-client&response_type=token',
  method  : 'GET',
  auth    : 'admin:admin'
};

var pods = token => ({
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

get(authorize)
  .then(response => response.headers.location.match(/access_token=([^&]+)/)[1])
  .then(token => get(pods(token)))
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
  })
  .then(() => screen.render())
  .catch(console.error);

var table = contrib.table({
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
screen.append(table);

screen.key(['escape', 'q', 'C-c'], (ch, key) => process.exit(0));

screen.render();

function get(options) {
  return new Promise((resolve, reject) => {
    const lib = (options.protocol || 'http').startsWith('https') ? require('https') : require('http');
    lib.get(options, response => {
      if (response.statusCode < 200 || response.statusCode >= 400) {
        reject(new Error('Failed to load page, status code: ' + response.statusCode));
      }
      // response.setEncoding('utf8');
      const body = [];
      response.on('data', chunk => body.push(chunk));
      response.on('end', () => resolve({
        statusCode   : response.statusCode,
        statusMessage: response.statusMessage,
        headers      : response.headers,
        body         : Buffer.concat(body)
      }));
    }).on('error', reject);
  })
}