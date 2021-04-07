'use strict';

const Logs = require('./logs'),
      util = require('util');

const { scroll, throttle } = require('./blessed/scroll');

const logs = new Logs({
  top    : 1,
  bottom : 1,
  width  : '100%',
  align  : 'left',
  tags   : true,
  keys   : true,
  mouse  : true,
  border : 'line',
  style  : {
    label : { bold: true },
  },
  scrollbar : {
    ch    : ' ',
    style : { bg: 'white' },
    track : {
      style : { bg: 'grey' },
    },
  },
}).with(scroll, throttle);

const writeln = function (line) {
  const l = logs._parseTags(line);
  logs.writeSync(l + '\n');
};

console.log = function (...args) {
  writeln(util.format.apply(util, args));
}

console.debug = function (...args) {
  const msg = util.format.apply(util, args.map(a => typeof a === 'object' ? util.inspect(a, { showHidden: true, depth: 5 }) : a));
  writeln(`{grey-fg}${msg}{/grey-fg}`);
}

console.error = function (...args) {
  const msg = util.format.apply(util, args.map(a => typeof a === 'object' ? util.inspect(a, { showHidden: true, depth: 5 }) : a));
  writeln(`{red-fg}${msg}{/red-fg}`);
}

console.info = function (...args) {
  const msg = util.format.apply(util, args.map(a => typeof a === 'object' ? util.inspect(a, { showHidden: true, depth: 5 }) : a));
  writeln(`{blue-fg}${msg}{/blue-fg}`);
}

console.warn = function (...args) {
  const msg = util.format.apply(util, args.map(a => typeof a === 'object' ? util.inspect(a, { showHidden: true, depth: 5 }) : a));
  writeln(`{yellow-fg}${msg}{/yellow-fg}`);
}

process.on('uncaughtException', function (err) {
  writeln(`{red-bg}${util.inspect(err, { showHidden: true, depth: 5 })}{/red-bg}`);
  writeln(`{red-bg}${err}{/red-bg}`);
});

module.exports = logs;
