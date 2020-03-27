'use strict';

const os = require('os');

Object.defineProperties(Array.prototype, {
  flatMap: {
    value: function (f) {
      return Array.prototype.concat.apply([], this.map(f));
    },
    writeable  : false,
    enumerable : false,
  }
});

Object.defineProperties(Array.prototype, {
  delta: {
    value: function () {
      return this.reduce((r, v, i, a) => {
        if (i < a.length - 1)
          r.push(a[i + 1] - a[i]);
        return r;
      }, []);
    },
    writeable  : false,
    enumerable : false,
  }
});

module.exports.safeGet = function (object, ...path) {
  return path.flatMap(p => p.split('.')).reduce((r, p) => r && r[p] ? r[p] : null, object);
}

module.exports.isEmpty = str => !str || str === '';

module.exports.isNotEmpty = str => str && str.length > 0;

module.exports.toTitleCase = str => str.replace(/\w\S*/g, s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase());

module.exports.splitCamelCase = str => str.replace(/([a-z])([A-Z])/g, '$1 $2');

module.exports.formatDuration = function (duration) {
  if (duration.years() > 0)
    return duration.format('y[y] M[M]');
  else if (duration.months() > 0)
    return duration.format('M[M] d[d]');
  else if (duration.days() > 0)
    return duration.format('d[d] h[h]');
  else if (duration.hours() > 0)
    return duration.format('h[h] m[m]');
  else if (duration.minutes() > 0)
    return duration.format('m[m] s[s]');
  else
    return duration.format('s[s]');
}

module.exports.humanBytes = function (bytes, SI = false) {
  const threshold = SI ? 1000 : 1024;
  if (Math.abs(bytes) < threshold) {
    return `${bytes} B`;
  }
  const units = SI
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  do {
    bytes /= threshold;
    ++u;
  } while (Math.abs(bytes) >= threshold && u < units.length - 1);
  return `${bytes.toFixed(1)} ${units[u]}`;
};

module.exports.humanCores = function (cores) {
  const c = parseFloat(cores, 10);
  return c < 1000 ? `${c} m` : `${c / 1000}`;
}

module.exports.humanNet = function (bytes) {
  return `${module.exports.humanBytes(bytes, true)}/s`;
}

module.exports.isLocalStorageAvailable = function () {
  if (os.platform() !== 'browser') {
    return false;
  }
  try {
    var storage = window['localStorage'],
        x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch(e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0;
  }
}

// Adds a namespace to the http URL if needed
module.exports.namespaced = function (strings, namespace) {
  const path = strings[0];
  if (namespace === undefined) {
    return path;
  }
  const i = path.lastIndexOf('/');
  return path.slice(0, i) + '/namespaces/' + namespace + path.slice(i, path.length);
}