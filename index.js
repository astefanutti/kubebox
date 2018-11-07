#!/usr/bin/env node

'use strict';

const terminal = process.env.TERM || (process.platform === 'win32' ? 'windows-ansi' : 'xterm');
// theming, it has to be the first to hack into blessed Node module
if (!['xterm-color', 'xterm-16color', 'xterm-256color'].includes(terminal)) {
  require('./lib/ui/theme');
}

const blessed       = require('blessed'),
      cancellations = require('./lib/task'),
      Context       = require('./lib/config/context'),
      fs            = require('fs'),
      Kubebox       = require('./lib/kubebox');

const screen = blessed.screen({
  ignoreLocked: ['C-q'],
});

screen.key(['q', 'C-q'], (ch, key) => {
  cancellations.runAll();
  process.exit(0);
});

let server;

if (process.env.KUBERNETES_SERVICE_HOST && process.env.KUBERNETES_SERVICE_PORT) {
  const host = process.env.KUBERNETES_SERVICE_HOST;
  const port = process.env.KUBERNETES_SERVICE_PORT;
  const ca = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt');
  const token = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token');
  server = Context.getBaseMasterApi(`https://${host}:${port}`);
  server.ca = ca;
  server.headers = {
    Authorization : `Bearer ${token.toString('ascii')}`,
  };
}

new Kubebox(screen, server);