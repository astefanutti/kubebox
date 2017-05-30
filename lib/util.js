'use strict';

module.exports.delay = delay => new Promise(resolve => setTimeout(resolve, delay));

module.exports.isEmpty = str => !str || str === '';