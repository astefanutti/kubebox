require('./element');
require('./list');
require('./listbar');
require('./listtable');
require('./log');
require('./node');
require('./screen');
require('./table');

const blessed = require('blessed');

blessed.with = function (...fns) {
  return new Proxy(blessed, {
    get: function (target, method) {
      return function (...args) {
        const el = Reflect.apply(target[method], target, args);
        return fns.reduce((e, fn) => fn.call(null, e) || e, el);
      }
    }
  })
};
