'use strict';

module.exports.delay = (promise, delay) => new Promise(resolve => setTimeout(resolve, delay))
  .then(() => promise);
