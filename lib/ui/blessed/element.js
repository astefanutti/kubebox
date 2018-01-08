const blessed = require('blessed');

const nextTick = global.setImmediate || process.nextTick.bind(process);

// work-around for https://github.com/chjj/blessed/issues/175
blessed.element.prototype._getShrinkContent = function (xi, xl, yi, yl) {
  // PATCH BEGIN
  if (this._clines == null) {
    var h = 1;
    var w = 1;
  } else {
    var h = this._clines.length;
    var w = this._clines.mwidth || 1;
  }
  // PATCH END

  if (this.position.width == null && (this.position.left == null || this.position.right == null)) {
    if (this.position.left == null && this.position.right != null) {
      xi = xl - w - this.iwidth;
    } else {
      xl = xi + w + this.iwidth;
    }
  }

  if (this.position.height == null && (this.position.top == null || this.position.bottom == null) && (!this.scrollable || this._isList)) {
    if (this.position.top == null && this.position.bottom != null) {
      yi = yl - h - this.iheight;
    } else {
      yl = yi + h + this.iheight;
    }
  }

  return { xi: xi, xl: xl, yi: yi, yl: yl };
};

blessed.Element.prototype.setLabel = function (options) {
  var self = this;
  var Box = blessed.box;

  if (typeof options === 'string') {
    options = { text: options };
  }

  if (this._label) {
    this._label.setContent(options.text);
    if (options.side !== 'right') {
      this._label.rleft = 2 + (this.border ? -1 : 0);
      this._label.position.right = undefined;
      if (!this.screen.autoPadding) {
        this._label.rleft = 2;
      }
    } else {
      this._label.rright = 2 + (this.border ? -1 : 0);
      this._label.position.left = undefined;
      if (!this.screen.autoPadding) {
        this._label.rright = 2;
      }
    }
    return;
  }

  this._label = new Box({
    screen: this.screen,
    parent: this,
    content: options.text,
    top: -this.itop,
    // PATCH BEGIN
    tags: true,
    // PATCH END
    shrink: true,
    style: this.style.label
  });

  if (options.side !== 'right') {
    this._label.rleft = 2 - this.ileft;
  } else {
    this._label.rright = 2 - this.iright;
  }

  this._label._isLabel = true;

  if (!this.screen.autoPadding) {
    if (options.side !== 'right') {
      this._label.rleft = 2;
    } else {
      this._label.rright = 2;
    }
    this._label.rtop = 0;
  }

  var reposition = function () {
    self._label.rtop = (self.childBase || 0) - self.itop;
    if (!self.screen.autoPadding) {
      self._label.rtop = self.childBase || 0;
    }
    // PATCH BEGIN
    if (!self._label.detached) self.screen.render();
    // PATCH END
  };

  this.on('scroll', this._labelScroll = function () {
    reposition();
  });

  this.on('resize', this._labelResize = function() {
    nextTick(function () {
      reposition();
    });
  });
};

blessed.Element.prototype._parseAttr = function (lines) {
  var dattr = this.sattr(this.style)
    , attr = dattr
    , attrs = []
    , line
    , i
    , j
    , c;

  // PATCH BEGIN
  // See: https://github.com/chjj/blessed/pull/306/
  if (Array.isArray(lines.attr) && lines.attr.length > 0 && lines.attr[0] === attr) {
    return;
  }
  // PATCH END

  for (j = 0; j < lines.length; j++) {
    line = lines[j];
    attrs[j] = attr;
    for (i = 0; i < line.length; i++) {
      if (line[i] === '\x1b') {
        if (c = /^\x1b\[[\d;]*m/.exec(line.substring(i))) {
          attr = this.screen.attrCode(c[0], attr, dattr);
          i += c[0].length - 1;
        }
      }
    }
  }

  return attrs;
};

// PATCH BEGIN
blessed.Element.prototype.setLine = function(i, line) {
  if (typeof line === 'string') line = line.split('\n');

  i = Math.max(i, 0);
  while (this._clines.fake.length < i) {
    this._clines.fake.push('');
  }
  for (var j = 0; j < line.length; j++) {
    this._clines.fake[i + j] = line[j];
  }

  return this.setContent(this._clines.fake.join('\n'), true);
};
// PATCH END
