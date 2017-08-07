'use strict';

const contrib = require('blessed-contrib');

module.exports.debug = contrib.log({
  label  : 'Debug',
  height : '100%',
  width  : '100%',
  border : 'line',
  style  : {
    fg     : 'white',
    border : { fg: 'white' }
  },
  bufferLength : 100
});

module.exports.log = message => new Promise(resolve => {
  module.exports.debug.log(message);
  resolve();
});
