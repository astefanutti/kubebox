const blessed  = require('blessed'),
      debounce = require('lodash.debounce'),
      hrtime   = require('./hrtime'),
      os       = require('os');

const nextTick = global.setImmediate || process.nextTick.bind(process);

const Terminal = os.platform() === 'browser'
  ? window.Terminal
  : require('xterm-headless').Terminal;

const CRLF_OR_LF = os.platform() === 'browser' && window.navigator.platform === 'Win32' || os.platform() === 'win32' ? '\r\n' : '\n';

class XTerm extends blessed.ScrollableBox {

  constructor(options = {}) {
    super(options);
    // required so that scrollbar positions correctly without childOffset
    this.alwaysScroll = true;

    const setOption = (cfg, name, def) => {
      if (cfg[name] === undefined) {
        cfg[name] = def;
      }
    };

    setOption(this.options, 'args', []);
    setOption(this.options, 'env', process.env);
    setOption(this.options, 'cwd', process.cwd());
    setOption(this.options, 'cursorType', 'block');
    setOption(this.options, 'scrollback', 10000);

    setOption(this.options, 'style', {});
    setOption(this.options.style, 'bg', 'default');
    setOption(this.options.style, 'fg', 'default');

    // determine display attributes
    this.dattr = this.sattr(this.style);

    this.term = new Terminal({
      // logLevel: 'off',
      convertEol: true,
      scrollback: this.options.scrollback !== 'none' ? this.options.scrollback : this.height - this.iheight,
    });

    // The default error handler logs the parser state, which pollutes the screen.
    // Ideally, a replacement character would be injected, instead of skipping the parsing error.
    this.term._core._inputHandler._parser.setErrorHandler(state => ({ abort: false }));

    // pass-through title changes by application
    this.term.onTitleChange(title => {
      this.title = title;
      this.emit('title', title);
    });

    // TODO: we may want to dynamically adjust the width depending on the scrollbar
    const resize = () => {
      this.term.resize(this.width - this.iwidth - 1, this.height - this.iheight);
      if (!this.detached) {
        this.screen.render();
      }
    };
    // pass-through Blessed resize events to XTerm
    this.on('resize', debounce(resize, 100, { trailing: true }));
    // in case the terminal was resized while being detached
    this.on('attach', () => nextTick(resize));
    // perform an initial resizing once
    this.once('render', resize);

    // selection coordinates
    this.on('mousedown', function (data) {
      // return if already scrolling or selecting
      if (this.mousedown || this._scrollingBar) return;
      // leave dragging the scrollbar
      if (data.x >= this.width - this.iright - 1) return;

      this.mousedown = true;
      // hacking the scrollbar logic so that it does not scroll when hovering it
      this._scrollingBar = true;

      const buffer = this.term.buffer.active;
      const xi = this.aleft + this.ileft;
      const yi = this.atop + this.itop;

      // start coordinates
      const [line, index] = getUnwrappedLineCoordinates(this.term, data.x - xi, data.y - yi + buffer.viewportY);
      this._selection = {
        x1 : index,
        y1 : line,
        m1 : buffer._buffer.addMarker(line),
      };
      let smd, smu, click = hrtime();
      this.onScreenEvent('mouse', smd = data => {
        // VTE seems to be sending mousemove while XTERM mousedown, let's handle both
        if (data.action !== 'mousemove' && data.action !== 'mousedown') {
          return;
        }
        // end coordinates
        // TODO: scroll vertically when y coordinate is out of current range
        const [line, index] = getUnwrappedLineCoordinates(this.term, data.x - xi, data.y - yi + buffer.viewportY);
        Object.assign(this._selection || {}, {
          x2 : index,
          y2 : line,
          m2 : buffer._buffer.addMarker(line),
        });
        this.screen.render();
      });
      this.onScreenEvent('mouseup', smu = () => {
        const elapsed = hrtime(click);
        this.mousedown = false;
        this._scrollingBar = false;
        this.removeScreenEvent('mouse', smd);
        this.removeScreenEvent('mouseup', smu);
        const { x1, y1, x2, y2 } = this._selection || {};
        if (x1 === x2 && y1 === y2 && elapsed[0] === 0 && elapsed[1] * 1e-6 < 100) {
          // emulate clicking instead of selecting
          this.clearSelection();
          this.screen.render();
        }
      });
    });

    this.on('destroy', () => this.dispose());
  }

  start() {
    this.refreshIntervalId = setInterval(() => {
      this.blinking = !this.blinking;
      this.screen.render();
    }, 500);
  }

  get type() {
    return 'terminal';
  }

  reset() {
    this.clearSelection();
    this.term.reset();
    this.setScrollPerc(0);
    this._userScrolled = false;
  }

  write(data) {
    this.term.write(data, () => this.screen.render());
  }

  writeln(data) {
    this.term.writeln(data, () => this.screen.render());
  }

  writeSync(data) {
    this.term._core._writeBuffer.writeSync(data);
    this.screen.render();
  }

  hasSelection() {
    return !!this._selection;
  }

  clearSelection() {
    if (this._selection) {
      // remove markers listeners used to keep track of buffer reflow
      this._selection.m1.dispose();
      this._selection.m2.dispose();
    }
    delete this._selection;
  }

  getSelectedText() {
    if (!this._selection) return;

    const buffer = this.term.buffer.active;

    let { x1, x2, m1: { line: y1 }, m2: { line: y2 } } = this._selection;
    // back to wrapped lines coordinates
    [x1, y1] = getWrappedLineCoordinates(this.term, x1, y1);
    [x2, y2] = getWrappedLineCoordinates(this.term, x2, y2);
    // make sure it's from left to right
    if (y1 > y2 || (y1 == y2 && x1 > x2)) {
      [x1, x2] = [x2, x1];
      [y1, y2] = [y2, y1];
    }

    const result = [];
    // get first row
    result.push(buffer.getLine(y1).translateToString(true, x1, y1 == y2 ? x2 + 1 : undefined));

    // get middle rows
    for (let i = y1 + 1; i <= y2 - 1; i++) {
      const line = buffer.getLine(i);
      const text = line.translateToString(true);
      if (line.isWrapped) {
        result[result.length - 1] += text;
      } else {
        result.push(text);
      }
    }

    // get last row
    if (y1 != y2) {
      const line = buffer.getLine(y2);
      const text = line.translateToString(true, 0, x2 + 1);
      if (line.isWrapped) {
        result[result.length - 1] += text;
      } else {
        result.push(text);
      }
    }

    return result.join(CRLF_OR_LF);
  }

  render() {
    // repositions the label given scrolling
    if (this._label) {
      if (!this.screen.autoPadding) {
        this._label.rtop = this.childBase || 0;
      } else {
        this._label.rtop = (this.childBase || 0) - this.itop;
      }
    }

    // call the underlying Element's rendering function
    let ret = this._render();
    if (!ret) return;

    const buffer = this.term.buffer.active;
    const lines = buffer._buffer.lines;
    const ydisp = buffer.viewportY;

    // determine position
    const xi = ret.xi + this.ileft;
    const xl = ret.xl - this.iright - 1; // scrollbar
    const yi = ret.yi + this.itop;
    const yl = ret.yl - this.ibottom;

    // selection
    let { x1: xs1, x2: xs2, m1: { line: ys1 }, m2: { line: ys2 } } = this._selection || { m1: {}, m2: {} };
    if (this._selection) {
      // back to wrapped lines coordinates
      [xs1, ys1] = getWrappedLineCoordinates(this.term, xs1, ys1);
      [xs2, ys2] = getWrappedLineCoordinates(this.term, xs2, ys2);
      // make sure it's from left to right
      if (ys1 > ys2 || (ys1 == ys2 && xs1 > xs2)) {
        [xs1, xs2] = [xs2, xs1];
        [ys1, ys2] = [ys2, ys1];
      }
      // convert to screen coordinates
      xs1 += xi;
      xs2 += xi;
      ys1 += yi - ydisp;
      ys2 += yi - ydisp;
    }

    const cursor = this.screen.focused === this && ydisp === buffer.baseY && !this.term.cursorHidden;
    const cursorY = yi + buffer.cursorY;

    // iterate over visible lines
    for (let y = Math.max(yi, 0); y < yl; y++) {
      // fetch Blessed Screen and XTerm lines
      let sline = this.screen.lines[y];
      let tline = lines.get(ydisp + y - yi);
      if (!sline || !tline)
        break;

      // determine cursor column position
      let cursorX = -1;
      if (cursor && y === cursorY) {
        cursorX = xi + buffer.cursorX;
      }

      // iterate over columns
      for (let x = Math.max(xi, 0); x < xl; x++) {
        // read attribute and character
        const tx = x - xi;
        let x0 = ((tline.getFg(tx) & 0x1ff) << 9) | (tline.getBg(tx) & 0x1ff);
        let x1 = tline.getString(tx) || ' ';

        // handle cursor
        if (x === cursorX) {
          if (this.blinking) {
            if (this.options.cursorType === 'line') {
              x0 = this.dattr;
              x1 = '\u2502';
            } else if (this.options.cursorType === 'underline') {
              x0 = this.dattr | (2 << 18);
            } else if (this.options.cursorType === 'block') {
              x0 = this.dattr | (8 << 18);
            }
          }
        }

        if (this._selection) {
          // inverse x0 if selected
          let inverse = false;
          if (ys1 <= y && ys2 >= y) {
            if (ys1 === ys2) {
              if (xs1 <= x && xs2 >= x) {
                inverse = true;
              }
            } else if (y === ys1 && x >= xs1) {
              inverse = true;
            } else if (y === ys2 && x <= xs2) {
              inverse = true;
            } else if (y > ys1 && y < ys2) {
              inverse = true;
            }
          }
          if (inverse && x <= tline.getTrimmedLength()) {
            x0 = x0 | (8 << 18);
          }
        }

        // default foreground
        if (((x0 >> 9) & 0x1ff) === 0) {
          x0 = (x0 & ~(0x1ff << 9)) | (((this.dattr >> 9) & 0x1ff) << 9);
        }

        // default background
        if ((x0 & 0x1ff) === 0) {
          x0 = (x0 & ~0x1ff) | (this.dattr & 0x1ff);
        }

        // write screen attribute and character
        const scell = sline[x];
        if (scell[0] !== x0) {
          scell[0] = x0;
          sline.dirty = true;
        }
        if (scell[1] !== x1) {
          scell[1] = x1;
          sline.dirty = true;
        }
      }
    }
    return ret;
  }

  // called prior to the element scrollbar rendering
  _scrollBottom() {
    if (!this.term) return super._scrollBottom();
    // requires alwaysScroll = true for it to position the scrollbar correctly
    this.childBase = this.term.buffer.active.viewportY;
    return this.term.buffer.active.baseY + this.term.rows;
  }

  getScrollPerc() {
    return this.term.buffer.active.baseY > 0
      ? this.term.buffer.active.viewportY / this.term.buffer.active.baseY * 100
      : 100;
  }

  setScrollPerc(i) {
    return this.scrollTo(Math.floor(i / 100 * this.term.buffer.active.baseY));
  }

  setScroll(offset) {
    return this.scrollTo(offset);
  }

  scrollTo(offset) {
    this.term.scrollLines(offset - this.term.buffer.active.viewportY);
    this.emit('scroll');
  }

  scroll(offset) {
    this.term.scrollLines(offset);
    this.emit('scroll');
  }

  dispose() {
    clearInterval(this.refreshIntervalId);
    this.term.dispose();
  }

  // helper function to determine mouse inputs
  static isMouse(buf) {
    let s = buf;
    if (Buffer.isBuffer(s)) {
      if (s[0] > 127 && s[1] === undefined) {
        s[0] -= 128;
        s = '\x1b' + s.toString('utf-8');
      } else {
        s = s.toString('utf-8');
      }
    }
    return (buf[0] === 0x1b && buf[1] === 0x5b && buf[2] === 0x4d)
      || /^\x1b\[M([\x00\u0020-\uffff]{3})/.test(s)
      || /^\x1b\[(\d+;\d+;\d+)M/.test(s)
      || /^\x1b\[<(\d+;\d+;\d+)([mM])/.test(s)
      || /^\x1b\[<(\d+;\d+;\d+;\d+)&w/.test(s)
      || /^\x1b\[24([0135])~\[(\d+),(\d+)\]\r/.test(s)
      || /^\x1b\[(O|I)/.test(s);
  }
}

function getUnwrappedLineCoordinates(terminal, x, y) {
  const buffer = terminal.buffer.active._buffer;
  // keep the y coordinate within buffer range
  const l = Math.min(Math.max(0, y), buffer.lines.length - 1);
  const line = buffer.getWrappedRangeForLine(l).first;
  const index = (l - line) * terminal.cols + Math.min(x, buffer.lines.get(l).getTrimmedLength() - 1);
  return [line, index];
};

function getWrappedLineCoordinates(terminal, index, line) {
  const { first, last } = terminal.buffer.active._buffer.getWrappedRangeForLine(line);

  const y = first + Math.floor(index / terminal.cols);
  const x = index % terminal.cols;

  if (y > last) {
    throw Error(`wrapped line coordinates [${index}, ${line}] is out of range`);
  }

  return [x, y];
};

module.exports = XTerm;
