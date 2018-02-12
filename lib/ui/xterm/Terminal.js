"use strict";

const {Terminal} = require("xterm");

Terminal.prototype._keyPress = function (ev) {
    var key;
    if (this.customKeyEventHandler && this.customKeyEventHandler(ev) === false) {
        return false;
    }
    this.cancel(ev);
    if (ev.charCode) {
        key = ev.charCode;
    }
    else if (ev.which == null) {
        key = ev.keyCode;
    }
    else if (ev.which !== 0 && ev.charCode !== 0) {
        key = ev.which;
    }
    else {
        return false;
    }
    if (!key || ((ev.altKey || ev.ctrlKey || ev.metaKey) && !isThirdLevelShift(this.browser, ev))) {
        return false;
    }

    //monkey patch start
    // work-around Blessed / Xterm interfacing as Blessed emits these events
    // while handling the keypress event
    // this.emit('keypress', key, ev);
    // this.emit('key', key, ev);
    // monkey patch end
    this.showCursor();
    this.handler(key);
    return true;
};

Terminal.prototype.bindMouse = function () {
    var _this = this;
    var el = this.element;
    var self = this;
    var pressed = 32;
    function sendButton(ev) {
        var button;
        var pos;
        button = getButton(ev);
        pos = self.mouseHelper.getRawByteCoords(ev, self.element, self.charMeasure, self.options.lineHeight, self.cols, self.rows);
        if (!pos)
            return;
        sendEvent(button, pos);
        switch (ev.overrideType || ev.type) {
            case 'mousedown':
                pressed = button;
                break;
            case 'mouseup':
                pressed = 32;
                break;
            case 'wheel':
                break;
        }
    }
    function sendMove(ev) {
        var button = pressed;
        var pos = self.mouseHelper.getRawByteCoords(ev, self.element, self.charMeasure, self.options.lineHeight, self.cols, self.rows);
        if (!pos)
            return;
        button += 32;
        sendEvent(button, pos);
    }
    function encode(data, ch) {
        if (!self.utfMouse) {
            if (ch === 255) {
                data.push(0);
                return;
            }
            if (ch > 127)
                ch = 127;
            data.push(ch);
        }
        else {
            if (ch === 2047) {
                data.push(0);
                return;
            }
            // monkey patch start
            if (ch < 511) {
                data.push(ch);
            }
            // monkey patch end
            else {
                if (ch > 2047)
                    ch = 2047;
                data.push(0xC0 | (ch >> 6));
                data.push(0x80 | (ch & 0x3F));
            }
        }
    }
    function sendEvent(button, pos) {
        if (self.vt300Mouse) {
            button &= 3;
            pos.x -= 32;
            pos.y -= 32;
            var data_1 = EscapeSequences_1.C0.ESC + '[24';
            if (button === 0)
                data_1 += '1';
            else if (button === 1)
                data_1 += '3';
            else if (button === 2)
                data_1 += '5';
            else if (button === 3)
                return;
            else
                data_1 += '0';
            data_1 += '~[' + pos.x + ',' + pos.y + ']\r';
            self.send(data_1);
            return;
        }
        if (self.decLocator) {
            button &= 3;
            pos.x -= 32;
            pos.y -= 32;
            if (button === 0)
                button = 2;
            else if (button === 1)
                button = 4;
            else if (button === 2)
                button = 6;
            else if (button === 3)
                button = 3;
            self.send(EscapeSequences_1.C0.ESC + '['
                + button
                + ';'
                + (button === 3 ? 4 : 0)
                + ';'
                + pos.y
                + ';'
                + pos.x
                + ';'
                + pos.page || 0
                + '&w');
            return;
        }
        if (self.urxvtMouse) {
            pos.x -= 32;
            pos.y -= 32;
            pos.x++;
            pos.y++;
            self.send(EscapeSequences_1.C0.ESC + '[' + button + ';' + pos.x + ';' + pos.y + 'M');
            return;
        }
        if (self.sgrMouse) {
            pos.x -= 32;
            pos.y -= 32;
            self.send(EscapeSequences_1.C0.ESC + '[<'
                + (((button & 3) === 3 ? button & ~3 : button) - 32)
                + ';'
                + pos.x
                + ';'
                + pos.y
                + ((button & 3) === 3 ? 'm' : 'M'));
            return;
        }
        var data = [];
        encode(data, button);
        encode(data, pos.x);
        encode(data, pos.y);
        self.send(EscapeSequences_1.C0.ESC + '[M' + String.fromCharCode.apply(String, data));
    }
    function getButton(ev) {
        var button;
        var shift;
        var meta;
        var ctrl;
        var mod;
        switch (ev.overrideType || ev.type) {
            case 'mousedown':
                button = ev.button != null
                    ? +ev.button
                    : ev.which != null
                        ? ev.which - 1
                        : null;
                if (Browser.isMSIE) {
                    button = button === 1 ? 0 : button === 4 ? 1 : button;
                }
                break;
            case 'mouseup':
                button = 3;
                break;
            case 'DOMMouseScroll':
                button = ev.detail < 0
                    ? 64
                    : 65;
                break;
            case 'wheel':
                button = ev.wheelDeltaY > 0
                    ? 64
                    : 65;
                break;
        }
        shift = ev.shiftKey ? 4 : 0;
        meta = ev.metaKey ? 8 : 0;
        ctrl = ev.ctrlKey ? 16 : 0;
        mod = shift | meta | ctrl;
        if (self.vt200Mouse) {
            mod &= ctrl;
        }
        else if (!self.normalMouse) {
            mod = 0;
        }
        button = (32 + (mod << 2)) + button;
        return button;
    }
    self.on(el, 'mousedown', function (ev) {
        ev.preventDefault();
        _this.focus();
        if (!_this.mouseEvents || _this.selectionManager.shouldForceSelection(ev)) {
            return;
        }
        sendButton(ev);
        if (_this.vt200Mouse) {
            ev.overrideType = 'mouseup';
            sendButton(ev);
            return _this.cancel(ev);
        }
        if (_this.normalMouse)
            on(_this.document, 'mousemove', sendMove);
        if (!_this.x10Mouse) {
            var handler_1 = function (ev) {
                sendButton(ev);
                if (_this.normalMouse)
                    off(_this.document, 'mousemove', sendMove);
                off(_this.document, 'mouseup', handler_1);
                return _this.cancel(ev);
            };
            on(_this.document, 'mouseup', handler_1);
        }
        return _this.cancel(ev);
    });
    self.on(el, 'wheel', function (ev) {
        if (!_this.mouseEvents)
            return;
        if (_this.x10Mouse || _this.vt300Mouse || _this.decLocator)
            return;
        sendButton(ev);
        ev.preventDefault();
    });
    self.on(el, 'wheel', function (ev) {
        if (_this.mouseEvents)
            return;
        _this.viewport.onWheel(ev);
        return _this.cancel(ev);
    });
    self.on(el, 'touchstart', function (ev) {
        if (_this.mouseEvents)
            return;
        _this.viewport.onTouchStart(ev);
        return _this.cancel(ev);
    });
    self.on(el, 'touchmove', function (ev) {
        if (_this.mouseEvents)
            return;
        _this.viewport.onTouchMove(ev);
        return _this.cancel(ev);
    });
};

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
    // PATCH BEGIN https://github.com/xtermjs/xterm.js/issues/1278
    if (this.charMeasure) { 
        this.charMeasure.measure(this.options);
    }
    // PATCH END
    this.refresh(0, this.rows - 1);
    this.emit('resize', { cols: x, rows: y });
};