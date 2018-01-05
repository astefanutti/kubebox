const blessed = require('blessed');

blessed.Screen.prototype._listenMouse = function (el) {
  var self = this;

  if (el && !~this.clickable.indexOf(el)) {
    el.clickable = true;
    this.clickable.push(el);
  }

  if (this._listenedMouse) return;
  this._listenedMouse = true;

  this.program.enableMouse();
  if (this.options.sendFocus) {
    this.program.setMouse({ sendFocus: true }, true);
  }

  this.on('render', function () {
    self._needsClickableSort = true;
  });

  this.program.on('mouse', function (data) {
    if (self.lockKeys) return;

    if (self._needsClickableSort) {
      self.clickable = blessed.helpers.hsort(self.clickable);
      self._needsClickableSort = false;
    }

    var i = 0,
      el,
      set,
      pos;

    for (; i < self.clickable.length; i++) {
      el = self.clickable[i];

      if (el.detached || !el.visible) {
        continue;
      }

      // PATCH BEGIN
      if (self.grabMouse && !el.grabMouse) {
        if (!self.clickable.filter(em => em.grabMouse).some(em => el.hasAncestor(em)))
          continue;
      }
      // PATCH END

      pos = el.lpos;
      if (!pos) continue;

      if (data.x >= pos.xi && data.x < pos.xl
        && data.y >= pos.yi && data.y < pos.yl
      ) {
        el.emit('mouse', data);
        if (data.action === 'mousedown') {
          self.mouseDown = el;
        } else if (data.action === 'mouseup') {
          (self.mouseDown || el).emit('click', data);
          self.mouseDown = null;
        } else if (data.action === 'mousemove') {
          if (self.hover && el.index > self.hover.index) {
            set = false;
          }
          if (self.hover !== el && !set) {
            if (self.hover) {
              self.hover.emit('mouseout', data);
            }
            el.emit('mouseover', data);
            self.hover = el;
          }
          set = true;
        }
        el.emit(data.action, data);
        break;
      }
    }

    // Just mouseover?
    if ((data.action === 'mousemove'
      || data.action === 'mousedown'
      || data.action === 'mouseup')
      && self.hover && !set) {
      self.hover.emit('mouseout', data);
      self.hover = null;
    }

    self.emit('mouse', data);
    self.emit(data.action, data);
  });

  // Autofocus highest element.
  // this.on('element click', function (el, data) {
  //   var target;
  //   do {
  //     if (el.clickable === true && el.options.autoFocus !== false) {
  //       target = el;
  //     }
  //   } while (el = el.parent);
  //   if (target) target.focus();
  // });

  // Autofocus elements with the appropriate option.
  this.on('element click', function (el) {
    if (el.clickable === true && el.options.autoFocus !== false) {
      el.focus();
    }
  });
};
