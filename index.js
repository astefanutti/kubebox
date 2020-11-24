#!/usr/bin/env node

'use strict';

const { theme, TERM } = require('./lib/ui/theme');
// theming, it has to be the first to hack into blessed Node module
if (!['xterm-color', 'xterm-16color', 'xterm-256color'].includes(TERM)) {
  // skip Blessed Node constructor interception as it is done by Webpack
  if (!WEBPACK) {
    const Module = require('module');
    const _require = Module.prototype.require;
    Module.prototype.require = function (path) {
      const module = _require.apply(this, arguments);
      if (path === './node') {
        const Node = function (options) {
          theme(this, options);
          return module.call(this, options);
        }
        Node.prototype = module.prototype;
        return Node;
      }
      return module;
    }
  };
  // override tags parsing
  const blessed = require('blessed');
  const _parseTags = blessed.Element.prototype._parseTags;
  blessed.Element.prototype._parseTags = function (text) {
    if (!this.parseTags) return text;
    if (!/{\/?[\w\-,;!#]*}/.test(text)) return text;

    return _parseTags.call(this, text.replace(/\{(\/)?grey-fg\}/g, '{$1white-fg}'));
  }
}

const blessed       = require('blessed'),
      cancellations = require('./lib/task'),
      Context       = require('./lib/config/context'),
      fs            = require('fs'),
      Kubebox       = require('./lib/kubebox');

const screen = blessed.screen({
  ignoreLocked : ['C-q'],
  fullUnicode  : true,
  dockBorders  : true,
  autoPadding  : false,
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
    Authorization: `Bearer ${token.toString('ascii')}`,
  };
}

new Kubebox(screen, server);
