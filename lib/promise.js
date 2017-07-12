'use strict';

module.exports.delay = delay => new Promise(resolve => setTimeout(resolve, delay));

module.exports.wait = ms => () => module.exports.delay(ms);

module.exports.call = f => val => {
  f(); return val;
};
