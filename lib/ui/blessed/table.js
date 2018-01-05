const blessed = require('blessed');

// See https://github.com/chjj/blessed/pull/292
blessed.Table.prototype._calculateMaxes =
blessed.ListTable.prototype._calculateMaxes = function () {
  var self = this;
  var maxes = [];

  if (this.detached) return;

  // PATCH BEGIN
  // Tables that are also ListTables can have scrollbars, which means we need
  // to calculate with one fewer width cells
  var width = this.scrollbar ? this.width - 1 : this.width;
  // PATCH END

  this.rows = this.rows || [];

  this.rows.forEach(function (row) {
    row.forEach(function (cell, i) {
      var clen = self.strWidth(cell);
      if (!maxes[i] || maxes[i] < clen) {
        maxes[i] = clen;
      }
    });
  });

  var total = maxes.reduce(function (total, max) {
    return total + max;
  }, 0);
  total += maxes.length + 1;

  // XXX There might be an issue with resizing where on the first resize event
  // width appears to be less than total if it's a percentage or left/right
  // combination.
  if (width < total) {
    delete this.position.width;
  }

  if (this.position.width != null) {
    var missing = width - total;
    var w = (missing / maxes.length) | 0;
    var wr = missing % maxes.length;
    maxes = maxes.map(function (max, i) {
      if (i === maxes.length - 1) {
        return max + w + wr;
      }
      return max + w;
    });
  } else {
    maxes = maxes.map(function (max) {
      return max + self.pad;
    });
  }

  return (this._maxes = maxes);
};
