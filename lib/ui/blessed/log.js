const blessed = require('blessed');
const util    = require('util');

blessed.log.prototype.init = function () {
  delete this._clines;
  this._clines = [];
  this._clines.fake = [];
  this._clines.ftor = [];
  this._clines.rtof = [];
}

blessed.log.prototype.clear = function () {
  this.init();
  this.content = '';
  this._userScrolled = false;
  this.setScrollPerc(0);
}

// PATCH BEGIN
blessed.log.prototype.pushLine = function (line) {
  const delta = Array.isArray(line) ? line.join('\n') : line;
  if (!this.content) {
    this.init();
    this.content = delta;
  } else {
    this.content += '\n' + delta;
  }

  if (Array.isArray(line)) {
    this._clines.fake.push(...line);
  } else {
    this._clines.fake.push(line);
  }

  if (this.detached) {
    return;
  }

  var width = this.width - this.iwidth;

  const lines = [];
  for (let i = this._clines.ftor.length; i < this._clines.fake.length; i++) {
    let line = this._clines.fake[i];
    line = line
      .replace(/[\x00-\x08\x0b-\x0c\x0e-\x1a\x1c-\x1f\x7f]/g, '')
      .replace(/\x1b(?!\[[\d;]*m)/g, '')
      .replace(/\r\n|\r/g, '\n')
      .replace(/\t/g, this.screen.tabc);

    if (this.screen.fullUnicode) {
      // double-width chars will eat the next char after render. create a
      // blank character after it so it doesn't eat the real next char.
      line = line.replace(blessed.unicode.chars.all, '$1\x03');
      // iTerm2 cannot render combining characters properly.
      if (this.screen.program.isiTerm2) {
        line = line.replace(blessed.unicode.chars.combining, '');
      }
    } else {
      // no double-width: replace them with question-marks.
      line = line.replace(blessed.unicode.chars.all, '??');
      // delete combining characters since they're 0-width anyway.
      // NOTE: We could drop this, the non-surrogates would get changed to ? by
      // the unicode filter, and surrogates changed to ? by the surrogate
      // regex. however, the user might expect them to be 0-width.
      // NOTE: Might be better for performance to drop!
      line = line.replace(blessed.unicode.chars.combining, '');
      // no surrogate pairs: replace them with question-marks.
      line = line.replace(blessed.unicode.chars.surrogate, '?');
      // XXX Deduplicate code here:
      // line = helpers.dropUnicode(line);
    }
    if (this.parseTags) {
      line = this._parseTags(line);
    }
    lines.push(line);
  }

  const wrap = this._wrapContent(lines.join('\n'), width);

  const ftor = this._clines.ftor.length;
  for (let i = 0, length = wrap.ftor.length; i < length; i++) {
    this._clines.ftor[ftor + i] = wrap.ftor[i].map(e => ftor + e);
  }
  for (let i = 0, length = wrap.rtof.length; i < length; i++) {
    this._clines.rtof.push(ftor + wrap.rtof[i]);
  }

  if (wrap.mwidth > this._clines.mwidth) {
    this._clines.mwidth = wrap.mwidth;
  }

  this._clines.push(...wrap);

  this._clines.width = width;
  this._clines.content = this.content;
  this._clines.attr = this._parseAttr(this._clines);
  this._clines.ci = [];
  this._clines.reduce(function (total, line) {
    this._clines.ci.push(total);
    return total + line.length + 1;
  }.bind(this), 0);

  this._pcontent = this._clines.join('\n');
  this.emit('parsed content');

  this.emit('set content');
};
// PATCH END

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

  // PATCH BEGIN
  if (this.detached) {
    this.setContent(this._clines.fake.join('\n'), true);
    return;
  }
  // PATCH END

  // NOTE: Could possibly compare the first and last ftor line numbers to see
  // if they're the same, or if they fit in the visible region entirely.
  var start = this._clines.length, diff, real;

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
      this.screen.insertLine(diff, pos.yi + this.itop + real - base, pos.yi, pos.yl - this.ibottom - 1);
    }
  }
};

// Fix Log's log/add method, which calls shiftLine with two parameters (start, end)
// when it should call it with just one (num lines to shift out).
// See https://github.com/chjj/blessed/issues/255
blessed.log.prototype.log =
blessed.log.prototype.add = function (line) {
  // PATCH BEGIN
  /* var args = Array.prototype.slice.call(arguments);
  if (typeof args[0] === 'object') {
    args[0] = util.inspect(args[0], { showHidden: true, depth: MAX_OBJECT_LOG_DEPTH });
  }
  var text = util.format.apply(util, args); */
  // PATCH END
  this.emit('log', line);
  var ret = this.pushLine(line);
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
