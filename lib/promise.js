'use strict';

module.exports.delay = delay => value => new Promise(resolve => setTimeout(resolve, delay, value));

module.exports.pause = (ms, value) => module.exports.delay(ms)(value);

module.exports.wait = ms => () => module.exports.pause(ms);

module.exports.log = (...args) => new Promise(resolve => {
  console.log(...args);
  resolve();
});
