const blessed = require('blessed');

blessed.listbar.prototype.add =
blessed.listbar.prototype.addItem =
blessed.listbar.prototype.appendItem = function (item, callback) {
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
      // PATCH BEGIN
      this.on('detach', function () {
        this.screen.unkey(cmd.keys, handler);
      });
      this.on('attach', function () {
        this.screen.key(cmd.keys, handler);
      });
      // PATCH END
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
