'use strict';

const blessed = require('blessed');

module.exports.debug = blessed.log({
  label  : 'Debug',
  tags   : true,
  top    : 1,
  height : '100%-2',
  width  : '100%',
  border : 'line',
  keys   : true,
  vi     : true,
  mouse  : true,
  scrollable : true,
  scrollbar  : {
    ch    : ' ',
    style : { bg: 'white' },
    track : {
      style : { bg: 'grey' },
    }
  },
  style : {
    fg     : 'white',
    label  : { bold: true },
    border : { fg: 'white' },
  }
});

module.exports.log = message => new Promise(resolve => {
  module.exports.debug.log(message);
  resolve();
});
