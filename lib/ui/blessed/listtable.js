const blessed = require('blessed');

const { Box, List, Node } = blessed;

function ListTable(options) {
  var self = this;

  if (!(this instanceof Node)) {
    return new ListTable(options);
  }

  options = options || {};
  // PATCH BEGIN
  // options.shrink = true;
  // options.normalShrink = true;
  // PATCH END
  options.style = options.style || {};
  options.style.border = options.style.border || {};
  options.style.header = options.style.header || {};
  options.style.cell = options.style.cell || {};
  this.__align = options.align || 'center';
  delete options.align;

  options.style.selected = options.style.cell.selected;
  options.style.item = options.style.cell;

  List.call(this, options);

  this._header = new Box({
    parent: this,
    left: this.screen.autoPadding ? 0 : this.ileft,
    top: 0,
    // PATCH BEGIN
    // width: 'shrink',
    right: this.scrollbar ? 2 : 1,
    wrap: false,
    // PATCH END
    height: 1,
    style: options.style.header,
    tags: options.parseTags || options.tags
  });

  this.on('scroll', function() {
    self._header.setFront();
    self._header.rtop = self.childBase;
    if (!self.screen.autoPadding) {
      self._header.rtop = self.childBase + (self.border ? 1 : 0);
    }
  });

  this.pad = options.pad != null
    ? options.pad
    // PATCH BEGIN
    : 0;
    // PATCH END

  this.setData(options.rows || options.data);

  // PATCH BEGIN
  // Override the default attach event, that sets the data and resets the selection.
  // Callers are responsible to set the data when the list table gets attached,
  // and deal with selection stickiness.
  // this.on('attach', function() {
  //   self.setData(self.rows);
  // });
  // PATCH END

  this.on('resize', function() {
    var selected = self.selected;
    self.setData(self.rows);
    self.select(selected);
    self.screen.render();
  });
};

ListTable.prototype._select = List.prototype.select;
ListTable.prototype.select = function (i) {
  if (i <= 0) {
    i = 1;
  }
  if (i <= this.childBase) {
    this.setScroll(i - 1);
  }
  return this._select(i);
};

ListTable.prototype.__proto__ = blessed.listtable.prototype;

blessed.listtable = ListTable;
