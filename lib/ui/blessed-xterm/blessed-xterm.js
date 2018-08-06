/*
**  blessed-xterm -- XTerm Widget for Blessed Curses Environment
**  Copyright (c) 2017 Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const blessed = require('blessed');
const os      = require('os');

if (os.platform() === 'browser') {
    // lets grab the xterm from index.html and not reimport
    var Terminal = window.Terminal;
} else {
    var { Terminal } = require('xterm');
}

class XTerm extends blessed.ScrollableBox {

    constructor(options = {}) {
        super(options);
        // required so that scrollbar positions correctly without childOffset
        this.alwaysScroll = true;

        /*  helper function for setting options  */
        const setOption = (cfg, name, def) => {
            if (this.options[name] === undefined)
                this.options[name] = def
        }

        /*  provide option fallbacks  */
        setOption(this.options, "args", [])
        setOption(this.options, "env", process.env)
        setOption(this.options, "cwd", process.cwd())
        setOption(this.options, "cursorType", "block")
        setOption(this.options, "scrollback", 1000)
        setOption(this.options, "mousePassthrough", false)

        /*  ensure style is available  */
        setOption(this.options, "style", {})
        setOption(this.options.style, "bg", "default")
        setOption(this.options.style, "fg", "default")

        this.on('mouse', function (data) {
            // scrollbar is being dragged
            if (this._scrollingBar) return;

            let oldmouse = this.mousedown;
            if (data.action === 'mouseup') {
                // hold selection
                this.mousedown = false;
            }
            else if (data.action === 'mousedown' && this.mousedown) {
                this.x2 = data.x;
                this.y2 = data.y;
            }
            else if (data.action === 'mousedown' && data.button === 'left') {
                // scrollbar
                if (data.x >= this.aleft - this.ileft + this.width - 1) return;
                this.mousedown = true;
                this.x1 = data.x;
                this.y1 = data.y;
                this.x2 = data.x;
                this.y2 = data.y;
            } else if (data.action === 'mousemove' && this.mousedown) {
                this.x2 = data.x;
                this.y2 = data.y;
            } else {
                this.mousedown = false;
            }
            if (oldmouse && oldmouse != this.mousedown || this.mousedown) {
                this.screen.render();
            }
        });
        this._bootstrap();
        this.handler = options.handler;
    }

    start() {
        this.refreshIntervalId = setInterval(() => {
            this.blinking = !this.blinking;
            this.screen.render();
        }, 500);
    }

    /*  identify us to Blessed  */
    get type() {
        return "terminal"
    }

    /*  bootstrap the API class  */
    _bootstrap() {
        // This code executes in the jsdom global scope
        this.term = new Terminal({
            cols       : this.width - this.iwidth - 1,
            rows       : this.height - this.iheight,
            scrollback : this.options.scrollback !== "none"
                ? this.options.scrollback
                : this.height - this.iheight,
        });
        this.term._core.cursorState = 1;

        /*  monkey-patch XTerm to prevent it from effectively rendering
            anything to the Virtual DOM, as we just grab its character buffer.
            The alternative would be to listen on the XTerm "refresh" event,
            but this way XTerm would uselessly render the DOM elements.  */
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

        /*  monkey-patch XTerm to prevent any key handling  */
        this.term._core.keyDown = () => { }
        this.term._core.keyPress = () => { }
        this.term.focus();

        /*  pass-through title changes by application  */
        this.term.on("title", (title) => {
            this.title = title
            this.emit("title", title)
        })

        /*  helper function to determine mouse inputs  */
        const _isMouse = (buf) => {
            /*  mouse event determination:
                borrowed from original Blessed Terminal widget
                Copyright (c) 2013-2015 Christopher Jeffrey et al.  */
            let s = buf
            if (Buffer.isBuffer(s)) {
                if (s[0] > 127 && s[1] === undefined) {
                    s[0] -= 128
                    s = "\x1b" + s.toString("utf-8")
                }
                else
                    s = s.toString("utf-8")
            }
            return (buf[0] === 0x1b && buf[1] === 0x5b && buf[2] === 0x4d)
                || /^\x1b\[M([\x00\u0020-\uffff]{3})/.test(s)
                || /^\x1b\[(\d+;\d+;\d+)M/.test(s)
                || /^\x1b\[<(\d+;\d+;\d+)([mM])/.test(s)
                || /^\x1b\[<(\d+;\d+;\d+;\d+)&w/.test(s)
                || /^\x1b\[24([0135])~\[(\d+),(\d+)\]\r/.test(s)
                || /^\x1b\[(O|I)/.test(s)
        }

        /*  pass raw keyboard input from Blessed to XTerm  */
        this.skipInputDataOnce = false;
        this.skipInputDataAlways = false;
        this.screen.program.input.on("data", this._onScreenEventInputData = (data) => {
            if (this.screen.focused !== this)
                return;
            if (this.skipInputDataAlways)
                return;
            if (this.skipInputDataOnce) {
                this.skipInputDataOnce = false;
                return;
            }
            if (!_isMouse(data))
                this.handler(data);
        })

        /*  pass mouse input from Blessed to XTerm  */
        if (this.options.mousePassthrough) {
            this.onScreenEvent("mouse", this._onScreenEventMouse = (ev) => {
                /*  only in case we are focused  */
                if (this.screen.focused !== this)
                    return

                /*  only in case we are touched  */
                if ((ev.x < this.aleft + this.ileft)
                    || (ev.y < this.atop + this.itop)
                    || (ev.x > this.aleft - this.ileft + this.width)
                    || (ev.y > this.atop - this.itop + this.height))
                    return

                /*  generate canonical mouse input sequence,
                    borrowed from original Blessed Terminal widget
                    Copyright (c) 2013-2015 Christopher Jeffrey et al.  */
                let b = ev.raw[0]
                let x = ev.x - this.aleft
                let y = ev.y - this.atop
                let s
                if (this.term._core.urxvtMouse) {
                    if (this.screen.program.sgrMouse)
                        b += 32
                    s = "\x1b[" + b + ";" + (x + 32) + ";" + (y + 32) + "M"
                }
                else if (this.term._core.sgrMouse) {
                    if (!this.screen.program.sgrMouse)
                        b -= 32
                    s = "\x1b[<" + b + ";" + x + ";" + y +
                        (ev.action === "mousedown" ? "M" : "m")
                }
                else {
                    if (this.screen.program.sgrMouse)
                        b += 32
                    s = "\x1b[M" +
                        String.fromCharCode(b) +
                        String.fromCharCode(x + 32) +
                        String.fromCharCode(y + 32)
                }

                /*  pass-through mouse event sequence  */
                this.handler(s)
            })
        }

        /*  pass-through Blessed resize events to XTerm/Pty  */
        this.on("resize", () => {
            const nextTick = global.setImmediate || process.nextTick.bind(process)
            nextTick(() => {
                // TODO: we may want to dynamically adjust the width depending on the scrollbar
                const width = this.width - this.iwidth - 1;
                const height = this.height - this.iheight;
                this.term.resize(width, height);
            })
        })

        /*  perform an initial resizing once  */
        this.once("render", () => {
            const width = this.width - this.iwidth - 1;
            const height = this.height - this.iheight;
            this.term.resize(width, height);
        })

        this.on("destroy", () => this.dispose());
    }

    /*  process input data  */
    enableInput(process) {
        this.skipInputDataAlways = !process;
    }

    /*  write data to the terminal  */
    write(data) {
        return this.term.write(data)
    }

    getSelectedText() {
        // let's not render twice
        /*  call the underlying Element's rendering function  */
        let ret = this._render()
        if (!ret)
            return

        let xi = ret.xi + this.ileft
        let xl = ret.xl - this.iright
        let yi = ret.yi + this.itop
        let yl = ret.yl - this.ibottom
        let result = [];
        let x1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2;
        if (this.y1 > this.y2 || (this.y1 == this.y2 && this.x1 > this.x2)) {
            x1 = this.x2;
            y1 = this.y2;
            x2 = this.x1;
            y2 = this.y1;
        }

        let endRow = y1 == y2 ? x2 : null;
        // Get first row
        result.push(this.term._core.buffer.translateBufferLineToString(this.term._core.buffer.ydisp + y1 - yi, true, x1 - xi, endRow));

        // Get middle rows
        for (let i = y1 + 1; i <= y2 - 1; i++) {
            const lineText = this.term._core.buffer.translateBufferLineToString(this.term._core.buffer.ydisp + i - yi, true);
            result.push(lineText);
        }

        // Get last row
        if (y1 != y2) {
            const lineText = this.term._core.buffer.translateBufferLineToString(this.term._core.buffer.ydisp + y2 - yi, true, 0, x2);
            result.push(lineText);
        }

        const NON_BREAKING_SPACE_CHAR = String.fromCharCode(160);
        const ALL_NON_BREAKING_SPACE_REGEX = new RegExp(NON_BREAKING_SPACE_CHAR, 'g');

        // Format string by replacing non-breaking space chars with regular spaces
        // and joining the array into a multi-line string.
        const formattedResult = result.map(line => {
            return line.replace(ALL_NON_BREAKING_SPACE_REGEX, ' ');
        }).join('\n');
        return formattedResult;
    }

    /*  render the widget  */
    render() {
        /*  call the underlying Element's rendering function  */
        let ret = this._render()
        if (!ret)
            return

        /*  framebuffer synchronization:
            borrowed from original Blessed Terminal widget
            Copyright (c) 2013-2015 Christopher Jeffrey et al.  */

        /*  determine display attributes  */
        this.dattr = this.sattr(this.style)
        // add 'inverse'

        /*  determine position  */
        let xi = ret.xi + this.ileft
        let xl = ret.xl - this.iright - 1; // scrollbar
        let yi = ret.yi + this.itop
        let yl = ret.yl - this.ibottom

        /*  iterate over all lines  */
        let cursor
        let dirtyAny = false;
        let X1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2;
        if (this.y1 > this.y2 || (this.y1 == this.y2 && this.x1 > this.x2)) {
            X1 = this.x2;
            y1 = this.y2;
            x2 = this.x1;
            y2 = this.y1;
        }
        for (let y = Math.max(yi, 0); y < yl; y++) {
            /*  fetch Blessed Screen and XTerm lines  */
            let sline = this.screen.lines[y]
            let tline = this.term._core.buffer.lines.get(this.term._core.buffer.ydisp + y - yi)
            if (!sline || !tline)
                break

            /*  update sline from tline  */
            let dirty = false
            const updateSLine = (s1, s2, val) => {
                if (sline[s1][s2] !== val) {
                    sline[s1][s2] = val
                    dirty = true
                }
            }

            /*  determine cursor column position  */
            if (y === yi + this.term._core.buffer.y
                && this.term._core.cursorState
                && this.screen.focused === this
                && (this.term._core.buffer.ydisp === this.term._core.buffer.ybase)
                && !this.term._core.cursorHidden)
                cursor = xi + this.term._core.buffer.x
            else
                cursor = -1

            /*  iterate over all columns  */
            for (let x = Math.max(xi, 0); x < xl; x++) {
                if (!sline[x] || !tline[x - xi])
                    break

                /*  read terminal attribute and character  */
                let x0 = tline[x - xi][0]
                let x1 = tline[x - xi][1]

                /*  handle cursor  */
                if (x === cursor) {
                    if (this.blinking) {
                        if (this.options.cursorType === "line") {
                            x0 = this.dattr
                            x1 = "\u2502"
                        }
                        else if (this.options.cursorType === "underline")
                            x0 = this.dattr | (2 << 18)
                        else if (this.options.cursorType === "block")
                            x0 = this.dattr | (8 << 18)
                    }
                }

                // inverse x0 if selected
                let inverse = false;
                if (y1 <= y && y2 >= y && !(y1 == y2 && X1 == x2)) {
                    if (y1 == y2) {
                        if (X1 <= x && x2 >= x) {
                            inverse = true;
                        }
                    } else if (y == y1 && x >= X1) {
                        inverse = true;
                    } else if (y == y2 && x <= x2) {
                        inverse = true;
                    } else if (y > y1 && y < y2) {
                        inverse = true;
                    }
                }
                if (inverse) {
                    x0 = x0 | (8 << 18);
                }

                /*  default foreground is 257  */
                if (((x0 >> 9) & 0x1ff) === 257)
                    x0 = (x0 & ~(0x1ff << 9)) | (((this.dattr >> 9) & 0x1ff) << 9)

                /*  default background is 256  */
                if ((x0 & 0x1ff) === 256)
                    x0 = (x0 & ~0x1ff) | (this.dattr & 0x1ff)

                /*  write screen attribute and character  */
                updateSLine(x, 0, x0)
                updateSLine(x, 1, x1)
            }

            /*  mark Blessed Screen line as dirty  */
            if (dirty) {
                sline.dirty = true
                dirtyAny = true
            }
        }
        return ret
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
        if (this._onScreenEventInput)
            this.screen.program.input.removeListener('data', this._onScreenEventInputData);
        if (this._onScreenEventMouse)
            this.removeScreenEvent('mouse', this._onScreenEventMouse);

        this.term.dispose();
    }
}

module.exports = XTerm;
