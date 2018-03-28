const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

var blessed = require('blessed');
var Kubebox = require('./lib/kubebox');

const EventEmitter = require('events');

const app = express();

app.use('/', express.static(__dirname));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
  const location = url.parse(req.url, true);

  class Duplex extends EventEmitter {
    constructor() {
      super();
      this.isTTY = true;
      this.writable = true;
      this.columns = 120;
      this.rows = 40;
    }
    write(data) {
      if (ws.readyState === WebSocket.OPEN) {
          const buffer = Buffer.from(data, 'utf-8');
          const message = Buffer.allocUnsafe(buffer.length + 1);
          message.writeUInt8(0, 0);
          buffer.copy(message, 1);
          ws.send(message);
      }
    }
  }

  const duplex = new Duplex();
//   var program = blessed.program({ input: ws, output: ws, tput: false });
  var screen = blessed.screen({
    input         : duplex,
    output        : duplex,
    terminal      : 'xterm-256color',
    resizeTimeout : 10,
    forceUnicode  : true,
    // smartCSR   : true,
    dockBorders   : true,
    autoPadding   : true,
    warnings      : true,
  });

  var kubebox = new Kubebox(screen);

  ws.on('message', function(data) {
    var cmd = data.readUInt8(0);
    data = data.slice(1);

    const { StringDecoder } = require('string_decoder');
    const decoder = new StringDecoder('utf8');
    data = decoder.end(data);

    // console.log('cmd:', cmd, 'data: ', data);
    switch(cmd) {
        case 0:
            // term.write(data);
            duplex.emit('data', data);
            break;
        case 1:
            data = JSON.parse(data);
            duplex.columns = data.columns;
            duplex.rows = data.rows;
            duplex.emit('resize');
            // term.resize(data.columns, data.rows);
            break;
        default:
            console.log('Unknown command: ' + cmd);
            break;
    }
  });
  ws.on('close', function() {
    console.log('close')
    // FIXME: abort all cancellations
    screen.destroy();
    delete kubebox;

  });
  ws.on('error', function() {
    console.log('error');
  });
});

server.listen(8080, function listening() {
  console.log('Listening on %d', server.address().port);
});