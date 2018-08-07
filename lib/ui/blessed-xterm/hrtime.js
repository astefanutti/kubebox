// Polyfill for window.performance.now
const performance = global.performance || {}
const performanceNow = performance.now ||
  performance.mozNow     ||
  performance.msNow      ||
  performance.oNow       ||
  performance.webkitNow  ||
  (() => new Date().getTime());

// Generate timestamp or delta
// See: http://nodejs.org/api/process.html#process_process_hrtime
function hrtime(previousTimestamp) {
  const clocktime = performanceNow.call(performance) * 1e-3;
  let seconds = Math.floor(clocktime);
  let nanoseconds = Math.floor((clocktime % 1) * 1e9);
  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];
    if (nanoseconds < 0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }
  return [seconds, nanoseconds];
}

module.exports = process.hrtime || hrtime;