#!/usr/bin/env node

'use strict';

const blessed = require('blessed'),
      Context = require('./lib/config/context'),
      fs      = require('fs'),
      Kubebox = require('./lib/kubebox');

const screen = blessed.screen({
  ignoreLocked: ['C-c']
});

screen.key(['q', 'C-c'], (ch, key) => process.exit(0));

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