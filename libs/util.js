'use strict';

module.exports.delay = delay => new Promise(resolve => setTimeout(resolve, delay));
