#!/usr/bin/env node

'use strict';

const blessed = require('blessed'),
      Kubebox = require('./lib/kubebox');

const screen = blessed.screen({
  ignoreLocked: ['C-c']
});

screen.key(['q', 'C-c'], (ch, key) => process.exit(0));

new Kubebox(screen);