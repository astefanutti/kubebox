var map = [
  [0x1, 0x8],
  [0x2, 0x10],
  [0x4, 0x20],
  [0x40, 0x80]
];

function Canvas(width, height) {
  if (width % 2 != 0) {
    throw new Error('Width must be multiple of 2!');
  }
  if (height % 4 != 0) {
    throw new Error('Height must be multiple of 4!');
  }
  this.width = width;
  this.height = height;
  this.content = Buffer.alloc(width*height/8);
  this.colors = new Array(width*height/8);
  this.chars = new Array(width*height/8);
  this.content.fill(0);

  this.fontFg = 'normal';
  this.fontBg = 'normal';
  this.color = 'normal';
}

exports.colors = {
    black: 0
  , red: 1
  , green: 2
  , yellow: 3
  , blue: 4
  , magenta: 5
  , cyan: 6
  , white: 7
  , normal: 9
};

var methods = {
  set: function (coord, mask) {
    this.content[coord] |= mask;
    this.colors[coord] = exports.colors[this.color];
    this.chars[coord] = null;
  },
  unset: function (coord, mask) {
    this.content[coord] &= ~mask;
    this.colors[coord] = null;
    this.chars[coord] = null;
  },
  toggle: function (coord, mask) {
    this.content[coord] ^= mask;
    this.colors[coord] = null;
    this.chars[coord] = null;
  },
};

Object.keys(methods).forEach(function (method) {
  Canvas.prototype[method] = function (x, y) {
    if (!(x >= 0 && x < this.width && y >= 0 && y < this.height)) {
      return;
    }
    var coord = this.getCoord(x, y);
    var mask = map[y % 4][x % 2];
    methods[method].call(this, coord, mask);
  }
});

Canvas.prototype.getCoord = function (x, y) {
  x = Math.floor(x);
  y = Math.floor(y);
  var nx = Math.floor(x/2);
  var ny = Math.floor(y/4);
  var coord = nx + this.width/2*ny;
  return coord;
}

Canvas.prototype.clear = function () {
  this.content.fill(0);
};

Canvas.prototype.measureText = function (str) {
  return { width: str.length * 2 + 2 };
};

Canvas.prototype.writeText = function (str, x, y) {  
  var coord = this.getCoord(x, y)
  for (var i = 0; i < str.length; i++) {
    this.chars[coord + i] = str[i];
  }

  var bg = exports.colors[this.fontBg];
  var fg = exports.colors[this.fontFg];

  this.chars[coord] = '\033[3' + fg + 'm' + '\033[4' + bg + 'm' + this.chars[coord];
  this.chars[coord + str.length - 1] += '\033[39m\033[49m';
}

Canvas.prototype.frame = function frame(delimiter) {
  delimiter = delimiter || '\n';
  var result = [];

  for (var i = 0, j = 0; i < this.content.length; i++, j++) {
    if (j == this.width/2) {
      result.push(delimiter);
      j = 0;
    }
    if (this.chars[i]) {
      result.push(this.chars[i]);
    } else if (this.content[i] == 0) {
      result.push(' ');
    } else {
      result.push('\033[3' + this.colors[i] + 'm'+String.fromCharCode(0x2800 + this.content[i]) + '\033[39m');
      //result.push(String.fromCharCode(0x2800 + this.content[i]));
    }
  }
  result.push(delimiter);
  return result.join('');
};

module.exports = Canvas;
