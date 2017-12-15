const x256 = require('x256');

exports.getColorCode = function (color) {
  if (Array.isArray(color) && color.length == 3) {
    return x256(color[0], color[1], color[2]);
  } else {
    return color;
  }
}

exports.arrayMax = function (array, iteratee) {
  let index = -1;
  let length = array.length;

  let computed, result;
  while (++index < length) {
    let value = array[index];
    let current = iteratee(value);

    if (current != null && (computed === undefined ? current === current : current > computed)) {
      computed = current,
      result = value;
    }
  }
  return result;
}
