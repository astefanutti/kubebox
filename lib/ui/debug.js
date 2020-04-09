'use strict';

const blessed = require('blessed');

const debug = screen => blessed.log({
  screen : screen,
  label  : 'Debug',
  tags   : true,
  top    : 1,
  bottom : 1,
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
    label : { bold: true },
  }
});

module.exports = screen => {
  const d = debug(screen);
  return {
    debug : d,
    log : (...args) => new Promise(resolve => {
      d.log(args);
      resolve();
    }),
  }
};
