const blessed = require('blessed');

blessed.Node.prototype.insert = function (element, i) {
  var self = this;

  if (element.screen && element.screen !== this.screen) {
    throw new Error("Cannot switch a node's screen.");
  }

  element.detach();
  element.parent = this;
  element.screen = this.screen;

  if (i === 0) {
    this.children.unshift(element);
  } else if (i === this.children.length) {
    this.children.push(element);
  } else {
    this.children.splice(i, 0, element);
  }

  element.emit('reparent', this);
  this.emit('adopt', element);

  (function emit(el) {
    var n = el.detached !== self.detached;
    el.detached = self.detached;
    if (n) {
      // PATCH BEGIN
      if (el.clickable) el.screen._listenMouse(el);
      if (el.keyable) el.screen._listenKeys(el);
      // PATCH END
      el.emit('attach');
    }
    el.children.forEach(emit);
  })(element);

  if (!this.screen.focused) {
    this.screen.focused = element;
  }
};

blessed.Node.prototype.remove = function (element) {
  if (element.parent !== this) return;

  var i = this.children.indexOf(element);
  if (!~i) return;

  element.clearPos();

  element.parent = null;

  this.children.splice(i, 1);

  element.emit('reparent', null);
  this.emit('remove', element);

  (function emit(el) {
    var n = el.detached !== true;
    el.detached = true;
    if (n) {
      // PATCH BEGIN
      i = el.screen.clickable.indexOf(el);
      if (~i) el.screen.clickable.splice(i, 1);
      i = el.screen.keyable.indexOf(el);
      if (~i) el.screen.keyable.splice(i, 1);
      // PATCH END
      el.emit('detach');
    }
    el.children.forEach(emit);
  })(element);

  if (this.screen.focused === element) {
    this.screen.rewindFocus();
  }
};
