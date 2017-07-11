'use strict';

module.exports.delay = delay => new Promise(resolve => setTimeout(resolve, delay));

module.exports.do = f => val => {
  f(); return val;
};

module.exports.isEmpty = str => !str || str === '';

module.exports.formatDuration = function(duration) {
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