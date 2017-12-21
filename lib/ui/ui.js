module.exports.Dashboard  = require('./dashboard');
module.exports.login      = require('./login');
module.exports.namespaces = require('./namespaces');

const blessed = require('blessed');

// --------------------------------------------------------------
// ListTable
// --------------------------------------------------------------

// work-around for https://github.com/chjj/blessed/issues/175
blessed.listtable.prototype._getShrinkContent = function(xi, xl, yi, yl) {
  if (this._clines == null) {
    var h = 1;
    var w = 1;
  } else {
    var h = this._clines.length;
    var w = this._clines.mwidth || 1;
  }

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

blessed.listtable.prototype.setLabel = function(options) {
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
    tags: this.parseTags,
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
};

// --------------------------------------------------------------
// Listbar
// --------------------------------------------------------------

blessed.listbar.prototype.add =
blessed.listbar.prototype.addItem =
blessed.listbar.prototype.appendItem = function(item, callback) {
  var self = this,
    prev = this.items[this.items.length - 1],
    drawn,
    cmd,
    title,
    len;

  if (!this.parent) {
    drawn = 0;
  } else {
    drawn = prev ? prev.aleft + prev.width : 0;
    if (!this.screen.autoPadding) {
      drawn += this.ileft;
    }
  }

  if (typeof item === 'object') {
    cmd = item;
    if (cmd.prefix == null) cmd.prefix = this.items.length + 1 + '';
  }

  if (typeof item === 'string') {
    cmd = {
      prefix: this.items.length + 1 + '',
      text: item,
      callback: callback
    };
  }

  if (typeof item === 'function') {
    cmd = {
      prefix: this.items.length + 1 + '',
      text: item.name,
      callback: item
    };
  }

  if (cmd.keys && cmd.keys[0]) {
    cmd.prefix = cmd.keys[0];
  }

  var t = blessed.helpers.generateTags(this.style.prefix || { fg: 'lightblack' });

  title = (cmd.prefix != null ? t.open + cmd.prefix + t.close + ':' : '') + cmd.text;

  len = ((cmd.prefix != null ? cmd.prefix + ':' : '') + cmd.text).length;

  var options = {
    screen: this.screen,
    top: 0,
    left: drawn + 1,
    height: 1,
    content: title,
    width: len + 2,
    align: 'center',
    autoFocus: false,
    tags: true,
    mouse: true,
    style: blessed.helpers.merge({}, this.style.item),
    noOverflow: true
  };

  if (!this.screen.autoPadding) {
    options.top += this.itop;
    options.left += this.ileft;
  }

  ['bg', 'fg', 'bold', 'underline', 'blink', 'inverse', 'invisible'].forEach(
    function(name) {
      options.style[name] = function() {
        var attr =
          self.items[self.selected] === el
            ? self.style.selected[name]
            : self.style.item[name];
        if (typeof attr === 'function') attr = attr(el);
        return attr;
      };
    }
  );

  var el = blessed.box(options);

  this._[cmd.text] = el;
  cmd.element = el;
  el._.cmd = cmd;

  this.ritems.push(cmd.text);
  this.items.push(el);
  this.commands.push(cmd);
  this.append(el);

  function handler() {
    self.emit('action', el, self.selected);
    self.emit('select', el, self.selected);
    if (el._.cmd.callback) {
      el._.cmd.callback();
    }
    self.select(el);
    self.screen.render();
  }

  if (cmd.callback) {
    if (cmd.keys) {
      this.on('detach', function () {
        this.screen.unkey(cmd.keys, handler);
      });
      this.on('attach', function () {
        this.screen.key(cmd.keys, handler);
      });
    }
  }

  if (this.items.length === 1) {
    this.select(0);
  }

  // XXX May be affected by new element.options.mouse option.
  if (this.mouse) {
    el.on('click', handler);
  }

  this.emit('add item');
};
