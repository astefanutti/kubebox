const blessed = require('blessed'),
      hrtime  = require('./hrtime'),
      os      = require('os');

const Terminal = os.platform() === 'browser'
  ? window.Terminal
  : require('xterm').Terminal;

const NON_BREAKING_SPACE_CHAR = String.fromCharCode(160);
const SPACE_CHAR = String.fromCharCode(32);
const ALL_SPACE_REGEX = new RegExp(SPACE_CHAR, 'g');
const ALL_NON_BREAKING_SPACE_REGEX = new RegExp(NON_BREAKING_SPACE_CHAR, 'g');
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
    setOption(this.options, 'scrollback', 1000);

    setOption(this.options, 'style', {});
    setOption(this.options.style, 'bg', 'default');
    setOption(this.options.style, 'fg', 'default');

    // This code executes in the jsdom global scope
    this.term = new Terminal({
      cols: this.width - this.iwidth - 1,
      rows: this.height - this.iheight,
      scrollback: this.options.scrollback !== 'none'
        ? this.options.scrollback
        : this.height - this.iheight,
    });
    this.term._core.cursorState = 1;

    // monkey-patch XTerm to prevent it from effectively rendering
    // anything to the Virtual DOM, as we just grab its character buffer.
    // The alternative would be to listen on the XTerm 'refresh' event,
    // but this way XTerm would uselessly render the DOM elements.
    this.term._core.refresh = (start, end) => {
      this.screen.render();
      // repositions the label given scrolling
      if (this._label) {
        this._label.rtop = (this.childBase || 0) - this.itop;
      }
    }

    this.term._core.viewport = {
      syncScrollArea: () => {},
    };

    // monkey-patch XTerm to prevent any key handling
    this.term._core.keyDown = () => {};
    this.term._core.keyPress = () => {};
    this.term.focus();

    // pass-through title changes by application
    this.term.on('title', (title) => {
      this.title = title;
      this.emit('title', title);
    });

    // TODO: we may want to dynamically adjust the width depending on the scrollbar
    const resize = () => this.term.resize(this.width - this.iwidth - 1, this.height - this.iheight);

    // pass-through Blessed resize events to XTerm
    const nextTick = global.setImmediate || process.nextTick.bind(process);
    this.on('resize', () => nextTick(resize));
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
      this._selection = {
        x1: data.x,
        // in absolute coordinates
        y1: data.y + this.term._core.buffer.ydisp,
      }
      let smd, smu, click = hrtime();
      this.onScreenEvent('mouse', smd = data => {
        // VTE seems to be sending mousemove while XTERM mousedown, let's handle both
        if (data.action !== 'mousemove' && data.action !== 'mousedown') {
          return;
        }
        Object.assign(this._selection || {}, {
          x2: data.x,
          // in absolute coordinates
          y2: data.y + this.term._core.buffer.ydisp,
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
          delete this._selection;
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

  write(data) {
    // replace regular spaces with non-breaking spaces
    // this will serve as a marker to differentiate what was written to the terminal buffer
    // and what wasn't (the buffer is initially filled with spaces). This is useful for copy pasting.
    if (data.indexOf(SPACE_CHAR) !== -1) {
      data = data.replace(ALL_SPACE_REGEX, NON_BREAKING_SPACE_CHAR);
    }
    this.term.write(data);
  }

  hasSelection() {
    return !!this._selection;
  }

  clearSelection() {
    delete this._selection;
  }

  getSelectedText() {
    if (!this._selection) return;

    const xi = this.aleft + this.ileft;
    const yi = this.atop + this.itop;
    let { x1, x2, y1, y2 } = this._selection || {};
    // make sure it's from left to right
    if (y1 > y2 || (y1 == y2 && x1 > x2)) {
      [x1, x2] = [x2, x1];
      [y1, y2] = [y2, y1];
    }
    // convert to buffer coordinates
    x1 -= xi;
    x2 -= xi;
    y1 -= yi;
    y2 -= yi;

    const result = [];
    // get first row
    result.push(this.term._core.buffer.translateBufferLineToString(y1, true, x1, y1 == y2 ? x2 + 1 : null));

    // get middle rows
    for (let i = y1 + 1; i <= y2 - 1; i++) {
      const bufferLine = this.term._core.buffer.lines.get(i);
      const lineText = this.term._core.buffer.translateBufferLineToString(i, true);
      if (bufferLine.isWrapped) {
        result[result.length - 1] += lineText;
      } else {
        result.push(lineText);
      }
    }

    // get last row
    if (y1 != y2) {
      const bufferLine = this.term._core.buffer.lines.get(y2);
      const lineText = this.term._core.buffer.translateBufferLineToString(y2, true, 0, x2 + 1);
      if (bufferLine.isWrapped) {
        result[result.length - 1] += lineText;
      } else {
        result.push(lineText);
      }
    }

    // format string by replacing non-breaking space chars with regular spaces
    // and joining the array into a multi-line string
    return result.map(line => line.replace(ALL_NON_BREAKING_SPACE_REGEX, ' ')).join(CRLF_OR_LF);
  }

  render() {
    // call the underlying Element's rendering function
    let ret = this._render();
    if (!ret) return;

    // framebuffer synchronization:
    // borrowed from original Blessed Terminal widget
    // Copyright (c) 2013-2015 Christopher Jeffrey et al.

    // determine display attributes
    this.dattr = this.sattr(this.style);

    // determine position
    let xi = ret.xi + this.ileft;
    let xl = ret.xl - this.iright - 1; // scrollbar
    let yi = ret.yi + this.itop;
    let yl = ret.yl - this.ibottom;

    // selection
    let { x1: xs1, x2: xs2, y1: ys1, y2: ys2 } = this._selection || {};
    // make sure it's from left to right
    if (ys1 > ys2 || (ys1 == ys2 && xs1 > xs2)) {
      [xs1, xs2] = [xs2, xs1];
      [ys1, ys2] = [ys2, ys1];
    }
    // back to screen coordinates
    const ydisp = this.term._core.buffer.ydisp;
    ys1 -= ydisp;
    ys2 -= ydisp;

    let cursor;
    // iterate over all lines
    for (let y = Math.max(yi, 0); y < yl; y++) {
      // fetch Blessed Screen and XTerm lines
      let sline = this.screen.lines[y];
      let tline = this.term._core.buffer.lines.get(ydisp + y - yi);
      if (!sline || !tline)
        break;

      // update sline from tline
      let dirty = false;
      const updateSLine = (s1, s2, val) => {
        if (sline[s1][s2] !== val) {
          sline[s1][s2] = val;
          dirty = true;
        }
      }

      // determine cursor column position
      if (y === yi + this.term._core.buffer.y
          && this.term._core.cursorState
          && this.screen.focused === this
          && (ydisp === this.term._core.buffer.ybase)
          && !this.term._core.cursorHidden) {
        cursor = xi + this.term._core.buffer.x;
      } else {
        cursor = -1;
      }

      // iterate over all columns
      for (let x = Math.max(xi, 0); x < xl; x++) {
        if (!sline[x] || !tline.get(x - xi))
          break;

        // read terminal attribute and character
        let x0 = tline.get(x - xi)[0];
        let x1 = tline.get(x - xi)[1];

        // handle cursor
        if (x === cursor) {
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
        if (inverse && tline.get(x - xi)[3] != 32) {
          x0 = x0 | (8 << 18);
        }

        // default foreground is 257
        if (((x0 >> 9) & 0x1ff) === 257) {
          x0 = (x0 & ~(0x1ff << 9)) | (((this.dattr >> 9) & 0x1ff) << 9);
        }

        // default background is 256
        if ((x0 & 0x1ff) === 256) {
          x0 = (x0 & ~0x1ff) | (this.dattr & 0x1ff);
        }

        // write screen attribute and character
        updateSLine(x, 0, x0);
        updateSLine(x, 1, x1);
      }

      if (dirty) {
        sline.dirty = true;
      }
    }
    return ret;
  }

  // called prior to the element scrollbar rendering
  _scrollBottom() {
    if (!this.term) return super._scrollBottom();
    // requires alwaysScroll = true for it to position the scrollbar correctly
    this.childBase = this.term._core.buffer.ydisp;
    return this.term._core.buffer.scrollBottom + this.term._core.buffer.ybase + 1;
  }

  getScrollPerc() {
    return this.term._core.buffer.ybase > 0
      ? this.term._core.buffer.ydisp / this.term._core.buffer.ybase * 100
      : 100;
  }

  setScrollPerc(i) {
    return this.scrollTo(Math.floor(i / 100 * this.term._core.buffer.ybase));
  }

  setScroll(offset) {
    return this.scrollTo(offset);
  }

  scrollTo(offset) {
    this.term.scrollLines(offset - this.term._core.buffer.ydisp);
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

module.exports = XTerm;
