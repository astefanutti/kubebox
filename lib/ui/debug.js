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
    fg     : 'white',
    label  : { bold: true },
    border : { fg: 'white' },
  }
});

module.exports = screen => {
  const d = debug(screen);
  return {
    debug : d,
    log   : message => new Promise(resolve => {
      d.log(message);
      resolve();
    }),
  }
};
