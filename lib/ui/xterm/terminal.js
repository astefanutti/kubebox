'use strict';

const { Terminal } = require('xterm');

Terminal.prototype.resize = function (x, y) {
    if (isNaN(x) || isNaN(y)) {
        return;
    }
    if (x === this.cols && y === this.rows) {
        // PATCH BEGIN https://github.com/xtermjs/xterm.js/issues/1278
        if (this.charMeasure) { 
            if (!this.charMeasure.width || !this.charMeasure.height) {
                this.charMeasure.measure(this.options);
            }
        }
        // PATCH END
        return;
    }
    if (x < 1)
        x = 1;
    if (y < 1)
        y = 1;
    this.buffers.resize(x, y);
    this.cols = x;
    this.rows = y;
    this.buffers.setupTabStops(this.cols);
    if (this.charMeasure) { 
        this.charMeasure.measure(this.options);
    }
    this.refresh(0, this.rows - 1);
    this.emit('resize', { cols: x, rows: y });
};