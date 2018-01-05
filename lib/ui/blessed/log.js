const blessed = require('blessed');
const util    = require('util');

blessed.log.prototype.clear = function () {
  delete this._clines;
  this._clines = [];
  this._clines.fake = [];
  this._clines.ftor = [];
  this.setContent('');
  this._userScrolled = false;
}

blessed.log.prototype.insertLine = function (i, line) {
  if (typeof line === 'string') line = line.split('\n');

  if (i !== i || i == null) {
    i = this._clines.ftor.length;
  }

  i = Math.max(i, 0);

  while (this._clines.fake.length < i) {
    this._clines.fake.push('');
    this._clines.ftor.push([this._clines.push('') - 1]);
    this._clines.rtof(this._clines.fake.length - 1);
  }

  for (var j = 0; j < line.length; j++) {
    this._clines.fake.splice(i + j, 0, line[j]);
  }

  if (!this.detached) {
    // NOTE: Could possibly compare the first and last ftor line numbers to see
    // if they're the same, or if they fit in the visible region entirely.
    var start = this._clines.length,
        diff,
        real;

    if (i >= this._clines.ftor.length) {
        real = this._clines.ftor[this._clines.ftor.length - 1];
        real = real[real.length - 1] + 1;
    } else {
        real = this._clines.ftor[i][0];
    }

    this.setContent(this._clines.fake.join('\n'), true);

    diff = this._clines.length - start;

    if (diff > 0) {
      var pos = this._getCoords();
      if (!pos) return;

      var height = pos.yl - pos.yi - this.iheight,
      base = this.childBase || 0,
      visible = real >= base && real - base < height;

      if (pos && visible && this.screen.cleanSides(this)) {
      this.screen.insertLine(
        diff,
        pos.yi + this.itop + real - base,
        pos.yi,
        pos.yl - this.ibottom - 1);
      }
    }
  } else {
    this.setContent(this._clines.fake.join('\n'), true);
  }
};

// Fix Log's log/add method, which calls shiftLine with two parameters (start, end)
// when it should call it with just one (num lines to shift out).
// See https://github.com/chjj/blessed/issues/255
blessed.log.prototype.log =
blessed.log.prototype.add = function () {
  var args = Array.prototype.slice.call(arguments);
  if (typeof args[0] === 'object') {
    args[0] = util.inspect(args[0], { showHidden: true, depth: MAX_OBJECT_LOG_DEPTH });
  }
  var text = util.format.apply(util, args);
  this.emit('log', text);
  var ret = this.pushLine(text);
  if (this.scrollback && this._clines.fake.length > this.scrollback) {
    this.shiftLine(this._clines.fake.length - this.scrollback);
  }
  return ret;
};

// This fix prevents crashing, when view is removed from parent during before nextTick call.
const _setScrollPerc = blessed.scrollablebox.prototype.setScrollPerc;
blessed.scrollablebox.prototype.setScrollPerc = function (percent) {
  if (this.parent) {
    _setScrollPerc.call(this, percent);
  }
};

// Reapply scroll method override from Log which is broken by workaround in Element:
// https://github.com/chjj/blessed/blob/master/lib/widgets/element.js#L35
// This method prevents auto-scrolling to bottom if user scrolled the view up.
// See https://github.com/chjj/blessed/issues/284
const Log = blessed.log;
blessed.log = function (options) {
  const log = Log(options);
  log.clear();

  log.scroll = function (offset, always) {
    if (offset === 0) return this._scroll(offset, always);
    this._userScrolled = true;
    var ret = this._scroll(offset, always);
    var perc = this.getScrollPerc(true);
    // returns -1 when there is no scrollbar
    if (perc === 100 || perc === -1) {
      this._userScrolled = false;
    }
    return ret;
  };
  return log;
}
