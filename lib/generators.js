'use strict';

module.exports.newLineReader = function* (generator) {
  const gen = generator();
  gen.next();
  let change, buffer;
  while (change = yield) {
    if (buffer) {
      buffer = Buffer.concat([buffer, change]);
    } else {
      buffer = change;
    }
    do {
      const i = buffer.indexOf('\n');
      if (i < 0) {
        break;
      }
      const { done, value } = gen.next(buffer.slice(0, i));
      if (done) {
        return value;
      }
      buffer = buffer.slice(i + 1);
    } while (buffer.length > 0);
  }
}
