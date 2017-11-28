function getColorCode(color) {
  if (Array.isArray(color) && color.length == 3) {
    return x256(color[0], color[1], color[2]);
  } else {
    return color;
  }
}

exports.getColorCode = getColorCode;
