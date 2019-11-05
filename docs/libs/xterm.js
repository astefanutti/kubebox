(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 32);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ServiceRegistry_1 = __webpack_require__(13);
exports.IBufferService = ServiceRegistry_1.createDecorator('BufferService');
exports.ICoreMouseService = ServiceRegistry_1.createDecorator('CoreMouseService');
exports.ICoreService = ServiceRegistry_1.createDecorator('CoreService');
exports.IDirtyRowService = ServiceRegistry_1.createDecorator('DirtyRowService');
exports.IInstantiationService = ServiceRegistry_1.createDecorator('InstantiationService');
exports.ILogService = ServiceRegistry_1.createDecorator('LogService');
exports.IOptionsService = ServiceRegistry_1.createDecorator('OptionsService');


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter = (function () {
    function EventEmitter() {
        this._listeners = [];
    }
    Object.defineProperty(EventEmitter.prototype, "event", {
        get: function () {
            var _this = this;
            if (!this._event) {
                this._event = function (listener) {
                    _this._listeners.push(listener);
                    var disposable = {
                        dispose: function () {
                            for (var i = 0; i < _this._listeners.length; i++) {
                                if (_this._listeners[i] === listener) {
                                    _this._listeners.splice(i, 1);
                                    return;
                                }
                            }
                        }
                    };
                    return disposable;
                };
            }
            return this._event;
        },
        enumerable: true,
        configurable: true
    });
    EventEmitter.prototype.fire = function (data) {
        var queue = [];
        for (var i = 0; i < this._listeners.length; i++) {
            queue.push(this._listeners[i]);
        }
        for (var i = 0; i < queue.length; i++) {
            queue[i].call(undefined, data);
        }
    };
    return EventEmitter;
}());
exports.EventEmitter = EventEmitter;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Disposable = (function () {
    function Disposable() {
        this._disposables = [];
        this._isDisposed = false;
    }
    Disposable.prototype.dispose = function () {
        this._isDisposed = true;
        this._disposables.forEach(function (d) { return d.dispose(); });
        this._disposables.length = 0;
    };
    Disposable.prototype.register = function (d) {
        this._disposables.push(d);
    };
    Disposable.prototype.unregister = function (d) {
        var index = this._disposables.indexOf(d);
        if (index !== -1) {
            this._disposables.splice(index, 1);
        }
    };
    return Disposable;
}());
exports.Disposable = Disposable;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COLOR = 256;
exports.DEFAULT_ATTR = (0 << 18) | (exports.DEFAULT_COLOR << 9) | (256 << 0);
exports.CHAR_DATA_ATTR_INDEX = 0;
exports.CHAR_DATA_CHAR_INDEX = 1;
exports.CHAR_DATA_WIDTH_INDEX = 2;
exports.CHAR_DATA_CODE_INDEX = 3;
exports.NULL_CELL_CHAR = '';
exports.NULL_CELL_WIDTH = 1;
exports.NULL_CELL_CODE = 0;
exports.WHITESPACE_CELL_CHAR = ' ';
exports.WHITESPACE_CELL_WIDTH = 1;
exports.WHITESPACE_CELL_CODE = 32;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var TextDecoder_1 = __webpack_require__(8);
var Constants_1 = __webpack_require__(3);
var AttributeData_1 = __webpack_require__(6);
var CellData = (function (_super) {
    __extends(CellData, _super);
    function CellData() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.content = 0;
        _this.fg = 0;
        _this.bg = 0;
        _this.combinedData = '';
        return _this;
    }
    CellData.fromCharData = function (value) {
        var obj = new CellData();
        obj.setFromCharData(value);
        return obj;
    };
    CellData.prototype.isCombined = function () {
        return this.content & 2097152;
    };
    CellData.prototype.getWidth = function () {
        return this.content >> 22;
    };
    CellData.prototype.getChars = function () {
        if (this.content & 2097152) {
            return this.combinedData;
        }
        if (this.content & 2097151) {
            return TextDecoder_1.stringFromCodePoint(this.content & 2097151);
        }
        return '';
    };
    CellData.prototype.getCode = function () {
        return (this.isCombined())
            ? this.combinedData.charCodeAt(this.combinedData.length - 1)
            : this.content & 2097151;
    };
    CellData.prototype.setFromCharData = function (value) {
        this.fg = value[Constants_1.CHAR_DATA_ATTR_INDEX];
        this.bg = 0;
        var combined = false;
        if (value[Constants_1.CHAR_DATA_CHAR_INDEX].length > 2) {
            combined = true;
        }
        else if (value[Constants_1.CHAR_DATA_CHAR_INDEX].length === 2) {
            var code = value[Constants_1.CHAR_DATA_CHAR_INDEX].charCodeAt(0);
            if (0xD800 <= code && code <= 0xDBFF) {
                var second = value[Constants_1.CHAR_DATA_CHAR_INDEX].charCodeAt(1);
                if (0xDC00 <= second && second <= 0xDFFF) {
                    this.content = ((code - 0xD800) * 0x400 + second - 0xDC00 + 0x10000) | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
                }
                else {
                    combined = true;
                }
            }
            else {
                combined = true;
            }
        }
        else {
            this.content = value[Constants_1.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
        }
        if (combined) {
            this.combinedData = value[Constants_1.CHAR_DATA_CHAR_INDEX];
            this.content = 2097152 | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
        }
    };
    CellData.prototype.getAsCharData = function () {
        return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
    };
    return CellData;
}(AttributeData_1.AttributeData));
exports.CellData = CellData;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ServiceRegistry_1 = __webpack_require__(13);
exports.ICharSizeService = ServiceRegistry_1.createDecorator('CharSizeService');
exports.IMouseService = ServiceRegistry_1.createDecorator('MouseService');
exports.IRenderService = ServiceRegistry_1.createDecorator('RenderService');
exports.ISelectionService = ServiceRegistry_1.createDecorator('SelectionService');
exports.ISoundService = ServiceRegistry_1.createDecorator('SoundService');


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var AttributeData = (function () {
    function AttributeData() {
        this.fg = 0;
        this.bg = 0;
    }
    AttributeData.toColorRGB = function (value) {
        return [
            value >>> 16 & 255,
            value >>> 8 & 255,
            value & 255
        ];
    };
    AttributeData.fromColorRGB = function (value) {
        return (value[0] & 255) << 16 | (value[1] & 255) << 8 | value[2] & 255;
    };
    AttributeData.prototype.clone = function () {
        var newObj = new AttributeData();
        newObj.fg = this.fg;
        newObj.bg = this.bg;
        return newObj;
    };
    AttributeData.prototype.isInverse = function () { return this.fg & 67108864; };
    AttributeData.prototype.isBold = function () { return this.fg & 134217728; };
    AttributeData.prototype.isUnderline = function () { return this.fg & 268435456; };
    AttributeData.prototype.isBlink = function () { return this.fg & 536870912; };
    AttributeData.prototype.isInvisible = function () { return this.fg & 1073741824; };
    AttributeData.prototype.isItalic = function () { return this.bg & 67108864; };
    AttributeData.prototype.isDim = function () { return this.bg & 134217728; };
    AttributeData.prototype.getFgColorMode = function () { return this.fg & 50331648; };
    AttributeData.prototype.getBgColorMode = function () { return this.bg & 50331648; };
    AttributeData.prototype.isFgRGB = function () { return (this.fg & 50331648) === 50331648; };
    AttributeData.prototype.isBgRGB = function () { return (this.bg & 50331648) === 50331648; };
    AttributeData.prototype.isFgPalette = function () { return (this.fg & 50331648) === 16777216 || (this.fg & 50331648) === 33554432; };
    AttributeData.prototype.isBgPalette = function () { return (this.bg & 50331648) === 16777216 || (this.bg & 50331648) === 33554432; };
    AttributeData.prototype.isFgDefault = function () { return (this.fg & 50331648) === 0; };
    AttributeData.prototype.isBgDefault = function () { return (this.bg & 50331648) === 0; };
    AttributeData.prototype.getFgColor = function () {
        switch (this.fg & 50331648) {
            case 16777216:
            case 33554432: return this.fg & 255;
            case 50331648: return this.fg & 16777215;
            default: return -1;
        }
    };
    AttributeData.prototype.getBgColor = function () {
        switch (this.bg & 50331648) {
            case 16777216:
            case 33554432: return this.bg & 255;
            case 50331648: return this.bg & 16777215;
            default: return -1;
        }
    };
    return AttributeData;
}());
exports.AttributeData = AttributeData;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function addDisposableDomListener(node, type, handler, useCapture) {
    node.addEventListener(type, handler, useCapture);
    return {
        dispose: function () {
            if (!handler) {
                return;
            }
            node.removeEventListener(type, handler, useCapture);
        }
    };
}
exports.addDisposableDomListener = addDisposableDomListener;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function stringFromCodePoint(codePoint) {
    if (codePoint > 0xFFFF) {
        codePoint -= 0x10000;
        return String.fromCharCode((codePoint >> 10) + 0xD800) + String.fromCharCode((codePoint % 0x400) + 0xDC00);
    }
    return String.fromCharCode(codePoint);
}
exports.stringFromCodePoint = stringFromCodePoint;
function utf32ToString(data, start, end) {
    if (start === void 0) { start = 0; }
    if (end === void 0) { end = data.length; }
    var result = '';
    for (var i = start; i < end; ++i) {
        var codepoint = data[i];
        if (codepoint > 0xFFFF) {
            codepoint -= 0x10000;
            result += String.fromCharCode((codepoint >> 10) + 0xD800) + String.fromCharCode((codepoint % 0x400) + 0xDC00);
        }
        else {
            result += String.fromCharCode(codepoint);
        }
    }
    return result;
}
exports.utf32ToString = utf32ToString;
var StringToUtf32 = (function () {
    function StringToUtf32() {
        this._interim = 0;
    }
    StringToUtf32.prototype.clear = function () {
        this._interim = 0;
    };
    StringToUtf32.prototype.decode = function (input, target) {
        var length = input.length;
        if (!length) {
            return 0;
        }
        var size = 0;
        var startPos = 0;
        if (this._interim) {
            var second = input.charCodeAt(startPos++);
            if (0xDC00 <= second && second <= 0xDFFF) {
                target[size++] = (this._interim - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
            }
            else {
                target[size++] = this._interim;
                target[size++] = second;
            }
            this._interim = 0;
        }
        for (var i = startPos; i < length; ++i) {
            var code = input.charCodeAt(i);
            if (0xD800 <= code && code <= 0xDBFF) {
                if (++i >= length) {
                    this._interim = code;
                    return size;
                }
                var second = input.charCodeAt(i);
                if (0xDC00 <= second && second <= 0xDFFF) {
                    target[size++] = (code - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
                }
                else {
                    target[size++] = code;
                    target[size++] = second;
                }
                continue;
            }
            target[size++] = code;
        }
        return size;
    };
    return StringToUtf32;
}());
exports.StringToUtf32 = StringToUtf32;
var Utf8ToUtf32 = (function () {
    function Utf8ToUtf32() {
        this.interim = new Uint8Array(3);
    }
    Utf8ToUtf32.prototype.clear = function () {
        this.interim.fill(0);
    };
    Utf8ToUtf32.prototype.decode = function (input, target) {
        var length = input.length;
        if (!length) {
            return 0;
        }
        var size = 0;
        var byte1;
        var byte2;
        var byte3;
        var byte4;
        var codepoint = 0;
        var startPos = 0;
        if (this.interim[0]) {
            var discardInterim = false;
            var cp = this.interim[0];
            cp &= ((((cp & 0xE0) === 0xC0)) ? 0x1F : (((cp & 0xF0) === 0xE0)) ? 0x0F : 0x07);
            var pos = 0;
            var tmp = void 0;
            while ((tmp = this.interim[++pos] & 0x3F) && pos < 4) {
                cp <<= 6;
                cp |= tmp;
            }
            var type = (((this.interim[0] & 0xE0) === 0xC0)) ? 2 : (((this.interim[0] & 0xF0) === 0xE0)) ? 3 : 4;
            var missing = type - pos;
            while (startPos < missing) {
                if (startPos >= length) {
                    return 0;
                }
                tmp = input[startPos++];
                if ((tmp & 0xC0) !== 0x80) {
                    startPos--;
                    discardInterim = true;
                    break;
                }
                else {
                    this.interim[pos++] = tmp;
                    cp <<= 6;
                    cp |= tmp & 0x3F;
                }
            }
            if (!discardInterim) {
                if (type === 2) {
                    if (cp < 0x80) {
                        startPos--;
                    }
                    else {
                        target[size++] = cp;
                    }
                }
                else if (type === 3) {
                    if (cp < 0x0800 || (cp >= 0xD800 && cp <= 0xDFFF)) {
                    }
                    else {
                        target[size++] = cp;
                    }
                }
                else {
                    if (cp < 0x010000 || cp > 0x10FFFF) {
                    }
                    else {
                        target[size++] = cp;
                    }
                }
            }
            this.interim.fill(0);
        }
        var fourStop = length - 4;
        var i = startPos;
        while (i < length) {
            while (i < fourStop
                && !((byte1 = input[i]) & 0x80)
                && !((byte2 = input[i + 1]) & 0x80)
                && !((byte3 = input[i + 2]) & 0x80)
                && !((byte4 = input[i + 3]) & 0x80)) {
                target[size++] = byte1;
                target[size++] = byte2;
                target[size++] = byte3;
                target[size++] = byte4;
                i += 4;
            }
            byte1 = input[i++];
            if (byte1 < 0x80) {
                target[size++] = byte1;
            }
            else if ((byte1 & 0xE0) === 0xC0) {
                if (i >= length) {
                    this.interim[0] = byte1;
                    return size;
                }
                byte2 = input[i++];
                if ((byte2 & 0xC0) !== 0x80) {
                    i--;
                    continue;
                }
                codepoint = (byte1 & 0x1F) << 6 | (byte2 & 0x3F);
                if (codepoint < 0x80) {
                    i--;
                    continue;
                }
                target[size++] = codepoint;
            }
            else if ((byte1 & 0xF0) === 0xE0) {
                if (i >= length) {
                    this.interim[0] = byte1;
                    return size;
                }
                byte2 = input[i++];
                if ((byte2 & 0xC0) !== 0x80) {
                    i--;
                    continue;
                }
                if (i >= length) {
                    this.interim[0] = byte1;
                    this.interim[1] = byte2;
                    return size;
                }
                byte3 = input[i++];
                if ((byte3 & 0xC0) !== 0x80) {
                    i--;
                    continue;
                }
                codepoint = (byte1 & 0x0F) << 12 | (byte2 & 0x3F) << 6 | (byte3 & 0x3F);
                if (codepoint < 0x0800 || (codepoint >= 0xD800 && codepoint <= 0xDFFF)) {
                    continue;
                }
                target[size++] = codepoint;
            }
            else if ((byte1 & 0xF8) === 0xF0) {
                if (i >= length) {
                    this.interim[0] = byte1;
                    return size;
                }
                byte2 = input[i++];
                if ((byte2 & 0xC0) !== 0x80) {
                    i--;
                    continue;
                }
                if (i >= length) {
                    this.interim[0] = byte1;
                    this.interim[1] = byte2;
                    return size;
                }
                byte3 = input[i++];
                if ((byte3 & 0xC0) !== 0x80) {
                    i--;
                    continue;
                }
                if (i >= length) {
                    this.interim[0] = byte1;
                    this.interim[1] = byte2;
                    this.interim[2] = byte3;
                    return size;
                }
                byte4 = input[i++];
                if ((byte4 & 0xC0) !== 0x80) {
                    i--;
                    continue;
                }
                codepoint = (byte1 & 0x07) << 18 | (byte2 & 0x3F) << 12 | (byte3 & 0x3F) << 6 | (byte4 & 0x3F);
                if (codepoint < 0x010000 || codepoint > 0x10FFFF) {
                    continue;
                }
                target[size++] = codepoint;
            }
            else {
            }
        }
        return size;
    };
    return Utf8ToUtf32;
}());
exports.Utf8ToUtf32 = Utf8ToUtf32;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.INVERTED_DEFAULT_COLOR = 257;
exports.DIM_OPACITY = 0.5;
exports.CHAR_ATLAS_CELL_SPACING = 1;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var isNode = (typeof navigator === 'undefined') ? true : false;
var userAgent = (isNode) ? 'node' : navigator.userAgent;
var platform = (isNode) ? 'node' : navigator.platform;
exports.isFirefox = !!~userAgent.indexOf('Firefox');
exports.isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
exports.isMac = contains(['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'], platform);
exports.isIpad = platform === 'iPad';
exports.isIphone = platform === 'iPhone';
exports.isWindows = contains(['Windows', 'Win16', 'Win32', 'WinCE'], platform);
exports.isLinux = platform.indexOf('Linux') >= 0;
function contains(arr, el) {
    return arr.indexOf(el) >= 0;
}


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var C0;
(function (C0) {
    C0.NUL = '\x00';
    C0.SOH = '\x01';
    C0.STX = '\x02';
    C0.ETX = '\x03';
    C0.EOT = '\x04';
    C0.ENQ = '\x05';
    C0.ACK = '\x06';
    C0.BEL = '\x07';
    C0.BS = '\x08';
    C0.HT = '\x09';
    C0.LF = '\x0a';
    C0.VT = '\x0b';
    C0.FF = '\x0c';
    C0.CR = '\x0d';
    C0.SO = '\x0e';
    C0.SI = '\x0f';
    C0.DLE = '\x10';
    C0.DC1 = '\x11';
    C0.DC2 = '\x12';
    C0.DC3 = '\x13';
    C0.DC4 = '\x14';
    C0.NAK = '\x15';
    C0.SYN = '\x16';
    C0.ETB = '\x17';
    C0.CAN = '\x18';
    C0.EM = '\x19';
    C0.SUB = '\x1a';
    C0.ESC = '\x1b';
    C0.FS = '\x1c';
    C0.GS = '\x1d';
    C0.RS = '\x1e';
    C0.US = '\x1f';
    C0.SP = '\x20';
    C0.DEL = '\x7f';
})(C0 = exports.C0 || (exports.C0 = {}));
var C1;
(function (C1) {
    C1.PAD = '\x80';
    C1.HOP = '\x81';
    C1.BPH = '\x82';
    C1.NBH = '\x83';
    C1.IND = '\x84';
    C1.NEL = '\x85';
    C1.SSA = '\x86';
    C1.ESA = '\x87';
    C1.HTS = '\x88';
    C1.HTJ = '\x89';
    C1.VTS = '\x8a';
    C1.PLD = '\x8b';
    C1.PLU = '\x8c';
    C1.RI = '\x8d';
    C1.SS2 = '\x8e';
    C1.SS3 = '\x8f';
    C1.DCS = '\x90';
    C1.PU1 = '\x91';
    C1.PU2 = '\x92';
    C1.STS = '\x93';
    C1.CCH = '\x94';
    C1.MW = '\x95';
    C1.SPA = '\x96';
    C1.EPA = '\x97';
    C1.SOS = '\x98';
    C1.SGCI = '\x99';
    C1.SCI = '\x9a';
    C1.CSI = '\x9b';
    C1.ST = '\x9c';
    C1.OSC = '\x9d';
    C1.PM = '\x9e';
    C1.APC = '\x9f';
})(C1 = exports.C1 || (exports.C1 = {}));


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Constants_1 = __webpack_require__(3);
var Constants_2 = __webpack_require__(9);
var CharAtlasCache_1 = __webpack_require__(23);
var AttributeData_1 = __webpack_require__(6);
var RendererUtils_1 = __webpack_require__(26);
var BaseRenderLayer = (function () {
    function BaseRenderLayer(_container, id, zIndex, _alpha, _colors, _rendererId, _bufferService, _optionsService) {
        this._container = _container;
        this._alpha = _alpha;
        this._colors = _colors;
        this._rendererId = _rendererId;
        this._bufferService = _bufferService;
        this._optionsService = _optionsService;
        this._scaledCharWidth = 0;
        this._scaledCharHeight = 0;
        this._scaledCellWidth = 0;
        this._scaledCellHeight = 0;
        this._scaledCharLeft = 0;
        this._scaledCharTop = 0;
        this._currentGlyphIdentifier = {
            chars: '',
            code: 0,
            bg: 0,
            fg: 0,
            bold: false,
            dim: false,
            italic: false
        };
        this._canvas = document.createElement('canvas');
        this._canvas.classList.add("xterm-" + id + "-layer");
        this._canvas.style.zIndex = zIndex.toString();
        this._initCanvas();
        this._container.appendChild(this._canvas);
    }
    BaseRenderLayer.prototype.dispose = function () {
        this._container.removeChild(this._canvas);
        if (this._charAtlas) {
            this._charAtlas.dispose();
        }
    };
    BaseRenderLayer.prototype._initCanvas = function () {
        this._ctx = RendererUtils_1.throwIfFalsy(this._canvas.getContext('2d', { alpha: this._alpha }));
        if (!this._alpha) {
            this._clearAll();
        }
    };
    BaseRenderLayer.prototype.onOptionsChanged = function () { };
    BaseRenderLayer.prototype.onBlur = function () { };
    BaseRenderLayer.prototype.onFocus = function () { };
    BaseRenderLayer.prototype.onCursorMove = function () { };
    BaseRenderLayer.prototype.onGridChanged = function (startRow, endRow) { };
    BaseRenderLayer.prototype.onSelectionChanged = function (start, end, columnSelectMode) {
        if (columnSelectMode === void 0) { columnSelectMode = false; }
    };
    BaseRenderLayer.prototype.setColors = function (colorSet) {
        this._refreshCharAtlas(colorSet);
    };
    BaseRenderLayer.prototype._setTransparency = function (alpha) {
        if (alpha === this._alpha) {
            return;
        }
        var oldCanvas = this._canvas;
        this._alpha = alpha;
        this._canvas = this._canvas.cloneNode();
        this._initCanvas();
        this._container.replaceChild(this._canvas, oldCanvas);
        this._refreshCharAtlas(this._colors);
        this.onGridChanged(0, this._bufferService.rows - 1);
    };
    BaseRenderLayer.prototype._refreshCharAtlas = function (colorSet) {
        if (this._scaledCharWidth <= 0 && this._scaledCharHeight <= 0) {
            return;
        }
        this._charAtlas = CharAtlasCache_1.acquireCharAtlas(this._optionsService.options, this._rendererId, colorSet, this._scaledCharWidth, this._scaledCharHeight);
        this._charAtlas.warmUp();
    };
    BaseRenderLayer.prototype.resize = function (dim) {
        this._scaledCellWidth = dim.scaledCellWidth;
        this._scaledCellHeight = dim.scaledCellHeight;
        this._scaledCharWidth = dim.scaledCharWidth;
        this._scaledCharHeight = dim.scaledCharHeight;
        this._scaledCharLeft = dim.scaledCharLeft;
        this._scaledCharTop = dim.scaledCharTop;
        this._canvas.width = dim.scaledCanvasWidth;
        this._canvas.height = dim.scaledCanvasHeight;
        this._canvas.style.width = dim.canvasWidth + "px";
        this._canvas.style.height = dim.canvasHeight + "px";
        if (!this._alpha) {
            this._clearAll();
        }
        this._refreshCharAtlas(this._colors);
    };
    BaseRenderLayer.prototype._fillCells = function (x, y, width, height) {
        this._ctx.fillRect(x * this._scaledCellWidth, y * this._scaledCellHeight, width * this._scaledCellWidth, height * this._scaledCellHeight);
    };
    BaseRenderLayer.prototype._fillBottomLineAtCells = function (x, y, width) {
        if (width === void 0) { width = 1; }
        this._ctx.fillRect(x * this._scaledCellWidth, (y + 1) * this._scaledCellHeight - window.devicePixelRatio - 1, width * this._scaledCellWidth, window.devicePixelRatio);
    };
    BaseRenderLayer.prototype._fillLeftLineAtCell = function (x, y) {
        this._ctx.fillRect(x * this._scaledCellWidth, y * this._scaledCellHeight, window.devicePixelRatio, this._scaledCellHeight);
    };
    BaseRenderLayer.prototype._strokeRectAtCell = function (x, y, width, height) {
        this._ctx.lineWidth = window.devicePixelRatio;
        this._ctx.strokeRect(x * this._scaledCellWidth + window.devicePixelRatio / 2, y * this._scaledCellHeight + (window.devicePixelRatio / 2), width * this._scaledCellWidth - window.devicePixelRatio, (height * this._scaledCellHeight) - window.devicePixelRatio);
    };
    BaseRenderLayer.prototype._clearAll = function () {
        if (this._alpha) {
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
        else {
            this._ctx.fillStyle = this._colors.background.css;
            this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        }
    };
    BaseRenderLayer.prototype._clearCells = function (x, y, width, height) {
        if (this._alpha) {
            this._ctx.clearRect(x * this._scaledCellWidth, y * this._scaledCellHeight, width * this._scaledCellWidth, height * this._scaledCellHeight);
        }
        else {
            this._ctx.fillStyle = this._colors.background.css;
            this._ctx.fillRect(x * this._scaledCellWidth, y * this._scaledCellHeight, width * this._scaledCellWidth, height * this._scaledCellHeight);
        }
    };
    BaseRenderLayer.prototype._fillCharTrueColor = function (cell, x, y) {
        this._ctx.font = this._getFont(false, false);
        this._ctx.textBaseline = 'middle';
        this._clipRow(y);
        this._ctx.fillText(cell.getChars(), x * this._scaledCellWidth + this._scaledCharLeft, y * this._scaledCellHeight + this._scaledCharTop + this._scaledCharHeight / 2);
    };
    BaseRenderLayer.prototype._drawChars = function (cell, x, y) {
        if (cell.isFgRGB() || cell.isBgRGB()) {
            this._drawUncachedChars(cell, x, y);
            return;
        }
        var fg;
        var bg;
        if (cell.isInverse()) {
            fg = (cell.isBgDefault()) ? Constants_2.INVERTED_DEFAULT_COLOR : cell.getBgColor();
            bg = (cell.isFgDefault()) ? Constants_2.INVERTED_DEFAULT_COLOR : cell.getFgColor();
        }
        else {
            bg = (cell.isBgDefault()) ? Constants_1.DEFAULT_COLOR : cell.getBgColor();
            fg = (cell.isFgDefault()) ? Constants_1.DEFAULT_COLOR : cell.getFgColor();
        }
        var drawInBrightColor = this._optionsService.options.drawBoldTextInBrightColors && cell.isBold() && fg < 8 && fg !== Constants_2.INVERTED_DEFAULT_COLOR;
        fg += drawInBrightColor ? 8 : 0;
        this._currentGlyphIdentifier.chars = cell.getChars() || Constants_1.WHITESPACE_CELL_CHAR;
        this._currentGlyphIdentifier.code = cell.getCode() || Constants_1.WHITESPACE_CELL_CODE;
        this._currentGlyphIdentifier.bg = bg;
        this._currentGlyphIdentifier.fg = fg;
        this._currentGlyphIdentifier.bold = !!cell.isBold();
        this._currentGlyphIdentifier.dim = !!cell.isDim();
        this._currentGlyphIdentifier.italic = !!cell.isItalic();
        var atlasDidDraw = this._charAtlas && this._charAtlas.draw(this._ctx, this._currentGlyphIdentifier, x * this._scaledCellWidth + this._scaledCharLeft, y * this._scaledCellHeight + this._scaledCharTop);
        if (!atlasDidDraw) {
            this._drawUncachedChars(cell, x, y);
        }
    };
    BaseRenderLayer.prototype._drawUncachedChars = function (cell, x, y) {
        this._ctx.save();
        this._ctx.font = this._getFont(!!cell.isBold(), !!cell.isItalic());
        this._ctx.textBaseline = 'middle';
        if (cell.isInverse()) {
            if (cell.isBgDefault()) {
                this._ctx.fillStyle = this._colors.background.css;
            }
            else if (cell.isBgRGB()) {
                this._ctx.fillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getBgColor()).join(',') + ")";
            }
            else {
                this._ctx.fillStyle = this._colors.ansi[cell.getBgColor()].css;
            }
        }
        else {
            if (cell.isFgDefault()) {
                this._ctx.fillStyle = this._colors.foreground.css;
            }
            else if (cell.isFgRGB()) {
                this._ctx.fillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getFgColor()).join(',') + ")";
            }
            else {
                var fg = cell.getFgColor();
                if (this._optionsService.options.drawBoldTextInBrightColors && cell.isBold() && fg < 8) {
                    fg += 8;
                }
                this._ctx.fillStyle = this._colors.ansi[fg].css;
            }
        }
        this._clipRow(y);
        if (cell.isDim()) {
            this._ctx.globalAlpha = Constants_2.DIM_OPACITY;
        }
        this._ctx.fillText(cell.getChars(), x * this._scaledCellWidth + this._scaledCharLeft, y * this._scaledCellHeight + this._scaledCharTop + this._scaledCharHeight / 2);
        this._ctx.restore();
    };
    BaseRenderLayer.prototype._clipRow = function (y) {
        this._ctx.beginPath();
        this._ctx.rect(0, y * this._scaledCellHeight, this._bufferService.cols * this._scaledCellWidth, this._scaledCellHeight);
        this._ctx.clip();
    };
    BaseRenderLayer.prototype._getFont = function (isBold, isItalic) {
        var fontWeight = isBold ? this._optionsService.options.fontWeightBold : this._optionsService.options.fontWeight;
        var fontStyle = isItalic ? 'italic' : '';
        return fontStyle + " " + fontWeight + " " + this._optionsService.options.fontSize * window.devicePixelRatio + "px " + this._optionsService.options.fontFamily;
    };
    return BaseRenderLayer;
}());
exports.BaseRenderLayer = BaseRenderLayer;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var DI_TARGET = 'di$target';
var DI_DEPENDENCIES = 'di$dependencies';
exports.serviceRegistry = new Map();
function getServiceDependencies(ctor) {
    return ctor[DI_DEPENDENCIES] || [];
}
exports.getServiceDependencies = getServiceDependencies;
function createDecorator(id) {
    if (exports.serviceRegistry.has(id)) {
        return exports.serviceRegistry.get(id);
    }
    var decorator = function (target, key, index) {
        if (arguments.length !== 3) {
            throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
        }
        storeServiceDependency(decorator, target, index);
    };
    decorator.toString = function () { return id; };
    exports.serviceRegistry.set(id, decorator);
    return decorator;
}
exports.createDecorator = createDecorator;
function storeServiceDependency(id, target, index) {
    if (target[DI_TARGET] === target) {
        target[DI_DEPENDENCIES].push({ id: id, index: index });
    }
    else {
        target[DI_DEPENDENCIES] = [{ id: id, index: index }];
        target[DI_TARGET] = target;
    }
}


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function fill(array, value, start, end) {
    if (array.fill) {
        return array.fill(value, start, end);
    }
    return fillFallback(array, value, start, end);
}
exports.fill = fill;
function fillFallback(array, value, start, end) {
    if (start === void 0) { start = 0; }
    if (end === void 0) { end = array.length; }
    if (start >= array.length) {
        return array;
    }
    start = (array.length + start) % array.length;
    if (end >= array.length) {
        end = array.length;
    }
    else {
        end = (array.length + end) % array.length;
    }
    for (var i = start; i < end; ++i) {
        array[i] = value;
    }
    return array;
}
exports.fillFallback = fillFallback;
function concat(a, b) {
    var result = new a.constructor(a.length + b.length);
    result.set(a);
    result.set(b, a.length);
    return result;
}
exports.concat = concat;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var TextDecoder_1 = __webpack_require__(8);
var Constants_1 = __webpack_require__(3);
var CellData_1 = __webpack_require__(4);
var AttributeData_1 = __webpack_require__(6);
var CELL_SIZE = 3;
exports.DEFAULT_ATTR_DATA = Object.freeze(new AttributeData_1.AttributeData());
var BufferLine = (function () {
    function BufferLine(cols, fillCellData, isWrapped) {
        if (isWrapped === void 0) { isWrapped = false; }
        this.isWrapped = isWrapped;
        this._combined = {};
        this._data = new Uint32Array(cols * CELL_SIZE);
        var cell = fillCellData || CellData_1.CellData.fromCharData([0, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]);
        for (var i = 0; i < cols; ++i) {
            this.setCell(i, cell);
        }
        this.length = cols;
    }
    BufferLine.prototype.get = function (index) {
        var content = this._data[index * CELL_SIZE + 0];
        var cp = content & 2097151;
        return [
            this._data[index * CELL_SIZE + 1],
            (content & 2097152)
                ? this._combined[index]
                : (cp) ? TextDecoder_1.stringFromCodePoint(cp) : '',
            content >> 22,
            (content & 2097152)
                ? this._combined[index].charCodeAt(this._combined[index].length - 1)
                : cp
        ];
    };
    BufferLine.prototype.set = function (index, value) {
        this._data[index * CELL_SIZE + 1] = value[Constants_1.CHAR_DATA_ATTR_INDEX];
        if (value[Constants_1.CHAR_DATA_CHAR_INDEX].length > 1) {
            this._combined[index] = value[1];
            this._data[index * CELL_SIZE + 0] = index | 2097152 | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
        }
        else {
            this._data[index * CELL_SIZE + 0] = value[Constants_1.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
        }
    };
    BufferLine.prototype.getWidth = function (index) {
        return this._data[index * CELL_SIZE + 0] >> 22;
    };
    BufferLine.prototype.hasWidth = function (index) {
        return this._data[index * CELL_SIZE + 0] & 12582912;
    };
    BufferLine.prototype.getFg = function (index) {
        return this._data[index * CELL_SIZE + 1];
    };
    BufferLine.prototype.getBg = function (index) {
        return this._data[index * CELL_SIZE + 2];
    };
    BufferLine.prototype.hasContent = function (index) {
        return this._data[index * CELL_SIZE + 0] & 4194303;
    };
    BufferLine.prototype.getCodePoint = function (index) {
        var content = this._data[index * CELL_SIZE + 0];
        if (content & 2097152) {
            return this._combined[index].charCodeAt(this._combined[index].length - 1);
        }
        return content & 2097151;
    };
    BufferLine.prototype.isCombined = function (index) {
        return this._data[index * CELL_SIZE + 0] & 2097152;
    };
    BufferLine.prototype.getString = function (index) {
        var content = this._data[index * CELL_SIZE + 0];
        if (content & 2097152) {
            return this._combined[index];
        }
        if (content & 2097151) {
            return TextDecoder_1.stringFromCodePoint(content & 2097151);
        }
        return '';
    };
    BufferLine.prototype.loadCell = function (index, cell) {
        var startIndex = index * CELL_SIZE;
        cell.content = this._data[startIndex + 0];
        cell.fg = this._data[startIndex + 1];
        cell.bg = this._data[startIndex + 2];
        if (cell.content & 2097152) {
            cell.combinedData = this._combined[index];
        }
        return cell;
    };
    BufferLine.prototype.setCell = function (index, cell) {
        if (cell.content & 2097152) {
            this._combined[index] = cell.combinedData;
        }
        this._data[index * CELL_SIZE + 0] = cell.content;
        this._data[index * CELL_SIZE + 1] = cell.fg;
        this._data[index * CELL_SIZE + 2] = cell.bg;
    };
    BufferLine.prototype.setCellFromCodePoint = function (index, codePoint, width, fg, bg) {
        this._data[index * CELL_SIZE + 0] = codePoint | (width << 22);
        this._data[index * CELL_SIZE + 1] = fg;
        this._data[index * CELL_SIZE + 2] = bg;
    };
    BufferLine.prototype.addCodepointToCell = function (index, codePoint) {
        var content = this._data[index * CELL_SIZE + 0];
        if (content & 2097152) {
            this._combined[index] += TextDecoder_1.stringFromCodePoint(codePoint);
        }
        else {
            if (content & 2097151) {
                this._combined[index] = TextDecoder_1.stringFromCodePoint(content & 2097151) + TextDecoder_1.stringFromCodePoint(codePoint);
                content &= ~2097151;
                content |= 2097152;
            }
            else {
                content = codePoint | (1 << 22);
            }
            this._data[index * CELL_SIZE + 0] = content;
        }
    };
    BufferLine.prototype.insertCells = function (pos, n, fillCellData) {
        pos %= this.length;
        if (n < this.length - pos) {
            var cell = new CellData_1.CellData();
            for (var i = this.length - pos - n - 1; i >= 0; --i) {
                this.setCell(pos + n + i, this.loadCell(pos + i, cell));
            }
            for (var i = 0; i < n; ++i) {
                this.setCell(pos + i, fillCellData);
            }
        }
        else {
            for (var i = pos; i < this.length; ++i) {
                this.setCell(i, fillCellData);
            }
        }
    };
    BufferLine.prototype.deleteCells = function (pos, n, fillCellData) {
        pos %= this.length;
        if (n < this.length - pos) {
            var cell = new CellData_1.CellData();
            for (var i = 0; i < this.length - pos - n; ++i) {
                this.setCell(pos + i, this.loadCell(pos + n + i, cell));
            }
            for (var i = this.length - n; i < this.length; ++i) {
                this.setCell(i, fillCellData);
            }
        }
        else {
            for (var i = pos; i < this.length; ++i) {
                this.setCell(i, fillCellData);
            }
        }
    };
    BufferLine.prototype.replaceCells = function (start, end, fillCellData) {
        while (start < end && start < this.length) {
            this.setCell(start++, fillCellData);
        }
    };
    BufferLine.prototype.resize = function (cols, fillCellData) {
        if (cols === this.length) {
            return;
        }
        if (cols > this.length) {
            var data = new Uint32Array(cols * CELL_SIZE);
            if (this.length) {
                if (cols * CELL_SIZE < this._data.length) {
                    data.set(this._data.subarray(0, cols * CELL_SIZE));
                }
                else {
                    data.set(this._data);
                }
            }
            this._data = data;
            for (var i = this.length; i < cols; ++i) {
                this.setCell(i, fillCellData);
            }
        }
        else {
            if (cols) {
                var data = new Uint32Array(cols * CELL_SIZE);
                data.set(this._data.subarray(0, cols * CELL_SIZE));
                this._data = data;
                var keys = Object.keys(this._combined);
                for (var i = 0; i < keys.length; i++) {
                    var key = parseInt(keys[i], 10);
                    if (key >= cols) {
                        delete this._combined[key];
                    }
                }
            }
            else {
                this._data = new Uint32Array(0);
                this._combined = {};
            }
        }
        this.length = cols;
    };
    BufferLine.prototype.fill = function (fillCellData) {
        this._combined = {};
        for (var i = 0; i < this.length; ++i) {
            this.setCell(i, fillCellData);
        }
    };
    BufferLine.prototype.copyFrom = function (line) {
        if (this.length !== line.length) {
            this._data = new Uint32Array(line._data);
        }
        else {
            this._data.set(line._data);
        }
        this.length = line.length;
        this._combined = {};
        for (var el in line._combined) {
            this._combined[el] = line._combined[el];
        }
        this.isWrapped = line.isWrapped;
    };
    BufferLine.prototype.clone = function () {
        var newLine = new BufferLine(0);
        newLine._data = new Uint32Array(this._data);
        newLine.length = this.length;
        for (var el in this._combined) {
            newLine._combined[el] = this._combined[el];
        }
        newLine.isWrapped = this.isWrapped;
        return newLine;
    };
    BufferLine.prototype.getTrimmedLength = function () {
        for (var i = this.length - 1; i >= 0; --i) {
            if ((this._data[i * CELL_SIZE + 0] & 4194303)) {
                return i + (this._data[i * CELL_SIZE + 0] >> 22);
            }
        }
        return 0;
    };
    BufferLine.prototype.copyCellsFrom = function (src, srcCol, destCol, length, applyInReverse) {
        var srcData = src._data;
        if (applyInReverse) {
            for (var cell = length - 1; cell >= 0; cell--) {
                for (var i = 0; i < CELL_SIZE; i++) {
                    this._data[(destCol + cell) * CELL_SIZE + i] = srcData[(srcCol + cell) * CELL_SIZE + i];
                }
            }
        }
        else {
            for (var cell = 0; cell < length; cell++) {
                for (var i = 0; i < CELL_SIZE; i++) {
                    this._data[(destCol + cell) * CELL_SIZE + i] = srcData[(srcCol + cell) * CELL_SIZE + i];
                }
            }
        }
        var srcCombinedKeys = Object.keys(src._combined);
        for (var i = 0; i < srcCombinedKeys.length; i++) {
            var key = parseInt(srcCombinedKeys[i], 10);
            if (key >= srcCol) {
                this._combined[key - srcCol + destCol] = src._combined[key];
            }
        }
    };
    BufferLine.prototype.translateToString = function (trimRight, startCol, endCol) {
        if (trimRight === void 0) { trimRight = false; }
        if (startCol === void 0) { startCol = 0; }
        if (endCol === void 0) { endCol = this.length; }
        if (trimRight) {
            endCol = Math.min(endCol, this.getTrimmedLength());
        }
        var result = '';
        while (startCol < endCol) {
            var content = this._data[startCol * CELL_SIZE + 0];
            var cp = content & 2097151;
            result += (content & 2097152) ? this._combined[startCol] : (cp) ? TextDecoder_1.stringFromCodePoint(cp) : Constants_1.WHITESPACE_CELL_CHAR;
            startCol += (content >> 22) || 1;
        }
        return result;
    };
    return BufferLine;
}());
exports.BufferLine = BufferLine;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.promptLabel = 'Terminal input';
exports.tooMuchOutput = 'Too much output to announce, navigate to rows manually to read';


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CHARSETS = {};
exports.DEFAULT_CHARSET = exports.CHARSETS['B'];
exports.CHARSETS['0'] = {
    '`': '\u25c6',
    'a': '\u2592',
    'b': '\u0009',
    'c': '\u000c',
    'd': '\u000d',
    'e': '\u000a',
    'f': '\u00b0',
    'g': '\u00b1',
    'h': '\u2424',
    'i': '\u000b',
    'j': '\u2518',
    'k': '\u2510',
    'l': '\u250c',
    'm': '\u2514',
    'n': '\u253c',
    'o': '\u23ba',
    'p': '\u23bb',
    'q': '\u2500',
    'r': '\u23bc',
    's': '\u23bd',
    't': '\u251c',
    'u': '\u2524',
    'v': '\u2534',
    'w': '\u252c',
    'x': '\u2502',
    'y': '\u2264',
    'z': '\u2265',
    '{': '\u03c0',
    '|': '\u2260',
    '}': '\u00a3',
    '~': '\u00b7'
};
exports.CHARSETS['A'] = {
    '#': '£'
};
exports.CHARSETS['B'] = null;
exports.CHARSETS['4'] = {
    '#': '£',
    '@': '¾',
    '[': 'ij',
    '\\': '½',
    ']': '|',
    '{': '¨',
    '|': 'f',
    '}': '¼',
    '~': '´'
};
exports.CHARSETS['C'] =
    exports.CHARSETS['5'] = {
        '[': 'Ä',
        '\\': 'Ö',
        ']': 'Å',
        '^': 'Ü',
        '`': 'é',
        '{': 'ä',
        '|': 'ö',
        '}': 'å',
        '~': 'ü'
    };
exports.CHARSETS['R'] = {
    '#': '£',
    '@': 'à',
    '[': '°',
    '\\': 'ç',
    ']': '§',
    '{': 'é',
    '|': 'ù',
    '}': 'è',
    '~': '¨'
};
exports.CHARSETS['Q'] = {
    '@': 'à',
    '[': 'â',
    '\\': 'ç',
    ']': 'ê',
    '^': 'î',
    '`': 'ô',
    '{': 'é',
    '|': 'ù',
    '}': 'è',
    '~': 'û'
};
exports.CHARSETS['K'] = {
    '@': '§',
    '[': 'Ä',
    '\\': 'Ö',
    ']': 'Ü',
    '{': 'ä',
    '|': 'ö',
    '}': 'ü',
    '~': 'ß'
};
exports.CHARSETS['Y'] = {
    '#': '£',
    '@': '§',
    '[': '°',
    '\\': 'ç',
    ']': 'é',
    '`': 'ù',
    '{': 'à',
    '|': 'ò',
    '}': 'è',
    '~': 'ì'
};
exports.CHARSETS['E'] =
    exports.CHARSETS['6'] = {
        '@': 'Ä',
        '[': 'Æ',
        '\\': 'Ø',
        ']': 'Å',
        '^': 'Ü',
        '`': 'ä',
        '{': 'æ',
        '|': 'ø',
        '}': 'å',
        '~': 'ü'
    };
exports.CHARSETS['Z'] = {
    '#': '£',
    '@': '§',
    '[': '¡',
    '\\': 'Ñ',
    ']': '¿',
    '{': '°',
    '|': 'ñ',
    '}': 'ç'
};
exports.CHARSETS['H'] =
    exports.CHARSETS['7'] = {
        '@': 'É',
        '[': 'Ä',
        '\\': 'Ö',
        ']': 'Å',
        '^': 'Ü',
        '`': 'é',
        '{': 'ä',
        '|': 'ö',
        '}': 'å',
        '~': 'ü'
    };
exports.CHARSETS['='] = {
    '#': 'ù',
    '@': 'à',
    '[': 'é',
    '\\': 'ç',
    ']': 'ê',
    '^': 'î',
    '_': 'è',
    '`': 'ô',
    '{': 'ä',
    '|': 'ö',
    '}': 'ü',
    '~': 'û'
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var TypedArrayUtils_1 = __webpack_require__(14);
exports.wcwidth = (function (opts) {
    var COMBINING_BMP = [
        [0x0300, 0x036F], [0x0483, 0x0486], [0x0488, 0x0489],
        [0x0591, 0x05BD], [0x05BF, 0x05BF], [0x05C1, 0x05C2],
        [0x05C4, 0x05C5], [0x05C7, 0x05C7], [0x0600, 0x0603],
        [0x0610, 0x0615], [0x064B, 0x065E], [0x0670, 0x0670],
        [0x06D6, 0x06E4], [0x06E7, 0x06E8], [0x06EA, 0x06ED],
        [0x070F, 0x070F], [0x0711, 0x0711], [0x0730, 0x074A],
        [0x07A6, 0x07B0], [0x07EB, 0x07F3], [0x0901, 0x0902],
        [0x093C, 0x093C], [0x0941, 0x0948], [0x094D, 0x094D],
        [0x0951, 0x0954], [0x0962, 0x0963], [0x0981, 0x0981],
        [0x09BC, 0x09BC], [0x09C1, 0x09C4], [0x09CD, 0x09CD],
        [0x09E2, 0x09E3], [0x0A01, 0x0A02], [0x0A3C, 0x0A3C],
        [0x0A41, 0x0A42], [0x0A47, 0x0A48], [0x0A4B, 0x0A4D],
        [0x0A70, 0x0A71], [0x0A81, 0x0A82], [0x0ABC, 0x0ABC],
        [0x0AC1, 0x0AC5], [0x0AC7, 0x0AC8], [0x0ACD, 0x0ACD],
        [0x0AE2, 0x0AE3], [0x0B01, 0x0B01], [0x0B3C, 0x0B3C],
        [0x0B3F, 0x0B3F], [0x0B41, 0x0B43], [0x0B4D, 0x0B4D],
        [0x0B56, 0x0B56], [0x0B82, 0x0B82], [0x0BC0, 0x0BC0],
        [0x0BCD, 0x0BCD], [0x0C3E, 0x0C40], [0x0C46, 0x0C48],
        [0x0C4A, 0x0C4D], [0x0C55, 0x0C56], [0x0CBC, 0x0CBC],
        [0x0CBF, 0x0CBF], [0x0CC6, 0x0CC6], [0x0CCC, 0x0CCD],
        [0x0CE2, 0x0CE3], [0x0D41, 0x0D43], [0x0D4D, 0x0D4D],
        [0x0DCA, 0x0DCA], [0x0DD2, 0x0DD4], [0x0DD6, 0x0DD6],
        [0x0E31, 0x0E31], [0x0E34, 0x0E3A], [0x0E47, 0x0E4E],
        [0x0EB1, 0x0EB1], [0x0EB4, 0x0EB9], [0x0EBB, 0x0EBC],
        [0x0EC8, 0x0ECD], [0x0F18, 0x0F19], [0x0F35, 0x0F35],
        [0x0F37, 0x0F37], [0x0F39, 0x0F39], [0x0F71, 0x0F7E],
        [0x0F80, 0x0F84], [0x0F86, 0x0F87], [0x0F90, 0x0F97],
        [0x0F99, 0x0FBC], [0x0FC6, 0x0FC6], [0x102D, 0x1030],
        [0x1032, 0x1032], [0x1036, 0x1037], [0x1039, 0x1039],
        [0x1058, 0x1059], [0x1160, 0x11FF], [0x135F, 0x135F],
        [0x1712, 0x1714], [0x1732, 0x1734], [0x1752, 0x1753],
        [0x1772, 0x1773], [0x17B4, 0x17B5], [0x17B7, 0x17BD],
        [0x17C6, 0x17C6], [0x17C9, 0x17D3], [0x17DD, 0x17DD],
        [0x180B, 0x180D], [0x18A9, 0x18A9], [0x1920, 0x1922],
        [0x1927, 0x1928], [0x1932, 0x1932], [0x1939, 0x193B],
        [0x1A17, 0x1A18], [0x1B00, 0x1B03], [0x1B34, 0x1B34],
        [0x1B36, 0x1B3A], [0x1B3C, 0x1B3C], [0x1B42, 0x1B42],
        [0x1B6B, 0x1B73], [0x1DC0, 0x1DCA], [0x1DFE, 0x1DFF],
        [0x200B, 0x200F], [0x202A, 0x202E], [0x2060, 0x2063],
        [0x206A, 0x206F], [0x20D0, 0x20EF], [0x302A, 0x302F],
        [0x3099, 0x309A], [0xA806, 0xA806], [0xA80B, 0xA80B],
        [0xA825, 0xA826], [0xFB1E, 0xFB1E], [0xFE00, 0xFE0F],
        [0xFE20, 0xFE23], [0xFEFF, 0xFEFF], [0xFFF9, 0xFFFB]
    ];
    var COMBINING_HIGH = [
        [0x10A01, 0x10A03], [0x10A05, 0x10A06], [0x10A0C, 0x10A0F],
        [0x10A38, 0x10A3A], [0x10A3F, 0x10A3F], [0x1D167, 0x1D169],
        [0x1D173, 0x1D182], [0x1D185, 0x1D18B], [0x1D1AA, 0x1D1AD],
        [0x1D242, 0x1D244], [0xE0001, 0xE0001], [0xE0020, 0xE007F],
        [0xE0100, 0xE01EF]
    ];
    function bisearch(ucs, data) {
        var min = 0;
        var max = data.length - 1;
        var mid;
        if (ucs < data[0][0] || ucs > data[max][1]) {
            return false;
        }
        while (max >= min) {
            mid = (min + max) >> 1;
            if (ucs > data[mid][1]) {
                min = mid + 1;
            }
            else if (ucs < data[mid][0]) {
                max = mid - 1;
            }
            else {
                return true;
            }
        }
        return false;
    }
    function wcwidthHigh(ucs) {
        if (bisearch(ucs, COMBINING_HIGH)) {
            return 0;
        }
        if ((ucs >= 0x20000 && ucs <= 0x2fffd) || (ucs >= 0x30000 && ucs <= 0x3fffd)) {
            return 2;
        }
        return 1;
    }
    var control = opts.control | 0;
    var table = new Uint8Array(65536);
    TypedArrayUtils_1.fill(table, 1);
    table[0] = opts.nul;
    TypedArrayUtils_1.fill(table, opts.control, 1, 32);
    TypedArrayUtils_1.fill(table, opts.control, 0x7f, 0xa0);
    TypedArrayUtils_1.fill(table, 2, 0x1100, 0x1160);
    table[0x2329] = 2;
    table[0x232a] = 2;
    TypedArrayUtils_1.fill(table, 2, 0x2e80, 0xa4d0);
    table[0x303f] = 1;
    TypedArrayUtils_1.fill(table, 2, 0xac00, 0xd7a4);
    TypedArrayUtils_1.fill(table, 2, 0xf900, 0xfb00);
    TypedArrayUtils_1.fill(table, 2, 0xfe10, 0xfe1a);
    TypedArrayUtils_1.fill(table, 2, 0xfe30, 0xfe70);
    TypedArrayUtils_1.fill(table, 2, 0xff00, 0xff61);
    TypedArrayUtils_1.fill(table, 2, 0xffe0, 0xffe7);
    for (var r = 0; r < COMBINING_BMP.length; ++r) {
        TypedArrayUtils_1.fill(table, 0, COMBINING_BMP[r][0], COMBINING_BMP[r][1] + 1);
    }
    return function (num) {
        if (num < 32) {
            return control | 0;
        }
        if (num < 127) {
            return 1;
        }
        if (num < 65536) {
            return table[num];
        }
        return wcwidthHigh(num);
    };
})({ nul: 0, control: 0 });
function getStringCellWidth(s) {
    var result = 0;
    var length = s.length;
    for (var i = 0; i < length; ++i) {
        var code = s.charCodeAt(i);
        if (0xD800 <= code && code <= 0xDBFF) {
            if (++i >= length) {
                return result + exports.wcwidth(code);
            }
            var second = s.charCodeAt(i);
            if (0xDC00 <= second && second <= 0xDFFF) {
                code = (code - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
            }
            else {
                result += exports.wcwidth(second);
            }
        }
        result += exports.wcwidth(code);
    }
    return result;
}
exports.getStringCellWidth = getStringCellWidth;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var MAX_VALUE = 0x7FFFFFFF;
var MAX_SUBPARAMS = 256;
var Params = (function () {
    function Params(maxLength, maxSubParamsLength) {
        if (maxLength === void 0) { maxLength = 32; }
        if (maxSubParamsLength === void 0) { maxSubParamsLength = 32; }
        this.maxLength = maxLength;
        this.maxSubParamsLength = maxSubParamsLength;
        if (maxSubParamsLength > MAX_SUBPARAMS) {
            throw new Error('maxSubParamsLength must not be greater than 256');
        }
        this.params = new Int32Array(maxLength);
        this.length = 0;
        this._subParams = new Int32Array(maxSubParamsLength);
        this._subParamsLength = 0;
        this._subParamsIdx = new Uint16Array(maxLength);
        this._rejectDigits = false;
        this._rejectSubDigits = false;
        this._digitIsSub = false;
    }
    Params.fromArray = function (values) {
        var params = new Params();
        if (!values.length) {
            return params;
        }
        for (var i = (values[0] instanceof Array) ? 1 : 0; i < values.length; ++i) {
            var value = values[i];
            if (value instanceof Array) {
                for (var k = 0; k < value.length; ++k) {
                    params.addSubParam(value[k]);
                }
            }
            else {
                params.addParam(value);
            }
        }
        return params;
    };
    Params.prototype.clone = function () {
        var newParams = new Params(this.maxLength, this.maxSubParamsLength);
        newParams.params.set(this.params);
        newParams.length = this.length;
        newParams._subParams.set(this._subParams);
        newParams._subParamsLength = this._subParamsLength;
        newParams._subParamsIdx.set(this._subParamsIdx);
        newParams._rejectDigits = this._rejectDigits;
        newParams._rejectSubDigits = this._rejectSubDigits;
        newParams._digitIsSub = this._digitIsSub;
        return newParams;
    };
    Params.prototype.toArray = function () {
        var res = [];
        for (var i = 0; i < this.length; ++i) {
            res.push(this.params[i]);
            var start = this._subParamsIdx[i] >> 8;
            var end = this._subParamsIdx[i] & 0xFF;
            if (end - start > 0) {
                res.push(Array.prototype.slice.call(this._subParams, start, end));
            }
        }
        return res;
    };
    Params.prototype.reset = function () {
        this.length = 0;
        this._subParamsLength = 0;
        this._rejectDigits = false;
        this._rejectSubDigits = false;
        this._digitIsSub = false;
    };
    Params.prototype.addParam = function (value) {
        this._digitIsSub = false;
        if (this.length >= this.maxLength) {
            this._rejectDigits = true;
            return;
        }
        if (value < -1) {
            throw new Error('values lesser than -1 are not allowed');
        }
        this._subParamsIdx[this.length] = this._subParamsLength << 8 | this._subParamsLength;
        this.params[this.length++] = value > MAX_VALUE ? MAX_VALUE : value;
    };
    Params.prototype.addSubParam = function (value) {
        this._digitIsSub = true;
        if (!this.length) {
            return;
        }
        if (this._rejectDigits || this._subParamsLength >= this.maxSubParamsLength) {
            this._rejectSubDigits = true;
            return;
        }
        if (value < -1) {
            throw new Error('values lesser than -1 are not allowed');
        }
        this._subParams[this._subParamsLength++] = value > MAX_VALUE ? MAX_VALUE : value;
        this._subParamsIdx[this.length - 1]++;
    };
    Params.prototype.hasSubParams = function (idx) {
        return ((this._subParamsIdx[idx] & 0xFF) - (this._subParamsIdx[idx] >> 8) > 0);
    };
    Params.prototype.getSubParams = function (idx) {
        var start = this._subParamsIdx[idx] >> 8;
        var end = this._subParamsIdx[idx] & 0xFF;
        if (end - start > 0) {
            return this._subParams.subarray(start, end);
        }
        return null;
    };
    Params.prototype.getSubParamsAll = function () {
        var result = {};
        for (var i = 0; i < this.length; ++i) {
            var start = this._subParamsIdx[i] >> 8;
            var end = this._subParamsIdx[i] & 0xFF;
            if (end - start > 0) {
                result[i] = this._subParams.slice(start, end);
            }
        }
        return result;
    };
    Params.prototype.addDigit = function (value) {
        var length;
        if (this._rejectDigits
            || !(length = this._digitIsSub ? this._subParamsLength : this.length)
            || (this._digitIsSub && this._rejectSubDigits)) {
            return;
        }
        var store = this._digitIsSub ? this._subParams : this.params;
        var cur = store[length - 1];
        store[length - 1] = ~cur ? Math.min(cur * 10 + value, MAX_VALUE) : value;
    };
    return Params;
}());
exports.Params = Params;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Constants_1 = __webpack_require__(21);
var TextDecoder_1 = __webpack_require__(8);
var OscParser = (function () {
    function OscParser() {
        this._state = 0;
        this._id = -1;
        this._handlers = Object.create(null);
        this._handlerFb = function () { };
    }
    OscParser.prototype.addHandler = function (ident, handler) {
        if (this._handlers[ident] === undefined) {
            this._handlers[ident] = [];
        }
        var handlerList = this._handlers[ident];
        handlerList.push(handler);
        return {
            dispose: function () {
                var handlerIndex = handlerList.indexOf(handler);
                if (handlerIndex !== -1) {
                    handlerList.splice(handlerIndex, 1);
                }
            }
        };
    };
    OscParser.prototype.setHandler = function (ident, handler) {
        this._handlers[ident] = [handler];
    };
    OscParser.prototype.clearHandler = function (ident) {
        if (this._handlers[ident])
            delete this._handlers[ident];
    };
    OscParser.prototype.setHandlerFallback = function (handler) {
        this._handlerFb = handler;
    };
    OscParser.prototype.dispose = function () {
        this._handlers = Object.create(null);
        this._handlerFb = function () { };
    };
    OscParser.prototype.reset = function () {
        if (this._state === 2) {
            this.end(false);
        }
        this._id = -1;
        this._state = 0;
    };
    OscParser.prototype._start = function () {
        var handlers = this._handlers[this._id];
        if (!handlers) {
            this._handlerFb(this._id, 'START');
        }
        else {
            for (var j = handlers.length - 1; j >= 0; j--) {
                handlers[j].start();
            }
        }
    };
    OscParser.prototype._put = function (data, start, end) {
        var handlers = this._handlers[this._id];
        if (!handlers) {
            this._handlerFb(this._id, 'PUT', TextDecoder_1.utf32ToString(data, start, end));
        }
        else {
            for (var j = handlers.length - 1; j >= 0; j--) {
                handlers[j].put(data, start, end);
            }
        }
    };
    OscParser.prototype._end = function (success) {
        var handlers = this._handlers[this._id];
        if (!handlers) {
            this._handlerFb(this._id, 'END', success);
        }
        else {
            var j = handlers.length - 1;
            for (; j >= 0; j--) {
                if (handlers[j].end(success) !== false) {
                    break;
                }
            }
            j--;
            for (; j >= 0; j--) {
                handlers[j].end(false);
            }
        }
    };
    OscParser.prototype.start = function () {
        this.reset();
        this._id = -1;
        this._state = 1;
    };
    OscParser.prototype.put = function (data, start, end) {
        if (this._state === 3) {
            return;
        }
        if (this._state === 1) {
            while (start < end) {
                var code = data[start++];
                if (code === 0x3b) {
                    this._state = 2;
                    this._start();
                    break;
                }
                if (code < 0x30 || 0x39 < code) {
                    this._state = 3;
                    return;
                }
                if (this._id === -1) {
                    this._id = 0;
                }
                this._id = this._id * 10 + code - 48;
            }
        }
        if (this._state === 2 && end - start > 0) {
            this._put(data, start, end);
        }
    };
    OscParser.prototype.end = function (success) {
        if (this._state === 0) {
            return;
        }
        if (this._state !== 3) {
            if (this._state === 1) {
                this._start();
            }
            this._end(success);
        }
        this._id = -1;
        this._state = 0;
    };
    return OscParser;
}());
exports.OscParser = OscParser;
var OscHandler = (function () {
    function OscHandler(_handler) {
        this._handler = _handler;
        this._data = '';
        this._hitLimit = false;
    }
    OscHandler.prototype.start = function () {
        this._data = '';
        this._hitLimit = false;
    };
    OscHandler.prototype.put = function (data, start, end) {
        if (this._hitLimit) {
            return;
        }
        this._data += TextDecoder_1.utf32ToString(data, start, end);
        if (this._data.length > Constants_1.PAYLOAD_LIMIT) {
            this._data = '';
            this._hitLimit = true;
        }
    };
    OscHandler.prototype.end = function (success) {
        var ret;
        if (this._hitLimit) {
            ret = false;
        }
        else if (success) {
            ret = this._handler(this._data);
        }
        this._data = '';
        this._hitLimit = false;
        return ret;
    };
    return OscHandler;
}());
exports.OscHandler = OscHandler;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYLOAD_LIMIT = 10000000;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var TextDecoder_1 = __webpack_require__(8);
var Params_1 = __webpack_require__(19);
var Constants_1 = __webpack_require__(21);
var EMPTY_HANDLERS = [];
var DcsParser = (function () {
    function DcsParser() {
        this._handlers = Object.create(null);
        this._active = EMPTY_HANDLERS;
        this._ident = 0;
        this._handlerFb = function () { };
    }
    DcsParser.prototype.dispose = function () {
        this._handlers = Object.create(null);
        this._handlerFb = function () { };
    };
    DcsParser.prototype.addHandler = function (ident, handler) {
        if (this._handlers[ident] === undefined) {
            this._handlers[ident] = [];
        }
        var handlerList = this._handlers[ident];
        handlerList.push(handler);
        return {
            dispose: function () {
                var handlerIndex = handlerList.indexOf(handler);
                if (handlerIndex !== -1) {
                    handlerList.splice(handlerIndex, 1);
                }
            }
        };
    };
    DcsParser.prototype.setHandler = function (ident, handler) {
        this._handlers[ident] = [handler];
    };
    DcsParser.prototype.clearHandler = function (ident) {
        if (this._handlers[ident])
            delete this._handlers[ident];
    };
    DcsParser.prototype.setHandlerFallback = function (handler) {
        this._handlerFb = handler;
    };
    DcsParser.prototype.reset = function () {
        if (this._active.length) {
            this.unhook(false);
        }
        this._active = EMPTY_HANDLERS;
        this._ident = 0;
    };
    DcsParser.prototype.hook = function (ident, params) {
        this.reset();
        this._ident = ident;
        this._active = this._handlers[ident] || EMPTY_HANDLERS;
        if (!this._active.length) {
            this._handlerFb(this._ident, 'HOOK', params);
        }
        else {
            for (var j = this._active.length - 1; j >= 0; j--) {
                this._active[j].hook(params);
            }
        }
    };
    DcsParser.prototype.put = function (data, start, end) {
        if (!this._active.length) {
            this._handlerFb(this._ident, 'PUT', TextDecoder_1.utf32ToString(data, start, end));
        }
        else {
            for (var j = this._active.length - 1; j >= 0; j--) {
                this._active[j].put(data, start, end);
            }
        }
    };
    DcsParser.prototype.unhook = function (success) {
        if (!this._active.length) {
            this._handlerFb(this._ident, 'UNHOOK', success);
        }
        else {
            var j = this._active.length - 1;
            for (; j >= 0; j--) {
                if (this._active[j].unhook(success) !== false) {
                    break;
                }
            }
            j--;
            for (; j >= 0; j--) {
                this._active[j].unhook(false);
            }
        }
        this._active = EMPTY_HANDLERS;
        this._ident = 0;
    };
    return DcsParser;
}());
exports.DcsParser = DcsParser;
var DcsHandler = (function () {
    function DcsHandler(_handler) {
        this._handler = _handler;
        this._data = '';
        this._hitLimit = false;
    }
    DcsHandler.prototype.hook = function (params) {
        this._params = params.clone();
        this._data = '';
        this._hitLimit = false;
    };
    DcsHandler.prototype.put = function (data, start, end) {
        if (this._hitLimit) {
            return;
        }
        this._data += TextDecoder_1.utf32ToString(data, start, end);
        if (this._data.length > Constants_1.PAYLOAD_LIMIT) {
            this._data = '';
            this._hitLimit = true;
        }
    };
    DcsHandler.prototype.unhook = function (success) {
        var ret;
        if (this._hitLimit) {
            ret = false;
        }
        else if (success) {
            ret = this._handler(this._data, this._params ? this._params : new Params_1.Params());
        }
        this._params = undefined;
        this._data = '';
        this._hitLimit = false;
        return ret;
    };
    return DcsHandler;
}());
exports.DcsHandler = DcsHandler;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CharAtlasUtils_1 = __webpack_require__(24);
var DynamicCharAtlas_1 = __webpack_require__(42);
var charAtlasCache = [];
function acquireCharAtlas(options, rendererId, colors, scaledCharWidth, scaledCharHeight) {
    var newConfig = CharAtlasUtils_1.generateConfig(scaledCharWidth, scaledCharHeight, options, colors);
    for (var i = 0; i < charAtlasCache.length; i++) {
        var entry = charAtlasCache[i];
        var ownedByIndex = entry.ownedBy.indexOf(rendererId);
        if (ownedByIndex >= 0) {
            if (CharAtlasUtils_1.configEquals(entry.config, newConfig)) {
                return entry.atlas;
            }
            if (entry.ownedBy.length === 1) {
                entry.atlas.dispose();
                charAtlasCache.splice(i, 1);
            }
            else {
                entry.ownedBy.splice(ownedByIndex, 1);
            }
            break;
        }
    }
    for (var i = 0; i < charAtlasCache.length; i++) {
        var entry = charAtlasCache[i];
        if (CharAtlasUtils_1.configEquals(entry.config, newConfig)) {
            entry.ownedBy.push(rendererId);
            return entry.atlas;
        }
    }
    var newEntry = {
        atlas: new DynamicCharAtlas_1.DynamicCharAtlas(document, newConfig),
        config: newConfig,
        ownedBy: [rendererId]
    };
    charAtlasCache.push(newEntry);
    return newEntry.atlas;
}
exports.acquireCharAtlas = acquireCharAtlas;
function removeTerminalFromCache(rendererId) {
    for (var i = 0; i < charAtlasCache.length; i++) {
        var index = charAtlasCache[i].ownedBy.indexOf(rendererId);
        if (index !== -1) {
            if (charAtlasCache[i].ownedBy.length === 1) {
                charAtlasCache[i].atlas.dispose();
                charAtlasCache.splice(i, 1);
            }
            else {
                charAtlasCache[i].ownedBy.splice(index, 1);
            }
            break;
        }
    }
}
exports.removeTerminalFromCache = removeTerminalFromCache;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Constants_1 = __webpack_require__(3);
function generateConfig(scaledCharWidth, scaledCharHeight, options, colors) {
    var clonedColors = {
        foreground: colors.foreground,
        background: colors.background,
        cursor: undefined,
        cursorAccent: undefined,
        selection: undefined,
        ansi: colors.ansi.slice(0, 16)
    };
    return {
        devicePixelRatio: window.devicePixelRatio,
        scaledCharWidth: scaledCharWidth,
        scaledCharHeight: scaledCharHeight,
        fontFamily: options.fontFamily,
        fontSize: options.fontSize,
        fontWeight: options.fontWeight,
        fontWeightBold: options.fontWeightBold,
        allowTransparency: options.allowTransparency,
        colors: clonedColors
    };
}
exports.generateConfig = generateConfig;
function configEquals(a, b) {
    for (var i = 0; i < a.colors.ansi.length; i++) {
        if (a.colors.ansi[i].rgba !== b.colors.ansi[i].rgba) {
            return false;
        }
    }
    return a.devicePixelRatio === b.devicePixelRatio &&
        a.fontFamily === b.fontFamily &&
        a.fontSize === b.fontSize &&
        a.fontWeight === b.fontWeight &&
        a.fontWeightBold === b.fontWeightBold &&
        a.allowTransparency === b.allowTransparency &&
        a.scaledCharWidth === b.scaledCharWidth &&
        a.scaledCharHeight === b.scaledCharHeight &&
        a.colors.foreground === b.colors.foreground &&
        a.colors.background === b.colors.background;
}
exports.configEquals = configEquals;
function is256Color(colorCode) {
    return colorCode < Constants_1.DEFAULT_COLOR;
}
exports.is256Color = is256Color;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var DEFAULT_FOREGROUND = fromHex('#ffffff');
var DEFAULT_BACKGROUND = fromHex('#000000');
var DEFAULT_CURSOR = fromHex('#ffffff');
var DEFAULT_CURSOR_ACCENT = fromHex('#000000');
var DEFAULT_SELECTION = {
    css: 'rgba(255, 255, 255, 0.3)',
    rgba: 0xFFFFFF77
};
exports.DEFAULT_ANSI_COLORS = (function () {
    var colors = [
        fromHex('#2e3436'),
        fromHex('#cc0000'),
        fromHex('#4e9a06'),
        fromHex('#c4a000'),
        fromHex('#3465a4'),
        fromHex('#75507b'),
        fromHex('#06989a'),
        fromHex('#d3d7cf'),
        fromHex('#555753'),
        fromHex('#ef2929'),
        fromHex('#8ae234'),
        fromHex('#fce94f'),
        fromHex('#729fcf'),
        fromHex('#ad7fa8'),
        fromHex('#34e2e2'),
        fromHex('#eeeeec')
    ];
    var v = [0x00, 0x5f, 0x87, 0xaf, 0xd7, 0xff];
    for (var i = 0; i < 216; i++) {
        var r = v[(i / 36) % 6 | 0];
        var g = v[(i / 6) % 6 | 0];
        var b = v[i % 6];
        colors.push({
            css: "#" + toPaddedHex(r) + toPaddedHex(g) + toPaddedHex(b),
            rgba: ((r << 24) | (g << 16) | (b << 8) | 0xFF) >>> 0
        });
    }
    for (var i = 0; i < 24; i++) {
        var c = 8 + i * 10;
        var ch = toPaddedHex(c);
        colors.push({
            css: "#" + ch + ch + ch,
            rgba: ((c << 24) | (c << 16) | (c << 8) | 0xFF) >>> 0
        });
    }
    return colors;
})();
function fromHex(css) {
    return {
        css: css,
        rgba: parseInt(css.slice(1), 16) << 8 | 0xFF
    };
}
function toPaddedHex(c) {
    var s = c.toString(16);
    return s.length < 2 ? '0' + s : s;
}
var ColorManager = (function () {
    function ColorManager(document, allowTransparency) {
        this.allowTransparency = allowTransparency;
        var canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        var ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get rendering context');
        }
        this._ctx = ctx;
        this._ctx.globalCompositeOperation = 'copy';
        this._litmusColor = this._ctx.createLinearGradient(0, 0, 1, 1);
        this.colors = {
            foreground: DEFAULT_FOREGROUND,
            background: DEFAULT_BACKGROUND,
            cursor: DEFAULT_CURSOR,
            cursorAccent: DEFAULT_CURSOR_ACCENT,
            selection: DEFAULT_SELECTION,
            ansi: exports.DEFAULT_ANSI_COLORS.slice()
        };
    }
    ColorManager.prototype.setTheme = function (theme) {
        if (theme === void 0) { theme = {}; }
        this.colors.foreground = this._parseColor(theme.foreground, DEFAULT_FOREGROUND);
        this.colors.background = this._parseColor(theme.background, DEFAULT_BACKGROUND);
        this.colors.cursor = this._parseColor(theme.cursor, DEFAULT_CURSOR, true);
        this.colors.cursorAccent = this._parseColor(theme.cursorAccent, DEFAULT_CURSOR_ACCENT, true);
        this.colors.selection = this._parseColor(theme.selection, DEFAULT_SELECTION, true);
        this.colors.ansi[0] = this._parseColor(theme.black, exports.DEFAULT_ANSI_COLORS[0]);
        this.colors.ansi[1] = this._parseColor(theme.red, exports.DEFAULT_ANSI_COLORS[1]);
        this.colors.ansi[2] = this._parseColor(theme.green, exports.DEFAULT_ANSI_COLORS[2]);
        this.colors.ansi[3] = this._parseColor(theme.yellow, exports.DEFAULT_ANSI_COLORS[3]);
        this.colors.ansi[4] = this._parseColor(theme.blue, exports.DEFAULT_ANSI_COLORS[4]);
        this.colors.ansi[5] = this._parseColor(theme.magenta, exports.DEFAULT_ANSI_COLORS[5]);
        this.colors.ansi[6] = this._parseColor(theme.cyan, exports.DEFAULT_ANSI_COLORS[6]);
        this.colors.ansi[7] = this._parseColor(theme.white, exports.DEFAULT_ANSI_COLORS[7]);
        this.colors.ansi[8] = this._parseColor(theme.brightBlack, exports.DEFAULT_ANSI_COLORS[8]);
        this.colors.ansi[9] = this._parseColor(theme.brightRed, exports.DEFAULT_ANSI_COLORS[9]);
        this.colors.ansi[10] = this._parseColor(theme.brightGreen, exports.DEFAULT_ANSI_COLORS[10]);
        this.colors.ansi[11] = this._parseColor(theme.brightYellow, exports.DEFAULT_ANSI_COLORS[11]);
        this.colors.ansi[12] = this._parseColor(theme.brightBlue, exports.DEFAULT_ANSI_COLORS[12]);
        this.colors.ansi[13] = this._parseColor(theme.brightMagenta, exports.DEFAULT_ANSI_COLORS[13]);
        this.colors.ansi[14] = this._parseColor(theme.brightCyan, exports.DEFAULT_ANSI_COLORS[14]);
        this.colors.ansi[15] = this._parseColor(theme.brightWhite, exports.DEFAULT_ANSI_COLORS[15]);
    };
    ColorManager.prototype._parseColor = function (css, fallback, allowTransparency) {
        if (allowTransparency === void 0) { allowTransparency = this.allowTransparency; }
        if (css === undefined) {
            return fallback;
        }
        this._ctx.fillStyle = this._litmusColor;
        this._ctx.fillStyle = css;
        if (typeof this._ctx.fillStyle !== 'string') {
            console.warn("Color: " + css + " is invalid using fallback " + fallback.css);
            return fallback;
        }
        this._ctx.fillRect(0, 0, 1, 1);
        var data = this._ctx.getImageData(0, 0, 1, 1).data;
        if (!allowTransparency && data[3] !== 0xFF) {
            console.warn("Color: " + css + " is using transparency, but allowTransparency is false. " +
                ("Using fallback " + fallback.css + "."));
            return fallback;
        }
        return {
            css: css,
            rgba: (data[0] << 24 | data[1] << 16 | data[2] << 8 | data[3]) >>> 0
        };
    };
    return ColorManager;
}());
exports.ColorManager = ColorManager;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function throwIfFalsy(value) {
    if (!value) {
        throw new Error('value must not be falsy');
    }
    return value;
}
exports.throwIfFalsy = throwIfFalsy;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var AttributeData_1 = __webpack_require__(6);
var Constants_1 = __webpack_require__(3);
var CellData_1 = __webpack_require__(4);
var JoinedCellData = (function (_super) {
    __extends(JoinedCellData, _super);
    function JoinedCellData(firstCell, chars, width) {
        var _this = _super.call(this) || this;
        _this.content = 0;
        _this.combinedData = '';
        _this.fg = firstCell.fg;
        _this.bg = firstCell.bg;
        _this.combinedData = chars;
        _this._width = width;
        return _this;
    }
    JoinedCellData.prototype.isCombined = function () {
        return 2097152;
    };
    JoinedCellData.prototype.getWidth = function () {
        return this._width;
    };
    JoinedCellData.prototype.getChars = function () {
        return this.combinedData;
    };
    JoinedCellData.prototype.getCode = function () {
        return 0x1FFFFF;
    };
    JoinedCellData.prototype.setFromCharData = function (value) {
        throw new Error('not implemented');
    };
    JoinedCellData.prototype.getAsCharData = function () {
        return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
    };
    return JoinedCellData;
}(AttributeData_1.AttributeData));
exports.JoinedCellData = JoinedCellData;
var CharacterJoinerRegistry = (function () {
    function CharacterJoinerRegistry(_bufferService) {
        this._bufferService = _bufferService;
        this._characterJoiners = [];
        this._nextCharacterJoinerId = 0;
        this._workCell = new CellData_1.CellData();
    }
    CharacterJoinerRegistry.prototype.registerCharacterJoiner = function (handler) {
        var joiner = {
            id: this._nextCharacterJoinerId++,
            handler: handler
        };
        this._characterJoiners.push(joiner);
        return joiner.id;
    };
    CharacterJoinerRegistry.prototype.deregisterCharacterJoiner = function (joinerId) {
        for (var i = 0; i < this._characterJoiners.length; i++) {
            if (this._characterJoiners[i].id === joinerId) {
                this._characterJoiners.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    CharacterJoinerRegistry.prototype.getJoinedCharacters = function (row) {
        if (this._characterJoiners.length === 0) {
            return [];
        }
        var line = this._bufferService.buffer.lines.get(row);
        if (!line || line.length === 0) {
            return [];
        }
        var ranges = [];
        var lineStr = line.translateToString(true);
        var rangeStartColumn = 0;
        var currentStringIndex = 0;
        var rangeStartStringIndex = 0;
        var rangeAttrFG = line.getFg(0);
        var rangeAttrBG = line.getBg(0);
        for (var x = 0; x < line.getTrimmedLength(); x++) {
            line.loadCell(x, this._workCell);
            if (this._workCell.getWidth() === 0) {
                continue;
            }
            if (this._workCell.fg !== rangeAttrFG || this._workCell.bg !== rangeAttrBG) {
                if (x - rangeStartColumn > 1) {
                    var joinedRanges = this._getJoinedRanges(lineStr, rangeStartStringIndex, currentStringIndex, line, rangeStartColumn);
                    for (var i = 0; i < joinedRanges.length; i++) {
                        ranges.push(joinedRanges[i]);
                    }
                }
                rangeStartColumn = x;
                rangeStartStringIndex = currentStringIndex;
                rangeAttrFG = this._workCell.fg;
                rangeAttrBG = this._workCell.bg;
            }
            currentStringIndex += this._workCell.getChars().length || Constants_1.WHITESPACE_CELL_CHAR.length;
        }
        if (this._bufferService.cols - rangeStartColumn > 1) {
            var joinedRanges = this._getJoinedRanges(lineStr, rangeStartStringIndex, currentStringIndex, line, rangeStartColumn);
            for (var i = 0; i < joinedRanges.length; i++) {
                ranges.push(joinedRanges[i]);
            }
        }
        return ranges;
    };
    CharacterJoinerRegistry.prototype._getJoinedRanges = function (line, startIndex, endIndex, lineData, startCol) {
        var text = line.substring(startIndex, endIndex);
        var joinedRanges = this._characterJoiners[0].handler(text);
        for (var i = 1; i < this._characterJoiners.length; i++) {
            var joinerRanges = this._characterJoiners[i].handler(text);
            for (var j = 0; j < joinerRanges.length; j++) {
                CharacterJoinerRegistry._mergeRanges(joinedRanges, joinerRanges[j]);
            }
        }
        this._stringRangesToCellRanges(joinedRanges, lineData, startCol);
        return joinedRanges;
    };
    CharacterJoinerRegistry.prototype._stringRangesToCellRanges = function (ranges, line, startCol) {
        var currentRangeIndex = 0;
        var currentRangeStarted = false;
        var currentStringIndex = 0;
        var currentRange = ranges[currentRangeIndex];
        if (!currentRange) {
            return;
        }
        for (var x = startCol; x < this._bufferService.cols; x++) {
            var width = line.getWidth(x);
            var length_1 = line.getString(x).length || Constants_1.WHITESPACE_CELL_CHAR.length;
            if (width === 0) {
                continue;
            }
            if (!currentRangeStarted && currentRange[0] <= currentStringIndex) {
                currentRange[0] = x;
                currentRangeStarted = true;
            }
            if (currentRange[1] <= currentStringIndex) {
                currentRange[1] = x;
                currentRange = ranges[++currentRangeIndex];
                if (!currentRange) {
                    break;
                }
                if (currentRange[0] <= currentStringIndex) {
                    currentRange[0] = x;
                    currentRangeStarted = true;
                }
                else {
                    currentRangeStarted = false;
                }
            }
            currentStringIndex += length_1;
        }
        if (currentRange) {
            currentRange[1] = this._bufferService.cols;
        }
    };
    CharacterJoinerRegistry._mergeRanges = function (ranges, newRange) {
        var inRange = false;
        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[i];
            if (!inRange) {
                if (newRange[1] <= range[0]) {
                    ranges.splice(i, 0, newRange);
                    return ranges;
                }
                if (newRange[1] <= range[1]) {
                    range[0] = Math.min(newRange[0], range[0]);
                    return ranges;
                }
                if (newRange[0] < range[1]) {
                    range[0] = Math.min(newRange[0], range[0]);
                    inRange = true;
                }
                continue;
            }
            else {
                if (newRange[1] <= range[0]) {
                    ranges[i - 1][1] = newRange[1];
                    return ranges;
                }
                if (newRange[1] <= range[1]) {
                    ranges[i - 1][1] = Math.max(newRange[1], range[1]);
                    ranges.splice(i, 1);
                    return ranges;
                }
                ranges.splice(i, 1);
                i--;
            }
        }
        if (inRange) {
            ranges[ranges.length - 1][1] = newRange[1];
        }
        else {
            ranges.push(newRange);
        }
        return ranges;
    };
    return CharacterJoinerRegistry;
}());
exports.CharacterJoinerRegistry = CharacterJoinerRegistry;


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function getCoordsRelativeToElement(event, element) {
    var rect = element.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
}
exports.getCoordsRelativeToElement = getCoordsRelativeToElement;
function getCoords(event, element, colCount, rowCount, hasValidCharSize, actualCellWidth, actualCellHeight, isSelection) {
    if (!hasValidCharSize) {
        return undefined;
    }
    var coords = getCoordsRelativeToElement(event, element);
    if (!coords) {
        return undefined;
    }
    coords[0] = Math.ceil((coords[0] + (isSelection ? actualCellWidth / 2 : 0)) / actualCellWidth);
    coords[1] = Math.ceil(coords[1] / actualCellHeight);
    coords[0] = Math.min(Math.max(coords[0], 1), colCount + (isSelection ? 1 : 0));
    coords[1] = Math.min(Math.max(coords[1], 1), rowCount);
    return coords;
}
exports.getCoords = getCoords;
function getRawByteCoords(coords) {
    if (!coords) {
        return undefined;
    }
    return { x: coords[0] + 32, y: coords[1] + 32 };
}
exports.getRawByteCoords = getRawByteCoords;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var RenderDebouncer = (function () {
    function RenderDebouncer(_renderCallback) {
        this._renderCallback = _renderCallback;
    }
    RenderDebouncer.prototype.dispose = function () {
        if (this._animationFrame) {
            window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = undefined;
        }
    };
    RenderDebouncer.prototype.refresh = function (rowStart, rowEnd, rowCount) {
        var _this = this;
        this._rowCount = rowCount;
        rowStart = rowStart !== undefined ? rowStart : 0;
        rowEnd = rowEnd !== undefined ? rowEnd : this._rowCount - 1;
        this._rowStart = this._rowStart !== undefined ? Math.min(this._rowStart, rowStart) : rowStart;
        this._rowEnd = this._rowEnd !== undefined ? Math.max(this._rowEnd, rowEnd) : rowEnd;
        if (this._animationFrame) {
            return;
        }
        this._animationFrame = window.requestAnimationFrame(function () { return _this._innerRefresh(); });
    };
    RenderDebouncer.prototype._innerRefresh = function () {
        if (this._rowStart === undefined || this._rowEnd === undefined || this._rowCount === undefined) {
            return;
        }
        this._rowStart = Math.max(this._rowStart, 0);
        this._rowEnd = Math.min(this._rowEnd, this._rowCount - 1);
        this._renderCallback(this._rowStart, this._rowEnd);
        this._rowStart = undefined;
        this._rowEnd = undefined;
        this._animationFrame = undefined;
    };
    return RenderDebouncer;
}());
exports.RenderDebouncer = RenderDebouncer;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Lifecycle_1 = __webpack_require__(2);
var ScreenDprMonitor = (function (_super) {
    __extends(ScreenDprMonitor, _super);
    function ScreenDprMonitor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._currentDevicePixelRatio = window.devicePixelRatio;
        return _this;
    }
    ScreenDprMonitor.prototype.setListener = function (listener) {
        var _this = this;
        if (this._listener) {
            this.clearListener();
        }
        this._listener = listener;
        this._outerListener = function () {
            if (!_this._listener) {
                return;
            }
            _this._listener(window.devicePixelRatio, _this._currentDevicePixelRatio);
            _this._updateDpr();
        };
        this._updateDpr();
    };
    ScreenDprMonitor.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.clearListener();
    };
    ScreenDprMonitor.prototype._updateDpr = function () {
        if (!this._resolutionMediaMatchList || !this._outerListener) {
            return;
        }
        this._resolutionMediaMatchList.removeListener(this._outerListener);
        this._currentDevicePixelRatio = window.devicePixelRatio;
        this._resolutionMediaMatchList = window.matchMedia("screen and (resolution: " + window.devicePixelRatio + "dppx)");
        this._resolutionMediaMatchList.addListener(this._outerListener);
    };
    ScreenDprMonitor.prototype.clearListener = function () {
        if (!this._resolutionMediaMatchList || !this._listener || !this._outerListener) {
            return;
        }
        this._resolutionMediaMatchList.removeListener(this._outerListener);
        this._resolutionMediaMatchList = undefined;
        this._listener = undefined;
        this._outerListener = undefined;
    };
    return ScreenDprMonitor;
}(Lifecycle_1.Disposable));
exports.ScreenDprMonitor = ScreenDprMonitor;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function clone(val, depth) {
    if (depth === void 0) { depth = 5; }
    if (typeof val !== 'object') {
        return val;
    }
    var clonedObject = Array.isArray(val) ? [] : {};
    for (var key in val) {
        clonedObject[key] = depth <= 1 ? val[key] : (val[key] ? clone(val[key], depth - 1) : val[key]);
    }
    return clonedObject;
}
exports.clone = clone;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Terminal_1 = __webpack_require__(33);
var Strings = __webpack_require__(16);
var AddonManager_1 = __webpack_require__(75);
var Terminal = (function () {
    function Terminal(options) {
        this._core = new Terminal_1.Terminal(options);
        this._addonManager = new AddonManager_1.AddonManager();
    }
    Object.defineProperty(Terminal.prototype, "onCursorMove", {
        get: function () { return this._core.onCursorMove; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onLineFeed", {
        get: function () { return this._core.onLineFeed; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onSelectionChange", {
        get: function () { return this._core.onSelectionChange; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onData", {
        get: function () { return this._core.onData; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onTitleChange", {
        get: function () { return this._core.onTitleChange; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onScroll", {
        get: function () { return this._core.onScroll; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onKey", {
        get: function () { return this._core.onKey; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onRender", {
        get: function () { return this._core.onRender; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onResize", {
        get: function () { return this._core.onResize; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "element", {
        get: function () { return this._core.element; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "parser", {
        get: function () {
            if (!this._parser) {
                this._parser = new ParserApi(this._core);
            }
            return this._parser;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "textarea", {
        get: function () { return this._core.textarea; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "rows", {
        get: function () { return this._core.rows; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "cols", {
        get: function () { return this._core.cols; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "buffer", {
        get: function () { return new BufferApiView(this._core.buffer); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "markers", {
        get: function () { return this._core.markers; },
        enumerable: true,
        configurable: true
    });
    Terminal.prototype.blur = function () {
        this._core.blur();
    };
    Terminal.prototype.focus = function () {
        this._core.focus();
    };
    Terminal.prototype.resize = function (columns, rows) {
        this._verifyIntegers(columns, rows);
        this._core.resize(columns, rows);
    };
    Terminal.prototype.open = function (parent) {
        this._core.open(parent);
    };
    Terminal.prototype.attachCustomKeyEventHandler = function (customKeyEventHandler) {
        this._core.attachCustomKeyEventHandler(customKeyEventHandler);
    };
    Terminal.prototype.registerLinkMatcher = function (regex, handler, options) {
        return this._core.registerLinkMatcher(regex, handler, options);
    };
    Terminal.prototype.deregisterLinkMatcher = function (matcherId) {
        this._core.deregisterLinkMatcher(matcherId);
    };
    Terminal.prototype.registerCharacterJoiner = function (handler) {
        return this._core.registerCharacterJoiner(handler);
    };
    Terminal.prototype.deregisterCharacterJoiner = function (joinerId) {
        this._core.deregisterCharacterJoiner(joinerId);
    };
    Terminal.prototype.addMarker = function (cursorYOffset) {
        this._verifyIntegers(cursorYOffset);
        return this._core.addMarker(cursorYOffset);
    };
    Terminal.prototype.hasSelection = function () {
        return this._core.hasSelection();
    };
    Terminal.prototype.select = function (column, row, length) {
        this._verifyIntegers(column, row, length);
        this._core.select(column, row, length);
    };
    Terminal.prototype.getSelection = function () {
        return this._core.getSelection();
    };
    Terminal.prototype.getSelectionPosition = function () {
        return this._core.getSelectionPosition();
    };
    Terminal.prototype.clearSelection = function () {
        this._core.clearSelection();
    };
    Terminal.prototype.selectAll = function () {
        this._core.selectAll();
    };
    Terminal.prototype.selectLines = function (start, end) {
        this._verifyIntegers(start, end);
        this._core.selectLines(start, end);
    };
    Terminal.prototype.dispose = function () {
        this._addonManager.dispose();
        this._core.dispose();
    };
    Terminal.prototype.scrollLines = function (amount) {
        this._verifyIntegers(amount);
        this._core.scrollLines(amount);
    };
    Terminal.prototype.scrollPages = function (pageCount) {
        this._verifyIntegers(pageCount);
        this._core.scrollPages(pageCount);
    };
    Terminal.prototype.scrollToTop = function () {
        this._core.scrollToTop();
    };
    Terminal.prototype.scrollToBottom = function () {
        this._core.scrollToBottom();
    };
    Terminal.prototype.scrollToLine = function (line) {
        this._verifyIntegers(line);
        this._core.scrollToLine(line);
    };
    Terminal.prototype.clear = function () {
        this._core.clear();
    };
    Terminal.prototype.write = function (data, callback) {
        this._core.write(data, callback);
    };
    Terminal.prototype.writeUtf8 = function (data, callback) {
        this._core.write(data, callback);
    };
    Terminal.prototype.writeln = function (data, callback) {
        this._core.write(data);
        this._core.write('\r\n', callback);
    };
    Terminal.prototype.paste = function (data) {
        this._core.paste(data);
    };
    Terminal.prototype.getOption = function (key) {
        return this._core.optionsService.getOption(key);
    };
    Terminal.prototype.setOption = function (key, value) {
        this._core.optionsService.setOption(key, value);
    };
    Terminal.prototype.refresh = function (start, end) {
        this._verifyIntegers(start, end);
        this._core.refresh(start, end);
    };
    Terminal.prototype.reset = function () {
        this._core.reset();
    };
    Terminal.prototype.loadAddon = function (addon) {
        return this._addonManager.loadAddon(this, addon);
    };
    Object.defineProperty(Terminal, "strings", {
        get: function () {
            return Strings;
        },
        enumerable: true,
        configurable: true
    });
    Terminal.prototype._verifyIntegers = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        values.forEach(function (value) {
            if (value === Infinity || isNaN(value) || value % 1 !== 0) {
                throw new Error('This API only accepts integers');
            }
        });
    };
    return Terminal;
}());
exports.Terminal = Terminal;
var BufferApiView = (function () {
    function BufferApiView(_buffer) {
        this._buffer = _buffer;
    }
    Object.defineProperty(BufferApiView.prototype, "cursorY", {
        get: function () { return this._buffer.y; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BufferApiView.prototype, "cursorX", {
        get: function () { return this._buffer.x; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BufferApiView.prototype, "viewportY", {
        get: function () { return this._buffer.ydisp; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BufferApiView.prototype, "baseY", {
        get: function () { return this._buffer.ybase; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BufferApiView.prototype, "length", {
        get: function () { return this._buffer.lines.length; },
        enumerable: true,
        configurable: true
    });
    BufferApiView.prototype.getLine = function (y) {
        var line = this._buffer.lines.get(y);
        if (!line) {
            return undefined;
        }
        return new BufferLineApiView(line);
    };
    return BufferApiView;
}());
var BufferLineApiView = (function () {
    function BufferLineApiView(_line) {
        this._line = _line;
    }
    Object.defineProperty(BufferLineApiView.prototype, "isWrapped", {
        get: function () { return this._line.isWrapped; },
        enumerable: true,
        configurable: true
    });
    BufferLineApiView.prototype.getCell = function (x) {
        if (x < 0 || x >= this._line.length) {
            return undefined;
        }
        return new BufferCellApiView(this._line, x);
    };
    BufferLineApiView.prototype.translateToString = function (trimRight, startColumn, endColumn) {
        return this._line.translateToString(trimRight, startColumn, endColumn);
    };
    return BufferLineApiView;
}());
var BufferCellApiView = (function () {
    function BufferCellApiView(_line, _x) {
        this._line = _line;
        this._x = _x;
    }
    Object.defineProperty(BufferCellApiView.prototype, "char", {
        get: function () { return this._line.getString(this._x); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BufferCellApiView.prototype, "width", {
        get: function () { return this._line.getWidth(this._x); },
        enumerable: true,
        configurable: true
    });
    return BufferCellApiView;
}());
var ParserApi = (function () {
    function ParserApi(_core) {
        this._core = _core;
    }
    ParserApi.prototype.addCsiHandler = function (id, callback) {
        return this._core.addCsiHandler(id, function (params) { return callback(params.toArray()); });
    };
    ParserApi.prototype.addDcsHandler = function (id, callback) {
        return this._core.addDcsHandler(id, function (data, params) { return callback(data, params.toArray()); });
    };
    ParserApi.prototype.addEscHandler = function (id, handler) {
        return this._core.addEscHandler(id, handler);
    };
    ParserApi.prototype.addOscHandler = function (ident, callback) {
        return this._core.addOscHandler(ident, callback);
    };
    return ParserApi;
}());


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var CompositionHelper_1 = __webpack_require__(34);
var Viewport_1 = __webpack_require__(35);
var Clipboard_1 = __webpack_require__(36);
var EscapeSequences_1 = __webpack_require__(11);
var InputHandler_1 = __webpack_require__(37);
var Renderer_1 = __webpack_require__(39);
var Linkifier_1 = __webpack_require__(48);
var SelectionService_1 = __webpack_require__(49);
var Browser = __webpack_require__(10);
var Lifecycle_1 = __webpack_require__(7);
var Strings = __webpack_require__(16);
var SoundService_1 = __webpack_require__(52);
var MouseZoneManager_1 = __webpack_require__(53);
var AccessibilityManager_1 = __webpack_require__(54);
var DomRenderer_1 = __webpack_require__(55);
var Keyboard_1 = __webpack_require__(57);
var EventEmitter_1 = __webpack_require__(1);
var BufferLine_1 = __webpack_require__(15);
var WindowsMode_1 = __webpack_require__(58);
var ColorManager_1 = __webpack_require__(25);
var RenderService_1 = __webpack_require__(59);
var Services_1 = __webpack_require__(0);
var OptionsService_1 = __webpack_require__(60);
var Services_2 = __webpack_require__(5);
var CharSizeService_1 = __webpack_require__(61);
var BufferService_1 = __webpack_require__(62);
var Lifecycle_2 = __webpack_require__(2);
var MouseService_1 = __webpack_require__(68);
var CoreService_1 = __webpack_require__(69);
var LogService_1 = __webpack_require__(70);
var DirtyRowService_1 = __webpack_require__(71);
var InstantiationService_1 = __webpack_require__(72);
var CoreMouseService_1 = __webpack_require__(73);
var WriteBuffer_1 = __webpack_require__(74);
var document = (typeof window !== 'undefined') ? window.document : null;
var Terminal = (function (_super) {
    __extends(Terminal, _super);
    function Terminal(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.browser = Browser;
        _this.mouseEvents = 0;
        _this._keyDownHandled = false;
        _this._blankLine = null;
        _this._onCursorMove = new EventEmitter_1.EventEmitter();
        _this._onData = new EventEmitter_1.EventEmitter();
        _this._onKey = new EventEmitter_1.EventEmitter();
        _this._onLineFeed = new EventEmitter_1.EventEmitter();
        _this._onRender = new EventEmitter_1.EventEmitter();
        _this._onResize = new EventEmitter_1.EventEmitter();
        _this._onScroll = new EventEmitter_1.EventEmitter();
        _this._onSelectionChange = new EventEmitter_1.EventEmitter();
        _this._onTitleChange = new EventEmitter_1.EventEmitter();
        _this._onFocus = new EventEmitter_1.EventEmitter();
        _this._onBlur = new EventEmitter_1.EventEmitter();
        _this.onA11yCharEmitter = new EventEmitter_1.EventEmitter();
        _this.onA11yTabEmitter = new EventEmitter_1.EventEmitter();
        _this._instantiationService = new InstantiationService_1.InstantiationService();
        _this.optionsService = new OptionsService_1.OptionsService(options);
        _this._instantiationService.setService(Services_1.IOptionsService, _this.optionsService);
        _this._bufferService = _this._instantiationService.createInstance(BufferService_1.BufferService);
        _this._instantiationService.setService(Services_1.IBufferService, _this._bufferService);
        _this._logService = _this._instantiationService.createInstance(LogService_1.LogService);
        _this._instantiationService.setService(Services_1.ILogService, _this._logService);
        _this._coreService = _this._instantiationService.createInstance(CoreService_1.CoreService, function () { return _this.scrollToBottom(); });
        _this._instantiationService.setService(Services_1.ICoreService, _this._coreService);
        _this._coreService.onData(function (e) { return _this._onData.fire(e); });
        _this._coreMouseService = _this._instantiationService.createInstance(CoreMouseService_1.CoreMouseService);
        _this._instantiationService.setService(Services_1.ICoreMouseService, _this._coreMouseService);
        _this._dirtyRowService = _this._instantiationService.createInstance(DirtyRowService_1.DirtyRowService);
        _this._instantiationService.setService(Services_1.IDirtyRowService, _this._dirtyRowService);
        _this._setupOptionsListeners();
        _this._setup();
        _this._writeBuffer = new WriteBuffer_1.WriteBuffer(function (data) { return _this._inputHandler.parse(data); });
        return _this;
    }
    Object.defineProperty(Terminal.prototype, "options", {
        get: function () { return this.optionsService.options; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "cols", {
        get: function () { return this._bufferService.cols; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "rows", {
        get: function () { return this._bufferService.rows; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onCursorMove", {
        get: function () { return this._onCursorMove.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onData", {
        get: function () { return this._onData.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onKey", {
        get: function () { return this._onKey.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onLineFeed", {
        get: function () { return this._onLineFeed.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onRender", {
        get: function () { return this._onRender.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onResize", {
        get: function () { return this._onResize.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onScroll", {
        get: function () { return this._onScroll.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onSelectionChange", {
        get: function () { return this._onSelectionChange.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onTitleChange", {
        get: function () { return this._onTitleChange.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onFocus", {
        get: function () { return this._onFocus.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onBlur", {
        get: function () { return this._onBlur.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onA11yChar", {
        get: function () { return this.onA11yCharEmitter.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onA11yTab", {
        get: function () { return this.onA11yTabEmitter.event; },
        enumerable: true,
        configurable: true
    });
    Terminal.prototype.dispose = function () {
        if (this._isDisposed) {
            return;
        }
        _super.prototype.dispose.call(this);
        if (this._windowsMode) {
            this._windowsMode.dispose();
            this._windowsMode = undefined;
        }
        if (this._renderService) {
            this._renderService.dispose();
        }
        this._customKeyEventHandler = null;
        this.write = function () { };
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    };
    Terminal.prototype._setup = function () {
        var _this = this;
        this._parent = document ? document.body : null;
        this.cursorState = 0;
        this.cursorHidden = false;
        this._customKeyEventHandler = null;
        this.applicationKeypad = false;
        this.originMode = false;
        this.insertMode = false;
        this.wraparoundMode = true;
        this.bracketedPasteMode = false;
        this.charset = null;
        this.gcharset = null;
        this.glevel = 0;
        this.charsets = [null];
        this.curAttrData = BufferLine_1.DEFAULT_ATTR_DATA.clone();
        this._eraseAttrData = BufferLine_1.DEFAULT_ATTR_DATA.clone();
        this.params = [];
        this.currentParam = 0;
        this._userScrolling = false;
        this._inputHandler = new InputHandler_1.InputHandler(this, this._bufferService, this._coreService, this._dirtyRowService, this._logService, this.optionsService, this._coreMouseService);
        this._inputHandler.onCursorMove(function () { return _this._onCursorMove.fire(); });
        this._inputHandler.onLineFeed(function () { return _this._onLineFeed.fire(); });
        this.register(this._inputHandler);
        this.linkifier = this.linkifier || new Linkifier_1.Linkifier(this._bufferService, this._logService);
        if (this.options.windowsMode) {
            this._windowsMode = WindowsMode_1.applyWindowsMode(this);
        }
    };
    Object.defineProperty(Terminal.prototype, "buffer", {
        get: function () {
            return this.buffers.active;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "buffers", {
        get: function () {
            return this._bufferService.buffers;
        },
        enumerable: true,
        configurable: true
    });
    Terminal.prototype.eraseAttrData = function () {
        this._eraseAttrData.bg &= ~(50331648 | 0xFFFFFF);
        this._eraseAttrData.bg |= this.curAttrData.bg & ~0xFC000000;
        return this._eraseAttrData;
    };
    Terminal.prototype.focus = function () {
        if (this.textarea) {
            this.textarea.focus({ preventScroll: true });
        }
    };
    Object.defineProperty(Terminal.prototype, "isFocused", {
        get: function () {
            return document.activeElement === this.textarea && document.hasFocus();
        },
        enumerable: true,
        configurable: true
    });
    Terminal.prototype._setupOptionsListeners = function () {
        var _this = this;
        this.optionsService.onOptionChange(function (key) {
            switch (key) {
                case 'fontFamily':
                case 'fontSize':
                    if (_this._renderService) {
                        _this._renderService.clear();
                    }
                    if (_this._charSizeService) {
                        _this._charSizeService.measure();
                    }
                    break;
                case 'drawBoldTextInBrightColors':
                case 'letterSpacing':
                case 'lineHeight':
                case 'fontWeight':
                case 'fontWeightBold':
                    if (_this._renderService) {
                        _this._renderService.clear();
                        _this._renderService.onResize(_this.cols, _this.rows);
                        _this.refresh(0, _this.rows - 1);
                    }
                    break;
                case 'rendererType':
                    if (_this._renderService) {
                        _this._renderService.setRenderer(_this._createRenderer());
                        _this._renderService.onResize(_this.cols, _this.rows);
                    }
                    break;
                case 'scrollback':
                    _this.buffers.resize(_this.cols, _this.rows);
                    if (_this.viewport) {
                        _this.viewport.syncScrollArea();
                    }
                    break;
                case 'screenReaderMode':
                    if (_this.optionsService.options.screenReaderMode) {
                        if (!_this._accessibilityManager && _this._renderService) {
                            _this._accessibilityManager = new AccessibilityManager_1.AccessibilityManager(_this, _this._renderService);
                        }
                    }
                    else {
                        if (_this._accessibilityManager) {
                            _this._accessibilityManager.dispose();
                            _this._accessibilityManager = null;
                        }
                    }
                    break;
                case 'tabStopWidth':
                    _this.buffers.setupTabStops();
                    break;
                case 'theme':
                    _this._setTheme(_this.optionsService.options.theme);
                    break;
                case 'windowsMode':
                    if (_this.optionsService.options.windowsMode) {
                        if (!_this._windowsMode) {
                            _this._windowsMode = WindowsMode_1.applyWindowsMode(_this);
                        }
                    }
                    else {
                        if (_this._windowsMode) {
                            _this._windowsMode.dispose();
                            _this._windowsMode = undefined;
                        }
                    }
                    break;
            }
        });
    };
    Terminal.prototype._onTextAreaFocus = function (ev) {
        if (this.sendFocus) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[I');
        }
        this.updateCursorStyle(ev);
        this.element.classList.add('focus');
        this.showCursor();
        this._onFocus.fire();
    };
    Terminal.prototype.blur = function () {
        return this.textarea.blur();
    };
    Terminal.prototype._onTextAreaBlur = function () {
        this.textarea.value = '';
        this.refresh(this.buffer.y, this.buffer.y);
        if (this.sendFocus) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[O');
        }
        this.element.classList.remove('focus');
        this._onBlur.fire();
    };
    Terminal.prototype._initGlobal = function () {
        var _this = this;
        this._bindKeys();
        this.register(Lifecycle_1.addDisposableDomListener(this.element, 'copy', function (event) {
            if (!_this.hasSelection()) {
                return;
            }
            Clipboard_1.copyHandler(event, _this._selectionService);
        }));
        var pasteHandlerWrapper = function (event) { return Clipboard_1.handlePasteEvent(event, _this.textarea, _this.bracketedPasteMode, _this._coreService); };
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'paste', pasteHandlerWrapper));
        this.register(Lifecycle_1.addDisposableDomListener(this.element, 'paste', pasteHandlerWrapper));
        if (Browser.isFirefox) {
            this.register(Lifecycle_1.addDisposableDomListener(this.element, 'mousedown', function (event) {
                if (event.button === 2) {
                    Clipboard_1.rightClickHandler(event, _this.textarea, _this.screenElement, _this._selectionService, _this.options.rightClickSelectsWord);
                }
            }));
        }
        else {
            this.register(Lifecycle_1.addDisposableDomListener(this.element, 'contextmenu', function (event) {
                Clipboard_1.rightClickHandler(event, _this.textarea, _this.screenElement, _this._selectionService, _this.options.rightClickSelectsWord);
            }));
        }
        if (Browser.isLinux) {
            this.register(Lifecycle_1.addDisposableDomListener(this.element, 'auxclick', function (event) {
                if (event.button === 1) {
                    Clipboard_1.moveTextAreaUnderMouseCursor(event, _this.textarea, _this.screenElement);
                }
            }));
        }
    };
    Terminal.prototype._bindKeys = function () {
        var _this = this;
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'keyup', function (ev) { return _this._keyUp(ev); }, true));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'keydown', function (ev) { return _this._keyDown(ev); }, true));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'keypress', function (ev) { return _this._keyPress(ev); }, true));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'compositionstart', function () { return _this._compositionHelper.compositionstart(); }));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'compositionupdate', function (e) { return _this._compositionHelper.compositionupdate(e); }));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'compositionend', function () { return _this._compositionHelper.compositionend(); }));
        this.register(this.onRender(function () { return _this._compositionHelper.updateCompositionElements(); }));
        this.register(this.onRender(function (e) { return _this._queueLinkification(e.start, e.end); }));
    };
    Terminal.prototype.open = function (parent) {
        var _this = this;
        this._parent = parent || this._parent;
        if (!this._parent) {
            throw new Error('Terminal requires a parent element.');
        }
        if (!document.body.contains(parent)) {
            this._logService.warn('Terminal.open was called on an element that was not attached to the DOM');
        }
        this._document = this._parent.ownerDocument;
        this.element = this._document.createElement('div');
        this.element.dir = 'ltr';
        this.element.classList.add('terminal');
        this.element.classList.add('xterm');
        this.element.setAttribute('tabindex', '0');
        this._parent.appendChild(this.element);
        var fragment = document.createDocumentFragment();
        this._viewportElement = document.createElement('div');
        this._viewportElement.classList.add('xterm-viewport');
        fragment.appendChild(this._viewportElement);
        this._viewportScrollArea = document.createElement('div');
        this._viewportScrollArea.classList.add('xterm-scroll-area');
        this._viewportElement.appendChild(this._viewportScrollArea);
        this.screenElement = document.createElement('div');
        this.screenElement.classList.add('xterm-screen');
        this._helperContainer = document.createElement('div');
        this._helperContainer.classList.add('xterm-helpers');
        this.screenElement.appendChild(this._helperContainer);
        fragment.appendChild(this.screenElement);
        this.textarea = document.createElement('textarea');
        this.textarea.classList.add('xterm-helper-textarea');
        this.textarea.setAttribute('aria-label', Strings.promptLabel);
        this.textarea.setAttribute('aria-multiline', 'false');
        this.textarea.setAttribute('autocorrect', 'off');
        this.textarea.setAttribute('autocapitalize', 'off');
        this.textarea.setAttribute('spellcheck', 'false');
        this.textarea.tabIndex = 0;
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'focus', function (ev) { return _this._onTextAreaFocus(ev); }));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'blur', function () { return _this._onTextAreaBlur(); }));
        this._helperContainer.appendChild(this.textarea);
        this._charSizeService = this._instantiationService.createInstance(CharSizeService_1.CharSizeService, this._document, this._helperContainer);
        this._instantiationService.setService(Services_2.ICharSizeService, this._charSizeService);
        this._compositionView = document.createElement('div');
        this._compositionView.classList.add('composition-view');
        this._compositionHelper = this._instantiationService.createInstance(CompositionHelper_1.CompositionHelper, this.textarea, this._compositionView);
        this._helperContainer.appendChild(this._compositionView);
        this.element.appendChild(fragment);
        this._theme = this.options.theme || this._theme;
        this.options.theme = undefined;
        this._colorManager = new ColorManager_1.ColorManager(document, this.options.allowTransparency);
        this._colorManager.setTheme(this._theme);
        var renderer = this._createRenderer();
        this._renderService = this._instantiationService.createInstance(RenderService_1.RenderService, renderer, this.rows, this.screenElement);
        this._instantiationService.setService(Services_2.IRenderService, this._renderService);
        this._renderService.onRender(function (e) { return _this._onRender.fire(e); });
        this.onResize(function (e) { return _this._renderService.resize(e.cols, e.rows); });
        this._soundService = this._instantiationService.createInstance(SoundService_1.SoundService);
        this._instantiationService.setService(Services_2.ISoundService, this._soundService);
        this._mouseService = this._instantiationService.createInstance(MouseService_1.MouseService);
        this._instantiationService.setService(Services_2.IMouseService, this._mouseService);
        this.viewport = this._instantiationService.createInstance(Viewport_1.Viewport, function (amount, suppressEvent) { return _this.scrollLines(amount, suppressEvent); }, this._viewportElement, this._viewportScrollArea);
        this.viewport.onThemeChange(this._colorManager.colors);
        this.register(this.viewport);
        this.register(this.onCursorMove(function () { return _this._renderService.onCursorMove(); }));
        this.register(this.onResize(function () { return _this._renderService.onResize(_this.cols, _this.rows); }));
        this.register(this.onBlur(function () { return _this._renderService.onBlur(); }));
        this.register(this.onFocus(function () { return _this._renderService.onFocus(); }));
        this.register(this._renderService.onDimensionsChange(function () { return _this.viewport.syncScrollArea(); }));
        this._selectionService = this._instantiationService.createInstance(SelectionService_1.SelectionService, function (amount, suppressEvent) { return _this.scrollLines(amount, suppressEvent); }, this.element, this.screenElement);
        this._instantiationService.setService(Services_2.ISelectionService, this._selectionService);
        this.register(this._selectionService.onSelectionChange(function () { return _this._onSelectionChange.fire(); }));
        this.register(this._selectionService.onRedrawRequest(function (e) { return _this._renderService.onSelectionChanged(e.start, e.end, e.columnSelectMode); }));
        this.register(this._selectionService.onLinuxMouseSelection(function (text) {
            _this.textarea.value = text;
            _this.textarea.focus();
            _this.textarea.select();
        }));
        this.register(this.onScroll(function () {
            _this.viewport.syncScrollArea();
            _this._selectionService.refresh();
        }));
        this.register(Lifecycle_1.addDisposableDomListener(this._viewportElement, 'scroll', function () { return _this._selectionService.refresh(); }));
        this._mouseZoneManager = this._instantiationService.createInstance(MouseZoneManager_1.MouseZoneManager, this.element, this.screenElement);
        this.register(this._mouseZoneManager);
        this.register(this.onScroll(function () { return _this._mouseZoneManager.clearAll(); }));
        this.linkifier.attachToDom(this.element, this._mouseZoneManager);
        this.register(Lifecycle_1.addDisposableDomListener(this.element, 'mousedown', function (e) { return _this._selectionService.onMouseDown(e); }));
        if (this.mouseEvents) {
            this._selectionService.disable();
            this.element.classList.add('enable-mouse-events');
        }
        else {
            this._selectionService.enable();
        }
        if (this.options.screenReaderMode) {
            this._accessibilityManager = new AccessibilityManager_1.AccessibilityManager(this, this._renderService);
        }
        this._charSizeService.measure();
        this.refresh(0, this.rows - 1);
        this._initGlobal();
        this.bindMouse();
    };
    Terminal.prototype._createRenderer = function () {
        switch (this.options.rendererType) {
            case 'canvas': return new Renderer_1.Renderer(this._colorManager.colors, this, this._bufferService, this._charSizeService, this.optionsService);
            case 'dom': return new DomRenderer_1.DomRenderer(this, this._colorManager.colors, this._charSizeService, this.optionsService);
            default: throw new Error("Unrecognized rendererType \"" + this.options.rendererType + "\"");
        }
    };
    Terminal.prototype._setTheme = function (theme) {
        this._theme = theme;
        if (this._colorManager) {
            this._colorManager.setTheme(theme);
        }
        if (this._renderService) {
            this._renderService.setColors(this._colorManager.colors);
        }
        if (this.viewport) {
            this.viewport.onThemeChange(this._colorManager.colors);
        }
    };
    Terminal.prototype.bindMouse = function () {
        var _this = this;
        var self = this;
        var el = this.element;
        function sendEvent(ev) {
            var pos;
            pos = self._mouseService.getRawByteCoords(ev, self.screenElement, self.cols, self.rows);
            if (!pos) {
                return false;
            }
            var but;
            var action;
            switch (ev.overrideType || ev.type) {
                case 'mousemove':
                    action = 32;
                    if (ev.buttons === undefined) {
                        but = 3;
                        if (ev.button !== undefined) {
                            but = ev.button < 3 ? ev.button : 3;
                        }
                    }
                    else {
                        but = ev.buttons & 1 ? 0 :
                            ev.buttons & 4 ? 1 :
                                ev.buttons & 2 ? 2 :
                                    3;
                    }
                    break;
                case 'mouseup':
                    action = 0;
                    but = ev.button < 3 ? ev.button : 3;
                    break;
                case 'mousedown':
                    action = 1;
                    but = ev.button < 3 ? ev.button : 3;
                    break;
                case 'wheel':
                    if (ev.deltaY !== 0) {
                        action = ev.deltaY < 0 ? 0 : 1;
                    }
                    but = 4;
                    break;
                default:
                    return false;
            }
            if (action === undefined || but === undefined || but > 4) {
                return false;
            }
            return self._coreMouseService.triggerMouseEvent({
                col: pos.x - 33,
                row: pos.y - 33,
                button: but,
                action: action,
                ctrl: ev.ctrlKey,
                alt: ev.altKey,
                shift: ev.shiftKey
            });
        }
        var requestedEvents = {
            mouseup: null,
            wheel: null,
            mousedrag: null,
            mousemove: null
        };
        var eventListeners = {
            mouseup: function (ev) {
                sendEvent(ev);
                if (!ev.buttons) {
                    _this._document.removeEventListener('mouseup', requestedEvents.mouseup);
                    if (requestedEvents.mousedrag) {
                        _this._document.removeEventListener('mousemove', requestedEvents.mousedrag);
                    }
                }
                return _this.cancel(ev);
            },
            wheel: function (ev) {
                sendEvent(ev);
                ev.preventDefault();
                return _this.cancel(ev);
            },
            mousedrag: function (ev) {
                if (ev.buttons) {
                    sendEvent(ev);
                }
            },
            mousemove: function (ev) {
                if (!ev.buttons) {
                    sendEvent(ev);
                }
            }
        };
        this._coreMouseService.onProtocolChange(function (events) {
            _this.mouseEvents = events;
            if (events) {
                if (_this.optionsService.options.logLevel === 'debug') {
                    _this._logService.debug('Binding to mouse events:', _this._coreMouseService.explainEvents(events));
                }
                _this.element.classList.add('enable-mouse-events');
                _this._selectionService.disable();
            }
            else {
                _this._logService.debug('Unbinding from mouse events.');
                _this.element.classList.remove('enable-mouse-events');
                _this._selectionService.enable();
            }
            if (!(events & 8)) {
                el.removeEventListener('mousemove', requestedEvents.mousemove);
                requestedEvents.mousemove = null;
            }
            else if (!requestedEvents.mousemove) {
                el.addEventListener('mousemove', eventListeners.mousemove);
                requestedEvents.mousemove = eventListeners.mousemove;
            }
            if (!(events & 16)) {
                el.removeEventListener('wheel', requestedEvents.wheel);
                requestedEvents.wheel = null;
            }
            else if (!requestedEvents.wheel) {
                el.addEventListener('wheel', eventListeners.wheel);
                requestedEvents.wheel = eventListeners.wheel;
            }
            if (!(events & 2)) {
                _this._document.removeEventListener('mouseup', requestedEvents.mouseup);
                requestedEvents.mouseup = null;
            }
            else if (!requestedEvents.mouseup) {
                requestedEvents.mouseup = eventListeners.mouseup;
            }
            if (!(events & 4)) {
                _this._document.removeEventListener('mousemove', requestedEvents.mousedrag);
                requestedEvents.mousedrag = null;
            }
            else if (!requestedEvents.mousedrag) {
                requestedEvents.mousedrag = eventListeners.mousedrag;
            }
        });
        this._coreMouseService.activeProtocol = this._coreMouseService.activeProtocol;
        this.register(Lifecycle_1.addDisposableDomListener(el, 'mousedown', function (ev) {
            ev.preventDefault();
            _this.focus();
            if (!_this.mouseEvents || _this._selectionService.shouldForceSelection(ev)) {
                return;
            }
            sendEvent(ev);
            if (requestedEvents.mouseup) {
                _this._document.addEventListener('mouseup', requestedEvents.mouseup);
            }
            if (requestedEvents.mousedrag) {
                _this._document.addEventListener('mousemove', requestedEvents.mousedrag);
            }
            return _this.cancel(ev);
        }));
        this.register(Lifecycle_1.addDisposableDomListener(el, 'wheel', function (ev) {
            if (!requestedEvents.wheel) {
                if (!_this.buffer.hasScrollback) {
                    var amount = _this.viewport.getLinesScrolled(ev);
                    if (amount === 0) {
                        return;
                    }
                    var sequence = EscapeSequences_1.C0.ESC + (_this._coreService.decPrivateModes.applicationCursorKeys ? 'O' : '[') + (ev.deltaY < 0 ? 'A' : 'B');
                    var data = '';
                    for (var i = 0; i < Math.abs(amount); i++) {
                        data += sequence;
                    }
                    _this._coreService.triggerDataEvent(data, true);
                }
                return;
            }
        }));
        this.register(Lifecycle_1.addDisposableDomListener(el, 'wheel', function (ev) {
            if (requestedEvents.wheel)
                return;
            if (!_this.viewport.onWheel(ev)) {
                return _this.cancel(ev);
            }
        }));
        this.register(Lifecycle_1.addDisposableDomListener(el, 'touchstart', function (ev) {
            if (_this.mouseEvents)
                return;
            _this.viewport.onTouchStart(ev);
            return _this.cancel(ev);
        }));
        this.register(Lifecycle_1.addDisposableDomListener(el, 'touchmove', function (ev) {
            if (_this.mouseEvents)
                return;
            if (!_this.viewport.onTouchMove(ev)) {
                return _this.cancel(ev);
            }
        }));
    };
    Terminal.prototype.refresh = function (start, end) {
        if (this._renderService) {
            this._renderService.refreshRows(start, end);
        }
    };
    Terminal.prototype._queueLinkification = function (start, end) {
        if (this.linkifier) {
            this.linkifier.linkifyRows(start, end);
        }
    };
    Terminal.prototype.updateCursorStyle = function (ev) {
        if (this._selectionService && this._selectionService.shouldColumnSelect(ev)) {
            this.element.classList.add('column-select');
        }
        else {
            this.element.classList.remove('column-select');
        }
    };
    Terminal.prototype.showCursor = function () {
        if (!this.cursorState) {
            this.cursorState = 1;
            this.refresh(this.buffer.y, this.buffer.y);
        }
    };
    Terminal.prototype.scroll = function (isWrapped) {
        if (isWrapped === void 0) { isWrapped = false; }
        var newLine;
        newLine = this._blankLine;
        var eraseAttr = this.eraseAttrData();
        if (!newLine || newLine.length !== this.cols || newLine.getFg(0) !== eraseAttr.fg || newLine.getBg(0) !== eraseAttr.bg) {
            newLine = this.buffer.getBlankLine(eraseAttr, isWrapped);
            this._blankLine = newLine;
        }
        newLine.isWrapped = isWrapped;
        var topRow = this.buffer.ybase + this.buffer.scrollTop;
        var bottomRow = this.buffer.ybase + this.buffer.scrollBottom;
        if (this.buffer.scrollTop === 0) {
            var willBufferBeTrimmed = this.buffer.lines.isFull;
            if (bottomRow === this.buffer.lines.length - 1) {
                if (willBufferBeTrimmed) {
                    this.buffer.lines.recycle().copyFrom(newLine);
                }
                else {
                    this.buffer.lines.push(newLine.clone());
                }
            }
            else {
                this.buffer.lines.splice(bottomRow + 1, 0, newLine.clone());
            }
            if (!willBufferBeTrimmed) {
                this.buffer.ybase++;
                if (!this._userScrolling) {
                    this.buffer.ydisp++;
                }
            }
            else {
                if (this._userScrolling) {
                    this.buffer.ydisp = Math.max(this.buffer.ydisp - 1, 0);
                }
            }
        }
        else {
            var scrollRegionHeight = bottomRow - topRow + 1;
            this.buffer.lines.shiftElements(topRow + 1, scrollRegionHeight - 1, -1);
            this.buffer.lines.set(bottomRow, newLine.clone());
        }
        if (!this._userScrolling) {
            this.buffer.ydisp = this.buffer.ybase;
        }
        this._dirtyRowService.markRangeDirty(this.buffer.scrollTop, this.buffer.scrollBottom);
        this._onScroll.fire(this.buffer.ydisp);
    };
    Terminal.prototype.scrollLines = function (disp, suppressScrollEvent) {
        if (disp < 0) {
            if (this.buffer.ydisp === 0) {
                return;
            }
            this._userScrolling = true;
        }
        else if (disp + this.buffer.ydisp >= this.buffer.ybase) {
            this._userScrolling = false;
        }
        var oldYdisp = this.buffer.ydisp;
        this.buffer.ydisp = Math.max(Math.min(this.buffer.ydisp + disp, this.buffer.ybase), 0);
        if (oldYdisp === this.buffer.ydisp) {
            return;
        }
        if (!suppressScrollEvent) {
            this._onScroll.fire(this.buffer.ydisp);
        }
        this.refresh(0, this.rows - 1);
    };
    Terminal.prototype.scrollPages = function (pageCount) {
        this.scrollLines(pageCount * (this.rows - 1));
    };
    Terminal.prototype.scrollToTop = function () {
        this.scrollLines(-this.buffer.ydisp);
    };
    Terminal.prototype.scrollToBottom = function () {
        this.scrollLines(this.buffer.ybase - this.buffer.ydisp);
    };
    Terminal.prototype.scrollToLine = function (line) {
        var scrollAmount = line - this.buffer.ydisp;
        if (scrollAmount !== 0) {
            this.scrollLines(scrollAmount);
        }
    };
    Terminal.prototype.paste = function (data) {
        Clipboard_1.paste(data, this.textarea, this.bracketedPasteMode, this._coreService);
    };
    Terminal.prototype.attachCustomKeyEventHandler = function (customKeyEventHandler) {
        this._customKeyEventHandler = customKeyEventHandler;
    };
    Terminal.prototype.addEscHandler = function (id, callback) {
        return this._inputHandler.addEscHandler(id, callback);
    };
    Terminal.prototype.addDcsHandler = function (id, callback) {
        return this._inputHandler.addDcsHandler(id, callback);
    };
    Terminal.prototype.addCsiHandler = function (id, callback) {
        return this._inputHandler.addCsiHandler(id, callback);
    };
    Terminal.prototype.addOscHandler = function (ident, callback) {
        return this._inputHandler.addOscHandler(ident, callback);
    };
    Terminal.prototype.registerLinkMatcher = function (regex, handler, options) {
        var matcherId = this.linkifier.registerLinkMatcher(regex, handler, options);
        this.refresh(0, this.rows - 1);
        return matcherId;
    };
    Terminal.prototype.deregisterLinkMatcher = function (matcherId) {
        if (this.linkifier.deregisterLinkMatcher(matcherId)) {
            this.refresh(0, this.rows - 1);
        }
    };
    Terminal.prototype.registerCharacterJoiner = function (handler) {
        var joinerId = this._renderService.registerCharacterJoiner(handler);
        this.refresh(0, this.rows - 1);
        return joinerId;
    };
    Terminal.prototype.deregisterCharacterJoiner = function (joinerId) {
        if (this._renderService.deregisterCharacterJoiner(joinerId)) {
            this.refresh(0, this.rows - 1);
        }
    };
    Object.defineProperty(Terminal.prototype, "markers", {
        get: function () {
            return this.buffer.markers;
        },
        enumerable: true,
        configurable: true
    });
    Terminal.prototype.addMarker = function (cursorYOffset) {
        if (this.buffer !== this.buffers.normal) {
            return;
        }
        return this.buffer.addMarker(this.buffer.ybase + this.buffer.y + cursorYOffset);
    };
    Terminal.prototype.hasSelection = function () {
        return this._selectionService ? this._selectionService.hasSelection : false;
    };
    Terminal.prototype.select = function (column, row, length) {
        this._selectionService.setSelection(column, row, length);
    };
    Terminal.prototype.getSelection = function () {
        return this._selectionService ? this._selectionService.selectionText : '';
    };
    Terminal.prototype.getSelectionPosition = function () {
        if (!this._selectionService.hasSelection) {
            return undefined;
        }
        return {
            startColumn: this._selectionService.selectionStart[0],
            startRow: this._selectionService.selectionStart[1],
            endColumn: this._selectionService.selectionEnd[0],
            endRow: this._selectionService.selectionEnd[1]
        };
    };
    Terminal.prototype.clearSelection = function () {
        if (this._selectionService) {
            this._selectionService.clearSelection();
        }
    };
    Terminal.prototype.selectAll = function () {
        if (this._selectionService) {
            this._selectionService.selectAll();
        }
    };
    Terminal.prototype.selectLines = function (start, end) {
        if (this._selectionService) {
            this._selectionService.selectLines(start, end);
        }
    };
    Terminal.prototype._keyDown = function (event) {
        this._keyDownHandled = false;
        if (this._customKeyEventHandler && this._customKeyEventHandler(event) === false) {
            return false;
        }
        if (!this._compositionHelper.keydown(event)) {
            if (this.buffer.ybase !== this.buffer.ydisp) {
                this.scrollToBottom();
            }
            return false;
        }
        var result = Keyboard_1.evaluateKeyboardEvent(event, this._coreService.decPrivateModes.applicationCursorKeys, this.browser.isMac, this.options.macOptionIsMeta);
        this.updateCursorStyle(event);
        if (result.type === 3 || result.type === 2) {
            var scrollCount = this.rows - 1;
            this.scrollLines(result.type === 2 ? -scrollCount : scrollCount);
            return this.cancel(event, true);
        }
        if (result.type === 1) {
            this.selectAll();
        }
        if (this._isThirdLevelShift(this.browser, event)) {
            return true;
        }
        if (result.cancel) {
            this.cancel(event, true);
        }
        if (!result.key) {
            return true;
        }
        if (result.key === EscapeSequences_1.C0.ETX || result.key === EscapeSequences_1.C0.CR) {
            this.textarea.value = '';
        }
        this._onKey.fire({ key: result.key, domEvent: event });
        this.showCursor();
        this._coreService.triggerDataEvent(result.key, true);
        if (!this.optionsService.options.screenReaderMode) {
            return this.cancel(event, true);
        }
        this._keyDownHandled = true;
    };
    Terminal.prototype._isThirdLevelShift = function (browser, ev) {
        var thirdLevelKey = (browser.isMac && !this.options.macOptionIsMeta && ev.altKey && !ev.ctrlKey && !ev.metaKey) ||
            (browser.isWindows && ev.altKey && ev.ctrlKey && !ev.metaKey);
        if (ev.type === 'keypress') {
            return thirdLevelKey;
        }
        return thirdLevelKey && (!ev.keyCode || ev.keyCode > 47);
    };
    Terminal.prototype.setgLevel = function (g) {
        this.glevel = g;
        this.charset = this.charsets[g];
    };
    Terminal.prototype.setgCharset = function (g, charset) {
        this.charsets[g] = charset;
        if (this.glevel === g) {
            this.charset = charset;
        }
    };
    Terminal.prototype._keyUp = function (ev) {
        if (this._customKeyEventHandler && this._customKeyEventHandler(ev) === false) {
            return;
        }
        if (!wasModifierKeyOnlyEvent(ev)) {
            this.focus();
        }
        this.updateCursorStyle(ev);
    };
    Terminal.prototype._keyPress = function (ev) {
        var key;
        if (this._keyDownHandled) {
            return false;
        }
        if (this._customKeyEventHandler && this._customKeyEventHandler(ev) === false) {
            return false;
        }
        this.cancel(ev);
        if (ev.charCode) {
            key = ev.charCode;
        }
        else if (ev.which === null || ev.which === undefined) {
            key = ev.keyCode;
        }
        else if (ev.which !== 0 && ev.charCode !== 0) {
            key = ev.which;
        }
        else {
            return false;
        }
        if (!key || ((ev.altKey || ev.ctrlKey || ev.metaKey) && !this._isThirdLevelShift(this.browser, ev))) {
            return false;
        }
        key = String.fromCharCode(key);
        this._onKey.fire({ key: key, domEvent: ev });
        this.showCursor();
        this._coreService.triggerDataEvent(key, true);
        return true;
    };
    Terminal.prototype.bell = function () {
        var _this = this;
        if (this._soundBell()) {
            this._soundService.playBellSound();
        }
        if (this._visualBell()) {
            this.element.classList.add('visual-bell-active');
            clearTimeout(this._visualBellTimer);
            this._visualBellTimer = window.setTimeout(function () {
                _this.element.classList.remove('visual-bell-active');
            }, 200);
        }
    };
    Terminal.prototype.resize = function (x, y) {
        if (isNaN(x) || isNaN(y)) {
            return;
        }
        if (x === this.cols && y === this.rows) {
            if (this._charSizeService && !this._charSizeService.hasValidSize) {
                this._charSizeService.measure();
            }
            return;
        }
        if (x < BufferService_1.MINIMUM_COLS)
            x = BufferService_1.MINIMUM_COLS;
        if (y < BufferService_1.MINIMUM_ROWS)
            y = BufferService_1.MINIMUM_ROWS;
        this.buffers.resize(x, y);
        this._bufferService.resize(x, y);
        this.buffers.setupTabStops(this.cols);
        if (this._charSizeService) {
            this._charSizeService.measure();
        }
        this.viewport.syncScrollArea(true);
        this.refresh(0, this.rows - 1);
        this._onResize.fire({ cols: x, rows: y });
    };
    Terminal.prototype.clear = function () {
        if (this.buffer.ybase === 0 && this.buffer.y === 0) {
            return;
        }
        this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y));
        this.buffer.lines.length = 1;
        this.buffer.ydisp = 0;
        this.buffer.ybase = 0;
        this.buffer.y = 0;
        for (var i = 1; i < this.rows; i++) {
            this.buffer.lines.push(this.buffer.getBlankLine(BufferLine_1.DEFAULT_ATTR_DATA));
        }
        this.refresh(0, this.rows - 1);
        this._onScroll.fire(this.buffer.ydisp);
    };
    Terminal.prototype.is = function (term) {
        return (this.options.termName + '').indexOf(term) === 0;
    };
    Terminal.prototype.handleTitle = function (title) {
        this._onTitleChange.fire(title);
    };
    Terminal.prototype.reset = function () {
        this.options.rows = this.rows;
        this.options.cols = this.cols;
        var customKeyEventHandler = this._customKeyEventHandler;
        var inputHandler = this._inputHandler;
        var cursorState = this.cursorState;
        var userScrolling = this._userScrolling;
        this._setup();
        this._bufferService.reset();
        this._coreService.reset();
        this._coreMouseService.reset();
        if (this._selectionService) {
            this._selectionService.reset();
        }
        this._customKeyEventHandler = customKeyEventHandler;
        this._inputHandler = inputHandler;
        this.cursorState = cursorState;
        this._userScrolling = userScrolling;
        this.refresh(0, this.rows - 1);
        if (this.viewport) {
            this.viewport.syncScrollArea();
        }
    };
    Terminal.prototype.cancel = function (ev, force) {
        if (!this.options.cancelEvents && !force) {
            return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    };
    Terminal.prototype._visualBell = function () {
        return false;
    };
    Terminal.prototype._soundBell = function () {
        return this.options.bellStyle === 'sound';
    };
    Terminal.prototype.write = function (data, callback) {
        this._writeBuffer.write(data, callback);
    };
    Terminal.prototype.writeSync = function (data) {
        this._writeBuffer.writeSync(data);
    };
    return Terminal;
}(Lifecycle_2.Disposable));
exports.Terminal = Terminal;
function wasModifierKeyOnlyEvent(ev) {
    return ev.keyCode === 16 ||
        ev.keyCode === 17 ||
        ev.keyCode === 18;
}


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Services_1 = __webpack_require__(5);
var Services_2 = __webpack_require__(0);
var CompositionHelper = (function () {
    function CompositionHelper(_textarea, _compositionView, _bufferService, _optionsService, _charSizeService, _coreService) {
        this._textarea = _textarea;
        this._compositionView = _compositionView;
        this._bufferService = _bufferService;
        this._optionsService = _optionsService;
        this._charSizeService = _charSizeService;
        this._coreService = _coreService;
        this._isComposing = false;
        this._isSendingComposition = false;
        this._compositionPosition = { start: 0, end: 0 };
    }
    CompositionHelper.prototype.compositionstart = function () {
        this._isComposing = true;
        this._compositionPosition.start = this._textarea.value.length;
        this._compositionView.textContent = '';
        this._compositionView.classList.add('active');
    };
    CompositionHelper.prototype.compositionupdate = function (ev) {
        var _this = this;
        this._compositionView.textContent = ev.data;
        this.updateCompositionElements();
        setTimeout(function () {
            _this._compositionPosition.end = _this._textarea.value.length;
        }, 0);
    };
    CompositionHelper.prototype.compositionend = function () {
        this._finalizeComposition(true);
    };
    CompositionHelper.prototype.keydown = function (ev) {
        if (this._isComposing || this._isSendingComposition) {
            if (ev.keyCode === 229) {
                return false;
            }
            else if (ev.keyCode === 16 || ev.keyCode === 17 || ev.keyCode === 18) {
                return false;
            }
            this._finalizeComposition(false);
        }
        if (ev.keyCode === 229) {
            this._handleAnyTextareaChanges();
            return false;
        }
        return true;
    };
    CompositionHelper.prototype._finalizeComposition = function (waitForPropagation) {
        var _this = this;
        this._compositionView.classList.remove('active');
        this._isComposing = false;
        this._clearTextareaPosition();
        if (!waitForPropagation) {
            this._isSendingComposition = false;
            var input = this._textarea.value.substring(this._compositionPosition.start, this._compositionPosition.end);
            this._coreService.triggerDataEvent(input, true);
        }
        else {
            var currentCompositionPosition_1 = {
                start: this._compositionPosition.start,
                end: this._compositionPosition.end
            };
            this._isSendingComposition = true;
            setTimeout(function () {
                if (_this._isSendingComposition) {
                    _this._isSendingComposition = false;
                    var input = void 0;
                    if (_this._isComposing) {
                        input = _this._textarea.value.substring(currentCompositionPosition_1.start, currentCompositionPosition_1.end);
                    }
                    else {
                        input = _this._textarea.value.substring(currentCompositionPosition_1.start);
                    }
                    _this._coreService.triggerDataEvent(input, true);
                }
            }, 0);
        }
    };
    CompositionHelper.prototype._handleAnyTextareaChanges = function () {
        var _this = this;
        var oldValue = this._textarea.value;
        setTimeout(function () {
            if (!_this._isComposing) {
                var newValue = _this._textarea.value;
                var diff = newValue.replace(oldValue, '');
                if (diff.length > 0) {
                    _this._coreService.triggerDataEvent(diff, true);
                }
            }
        }, 0);
    };
    CompositionHelper.prototype.updateCompositionElements = function (dontRecurse) {
        var _this = this;
        if (!this._isComposing) {
            return;
        }
        if (this._bufferService.buffer.isCursorInViewport) {
            var cellHeight = Math.ceil(this._charSizeService.height * this._optionsService.options.lineHeight);
            var cursorTop = this._bufferService.buffer.y * cellHeight;
            var cursorLeft = this._bufferService.buffer.x * this._charSizeService.width;
            this._compositionView.style.left = cursorLeft + 'px';
            this._compositionView.style.top = cursorTop + 'px';
            this._compositionView.style.height = cellHeight + 'px';
            this._compositionView.style.lineHeight = cellHeight + 'px';
            this._compositionView.style.fontFamily = this._optionsService.options.fontFamily;
            this._compositionView.style.fontSize = this._optionsService.options.fontSize + 'px';
            var compositionViewBounds = this._compositionView.getBoundingClientRect();
            this._textarea.style.left = cursorLeft + 'px';
            this._textarea.style.top = cursorTop + 'px';
            this._textarea.style.width = compositionViewBounds.width + 'px';
            this._textarea.style.height = compositionViewBounds.height + 'px';
            this._textarea.style.lineHeight = compositionViewBounds.height + 'px';
        }
        if (!dontRecurse) {
            setTimeout(function () { return _this.updateCompositionElements(true); }, 0);
        }
    };
    CompositionHelper.prototype._clearTextareaPosition = function () {
        this._textarea.style.left = '';
        this._textarea.style.top = '';
    };
    CompositionHelper = __decorate([
        __param(2, Services_2.IBufferService),
        __param(3, Services_2.IOptionsService),
        __param(4, Services_1.ICharSizeService),
        __param(5, Services_2.ICoreService)
    ], CompositionHelper);
    return CompositionHelper;
}());
exports.CompositionHelper = CompositionHelper;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Lifecycle_1 = __webpack_require__(2);
var Lifecycle_2 = __webpack_require__(7);
var Services_1 = __webpack_require__(5);
var Services_2 = __webpack_require__(0);
var FALLBACK_SCROLL_BAR_WIDTH = 15;
var Viewport = (function (_super) {
    __extends(Viewport, _super);
    function Viewport(_scrollLines, _viewportElement, _scrollArea, _bufferService, _optionsService, _charSizeService, _renderService) {
        var _this = _super.call(this) || this;
        _this._scrollLines = _scrollLines;
        _this._viewportElement = _viewportElement;
        _this._scrollArea = _scrollArea;
        _this._bufferService = _bufferService;
        _this._optionsService = _optionsService;
        _this._charSizeService = _charSizeService;
        _this._renderService = _renderService;
        _this.scrollBarWidth = 0;
        _this._currentRowHeight = 0;
        _this._lastRecordedBufferLength = 0;
        _this._lastRecordedViewportHeight = 0;
        _this._lastRecordedBufferHeight = 0;
        _this._lastTouchY = 0;
        _this._lastScrollTop = 0;
        _this._wheelPartialScroll = 0;
        _this._refreshAnimationFrame = null;
        _this._ignoreNextScrollEvent = false;
        _this.scrollBarWidth = (_this._viewportElement.offsetWidth - _this._scrollArea.offsetWidth) || FALLBACK_SCROLL_BAR_WIDTH;
        _this.register(Lifecycle_2.addDisposableDomListener(_this._viewportElement, 'scroll', _this._onScroll.bind(_this)));
        setTimeout(function () { return _this.syncScrollArea(); }, 0);
        return _this;
    }
    Viewport.prototype.onThemeChange = function (colors) {
        this._viewportElement.style.backgroundColor = colors.background.css;
    };
    Viewport.prototype._refresh = function (immediate) {
        var _this = this;
        if (immediate) {
            this._innerRefresh();
            if (this._refreshAnimationFrame !== null) {
                cancelAnimationFrame(this._refreshAnimationFrame);
            }
            return;
        }
        if (this._refreshAnimationFrame === null) {
            this._refreshAnimationFrame = requestAnimationFrame(function () { return _this._innerRefresh(); });
        }
    };
    Viewport.prototype._innerRefresh = function () {
        if (this._charSizeService.height > 0) {
            this._currentRowHeight = this._renderService.dimensions.scaledCellHeight / window.devicePixelRatio;
            this._lastRecordedViewportHeight = this._viewportElement.offsetHeight;
            var newBufferHeight = Math.round(this._currentRowHeight * this._lastRecordedBufferLength) + (this._lastRecordedViewportHeight - this._renderService.dimensions.canvasHeight);
            if (this._lastRecordedBufferHeight !== newBufferHeight) {
                this._lastRecordedBufferHeight = newBufferHeight;
                this._scrollArea.style.height = this._lastRecordedBufferHeight + 'px';
            }
        }
        var scrollTop = this._bufferService.buffer.ydisp * this._currentRowHeight;
        if (this._viewportElement.scrollTop !== scrollTop) {
            this._ignoreNextScrollEvent = true;
            this._viewportElement.scrollTop = scrollTop;
        }
        this._refreshAnimationFrame = null;
    };
    Viewport.prototype.syncScrollArea = function (immediate) {
        if (immediate === void 0) { immediate = false; }
        if (this._lastRecordedBufferLength !== this._bufferService.buffer.lines.length) {
            this._lastRecordedBufferLength = this._bufferService.buffer.lines.length;
            this._refresh(immediate);
            return;
        }
        if (this._lastRecordedViewportHeight !== this._renderService.dimensions.canvasHeight) {
            this._refresh(immediate);
            return;
        }
        var newScrollTop = this._bufferService.buffer.ydisp * this._currentRowHeight;
        if (this._lastScrollTop !== newScrollTop) {
            this._refresh(immediate);
            return;
        }
        if (this._lastScrollTop !== this._viewportElement.scrollTop) {
            this._refresh(immediate);
            return;
        }
        if (this._renderService.dimensions.scaledCellHeight / window.devicePixelRatio !== this._currentRowHeight) {
            this._refresh(immediate);
            return;
        }
    };
    Viewport.prototype._onScroll = function (ev) {
        this._lastScrollTop = this._viewportElement.scrollTop;
        if (!this._viewportElement.offsetParent) {
            return;
        }
        if (this._ignoreNextScrollEvent) {
            this._ignoreNextScrollEvent = false;
            return;
        }
        var newRow = Math.round(this._lastScrollTop / this._currentRowHeight);
        var diff = newRow - this._bufferService.buffer.ydisp;
        this._scrollLines(diff, true);
    };
    Viewport.prototype._bubbleScroll = function (ev, amount) {
        var scrollPosFromTop = this._viewportElement.scrollTop + this._lastRecordedViewportHeight;
        if ((amount < 0 && this._viewportElement.scrollTop !== 0) ||
            (amount > 0 && scrollPosFromTop < this._lastRecordedBufferHeight)) {
            if (ev.cancelable) {
                ev.preventDefault();
            }
            return false;
        }
        return true;
    };
    Viewport.prototype.onWheel = function (ev) {
        var amount = this._getPixelsScrolled(ev);
        if (amount === 0) {
            return false;
        }
        this._viewportElement.scrollTop += amount;
        return this._bubbleScroll(ev, amount);
    };
    Viewport.prototype._getPixelsScrolled = function (ev) {
        if (ev.deltaY === 0) {
            return 0;
        }
        var amount = this._applyScrollModifier(ev.deltaY, ev);
        if (ev.deltaMode === WheelEvent.DOM_DELTA_LINE) {
            amount *= this._currentRowHeight;
        }
        else if (ev.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            amount *= this._currentRowHeight * this._bufferService.rows;
        }
        return amount;
    };
    Viewport.prototype.getLinesScrolled = function (ev) {
        if (ev.deltaY === 0) {
            return 0;
        }
        var amount = this._applyScrollModifier(ev.deltaY, ev);
        if (ev.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
            amount /= this._currentRowHeight + 0.0;
            this._wheelPartialScroll += amount;
            amount = Math.floor(Math.abs(this._wheelPartialScroll)) * (this._wheelPartialScroll > 0 ? 1 : -1);
            this._wheelPartialScroll %= 1;
        }
        else if (ev.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            amount *= this._bufferService.rows;
        }
        return amount;
    };
    Viewport.prototype._applyScrollModifier = function (amount, ev) {
        var modifier = this._optionsService.options.fastScrollModifier;
        if ((modifier === 'alt' && ev.altKey) ||
            (modifier === 'ctrl' && ev.ctrlKey) ||
            (modifier === 'shift' && ev.shiftKey)) {
            return amount * this._optionsService.options.fastScrollSensitivity * this._optionsService.options.scrollSensitivity;
        }
        return amount * this._optionsService.options.scrollSensitivity;
    };
    Viewport.prototype.onTouchStart = function (ev) {
        this._lastTouchY = ev.touches[0].pageY;
    };
    Viewport.prototype.onTouchMove = function (ev) {
        var deltaY = this._lastTouchY - ev.touches[0].pageY;
        this._lastTouchY = ev.touches[0].pageY;
        if (deltaY === 0) {
            return false;
        }
        this._viewportElement.scrollTop += deltaY;
        return this._bubbleScroll(ev, deltaY);
    };
    Viewport = __decorate([
        __param(3, Services_2.IBufferService),
        __param(4, Services_2.IOptionsService),
        __param(5, Services_1.ICharSizeService),
        __param(6, Services_1.IRenderService)
    ], Viewport);
    return Viewport;
}(Lifecycle_1.Disposable));
exports.Viewport = Viewport;


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function prepareTextForTerminal(text) {
    return text.replace(/\r?\n/g, '\r');
}
exports.prepareTextForTerminal = prepareTextForTerminal;
function bracketTextForPaste(text, bracketedPasteMode) {
    if (bracketedPasteMode) {
        return '\x1b[200~' + text + '\x1b[201~';
    }
    return text;
}
exports.bracketTextForPaste = bracketTextForPaste;
function copyHandler(ev, selectionService) {
    if (ev.clipboardData) {
        ev.clipboardData.setData('text/plain', selectionService.selectionText);
    }
    ev.preventDefault();
}
exports.copyHandler = copyHandler;
function handlePasteEvent(ev, textarea, bracketedPasteMode, coreService) {
    ev.stopPropagation();
    if (ev.clipboardData) {
        var text = ev.clipboardData.getData('text/plain');
        paste(text, textarea, bracketedPasteMode, coreService);
    }
}
exports.handlePasteEvent = handlePasteEvent;
function paste(text, textarea, bracketedPasteMode, coreService) {
    text = prepareTextForTerminal(text);
    text = bracketTextForPaste(text, bracketedPasteMode);
    coreService.triggerDataEvent(text, true);
    textarea.value = '';
}
exports.paste = paste;
function moveTextAreaUnderMouseCursor(ev, textarea, screenElement) {
    var pos = screenElement.getBoundingClientRect();
    var left = ev.clientX - pos.left - 10;
    var top = ev.clientY - pos.top - 10;
    textarea.style.position = 'absolute';
    textarea.style.width = '20px';
    textarea.style.height = '20px';
    textarea.style.left = left + "px";
    textarea.style.top = top + "px";
    textarea.style.zIndex = '1000';
    textarea.focus();
    setTimeout(function () {
        textarea.style.position = null;
        textarea.style.width = null;
        textarea.style.height = null;
        textarea.style.left = null;
        textarea.style.top = null;
        textarea.style.zIndex = null;
    }, 200);
}
exports.moveTextAreaUnderMouseCursor = moveTextAreaUnderMouseCursor;
function rightClickHandler(ev, textarea, screenElement, selectionService, shouldSelectWord) {
    moveTextAreaUnderMouseCursor(ev, textarea, screenElement);
    if (shouldSelectWord && !selectionService.isClickInSelection(ev)) {
        selectionService.selectWordAtCursor(ev);
    }
    textarea.value = selectionService.selectionText;
    textarea.select();
}
exports.rightClickHandler = rightClickHandler;


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EscapeSequences_1 = __webpack_require__(11);
var Charsets_1 = __webpack_require__(17);
var CharWidth_1 = __webpack_require__(18);
var EscapeSequenceParser_1 = __webpack_require__(38);
var Lifecycle_1 = __webpack_require__(2);
var TypedArrayUtils_1 = __webpack_require__(14);
var TextDecoder_1 = __webpack_require__(8);
var BufferLine_1 = __webpack_require__(15);
var EventEmitter_1 = __webpack_require__(1);
var Constants_1 = __webpack_require__(3);
var CellData_1 = __webpack_require__(4);
var AttributeData_1 = __webpack_require__(6);
var OscParser_1 = __webpack_require__(20);
var DcsParser_1 = __webpack_require__(22);
var GLEVEL = { '(': 0, ')': 1, '*': 2, '+': 3, '-': 1, '.': 2 };
var MAX_PARSEBUFFER_LENGTH = 131072;
var DECRQSS = (function () {
    function DECRQSS(_bufferService, _coreService, _logService, _optionsService) {
        this._bufferService = _bufferService;
        this._coreService = _coreService;
        this._logService = _logService;
        this._optionsService = _optionsService;
        this._data = new Uint32Array(0);
    }
    DECRQSS.prototype.hook = function (params) {
        this._data = new Uint32Array(0);
    };
    DECRQSS.prototype.put = function (data, start, end) {
        this._data = TypedArrayUtils_1.concat(this._data, data.subarray(start, end));
    };
    DECRQSS.prototype.unhook = function (success) {
        if (!success) {
            this._data = new Uint32Array(0);
            return;
        }
        var data = TextDecoder_1.utf32ToString(this._data);
        this._data = new Uint32Array(0);
        switch (data) {
            case '"q':
                return this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "P1$r0\"q" + EscapeSequences_1.C0.ESC + "\\");
            case '"p':
                return this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "P1$r61\"p" + EscapeSequences_1.C0.ESC + "\\");
            case 'r':
                var pt = '' + (this._bufferService.buffer.scrollTop + 1) +
                    ';' + (this._bufferService.buffer.scrollBottom + 1) + 'r';
                return this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "P1$r" + pt + EscapeSequences_1.C0.ESC + "\\");
            case 'm':
                return this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "P1$r0m" + EscapeSequences_1.C0.ESC + "\\");
            case ' q':
                var STYLES = { 'block': 2, 'underline': 4, 'bar': 6 };
                var style = STYLES[this._optionsService.options.cursorStyle];
                style -= this._optionsService.options.cursorBlink ? 1 : 0;
                return this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "P1$r" + style + " q" + EscapeSequences_1.C0.ESC + "\\");
            default:
                this._logService.debug('Unknown DCS $q %s', data);
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "P0$r" + EscapeSequences_1.C0.ESC + "\\");
        }
    };
    return DECRQSS;
}());
var InputHandler = (function (_super) {
    __extends(InputHandler, _super);
    function InputHandler(_terminal, _bufferService, _coreService, _dirtyRowService, _logService, _optionsService, _coreMouseService, _parser) {
        if (_parser === void 0) { _parser = new EscapeSequenceParser_1.EscapeSequenceParser(); }
        var _this = _super.call(this) || this;
        _this._terminal = _terminal;
        _this._bufferService = _bufferService;
        _this._coreService = _coreService;
        _this._dirtyRowService = _dirtyRowService;
        _this._logService = _logService;
        _this._optionsService = _optionsService;
        _this._coreMouseService = _coreMouseService;
        _this._parser = _parser;
        _this._parseBuffer = new Uint32Array(4096);
        _this._stringDecoder = new TextDecoder_1.StringToUtf32();
        _this._utf8Decoder = new TextDecoder_1.Utf8ToUtf32();
        _this._workCell = new CellData_1.CellData();
        _this._onCursorMove = new EventEmitter_1.EventEmitter();
        _this._onLineFeed = new EventEmitter_1.EventEmitter();
        _this._onScroll = new EventEmitter_1.EventEmitter();
        _this.register(_this._parser);
        _this._parser.setCsiHandlerFallback(function (ident, params) {
            _this._logService.debug('Unknown CSI code: ', { identifier: _this._parser.identToString(ident), params: params.toArray() });
        });
        _this._parser.setEscHandlerFallback(function (ident) {
            _this._logService.debug('Unknown ESC code: ', { identifier: _this._parser.identToString(ident) });
        });
        _this._parser.setExecuteHandlerFallback(function (code) {
            _this._logService.debug('Unknown EXECUTE code: ', { code: code });
        });
        _this._parser.setOscHandlerFallback(function (identifier, action, data) {
            _this._logService.debug('Unknown OSC code: ', { identifier: identifier, action: action, data: data });
        });
        _this._parser.setDcsHandlerFallback(function (ident, action, payload) {
            if (action === 'HOOK') {
                payload = payload.toArray();
            }
            _this._logService.debug('Unknown DCS code: ', { identifier: _this._parser.identToString(ident), action: action, payload: payload });
        });
        _this._parser.setPrintHandler(function (data, start, end) { return _this.print(data, start, end); });
        _this._parser.setCsiHandler({ final: '@' }, function (params) { return _this.insertChars(params); });
        _this._parser.setCsiHandler({ intermediates: ' ', final: '@' }, function (params) { return _this.scrollLeft(params); });
        _this._parser.setCsiHandler({ final: 'A' }, function (params) { return _this.cursorUp(params); });
        _this._parser.setCsiHandler({ intermediates: ' ', final: 'A' }, function (params) { return _this.scrollRight(params); });
        _this._parser.setCsiHandler({ final: 'B' }, function (params) { return _this.cursorDown(params); });
        _this._parser.setCsiHandler({ final: 'C' }, function (params) { return _this.cursorForward(params); });
        _this._parser.setCsiHandler({ final: 'D' }, function (params) { return _this.cursorBackward(params); });
        _this._parser.setCsiHandler({ final: 'E' }, function (params) { return _this.cursorNextLine(params); });
        _this._parser.setCsiHandler({ final: 'F' }, function (params) { return _this.cursorPrecedingLine(params); });
        _this._parser.setCsiHandler({ final: 'G' }, function (params) { return _this.cursorCharAbsolute(params); });
        _this._parser.setCsiHandler({ final: 'H' }, function (params) { return _this.cursorPosition(params); });
        _this._parser.setCsiHandler({ final: 'I' }, function (params) { return _this.cursorForwardTab(params); });
        _this._parser.setCsiHandler({ final: 'J' }, function (params) { return _this.eraseInDisplay(params); });
        _this._parser.setCsiHandler({ prefix: '?', final: 'J' }, function (params) { return _this.eraseInDisplay(params); });
        _this._parser.setCsiHandler({ final: 'K' }, function (params) { return _this.eraseInLine(params); });
        _this._parser.setCsiHandler({ prefix: '?', final: 'K' }, function (params) { return _this.eraseInLine(params); });
        _this._parser.setCsiHandler({ final: 'L' }, function (params) { return _this.insertLines(params); });
        _this._parser.setCsiHandler({ final: 'M' }, function (params) { return _this.deleteLines(params); });
        _this._parser.setCsiHandler({ final: 'P' }, function (params) { return _this.deleteChars(params); });
        _this._parser.setCsiHandler({ final: 'S' }, function (params) { return _this.scrollUp(params); });
        _this._parser.setCsiHandler({ final: 'T' }, function (params) { return _this.scrollDown(params); });
        _this._parser.setCsiHandler({ final: 'X' }, function (params) { return _this.eraseChars(params); });
        _this._parser.setCsiHandler({ final: 'Z' }, function (params) { return _this.cursorBackwardTab(params); });
        _this._parser.setCsiHandler({ final: '`' }, function (params) { return _this.charPosAbsolute(params); });
        _this._parser.setCsiHandler({ final: 'a' }, function (params) { return _this.hPositionRelative(params); });
        _this._parser.setCsiHandler({ final: 'b' }, function (params) { return _this.repeatPrecedingCharacter(params); });
        _this._parser.setCsiHandler({ final: 'c' }, function (params) { return _this.sendDeviceAttributesPrimary(params); });
        _this._parser.setCsiHandler({ prefix: '>', final: 'c' }, function (params) { return _this.sendDeviceAttributesSecondary(params); });
        _this._parser.setCsiHandler({ final: 'd' }, function (params) { return _this.linePosAbsolute(params); });
        _this._parser.setCsiHandler({ final: 'e' }, function (params) { return _this.vPositionRelative(params); });
        _this._parser.setCsiHandler({ final: 'f' }, function (params) { return _this.hVPosition(params); });
        _this._parser.setCsiHandler({ final: 'g' }, function (params) { return _this.tabClear(params); });
        _this._parser.setCsiHandler({ final: 'h' }, function (params) { return _this.setMode(params); });
        _this._parser.setCsiHandler({ prefix: '?', final: 'h' }, function (params) { return _this.setModePrivate(params); });
        _this._parser.setCsiHandler({ final: 'l' }, function (params) { return _this.resetMode(params); });
        _this._parser.setCsiHandler({ prefix: '?', final: 'l' }, function (params) { return _this.resetModePrivate(params); });
        _this._parser.setCsiHandler({ final: 'm' }, function (params) { return _this.charAttributes(params); });
        _this._parser.setCsiHandler({ final: 'n' }, function (params) { return _this.deviceStatus(params); });
        _this._parser.setCsiHandler({ prefix: '?', final: 'n' }, function (params) { return _this.deviceStatusPrivate(params); });
        _this._parser.setCsiHandler({ intermediates: '!', final: 'p' }, function (params) { return _this.softReset(params); });
        _this._parser.setCsiHandler({ intermediates: ' ', final: 'q' }, function (params) { return _this.setCursorStyle(params); });
        _this._parser.setCsiHandler({ final: 'r' }, function (params) { return _this.setScrollRegion(params); });
        _this._parser.setCsiHandler({ final: 's' }, function (params) { return _this.saveCursor(params); });
        _this._parser.setCsiHandler({ final: 'u' }, function (params) { return _this.restoreCursor(params); });
        _this._parser.setCsiHandler({ intermediates: '\'', final: '}' }, function (params) { return _this.insertColumns(params); });
        _this._parser.setCsiHandler({ intermediates: '\'', final: '~' }, function (params) { return _this.deleteColumns(params); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.BEL, function () { return _this.bell(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.LF, function () { return _this.lineFeed(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.VT, function () { return _this.lineFeed(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.FF, function () { return _this.lineFeed(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.CR, function () { return _this.carriageReturn(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.BS, function () { return _this.backspace(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.HT, function () { return _this.tab(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.SO, function () { return _this.shiftOut(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.SI, function () { return _this.shiftIn(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C1.IND, function () { return _this.index(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C1.NEL, function () { return _this.nextLine(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C1.HTS, function () { return _this.tabSet(); });
        _this._parser.setOscHandler(0, new OscParser_1.OscHandler(function (data) { return _this.setTitle(data); }));
        _this._parser.setOscHandler(2, new OscParser_1.OscHandler(function (data) { return _this.setTitle(data); }));
        _this._parser.setEscHandler({ final: '7' }, function () { return _this.saveCursor(); });
        _this._parser.setEscHandler({ final: '8' }, function () { return _this.restoreCursor(); });
        _this._parser.setEscHandler({ final: 'D' }, function () { return _this.index(); });
        _this._parser.setEscHandler({ final: 'E' }, function () { return _this.nextLine(); });
        _this._parser.setEscHandler({ final: 'H' }, function () { return _this.tabSet(); });
        _this._parser.setEscHandler({ final: 'M' }, function () { return _this.reverseIndex(); });
        _this._parser.setEscHandler({ final: '=' }, function () { return _this.keypadApplicationMode(); });
        _this._parser.setEscHandler({ final: '>' }, function () { return _this.keypadNumericMode(); });
        _this._parser.setEscHandler({ final: 'c' }, function () { return _this.reset(); });
        _this._parser.setEscHandler({ final: 'n' }, function () { return _this.setgLevel(2); });
        _this._parser.setEscHandler({ final: 'o' }, function () { return _this.setgLevel(3); });
        _this._parser.setEscHandler({ final: '|' }, function () { return _this.setgLevel(3); });
        _this._parser.setEscHandler({ final: '}' }, function () { return _this.setgLevel(2); });
        _this._parser.setEscHandler({ final: '~' }, function () { return _this.setgLevel(1); });
        _this._parser.setEscHandler({ intermediates: '%', final: '@' }, function () { return _this.selectDefaultCharset(); });
        _this._parser.setEscHandler({ intermediates: '%', final: 'G' }, function () { return _this.selectDefaultCharset(); });
        var _loop_1 = function (flag) {
            this_1._parser.setEscHandler({ intermediates: '(', final: flag }, function () { return _this.selectCharset('(' + flag); });
            this_1._parser.setEscHandler({ intermediates: ')', final: flag }, function () { return _this.selectCharset(')' + flag); });
            this_1._parser.setEscHandler({ intermediates: '*', final: flag }, function () { return _this.selectCharset('*' + flag); });
            this_1._parser.setEscHandler({ intermediates: '+', final: flag }, function () { return _this.selectCharset('+' + flag); });
            this_1._parser.setEscHandler({ intermediates: '-', final: flag }, function () { return _this.selectCharset('-' + flag); });
            this_1._parser.setEscHandler({ intermediates: '.', final: flag }, function () { return _this.selectCharset('.' + flag); });
            this_1._parser.setEscHandler({ intermediates: '/', final: flag }, function () { return _this.selectCharset('/' + flag); });
        };
        var this_1 = this;
        for (var flag in Charsets_1.CHARSETS) {
            _loop_1(flag);
        }
        _this._parser.setEscHandler({ intermediates: '#', final: '8' }, function () { return _this.screenAlignmentPattern(); });
        _this._parser.setErrorHandler(function (state) {
            _this._logService.error('Parsing error: ', state);
            return state;
        });
        _this._parser.setDcsHandler({ intermediates: '$', final: 'q' }, new DECRQSS(_this._bufferService, _this._coreService, _this._logService, _this._optionsService));
        return _this;
    }
    Object.defineProperty(InputHandler.prototype, "onCursorMove", {
        get: function () { return this._onCursorMove.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InputHandler.prototype, "onLineFeed", {
        get: function () { return this._onLineFeed.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InputHandler.prototype, "onScroll", {
        get: function () { return this._onScroll.event; },
        enumerable: true,
        configurable: true
    });
    InputHandler.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
    };
    InputHandler.prototype.parse = function (data) {
        var buffer = this._bufferService.buffer;
        var cursorStartX = buffer.x;
        var cursorStartY = buffer.y;
        this._logService.debug('parsing data', data);
        if (this._parseBuffer.length < data.length) {
            if (this._parseBuffer.length < MAX_PARSEBUFFER_LENGTH) {
                this._parseBuffer = new Uint32Array(Math.min(data.length, MAX_PARSEBUFFER_LENGTH));
            }
        }
        if (data.length > MAX_PARSEBUFFER_LENGTH) {
            for (var i = 0; i < data.length; i += MAX_PARSEBUFFER_LENGTH) {
                var end = i + MAX_PARSEBUFFER_LENGTH < data.length ? i + MAX_PARSEBUFFER_LENGTH : data.length;
                var len = (typeof data === 'string')
                    ? this._stringDecoder.decode(data.substring(i, end), this._parseBuffer)
                    : this._utf8Decoder.decode(data.subarray(i, end), this._parseBuffer);
                this._parser.parse(this._parseBuffer, len);
            }
        }
        else {
            var len = (typeof data === 'string')
                ? this._stringDecoder.decode(data, this._parseBuffer)
                : this._utf8Decoder.decode(data, this._parseBuffer);
            this._parser.parse(this._parseBuffer, len);
        }
        buffer = this._bufferService.buffer;
        if (buffer.x !== cursorStartX || buffer.y !== cursorStartY) {
            this._onCursorMove.fire();
        }
        this._terminal.refresh(this._dirtyRowService.start, this._dirtyRowService.end);
    };
    InputHandler.prototype.print = function (data, start, end) {
        var code;
        var chWidth;
        var buffer = this._bufferService.buffer;
        var charset = this._terminal.charset;
        var screenReaderMode = this._optionsService.options.screenReaderMode;
        var cols = this._bufferService.cols;
        var wraparoundMode = this._terminal.wraparoundMode;
        var insertMode = this._terminal.insertMode;
        var curAttr = this._terminal.curAttrData;
        var bufferRow = buffer.lines.get(buffer.y + buffer.ybase);
        this._dirtyRowService.markDirty(buffer.y);
        for (var pos = start; pos < end; ++pos) {
            code = data[pos];
            chWidth = CharWidth_1.wcwidth(code);
            if (code < 127 && charset) {
                var ch = charset[String.fromCharCode(code)];
                if (ch) {
                    code = ch.charCodeAt(0);
                }
            }
            if (screenReaderMode) {
                this._terminal.onA11yCharEmitter.fire(TextDecoder_1.stringFromCodePoint(code));
            }
            if (!chWidth && buffer.x) {
                if (!bufferRow.getWidth(buffer.x - 1)) {
                    bufferRow.addCodepointToCell(buffer.x - 2, code);
                }
                else {
                    bufferRow.addCodepointToCell(buffer.x - 1, code);
                }
                continue;
            }
            if (buffer.x + chWidth - 1 >= cols) {
                if (wraparoundMode) {
                    buffer.x = 0;
                    buffer.y++;
                    if (buffer.y === buffer.scrollBottom + 1) {
                        buffer.y--;
                        this._terminal.scroll(true);
                    }
                    else {
                        if (buffer.y >= this._bufferService.rows) {
                            buffer.y = this._bufferService.rows - 1;
                        }
                        buffer.lines.get(buffer.y).isWrapped = true;
                    }
                    bufferRow = buffer.lines.get(buffer.y + buffer.ybase);
                }
                else {
                    buffer.x = cols - 1;
                    if (chWidth === 2) {
                        continue;
                    }
                }
            }
            if (insertMode) {
                bufferRow.insertCells(buffer.x, chWidth, buffer.getNullCell(curAttr));
                if (bufferRow.getWidth(cols - 1) === 2) {
                    bufferRow.setCellFromCodePoint(cols - 1, Constants_1.NULL_CELL_CODE, Constants_1.NULL_CELL_WIDTH, curAttr.fg, curAttr.bg);
                }
            }
            bufferRow.setCellFromCodePoint(buffer.x++, code, chWidth, curAttr.fg, curAttr.bg);
            if (chWidth > 0) {
                while (--chWidth) {
                    bufferRow.setCellFromCodePoint(buffer.x++, 0, 0, curAttr.fg, curAttr.bg);
                }
            }
        }
        if (end) {
            bufferRow.loadCell(buffer.x - 1, this._workCell);
            if (this._workCell.getWidth() === 2 || this._workCell.getCode() > 0xFFFF) {
                this._parser.precedingCodepoint = 0;
            }
            else if (this._workCell.isCombined()) {
                this._parser.precedingCodepoint = this._workCell.getChars().charCodeAt(0);
            }
            else {
                this._parser.precedingCodepoint = this._workCell.content;
            }
        }
        this._dirtyRowService.markDirty(buffer.y);
    };
    InputHandler.prototype.addCsiHandler = function (id, callback) {
        return this._parser.addCsiHandler(id, callback);
    };
    InputHandler.prototype.addDcsHandler = function (id, callback) {
        return this._parser.addDcsHandler(id, new DcsParser_1.DcsHandler(callback));
    };
    InputHandler.prototype.addEscHandler = function (id, callback) {
        return this._parser.addEscHandler(id, callback);
    };
    InputHandler.prototype.addOscHandler = function (ident, callback) {
        return this._parser.addOscHandler(ident, new OscParser_1.OscHandler(callback));
    };
    InputHandler.prototype.bell = function () {
        this._terminal.bell();
    };
    InputHandler.prototype.lineFeed = function () {
        var buffer = this._bufferService.buffer;
        if (this._optionsService.options.convertEol) {
            buffer.x = 0;
        }
        buffer.y++;
        if (buffer.y === buffer.scrollBottom + 1) {
            buffer.y--;
            this._terminal.scroll();
        }
        else if (buffer.y >= this._bufferService.rows) {
            buffer.y = this._bufferService.rows - 1;
        }
        if (buffer.x >= this._bufferService.cols) {
            buffer.x--;
        }
        this._onLineFeed.fire();
    };
    InputHandler.prototype.carriageReturn = function () {
        this._bufferService.buffer.x = 0;
    };
    InputHandler.prototype.backspace = function () {
        this._restrictCursor();
        if (this._bufferService.buffer.x > 0) {
            this._bufferService.buffer.x--;
        }
    };
    InputHandler.prototype.tab = function () {
        if (this._bufferService.buffer.x >= this._bufferService.cols) {
            return;
        }
        var originalX = this._bufferService.buffer.x;
        this._bufferService.buffer.x = this._bufferService.buffer.nextStop();
        if (this._optionsService.options.screenReaderMode) {
            this._terminal.onA11yTabEmitter.fire(this._bufferService.buffer.x - originalX);
        }
    };
    InputHandler.prototype.shiftOut = function () {
        this._terminal.setgLevel(1);
    };
    InputHandler.prototype.shiftIn = function () {
        this._terminal.setgLevel(0);
    };
    InputHandler.prototype._restrictCursor = function () {
        this._bufferService.buffer.x = Math.min(this._bufferService.cols - 1, Math.max(0, this._bufferService.buffer.x));
        this._bufferService.buffer.y = this._terminal.originMode
            ? Math.min(this._bufferService.buffer.scrollBottom, Math.max(this._bufferService.buffer.scrollTop, this._bufferService.buffer.y))
            : Math.min(this._bufferService.rows - 1, Math.max(0, this._bufferService.buffer.y));
    };
    InputHandler.prototype._setCursor = function (x, y) {
        if (this._terminal.originMode) {
            this._bufferService.buffer.x = x;
            this._bufferService.buffer.y = this._bufferService.buffer.scrollTop + y;
        }
        else {
            this._bufferService.buffer.x = x;
            this._bufferService.buffer.y = y;
        }
        this._restrictCursor();
    };
    InputHandler.prototype._moveCursor = function (x, y) {
        this._restrictCursor();
        this._setCursor(this._bufferService.buffer.x + x, this._bufferService.buffer.y + y);
    };
    InputHandler.prototype.cursorUp = function (params) {
        var diffToTop = this._bufferService.buffer.y - this._bufferService.buffer.scrollTop;
        if (diffToTop >= 0) {
            this._moveCursor(0, -Math.min(diffToTop, params.params[0] || 1));
        }
        else {
            this._moveCursor(0, -(params.params[0] || 1));
        }
    };
    InputHandler.prototype.cursorDown = function (params) {
        var diffToBottom = this._bufferService.buffer.scrollBottom - this._bufferService.buffer.y;
        if (diffToBottom >= 0) {
            this._moveCursor(0, Math.min(diffToBottom, params.params[0] || 1));
        }
        else {
            this._moveCursor(0, params.params[0] || 1);
        }
    };
    InputHandler.prototype.cursorForward = function (params) {
        this._moveCursor(params.params[0] || 1, 0);
    };
    InputHandler.prototype.cursorBackward = function (params) {
        this._moveCursor(-(params.params[0] || 1), 0);
    };
    InputHandler.prototype.cursorNextLine = function (params) {
        this.cursorDown(params);
        this._bufferService.buffer.x = 0;
    };
    InputHandler.prototype.cursorPrecedingLine = function (params) {
        this.cursorUp(params);
        this._bufferService.buffer.x = 0;
    };
    InputHandler.prototype.cursorCharAbsolute = function (params) {
        this._setCursor((params.params[0] || 1) - 1, this._bufferService.buffer.y);
    };
    InputHandler.prototype.cursorPosition = function (params) {
        this._setCursor((params.length >= 2) ? (params.params[1] || 1) - 1 : 0, (params.params[0] || 1) - 1);
    };
    InputHandler.prototype.charPosAbsolute = function (params) {
        this._setCursor((params.params[0] || 1) - 1, this._bufferService.buffer.y);
    };
    InputHandler.prototype.hPositionRelative = function (params) {
        this._moveCursor(params.params[0] || 1, 0);
    };
    InputHandler.prototype.linePosAbsolute = function (params) {
        this._setCursor(this._bufferService.buffer.x, (params.params[0] || 1) - 1);
    };
    InputHandler.prototype.vPositionRelative = function (params) {
        this._moveCursor(0, params.params[0] || 1);
    };
    InputHandler.prototype.hVPosition = function (params) {
        this.cursorPosition(params);
    };
    InputHandler.prototype.tabClear = function (params) {
        var param = params.params[0];
        if (param === 0) {
            delete this._bufferService.buffer.tabs[this._bufferService.buffer.x];
        }
        else if (param === 3) {
            this._bufferService.buffer.tabs = {};
        }
    };
    InputHandler.prototype.cursorForwardTab = function (params) {
        if (this._bufferService.buffer.x >= this._bufferService.cols) {
            return;
        }
        var param = params.params[0] || 1;
        while (param--) {
            this._bufferService.buffer.x = this._bufferService.buffer.nextStop();
        }
    };
    InputHandler.prototype.cursorBackwardTab = function (params) {
        if (this._bufferService.buffer.x >= this._bufferService.cols) {
            return;
        }
        var param = params.params[0] || 1;
        var buffer = this._bufferService.buffer;
        while (param--) {
            buffer.x = buffer.prevStop();
        }
    };
    InputHandler.prototype._eraseInBufferLine = function (y, start, end, clearWrap) {
        if (clearWrap === void 0) { clearWrap = false; }
        var line = this._bufferService.buffer.lines.get(this._bufferService.buffer.ybase + y);
        line.replaceCells(start, end, this._bufferService.buffer.getNullCell(this._terminal.eraseAttrData()));
        if (clearWrap) {
            line.isWrapped = false;
        }
    };
    InputHandler.prototype._resetBufferLine = function (y) {
        var line = this._bufferService.buffer.lines.get(this._bufferService.buffer.ybase + y);
        line.fill(this._bufferService.buffer.getNullCell(this._terminal.eraseAttrData()));
        line.isWrapped = false;
    };
    InputHandler.prototype.eraseInDisplay = function (params) {
        this._restrictCursor();
        var j;
        switch (params.params[0]) {
            case 0:
                j = this._bufferService.buffer.y;
                this._dirtyRowService.markDirty(j);
                this._eraseInBufferLine(j++, this._bufferService.buffer.x, this._bufferService.cols, this._bufferService.buffer.x === 0);
                for (; j < this._bufferService.rows; j++) {
                    this._resetBufferLine(j);
                }
                this._dirtyRowService.markDirty(j);
                break;
            case 1:
                j = this._bufferService.buffer.y;
                this._dirtyRowService.markDirty(j);
                this._eraseInBufferLine(j, 0, this._bufferService.buffer.x + 1, true);
                if (this._bufferService.buffer.x + 1 >= this._bufferService.cols) {
                    this._bufferService.buffer.lines.get(j + 1).isWrapped = false;
                }
                while (j--) {
                    this._resetBufferLine(j);
                }
                this._dirtyRowService.markDirty(0);
                break;
            case 2:
                j = this._bufferService.rows;
                this._dirtyRowService.markDirty(j - 1);
                while (j--) {
                    this._resetBufferLine(j);
                }
                this._dirtyRowService.markDirty(0);
                break;
            case 3:
                var scrollBackSize = this._bufferService.buffer.lines.length - this._bufferService.rows;
                if (scrollBackSize > 0) {
                    this._bufferService.buffer.lines.trimStart(scrollBackSize);
                    this._bufferService.buffer.ybase = Math.max(this._bufferService.buffer.ybase - scrollBackSize, 0);
                    this._bufferService.buffer.ydisp = Math.max(this._bufferService.buffer.ydisp - scrollBackSize, 0);
                    this._onScroll.fire(0);
                }
                break;
        }
    };
    InputHandler.prototype.eraseInLine = function (params) {
        this._restrictCursor();
        switch (params.params[0]) {
            case 0:
                this._eraseInBufferLine(this._bufferService.buffer.y, this._bufferService.buffer.x, this._bufferService.cols);
                break;
            case 1:
                this._eraseInBufferLine(this._bufferService.buffer.y, 0, this._bufferService.buffer.x + 1);
                break;
            case 2:
                this._eraseInBufferLine(this._bufferService.buffer.y, 0, this._bufferService.cols);
                break;
        }
        this._dirtyRowService.markDirty(this._bufferService.buffer.y);
    };
    InputHandler.prototype.insertLines = function (params) {
        this._restrictCursor();
        var param = params.params[0] || 1;
        var buffer = this._bufferService.buffer;
        if (buffer.y > buffer.scrollBottom || buffer.y < buffer.scrollTop) {
            return;
        }
        var row = buffer.y + buffer.ybase;
        var scrollBottomRowsOffset = this._bufferService.rows - 1 - buffer.scrollBottom;
        var scrollBottomAbsolute = this._bufferService.rows - 1 + buffer.ybase - scrollBottomRowsOffset + 1;
        while (param--) {
            buffer.lines.splice(scrollBottomAbsolute - 1, 1);
            buffer.lines.splice(row, 0, buffer.getBlankLine(this._terminal.eraseAttrData()));
        }
        this._dirtyRowService.markRangeDirty(buffer.y, buffer.scrollBottom);
        buffer.x = 0;
    };
    InputHandler.prototype.deleteLines = function (params) {
        this._restrictCursor();
        var param = params.params[0] || 1;
        var buffer = this._bufferService.buffer;
        if (buffer.y > buffer.scrollBottom || buffer.y < buffer.scrollTop) {
            return;
        }
        var row = buffer.y + buffer.ybase;
        var j;
        j = this._bufferService.rows - 1 - buffer.scrollBottom;
        j = this._bufferService.rows - 1 + buffer.ybase - j;
        while (param--) {
            buffer.lines.splice(row, 1);
            buffer.lines.splice(j, 0, buffer.getBlankLine(this._terminal.eraseAttrData()));
        }
        this._dirtyRowService.markRangeDirty(buffer.y, buffer.scrollBottom);
        buffer.x = 0;
    };
    InputHandler.prototype.insertChars = function (params) {
        this._restrictCursor();
        var line = this._bufferService.buffer.lines.get(this._bufferService.buffer.y + this._bufferService.buffer.ybase);
        if (line) {
            line.insertCells(this._bufferService.buffer.x, params.params[0] || 1, this._bufferService.buffer.getNullCell(this._terminal.eraseAttrData()));
            this._dirtyRowService.markDirty(this._bufferService.buffer.y);
        }
    };
    InputHandler.prototype.deleteChars = function (params) {
        this._restrictCursor();
        var line = this._bufferService.buffer.lines.get(this._bufferService.buffer.y + this._bufferService.buffer.ybase);
        if (line) {
            line.deleteCells(this._bufferService.buffer.x, params.params[0] || 1, this._bufferService.buffer.getNullCell(this._terminal.eraseAttrData()));
            this._dirtyRowService.markDirty(this._bufferService.buffer.y);
        }
    };
    InputHandler.prototype.scrollUp = function (params) {
        var param = params.params[0] || 1;
        var buffer = this._bufferService.buffer;
        while (param--) {
            buffer.lines.splice(buffer.ybase + buffer.scrollTop, 1);
            buffer.lines.splice(buffer.ybase + buffer.scrollBottom, 0, buffer.getBlankLine(this._terminal.eraseAttrData()));
        }
        this._dirtyRowService.markRangeDirty(buffer.scrollTop, buffer.scrollBottom);
    };
    InputHandler.prototype.scrollDown = function (params) {
        var param = params.params[0] || 1;
        var buffer = this._bufferService.buffer;
        while (param--) {
            buffer.lines.splice(buffer.ybase + buffer.scrollBottom, 1);
            buffer.lines.splice(buffer.ybase + buffer.scrollTop, 0, buffer.getBlankLine(BufferLine_1.DEFAULT_ATTR_DATA));
        }
        this._dirtyRowService.markRangeDirty(buffer.scrollTop, buffer.scrollBottom);
    };
    InputHandler.prototype.scrollLeft = function (params) {
        var buffer = this._bufferService.buffer;
        if (buffer.y > buffer.scrollBottom || buffer.y < buffer.scrollTop) {
            return;
        }
        var param = params.params[0] || 1;
        for (var y = buffer.scrollTop; y <= buffer.scrollBottom; ++y) {
            var line = buffer.lines.get(buffer.ybase + y);
            line.deleteCells(0, param, buffer.getNullCell(this._terminal.eraseAttrData()));
            line.isWrapped = false;
        }
        this._dirtyRowService.markRangeDirty(buffer.scrollTop, buffer.scrollBottom);
    };
    InputHandler.prototype.scrollRight = function (params) {
        var buffer = this._bufferService.buffer;
        if (buffer.y > buffer.scrollBottom || buffer.y < buffer.scrollTop) {
            return;
        }
        var param = params.params[0] || 1;
        for (var y = buffer.scrollTop; y <= buffer.scrollBottom; ++y) {
            var line = buffer.lines.get(buffer.ybase + y);
            line.insertCells(0, param, buffer.getNullCell(this._terminal.eraseAttrData()));
            line.isWrapped = false;
        }
        this._dirtyRowService.markRangeDirty(buffer.scrollTop, buffer.scrollBottom);
    };
    InputHandler.prototype.insertColumns = function (params) {
        var buffer = this._bufferService.buffer;
        if (buffer.y > buffer.scrollBottom || buffer.y < buffer.scrollTop) {
            return;
        }
        var param = params.params[0] || 1;
        for (var y = buffer.scrollTop; y <= buffer.scrollBottom; ++y) {
            var line = this._bufferService.buffer.lines.get(buffer.ybase + y);
            line.insertCells(buffer.x, param, buffer.getNullCell(this._terminal.eraseAttrData()));
            line.isWrapped = false;
        }
        this._dirtyRowService.markRangeDirty(buffer.scrollTop, buffer.scrollBottom);
    };
    InputHandler.prototype.deleteColumns = function (params) {
        var buffer = this._bufferService.buffer;
        if (buffer.y > buffer.scrollBottom || buffer.y < buffer.scrollTop) {
            return;
        }
        var param = params.params[0] || 1;
        for (var y = buffer.scrollTop; y <= buffer.scrollBottom; ++y) {
            var line = buffer.lines.get(buffer.ybase + y);
            line.deleteCells(buffer.x, param, buffer.getNullCell(this._terminal.eraseAttrData()));
            line.isWrapped = false;
        }
        this._dirtyRowService.markRangeDirty(buffer.scrollTop, buffer.scrollBottom);
    };
    InputHandler.prototype.eraseChars = function (params) {
        this._restrictCursor();
        var line = this._bufferService.buffer.lines.get(this._bufferService.buffer.y + this._bufferService.buffer.ybase);
        if (line) {
            line.replaceCells(this._bufferService.buffer.x, this._bufferService.buffer.x + (params.params[0] || 1), this._bufferService.buffer.getNullCell(this._terminal.eraseAttrData()));
            this._dirtyRowService.markDirty(this._bufferService.buffer.y);
        }
    };
    InputHandler.prototype.repeatPrecedingCharacter = function (params) {
        if (!this._parser.precedingCodepoint) {
            return;
        }
        var length = params.params[0] || 1;
        var data = new Uint32Array(length);
        for (var i = 0; i < length; ++i) {
            data[i] = this._parser.precedingCodepoint;
        }
        this.print(data, 0, data.length);
    };
    InputHandler.prototype.sendDeviceAttributesPrimary = function (params) {
        if (params.params[0] > 0) {
            return;
        }
        if (this._terminal.is('xterm') || this._terminal.is('rxvt-unicode') || this._terminal.is('screen')) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[?1;2c');
        }
        else if (this._terminal.is('linux')) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[?6c');
        }
    };
    InputHandler.prototype.sendDeviceAttributesSecondary = function (params) {
        if (params.params[0] > 0) {
            return;
        }
        if (this._terminal.is('xterm')) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[>0;276;0c');
        }
        else if (this._terminal.is('rxvt-unicode')) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[>85;95;0c');
        }
        else if (this._terminal.is('linux')) {
            this._coreService.triggerDataEvent(params.params[0] + 'c');
        }
        else if (this._terminal.is('screen')) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[>83;40003;0c');
        }
    };
    InputHandler.prototype.setMode = function (params) {
        for (var i = 0; i < params.length; i++) {
            switch (params.params[i]) {
                case 4:
                    this._terminal.insertMode = true;
                    break;
                case 20:
                    break;
            }
        }
    };
    InputHandler.prototype.setModePrivate = function (params) {
        for (var i = 0; i < params.length; i++) {
            switch (params.params[i]) {
                case 1:
                    this._coreService.decPrivateModes.applicationCursorKeys = true;
                    break;
                case 2:
                    this._terminal.setgCharset(0, Charsets_1.DEFAULT_CHARSET);
                    this._terminal.setgCharset(1, Charsets_1.DEFAULT_CHARSET);
                    this._terminal.setgCharset(2, Charsets_1.DEFAULT_CHARSET);
                    this._terminal.setgCharset(3, Charsets_1.DEFAULT_CHARSET);
                    break;
                case 3:
                    this._terminal.savedCols = this._bufferService.cols;
                    this._terminal.resize(132, this._bufferService.rows);
                    this._terminal.reset();
                    break;
                case 6:
                    this._terminal.originMode = true;
                    this._setCursor(0, 0);
                    break;
                case 7:
                    this._terminal.wraparoundMode = true;
                    break;
                case 12:
                    break;
                case 66:
                    this._logService.debug('Serial port requested application keypad.');
                    this._terminal.applicationKeypad = true;
                    if (this._terminal.viewport) {
                        this._terminal.viewport.syncScrollArea();
                    }
                    break;
                case 9:
                    this._coreMouseService.activeProtocol = 'X10';
                    break;
                case 1000:
                    this._coreMouseService.activeProtocol = 'VT200';
                    break;
                case 1002:
                    this._coreMouseService.activeProtocol = 'DRAG';
                    break;
                case 1003:
                    this._coreMouseService.activeProtocol = 'ANY';
                    break;
                case 1004:
                    this._terminal.sendFocus = true;
                    break;
                case 1005:
                    this._logService.debug('DECSET 1005 not supported (see #2507)');
                    break;
                case 1006:
                    this._coreMouseService.activeEncoding = 'SGR';
                    break;
                case 1015:
                    this._logService.debug('DECSET 1015 not supported (see #2507)');
                    break;
                case 25:
                    this._terminal.cursorHidden = false;
                    break;
                case 1048:
                    this.saveCursor();
                    break;
                case 1049:
                    this.saveCursor();
                case 47:
                case 1047:
                    this._bufferService.buffers.activateAltBuffer(this._terminal.eraseAttrData());
                    this._terminal.refresh(0, this._bufferService.rows - 1);
                    if (this._terminal.viewport) {
                        this._terminal.viewport.syncScrollArea();
                    }
                    this._terminal.showCursor();
                    break;
                case 2004:
                    this._terminal.bracketedPasteMode = true;
                    break;
            }
        }
    };
    InputHandler.prototype.resetMode = function (params) {
        for (var i = 0; i < params.length; i++) {
            switch (params.params[i]) {
                case 4:
                    this._terminal.insertMode = false;
                    break;
                case 20:
                    break;
            }
        }
    };
    InputHandler.prototype.resetModePrivate = function (params) {
        for (var i = 0; i < params.length; i++) {
            switch (params.params[i]) {
                case 1:
                    this._coreService.decPrivateModes.applicationCursorKeys = false;
                    break;
                case 3:
                    if (this._bufferService.cols === 132 && this._terminal.savedCols) {
                        this._terminal.resize(this._terminal.savedCols, this._bufferService.rows);
                    }
                    delete this._terminal.savedCols;
                    this._terminal.reset();
                    break;
                case 6:
                    this._terminal.originMode = false;
                    this._setCursor(0, 0);
                    break;
                case 7:
                    this._terminal.wraparoundMode = false;
                    break;
                case 12:
                    break;
                case 66:
                    this._logService.debug('Switching back to normal keypad.');
                    this._terminal.applicationKeypad = false;
                    if (this._terminal.viewport) {
                        this._terminal.viewport.syncScrollArea();
                    }
                    break;
                case 9:
                case 1000:
                case 1002:
                case 1003:
                    this._coreMouseService.activeProtocol = 'NONE';
                    break;
                case 1004:
                    this._terminal.sendFocus = false;
                    break;
                case 1005:
                    this._logService.debug('DECRST 1005 not supported (see #2507)');
                    break;
                case 1006:
                    this._coreMouseService.activeEncoding = 'DEFAULT';
                    break;
                case 1015:
                    this._logService.debug('DECRST 1015 not supported (see #2507)');
                    break;
                case 25:
                    this._terminal.cursorHidden = true;
                    break;
                case 1048:
                    this.restoreCursor();
                    break;
                case 1049:
                case 47:
                case 1047:
                    this._bufferService.buffers.activateNormalBuffer();
                    if (params.params[i] === 1049) {
                        this.restoreCursor();
                    }
                    this._terminal.refresh(0, this._bufferService.rows - 1);
                    if (this._terminal.viewport) {
                        this._terminal.viewport.syncScrollArea();
                    }
                    this._terminal.showCursor();
                    break;
                case 2004:
                    this._terminal.bracketedPasteMode = false;
                    break;
            }
        }
    };
    InputHandler.prototype._extractColor = function (params, pos, attr) {
        var accu = [0, 0, -1, 0, 0, 0];
        var cSpace = 0;
        var advance = 0;
        do {
            accu[advance + cSpace] = params.params[pos + advance];
            if (params.hasSubParams(pos + advance)) {
                var subparams = params.getSubParams(pos + advance);
                var i = 0;
                do {
                    if (accu[1] === 5) {
                        cSpace = 1;
                    }
                    accu[advance + i + 1 + cSpace] = subparams[i];
                } while (++i < subparams.length && i + advance + 1 + cSpace < accu.length);
                break;
            }
            if ((accu[1] === 5 && advance + cSpace >= 2)
                || (accu[1] === 2 && advance + cSpace >= 5)) {
                break;
            }
            if (accu[1]) {
                cSpace = 1;
            }
        } while (++advance + pos < params.length && advance + cSpace < accu.length);
        for (var i = 2; i < accu.length; ++i) {
            if (accu[i] === -1) {
                accu[i] = 0;
            }
        }
        if (accu[0] === 38) {
            if (accu[1] === 2) {
                attr.fg |= 50331648;
                attr.fg &= ~16777215;
                attr.fg |= AttributeData_1.AttributeData.fromColorRGB([accu[3], accu[4], accu[5]]);
            }
            else if (accu[1] === 5) {
                attr.fg &= ~(50331648 | 255);
                attr.fg |= 33554432 | (accu[3] & 0xff);
            }
        }
        else if (accu[0] === 48) {
            if (accu[1] === 2) {
                attr.bg |= 50331648;
                attr.bg &= ~16777215;
                attr.bg |= AttributeData_1.AttributeData.fromColorRGB([accu[3], accu[4], accu[5]]);
            }
            else if (accu[1] === 5) {
                attr.bg &= ~(50331648 | 255);
                attr.bg |= 33554432 | (accu[3] & 0xff);
            }
        }
        return advance;
    };
    InputHandler.prototype.charAttributes = function (params) {
        if (params.length === 1 && params.params[0] === 0) {
            this._terminal.curAttrData.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg;
            this._terminal.curAttrData.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg;
            return;
        }
        var l = params.length;
        var p;
        var attr = this._terminal.curAttrData;
        for (var i = 0; i < l; i++) {
            p = params.params[i];
            if (p >= 30 && p <= 37) {
                attr.fg &= ~(50331648 | 255);
                attr.fg |= 16777216 | (p - 30);
            }
            else if (p >= 40 && p <= 47) {
                attr.bg &= ~(50331648 | 255);
                attr.bg |= 16777216 | (p - 40);
            }
            else if (p >= 90 && p <= 97) {
                attr.fg &= ~(50331648 | 255);
                attr.fg |= 16777216 | (p - 90) | 8;
            }
            else if (p >= 100 && p <= 107) {
                attr.bg &= ~(50331648 | 255);
                attr.bg |= 16777216 | (p - 100) | 8;
            }
            else if (p === 0) {
                attr.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg;
                attr.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg;
            }
            else if (p === 1) {
                attr.fg |= 134217728;
            }
            else if (p === 3) {
                attr.bg |= 67108864;
            }
            else if (p === 4) {
                attr.fg |= 268435456;
            }
            else if (p === 5) {
                attr.fg |= 536870912;
            }
            else if (p === 7) {
                attr.fg |= 67108864;
            }
            else if (p === 8) {
                attr.fg |= 1073741824;
            }
            else if (p === 2) {
                attr.bg |= 134217728;
            }
            else if (p === 22) {
                attr.fg &= ~134217728;
                attr.bg &= ~134217728;
            }
            else if (p === 23) {
                attr.bg &= ~67108864;
            }
            else if (p === 24) {
                attr.fg &= ~268435456;
            }
            else if (p === 25) {
                attr.fg &= ~536870912;
            }
            else if (p === 27) {
                attr.fg &= ~67108864;
            }
            else if (p === 28) {
                attr.fg &= ~1073741824;
            }
            else if (p === 39) {
                attr.fg &= ~(50331648 | 16777215);
                attr.fg |= BufferLine_1.DEFAULT_ATTR_DATA.fg & (255 | 16777215);
            }
            else if (p === 49) {
                attr.bg &= ~(50331648 | 16777215);
                attr.bg |= BufferLine_1.DEFAULT_ATTR_DATA.bg & (255 | 16777215);
            }
            else if (p === 38 || p === 48) {
                i += this._extractColor(params, i, attr);
            }
            else if (p === 100) {
                attr.fg &= ~(50331648 | 16777215);
                attr.fg |= BufferLine_1.DEFAULT_ATTR_DATA.fg & (255 | 16777215);
                attr.bg &= ~(50331648 | 16777215);
                attr.bg |= BufferLine_1.DEFAULT_ATTR_DATA.bg & (255 | 16777215);
            }
            else {
                this._logService.debug('Unknown SGR attribute: %d.', p);
            }
        }
    };
    InputHandler.prototype.deviceStatus = function (params) {
        switch (params.params[0]) {
            case 5:
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "[0n");
                break;
            case 6:
                var y = this._bufferService.buffer.y + 1;
                var x = this._bufferService.buffer.x + 1;
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "[" + y + ";" + x + "R");
                break;
        }
    };
    InputHandler.prototype.deviceStatusPrivate = function (params) {
        switch (params.params[0]) {
            case 6:
                var y = this._bufferService.buffer.y + 1;
                var x = this._bufferService.buffer.x + 1;
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "[?" + y + ";" + x + "R");
                break;
            case 15:
                break;
            case 25:
                break;
            case 26:
                break;
            case 53:
                break;
        }
    };
    InputHandler.prototype.softReset = function (params) {
        this._terminal.cursorHidden = false;
        this._terminal.insertMode = false;
        this._terminal.originMode = false;
        this._terminal.wraparoundMode = true;
        this._terminal.applicationKeypad = false;
        if (this._terminal.viewport) {
            this._terminal.viewport.syncScrollArea();
        }
        this._coreService.decPrivateModes.applicationCursorKeys = false;
        this._bufferService.buffer.scrollTop = 0;
        this._bufferService.buffer.scrollBottom = this._bufferService.rows - 1;
        this._terminal.curAttrData = BufferLine_1.DEFAULT_ATTR_DATA.clone();
        this._bufferService.buffer.x = this._bufferService.buffer.y = 0;
        this._terminal.charset = null;
        this._terminal.glevel = 0;
        this._terminal.charsets = [null];
    };
    InputHandler.prototype.setCursorStyle = function (params) {
        var param = params.params[0] || 1;
        switch (param) {
            case 1:
            case 2:
                this._optionsService.options.cursorStyle = 'block';
                break;
            case 3:
            case 4:
                this._optionsService.options.cursorStyle = 'underline';
                break;
            case 5:
            case 6:
                this._optionsService.options.cursorStyle = 'bar';
                break;
        }
        var isBlinking = param % 2 === 1;
        this._optionsService.options.cursorBlink = isBlinking;
    };
    InputHandler.prototype.setScrollRegion = function (params) {
        var top = params.params[0] || 1;
        var bottom;
        if (params.length < 2 || (bottom = params.params[1]) > this._bufferService.rows || bottom === 0) {
            bottom = this._bufferService.rows;
        }
        if (bottom > top) {
            this._bufferService.buffer.scrollTop = top - 1;
            this._bufferService.buffer.scrollBottom = bottom - 1;
            this._setCursor(0, 0);
        }
    };
    InputHandler.prototype.saveCursor = function (params) {
        this._bufferService.buffer.savedX = this._bufferService.buffer.x;
        this._bufferService.buffer.savedY = this._bufferService.buffer.ybase + this._bufferService.buffer.y;
        this._bufferService.buffer.savedCurAttrData.fg = this._terminal.curAttrData.fg;
        this._bufferService.buffer.savedCurAttrData.bg = this._terminal.curAttrData.bg;
        this._bufferService.buffer.savedCharset = this._terminal.charset;
    };
    InputHandler.prototype.restoreCursor = function (params) {
        this._bufferService.buffer.x = this._bufferService.buffer.savedX || 0;
        this._bufferService.buffer.y = Math.max(this._bufferService.buffer.savedY - this._bufferService.buffer.ybase, 0);
        this._terminal.curAttrData.fg = this._bufferService.buffer.savedCurAttrData.fg;
        this._terminal.curAttrData.bg = this._bufferService.buffer.savedCurAttrData.bg;
        this._terminal.charset = this._savedCharset;
        if (this._bufferService.buffer.savedCharset) {
            this._terminal.charset = this._bufferService.buffer.savedCharset;
        }
        this._restrictCursor();
    };
    InputHandler.prototype.setTitle = function (data) {
        this._terminal.handleTitle(data);
    };
    InputHandler.prototype.nextLine = function () {
        this._bufferService.buffer.x = 0;
        this.index();
    };
    InputHandler.prototype.keypadApplicationMode = function () {
        this._logService.debug('Serial port requested application keypad.');
        this._terminal.applicationKeypad = true;
        if (this._terminal.viewport) {
            this._terminal.viewport.syncScrollArea();
        }
    };
    InputHandler.prototype.keypadNumericMode = function () {
        this._logService.debug('Switching back to normal keypad.');
        this._terminal.applicationKeypad = false;
        if (this._terminal.viewport) {
            this._terminal.viewport.syncScrollArea();
        }
    };
    InputHandler.prototype.selectDefaultCharset = function () {
        this._terminal.setgLevel(0);
        this._terminal.setgCharset(0, Charsets_1.DEFAULT_CHARSET);
    };
    InputHandler.prototype.selectCharset = function (collectAndFlag) {
        if (collectAndFlag.length !== 2) {
            this.selectDefaultCharset();
            return;
        }
        if (collectAndFlag[0] === '/') {
            return;
        }
        this._terminal.setgCharset(GLEVEL[collectAndFlag[0]], Charsets_1.CHARSETS[collectAndFlag[1]] || Charsets_1.DEFAULT_CHARSET);
        return;
    };
    InputHandler.prototype.index = function () {
        this._restrictCursor();
        var buffer = this._bufferService.buffer;
        this._bufferService.buffer.y++;
        if (buffer.y === buffer.scrollBottom + 1) {
            buffer.y--;
            this._terminal.scroll();
        }
        else if (buffer.y >= this._bufferService.rows) {
            buffer.y = this._bufferService.rows - 1;
        }
        this._restrictCursor();
    };
    InputHandler.prototype.tabSet = function () {
        this._bufferService.buffer.tabs[this._bufferService.buffer.x] = true;
    };
    InputHandler.prototype.reverseIndex = function () {
        this._restrictCursor();
        var buffer = this._bufferService.buffer;
        if (buffer.y === buffer.scrollTop) {
            var scrollRegionHeight = buffer.scrollBottom - buffer.scrollTop;
            buffer.lines.shiftElements(buffer.y + buffer.ybase, scrollRegionHeight, 1);
            buffer.lines.set(buffer.y + buffer.ybase, buffer.getBlankLine(this._terminal.eraseAttrData()));
            this._dirtyRowService.markRangeDirty(buffer.scrollTop, buffer.scrollBottom);
        }
        else {
            buffer.y--;
            this._restrictCursor();
        }
    };
    InputHandler.prototype.reset = function () {
        this._parser.reset();
        this._terminal.reset();
    };
    InputHandler.prototype.setgLevel = function (level) {
        this._terminal.setgLevel(level);
    };
    InputHandler.prototype.screenAlignmentPattern = function () {
        var cell = new CellData_1.CellData();
        cell.content = 1 << 22 | 'E'.charCodeAt(0);
        cell.fg = this._terminal.curAttrData.fg;
        cell.bg = this._terminal.curAttrData.bg;
        var buffer = this._bufferService.buffer;
        this._setCursor(0, 0);
        for (var yOffset = 0; yOffset < this._bufferService.rows; ++yOffset) {
            var row = buffer.y + buffer.ybase + yOffset;
            buffer.lines.get(row).fill(cell);
            buffer.lines.get(row).isWrapped = false;
        }
        this._dirtyRowService.markAllDirty();
        this._setCursor(0, 0);
    };
    return InputHandler;
}(Lifecycle_1.Disposable));
exports.InputHandler = InputHandler;


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Lifecycle_1 = __webpack_require__(2);
var TypedArrayUtils_1 = __webpack_require__(14);
var Params_1 = __webpack_require__(19);
var OscParser_1 = __webpack_require__(20);
var DcsParser_1 = __webpack_require__(22);
var TransitionTable = (function () {
    function TransitionTable(length) {
        this.table = new Uint8Array(length);
    }
    TransitionTable.prototype.setDefault = function (action, next) {
        TypedArrayUtils_1.fill(this.table, action << 4 | next);
    };
    TransitionTable.prototype.add = function (code, state, action, next) {
        this.table[state << 8 | code] = action << 4 | next;
    };
    TransitionTable.prototype.addMany = function (codes, state, action, next) {
        for (var i = 0; i < codes.length; i++) {
            this.table[state << 8 | codes[i]] = action << 4 | next;
        }
    };
    return TransitionTable;
}());
exports.TransitionTable = TransitionTable;
var NON_ASCII_PRINTABLE = 0xA0;
exports.VT500_TRANSITION_TABLE = (function () {
    var table = new TransitionTable(4095);
    var BYTE_VALUES = 256;
    var blueprint = Array.apply(null, Array(BYTE_VALUES)).map(function (unused, i) { return i; });
    var r = function (start, end) { return blueprint.slice(start, end); };
    var PRINTABLES = r(0x20, 0x7f);
    var EXECUTABLES = r(0x00, 0x18);
    EXECUTABLES.push(0x19);
    EXECUTABLES.push.apply(EXECUTABLES, r(0x1c, 0x20));
    var states = r(0, 13 + 1);
    var state;
    table.setDefault(1, 0);
    table.addMany(PRINTABLES, 0, 2, 0);
    for (state in states) {
        table.addMany([0x18, 0x1a, 0x99, 0x9a], state, 3, 0);
        table.addMany(r(0x80, 0x90), state, 3, 0);
        table.addMany(r(0x90, 0x98), state, 3, 0);
        table.add(0x9c, state, 0, 0);
        table.add(0x1b, state, 11, 1);
        table.add(0x9d, state, 4, 8);
        table.addMany([0x98, 0x9e, 0x9f], state, 0, 7);
        table.add(0x9b, state, 11, 3);
        table.add(0x90, state, 11, 9);
    }
    table.addMany(EXECUTABLES, 0, 3, 0);
    table.addMany(EXECUTABLES, 1, 3, 1);
    table.add(0x7f, 1, 0, 1);
    table.addMany(EXECUTABLES, 8, 0, 8);
    table.addMany(EXECUTABLES, 3, 3, 3);
    table.add(0x7f, 3, 0, 3);
    table.addMany(EXECUTABLES, 4, 3, 4);
    table.add(0x7f, 4, 0, 4);
    table.addMany(EXECUTABLES, 6, 3, 6);
    table.addMany(EXECUTABLES, 5, 3, 5);
    table.add(0x7f, 5, 0, 5);
    table.addMany(EXECUTABLES, 2, 3, 2);
    table.add(0x7f, 2, 0, 2);
    table.add(0x5d, 1, 4, 8);
    table.addMany(PRINTABLES, 8, 5, 8);
    table.add(0x7f, 8, 5, 8);
    table.addMany([0x9c, 0x1b, 0x18, 0x1a, 0x07], 8, 6, 0);
    table.addMany(r(0x1c, 0x20), 8, 0, 8);
    table.addMany([0x58, 0x5e, 0x5f], 1, 0, 7);
    table.addMany(PRINTABLES, 7, 0, 7);
    table.addMany(EXECUTABLES, 7, 0, 7);
    table.add(0x9c, 7, 0, 0);
    table.add(0x7f, 7, 0, 7);
    table.add(0x5b, 1, 11, 3);
    table.addMany(r(0x40, 0x7f), 3, 7, 0);
    table.addMany(r(0x30, 0x3c), 3, 8, 4);
    table.addMany([0x3c, 0x3d, 0x3e, 0x3f], 3, 9, 4);
    table.addMany(r(0x30, 0x3c), 4, 8, 4);
    table.addMany(r(0x40, 0x7f), 4, 7, 0);
    table.addMany([0x3c, 0x3d, 0x3e, 0x3f], 4, 0, 6);
    table.addMany(r(0x20, 0x40), 6, 0, 6);
    table.add(0x7f, 6, 0, 6);
    table.addMany(r(0x40, 0x7f), 6, 0, 0);
    table.addMany(r(0x20, 0x30), 3, 9, 5);
    table.addMany(r(0x20, 0x30), 5, 9, 5);
    table.addMany(r(0x30, 0x40), 5, 0, 6);
    table.addMany(r(0x40, 0x7f), 5, 7, 0);
    table.addMany(r(0x20, 0x30), 4, 9, 5);
    table.addMany(r(0x20, 0x30), 1, 9, 2);
    table.addMany(r(0x20, 0x30), 2, 9, 2);
    table.addMany(r(0x30, 0x7f), 2, 10, 0);
    table.addMany(r(0x30, 0x50), 1, 10, 0);
    table.addMany(r(0x51, 0x58), 1, 10, 0);
    table.addMany([0x59, 0x5a, 0x5c], 1, 10, 0);
    table.addMany(r(0x60, 0x7f), 1, 10, 0);
    table.add(0x50, 1, 11, 9);
    table.addMany(EXECUTABLES, 9, 0, 9);
    table.add(0x7f, 9, 0, 9);
    table.addMany(r(0x1c, 0x20), 9, 0, 9);
    table.addMany(r(0x20, 0x30), 9, 9, 12);
    table.addMany(r(0x30, 0x3c), 9, 8, 10);
    table.addMany([0x3c, 0x3d, 0x3e, 0x3f], 9, 9, 10);
    table.addMany(EXECUTABLES, 11, 0, 11);
    table.addMany(r(0x20, 0x80), 11, 0, 11);
    table.addMany(r(0x1c, 0x20), 11, 0, 11);
    table.addMany(EXECUTABLES, 10, 0, 10);
    table.add(0x7f, 10, 0, 10);
    table.addMany(r(0x1c, 0x20), 10, 0, 10);
    table.addMany(r(0x30, 0x3c), 10, 8, 10);
    table.addMany([0x3c, 0x3d, 0x3e, 0x3f], 10, 0, 11);
    table.addMany(r(0x20, 0x30), 10, 9, 12);
    table.addMany(EXECUTABLES, 12, 0, 12);
    table.add(0x7f, 12, 0, 12);
    table.addMany(r(0x1c, 0x20), 12, 0, 12);
    table.addMany(r(0x20, 0x30), 12, 9, 12);
    table.addMany(r(0x30, 0x40), 12, 0, 11);
    table.addMany(r(0x40, 0x7f), 12, 12, 13);
    table.addMany(r(0x40, 0x7f), 10, 12, 13);
    table.addMany(r(0x40, 0x7f), 9, 12, 13);
    table.addMany(EXECUTABLES, 13, 13, 13);
    table.addMany(PRINTABLES, 13, 13, 13);
    table.add(0x7f, 13, 0, 13);
    table.addMany([0x1b, 0x9c, 0x18, 0x1a], 13, 14, 0);
    table.add(NON_ASCII_PRINTABLE, 0, 2, 0);
    table.add(NON_ASCII_PRINTABLE, 8, 5, 8);
    table.add(NON_ASCII_PRINTABLE, 6, 0, 6);
    table.add(NON_ASCII_PRINTABLE, 11, 0, 11);
    table.add(NON_ASCII_PRINTABLE, 13, 13, 13);
    return table;
})();
var EscapeSequenceParser = (function (_super) {
    __extends(EscapeSequenceParser, _super);
    function EscapeSequenceParser(TRANSITIONS) {
        if (TRANSITIONS === void 0) { TRANSITIONS = exports.VT500_TRANSITION_TABLE; }
        var _this = _super.call(this) || this;
        _this.TRANSITIONS = TRANSITIONS;
        _this.initialState = 0;
        _this.currentState = _this.initialState;
        _this._params = new Params_1.Params();
        _this._params.addParam(0);
        _this._collect = 0;
        _this.precedingCodepoint = 0;
        _this._printHandlerFb = function (data, start, end) { };
        _this._executeHandlerFb = function (code) { };
        _this._csiHandlerFb = function (ident, params) { };
        _this._escHandlerFb = function (ident) { };
        _this._errorHandlerFb = function (state) { return state; };
        _this._printHandler = _this._printHandlerFb;
        _this._executeHandlers = Object.create(null);
        _this._csiHandlers = Object.create(null);
        _this._escHandlers = Object.create(null);
        _this._oscParser = new OscParser_1.OscParser();
        _this._dcsParser = new DcsParser_1.DcsParser();
        _this._errorHandler = _this._errorHandlerFb;
        _this.setEscHandler({ final: '\\' }, function () { });
        return _this;
    }
    EscapeSequenceParser.prototype._identifier = function (id, finalRange) {
        if (finalRange === void 0) { finalRange = [0x40, 0x7e]; }
        var res = 0;
        if (id.prefix) {
            if (id.prefix.length > 1) {
                throw new Error('only one byte as prefix supported');
            }
            res = id.prefix.charCodeAt(0);
            if (res && 0x3c > res || res > 0x3f) {
                throw new Error('prefix must be in range 0x3c .. 0x3f');
            }
        }
        if (id.intermediates) {
            if (id.intermediates.length > 2) {
                throw new Error('only two bytes as intermediates are supported');
            }
            for (var i = 0; i < id.intermediates.length; ++i) {
                var intermediate = id.intermediates.charCodeAt(i);
                if (0x20 > intermediate || intermediate > 0x2f) {
                    throw new Error('intermediate must be in range 0x20 .. 0x2f');
                }
                res <<= 8;
                res |= intermediate;
            }
        }
        if (id.final.length !== 1) {
            throw new Error('final must be a single byte');
        }
        var finalCode = id.final.charCodeAt(0);
        if (finalRange[0] > finalCode || finalCode > finalRange[1]) {
            throw new Error("final must be in range " + finalRange[0] + " .. " + finalRange[1]);
        }
        res <<= 8;
        res |= finalCode;
        return res;
    };
    EscapeSequenceParser.prototype.identToString = function (ident) {
        var res = [];
        while (ident) {
            res.push(String.fromCharCode(ident & 0xFF));
            ident >>= 8;
        }
        return res.reverse().join('');
    };
    EscapeSequenceParser.prototype.dispose = function () {
        this._csiHandlers = Object.create(null);
        this._executeHandlers = Object.create(null);
        this._escHandlers = Object.create(null);
        this._oscParser.dispose();
        this._dcsParser.dispose();
    };
    EscapeSequenceParser.prototype.setPrintHandler = function (handler) {
        this._printHandler = handler;
    };
    EscapeSequenceParser.prototype.clearPrintHandler = function () {
        this._printHandler = this._printHandlerFb;
    };
    EscapeSequenceParser.prototype.addEscHandler = function (id, handler) {
        var ident = this._identifier(id, [0x30, 0x7e]);
        if (this._escHandlers[ident] === undefined) {
            this._escHandlers[ident] = [];
        }
        var handlerList = this._escHandlers[ident];
        handlerList.push(handler);
        return {
            dispose: function () {
                var handlerIndex = handlerList.indexOf(handler);
                if (handlerIndex !== -1) {
                    handlerList.splice(handlerIndex, 1);
                }
            }
        };
    };
    EscapeSequenceParser.prototype.setEscHandler = function (id, handler) {
        this._escHandlers[this._identifier(id, [0x30, 0x7e])] = [handler];
    };
    EscapeSequenceParser.prototype.clearEscHandler = function (id) {
        if (this._escHandlers[this._identifier(id, [0x30, 0x7e])])
            delete this._escHandlers[this._identifier(id, [0x30, 0x7e])];
    };
    EscapeSequenceParser.prototype.setEscHandlerFallback = function (handler) {
        this._escHandlerFb = handler;
    };
    EscapeSequenceParser.prototype.setExecuteHandler = function (flag, handler) {
        this._executeHandlers[flag.charCodeAt(0)] = handler;
    };
    EscapeSequenceParser.prototype.clearExecuteHandler = function (flag) {
        if (this._executeHandlers[flag.charCodeAt(0)])
            delete this._executeHandlers[flag.charCodeAt(0)];
    };
    EscapeSequenceParser.prototype.setExecuteHandlerFallback = function (handler) {
        this._executeHandlerFb = handler;
    };
    EscapeSequenceParser.prototype.addCsiHandler = function (id, handler) {
        var ident = this._identifier(id);
        if (this._csiHandlers[ident] === undefined) {
            this._csiHandlers[ident] = [];
        }
        var handlerList = this._csiHandlers[ident];
        handlerList.push(handler);
        return {
            dispose: function () {
                var handlerIndex = handlerList.indexOf(handler);
                if (handlerIndex !== -1) {
                    handlerList.splice(handlerIndex, 1);
                }
            }
        };
    };
    EscapeSequenceParser.prototype.setCsiHandler = function (id, handler) {
        this._csiHandlers[this._identifier(id)] = [handler];
    };
    EscapeSequenceParser.prototype.clearCsiHandler = function (id) {
        if (this._csiHandlers[this._identifier(id)])
            delete this._csiHandlers[this._identifier(id)];
    };
    EscapeSequenceParser.prototype.setCsiHandlerFallback = function (callback) {
        this._csiHandlerFb = callback;
    };
    EscapeSequenceParser.prototype.addDcsHandler = function (id, handler) {
        return this._dcsParser.addHandler(this._identifier(id), handler);
    };
    EscapeSequenceParser.prototype.setDcsHandler = function (id, handler) {
        this._dcsParser.setHandler(this._identifier(id), handler);
    };
    EscapeSequenceParser.prototype.clearDcsHandler = function (id) {
        this._dcsParser.clearHandler(this._identifier(id));
    };
    EscapeSequenceParser.prototype.setDcsHandlerFallback = function (handler) {
        this._dcsParser.setHandlerFallback(handler);
    };
    EscapeSequenceParser.prototype.addOscHandler = function (ident, handler) {
        return this._oscParser.addHandler(ident, handler);
    };
    EscapeSequenceParser.prototype.setOscHandler = function (ident, handler) {
        this._oscParser.setHandler(ident, handler);
    };
    EscapeSequenceParser.prototype.clearOscHandler = function (ident) {
        this._oscParser.clearHandler(ident);
    };
    EscapeSequenceParser.prototype.setOscHandlerFallback = function (handler) {
        this._oscParser.setHandlerFallback(handler);
    };
    EscapeSequenceParser.prototype.setErrorHandler = function (callback) {
        this._errorHandler = callback;
    };
    EscapeSequenceParser.prototype.clearErrorHandler = function () {
        this._errorHandler = this._errorHandlerFb;
    };
    EscapeSequenceParser.prototype.reset = function () {
        this.currentState = this.initialState;
        this._oscParser.reset();
        this._dcsParser.reset();
        this._params.reset();
        this._params.addParam(0);
        this._collect = 0;
        this.precedingCodepoint = 0;
    };
    EscapeSequenceParser.prototype.parse = function (data, length) {
        var code = 0;
        var transition = 0;
        var currentState = this.currentState;
        var osc = this._oscParser;
        var dcs = this._dcsParser;
        var collect = this._collect;
        var params = this._params;
        var table = this.TRANSITIONS.table;
        for (var i = 0; i < length; ++i) {
            code = data[i];
            transition = table[currentState << 8 | (code < 0xa0 ? code : NON_ASCII_PRINTABLE)];
            switch (transition >> 4) {
                case 2:
                    for (var j_1 = i + 1;; ++j_1) {
                        if (j_1 >= length || (code = data[j_1]) < 0x20 || (code > 0x7e && code < NON_ASCII_PRINTABLE)) {
                            this._printHandler(data, i, j_1);
                            i = j_1 - 1;
                            break;
                        }
                        if (++j_1 >= length || (code = data[j_1]) < 0x20 || (code > 0x7e && code < NON_ASCII_PRINTABLE)) {
                            this._printHandler(data, i, j_1);
                            i = j_1 - 1;
                            break;
                        }
                        if (++j_1 >= length || (code = data[j_1]) < 0x20 || (code > 0x7e && code < NON_ASCII_PRINTABLE)) {
                            this._printHandler(data, i, j_1);
                            i = j_1 - 1;
                            break;
                        }
                        if (++j_1 >= length || (code = data[j_1]) < 0x20 || (code > 0x7e && code < NON_ASCII_PRINTABLE)) {
                            this._printHandler(data, i, j_1);
                            i = j_1 - 1;
                            break;
                        }
                    }
                    break;
                case 3:
                    if (this._executeHandlers[code])
                        this._executeHandlers[code]();
                    else
                        this._executeHandlerFb(code);
                    this.precedingCodepoint = 0;
                    break;
                case 0:
                    break;
                case 1:
                    var inject = this._errorHandler({
                        position: i,
                        code: code,
                        currentState: currentState,
                        collect: collect,
                        params: params,
                        abort: false
                    });
                    if (inject.abort)
                        return;
                    break;
                case 7:
                    var handlers = this._csiHandlers[collect << 8 | code];
                    var j = handlers ? handlers.length - 1 : -1;
                    for (; j >= 0; j--) {
                        if (handlers[j](params) !== false) {
                            break;
                        }
                    }
                    if (j < 0) {
                        this._csiHandlerFb(collect << 8 | code, params);
                    }
                    this.precedingCodepoint = 0;
                    break;
                case 8:
                    do {
                        switch (code) {
                            case 0x3b:
                                params.addParam(0);
                                break;
                            case 0x3a:
                                params.addSubParam(-1);
                                break;
                            default:
                                params.addDigit(code - 48);
                        }
                    } while (++i < length && (code = data[i]) > 0x2f && code < 0x3c);
                    i--;
                    break;
                case 9:
                    collect <<= 8;
                    collect |= code;
                    break;
                case 10:
                    var handlersEsc = this._escHandlers[collect << 8 | code];
                    var jj = handlersEsc ? handlersEsc.length - 1 : -1;
                    for (; jj >= 0; jj--) {
                        if (handlersEsc[jj]() !== false) {
                            break;
                        }
                    }
                    if (jj < 0) {
                        this._escHandlerFb(collect << 8 | code);
                    }
                    this.precedingCodepoint = 0;
                    break;
                case 11:
                    params.reset();
                    params.addParam(0);
                    collect = 0;
                    break;
                case 12:
                    dcs.hook(collect << 8 | code, params);
                    break;
                case 13:
                    for (var j_2 = i + 1;; ++j_2) {
                        if (j_2 >= length || (code = data[j_2]) === 0x18 || code === 0x1a || code === 0x1b || (code > 0x7f && code < NON_ASCII_PRINTABLE)) {
                            dcs.put(data, i, j_2);
                            i = j_2 - 1;
                            break;
                        }
                    }
                    break;
                case 14:
                    dcs.unhook(code !== 0x18 && code !== 0x1a);
                    if (code === 0x1b)
                        transition |= 1;
                    params.reset();
                    params.addParam(0);
                    collect = 0;
                    this.precedingCodepoint = 0;
                    break;
                case 4:
                    osc.start();
                    break;
                case 5:
                    for (var j_3 = i + 1;; j_3++) {
                        if (j_3 >= length || (code = data[j_3]) < 0x20 || (code > 0x7f && code <= 0x9f)) {
                            osc.put(data, i, j_3);
                            i = j_3 - 1;
                            break;
                        }
                    }
                    break;
                case 6:
                    osc.end(code !== 0x18 && code !== 0x1a);
                    if (code === 0x1b)
                        transition |= 1;
                    params.reset();
                    params.addParam(0);
                    collect = 0;
                    this.precedingCodepoint = 0;
                    break;
            }
            currentState = transition & 15;
        }
        this._collect = collect;
        this.currentState = currentState;
    };
    return EscapeSequenceParser;
}(Lifecycle_1.Disposable));
exports.EscapeSequenceParser = EscapeSequenceParser;


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var TextRenderLayer_1 = __webpack_require__(40);
var SelectionRenderLayer_1 = __webpack_require__(45);
var CursorRenderLayer_1 = __webpack_require__(46);
var LinkRenderLayer_1 = __webpack_require__(47);
var CharacterJoinerRegistry_1 = __webpack_require__(27);
var Lifecycle_1 = __webpack_require__(2);
var CharAtlasCache_1 = __webpack_require__(23);
var nextRendererId = 1;
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer(_colors, _terminal, bufferService, _charSizeService, optionsService) {
        var _this = _super.call(this) || this;
        _this._colors = _colors;
        _this._terminal = _terminal;
        _this.bufferService = bufferService;
        _this._charSizeService = _charSizeService;
        _this.optionsService = optionsService;
        _this._id = nextRendererId++;
        var allowTransparency = _this._terminal.options.allowTransparency;
        _this._characterJoinerRegistry = new CharacterJoinerRegistry_1.CharacterJoinerRegistry(bufferService);
        _this._renderLayers = [
            new TextRenderLayer_1.TextRenderLayer(_this._terminal.screenElement, 0, _this._colors, _this._characterJoinerRegistry, allowTransparency, _this._id, bufferService, optionsService),
            new SelectionRenderLayer_1.SelectionRenderLayer(_this._terminal.screenElement, 1, _this._colors, _this._id, bufferService, optionsService),
            new LinkRenderLayer_1.LinkRenderLayer(_this._terminal.screenElement, 2, _this._colors, _this._id, _this._terminal.linkifier, bufferService, optionsService),
            new CursorRenderLayer_1.CursorRenderLayer(_this._terminal.screenElement, 3, _this._colors, _this._terminal, _this._id, bufferService, optionsService)
        ];
        _this.dimensions = {
            scaledCharWidth: null,
            scaledCharHeight: null,
            scaledCellWidth: null,
            scaledCellHeight: null,
            scaledCharLeft: null,
            scaledCharTop: null,
            scaledCanvasWidth: null,
            scaledCanvasHeight: null,
            canvasWidth: null,
            canvasHeight: null,
            actualCellWidth: null,
            actualCellHeight: null
        };
        _this._devicePixelRatio = window.devicePixelRatio;
        _this._updateDimensions();
        _this.onOptionsChanged();
        return _this;
    }
    Renderer.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._renderLayers.forEach(function (l) { return l.dispose(); });
        CharAtlasCache_1.removeTerminalFromCache(this._id);
    };
    Renderer.prototype.onDevicePixelRatioChange = function () {
        if (this._devicePixelRatio !== window.devicePixelRatio) {
            this._devicePixelRatio = window.devicePixelRatio;
            this.onResize(this._terminal.cols, this._terminal.rows);
        }
    };
    Renderer.prototype.setColors = function (colors) {
        var _this = this;
        this._colors = colors;
        this._renderLayers.forEach(function (l) {
            l.setColors(_this._colors);
            l.reset();
        });
    };
    Renderer.prototype.onResize = function (cols, rows) {
        var _this = this;
        this._updateDimensions();
        this._renderLayers.forEach(function (l) { return l.resize(_this.dimensions); });
        this._terminal.screenElement.style.width = this.dimensions.canvasWidth + "px";
        this._terminal.screenElement.style.height = this.dimensions.canvasHeight + "px";
    };
    Renderer.prototype.onCharSizeChanged = function () {
        this.onResize(this._terminal.cols, this._terminal.rows);
    };
    Renderer.prototype.onBlur = function () {
        this._runOperation(function (l) { return l.onBlur(); });
    };
    Renderer.prototype.onFocus = function () {
        this._runOperation(function (l) { return l.onFocus(); });
    };
    Renderer.prototype.onSelectionChanged = function (start, end, columnSelectMode) {
        if (columnSelectMode === void 0) { columnSelectMode = false; }
        this._runOperation(function (l) { return l.onSelectionChanged(start, end, columnSelectMode); });
    };
    Renderer.prototype.onCursorMove = function () {
        this._runOperation(function (l) { return l.onCursorMove(); });
    };
    Renderer.prototype.onOptionsChanged = function () {
        this._runOperation(function (l) { return l.onOptionsChanged(); });
    };
    Renderer.prototype.clear = function () {
        this._runOperation(function (l) { return l.reset(); });
    };
    Renderer.prototype._runOperation = function (operation) {
        this._renderLayers.forEach(function (l) { return operation(l); });
    };
    Renderer.prototype.renderRows = function (start, end) {
        this._renderLayers.forEach(function (l) { return l.onGridChanged(start, end); });
    };
    Renderer.prototype._updateDimensions = function () {
        if (!this._charSizeService.hasValidSize) {
            return;
        }
        this.dimensions.scaledCharWidth = Math.floor(this._charSizeService.width * window.devicePixelRatio);
        this.dimensions.scaledCharHeight = Math.ceil(this._charSizeService.height * window.devicePixelRatio);
        this.dimensions.scaledCellHeight = Math.floor(this.dimensions.scaledCharHeight * this._terminal.options.lineHeight);
        this.dimensions.scaledCharTop = this._terminal.options.lineHeight === 1 ? 0 : Math.round((this.dimensions.scaledCellHeight - this.dimensions.scaledCharHeight) / 2);
        this.dimensions.scaledCellWidth = this.dimensions.scaledCharWidth + Math.round(this._terminal.options.letterSpacing);
        this.dimensions.scaledCharLeft = Math.floor(this._terminal.options.letterSpacing / 2);
        this.dimensions.scaledCanvasHeight = this._terminal.rows * this.dimensions.scaledCellHeight;
        this.dimensions.scaledCanvasWidth = this._terminal.cols * this.dimensions.scaledCellWidth;
        this.dimensions.canvasHeight = Math.round(this.dimensions.scaledCanvasHeight / window.devicePixelRatio);
        this.dimensions.canvasWidth = Math.round(this.dimensions.scaledCanvasWidth / window.devicePixelRatio);
        this.dimensions.actualCellHeight = this.dimensions.canvasHeight / this._terminal.rows;
        this.dimensions.actualCellWidth = this.dimensions.canvasWidth / this._terminal.cols;
    };
    Renderer.prototype.registerCharacterJoiner = function (handler) {
        return this._characterJoinerRegistry.registerCharacterJoiner(handler);
    };
    Renderer.prototype.deregisterCharacterJoiner = function (joinerId) {
        return this._characterJoinerRegistry.deregisterCharacterJoiner(joinerId);
    };
    return Renderer;
}(Lifecycle_1.Disposable));
exports.Renderer = Renderer;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var GridCache_1 = __webpack_require__(41);
var BaseRenderLayer_1 = __webpack_require__(12);
var AttributeData_1 = __webpack_require__(6);
var Constants_1 = __webpack_require__(3);
var CharacterJoinerRegistry_1 = __webpack_require__(27);
var CellData_1 = __webpack_require__(4);
var TextRenderLayer = (function (_super) {
    __extends(TextRenderLayer, _super);
    function TextRenderLayer(container, zIndex, colors, characterJoinerRegistry, alpha, rendererId, bufferService, optionsService) {
        var _this = _super.call(this, container, 'text', zIndex, alpha, colors, rendererId, bufferService, optionsService) || this;
        _this.bufferService = bufferService;
        _this.optionsService = optionsService;
        _this._characterWidth = 0;
        _this._characterFont = '';
        _this._characterOverlapCache = {};
        _this._workCell = new CellData_1.CellData();
        _this._state = new GridCache_1.GridCache();
        _this._characterJoinerRegistry = characterJoinerRegistry;
        return _this;
    }
    TextRenderLayer.prototype.resize = function (dim) {
        _super.prototype.resize.call(this, dim);
        var terminalFont = this._getFont(false, false);
        if (this._characterWidth !== dim.scaledCharWidth || this._characterFont !== terminalFont) {
            this._characterWidth = dim.scaledCharWidth;
            this._characterFont = terminalFont;
            this._characterOverlapCache = {};
        }
        this._state.clear();
        this._state.resize(this._bufferService.cols, this._bufferService.rows);
    };
    TextRenderLayer.prototype.reset = function () {
        this._state.clear();
        this._clearAll();
    };
    TextRenderLayer.prototype._forEachCell = function (firstRow, lastRow, joinerRegistry, callback) {
        for (var y = firstRow; y <= lastRow; y++) {
            var row = y + this._bufferService.buffer.ydisp;
            var line = this._bufferService.buffer.lines.get(row);
            var joinedRanges = joinerRegistry ? joinerRegistry.getJoinedCharacters(row) : [];
            for (var x = 0; x < this._bufferService.cols; x++) {
                line.loadCell(x, this._workCell);
                var cell = this._workCell;
                var isJoined = false;
                var lastCharX = x;
                if (cell.getWidth() === 0) {
                    continue;
                }
                if (joinedRanges.length > 0 && x === joinedRanges[0][0]) {
                    isJoined = true;
                    var range = joinedRanges.shift();
                    cell = new CharacterJoinerRegistry_1.JoinedCellData(this._workCell, line.translateToString(true, range[0], range[1]), range[1] - range[0]);
                    lastCharX = range[1] - 1;
                }
                if (!isJoined && this._isOverlapping(cell)) {
                    if (lastCharX < line.length - 1 && line.getCodePoint(lastCharX + 1) === Constants_1.NULL_CELL_CODE) {
                        cell.content &= ~12582912;
                        cell.content |= 2 << 22;
                    }
                }
                callback(cell, x, y);
                x = lastCharX;
            }
        }
    };
    TextRenderLayer.prototype._drawBackground = function (firstRow, lastRow) {
        var _this = this;
        var ctx = this._ctx;
        var cols = this._bufferService.cols;
        var startX = 0;
        var startY = 0;
        var prevFillStyle = null;
        ctx.save();
        this._forEachCell(firstRow, lastRow, null, function (cell, x, y) {
            var nextFillStyle = null;
            if (cell.isInverse()) {
                if (cell.isFgDefault()) {
                    nextFillStyle = _this._colors.foreground.css;
                }
                else if (cell.isFgRGB()) {
                    nextFillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getFgColor()).join(',') + ")";
                }
                else {
                    nextFillStyle = _this._colors.ansi[cell.getFgColor()].css;
                }
            }
            else if (cell.isBgRGB()) {
                nextFillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getBgColor()).join(',') + ")";
            }
            else if (cell.isBgPalette()) {
                nextFillStyle = _this._colors.ansi[cell.getBgColor()].css;
            }
            if (prevFillStyle === null) {
                startX = x;
                startY = y;
            }
            if (y !== startY) {
                ctx.fillStyle = prevFillStyle ? prevFillStyle : '';
                _this._fillCells(startX, startY, cols - startX, 1);
                startX = x;
                startY = y;
            }
            else if (prevFillStyle !== nextFillStyle) {
                ctx.fillStyle = prevFillStyle ? prevFillStyle : '';
                _this._fillCells(startX, startY, x - startX, 1);
                startX = x;
                startY = y;
            }
            prevFillStyle = nextFillStyle;
        });
        if (prevFillStyle !== null) {
            ctx.fillStyle = prevFillStyle;
            this._fillCells(startX, startY, cols - startX, 1);
        }
        ctx.restore();
    };
    TextRenderLayer.prototype._drawForeground = function (firstRow, lastRow) {
        var _this = this;
        this._forEachCell(firstRow, lastRow, this._characterJoinerRegistry, function (cell, x, y) {
            if (cell.isInvisible()) {
                return;
            }
            _this._drawChars(cell, x, y);
            if (cell.isUnderline()) {
                _this._ctx.save();
                if (cell.isInverse()) {
                    if (cell.isBgDefault()) {
                        _this._ctx.fillStyle = _this._colors.background.css;
                    }
                    else if (cell.isBgRGB()) {
                        _this._ctx.fillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getBgColor()).join(',') + ")";
                    }
                    else {
                        _this._ctx.fillStyle = _this._colors.ansi[cell.getBgColor()].css;
                    }
                }
                else {
                    if (cell.isFgDefault()) {
                        _this._ctx.fillStyle = _this._colors.foreground.css;
                    }
                    else if (cell.isFgRGB()) {
                        _this._ctx.fillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getFgColor()).join(',') + ")";
                    }
                    else {
                        var fg = cell.getFgColor();
                        if (_this._optionsService.options.drawBoldTextInBrightColors && cell.isBold() && fg < 8) {
                            fg += 8;
                        }
                        _this._ctx.fillStyle = _this._colors.ansi[fg].css;
                    }
                }
                _this._fillBottomLineAtCells(x, y, cell.getWidth());
                _this._ctx.restore();
            }
        });
    };
    TextRenderLayer.prototype.onGridChanged = function (firstRow, lastRow) {
        if (this._state.cache.length === 0) {
            return;
        }
        if (this._charAtlas) {
            this._charAtlas.beginFrame();
        }
        this._clearCells(0, firstRow, this._bufferService.cols, lastRow - firstRow + 1);
        this._drawBackground(firstRow, lastRow);
        this._drawForeground(firstRow, lastRow);
    };
    TextRenderLayer.prototype.onOptionsChanged = function () {
        this._setTransparency(this._optionsService.options.allowTransparency);
    };
    TextRenderLayer.prototype._isOverlapping = function (cell) {
        if (cell.getWidth() !== 1) {
            return false;
        }
        if (cell.getCode() < 256) {
            return false;
        }
        var chars = cell.getChars();
        if (this._characterOverlapCache.hasOwnProperty(chars)) {
            return this._characterOverlapCache[chars];
        }
        this._ctx.save();
        this._ctx.font = this._characterFont;
        var overlaps = Math.floor(this._ctx.measureText(chars).width) > this._characterWidth;
        this._ctx.restore();
        this._characterOverlapCache[chars] = overlaps;
        return overlaps;
    };
    return TextRenderLayer;
}(BaseRenderLayer_1.BaseRenderLayer));
exports.TextRenderLayer = TextRenderLayer;


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var GridCache = (function () {
    function GridCache() {
        this.cache = [];
    }
    GridCache.prototype.resize = function (width, height) {
        for (var x = 0; x < width; x++) {
            if (this.cache.length <= x) {
                this.cache.push([]);
            }
            for (var y = this.cache[x].length; y < height; y++) {
                this.cache[x].push(undefined);
            }
            this.cache[x].length = height;
        }
        this.cache.length = width;
    };
    GridCache.prototype.clear = function () {
        for (var x = 0; x < this.cache.length; x++) {
            for (var y = 0; y < this.cache[x].length; y++) {
                this.cache[x][y] = undefined;
            }
        }
    };
    return GridCache;
}());
exports.GridCache = GridCache;


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Constants_1 = __webpack_require__(9);
var BaseCharAtlas_1 = __webpack_require__(43);
var ColorManager_1 = __webpack_require__(25);
var LRUMap_1 = __webpack_require__(44);
var Platform_1 = __webpack_require__(10);
var RendererUtils_1 = __webpack_require__(26);
var TEXTURE_WIDTH = 1024;
var TEXTURE_HEIGHT = 1024;
var TRANSPARENT_COLOR = {
    css: 'rgba(0, 0, 0, 0)',
    rgba: 0
};
var FRAME_CACHE_DRAW_LIMIT = 100;
var GLYPH_BITMAP_COMMIT_DELAY = 100;
function getGlyphCacheKey(glyph) {
    return glyph.code << 21 | glyph.bg << 12 | glyph.fg << 3 | (glyph.bold ? 0 : 4) + (glyph.dim ? 0 : 2) + (glyph.italic ? 0 : 1);
}
exports.getGlyphCacheKey = getGlyphCacheKey;
var DynamicCharAtlas = (function (_super) {
    __extends(DynamicCharAtlas, _super);
    function DynamicCharAtlas(document, _config) {
        var _this = _super.call(this) || this;
        _this._config = _config;
        _this._drawToCacheCount = 0;
        _this._glyphsWaitingOnBitmap = [];
        _this._bitmapCommitTimeout = null;
        _this._bitmap = null;
        _this._cacheCanvas = document.createElement('canvas');
        _this._cacheCanvas.width = TEXTURE_WIDTH;
        _this._cacheCanvas.height = TEXTURE_HEIGHT;
        _this._cacheCtx = RendererUtils_1.throwIfFalsy(_this._cacheCanvas.getContext('2d', { alpha: true }));
        var tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = _this._config.scaledCharWidth;
        tmpCanvas.height = _this._config.scaledCharHeight;
        _this._tmpCtx = RendererUtils_1.throwIfFalsy(tmpCanvas.getContext('2d', { alpha: _this._config.allowTransparency }));
        _this._width = Math.floor(TEXTURE_WIDTH / _this._config.scaledCharWidth);
        _this._height = Math.floor(TEXTURE_HEIGHT / _this._config.scaledCharHeight);
        var capacity = _this._width * _this._height;
        _this._cacheMap = new LRUMap_1.LRUMap(capacity);
        _this._cacheMap.prealloc(capacity);
        return _this;
    }
    DynamicCharAtlas.prototype.dispose = function () {
        if (this._bitmapCommitTimeout !== null) {
            window.clearTimeout(this._bitmapCommitTimeout);
            this._bitmapCommitTimeout = null;
        }
    };
    DynamicCharAtlas.prototype.beginFrame = function () {
        this._drawToCacheCount = 0;
    };
    DynamicCharAtlas.prototype.draw = function (ctx, glyph, x, y) {
        if (glyph.code === 32) {
            return true;
        }
        if (!this._canCache(glyph)) {
            return false;
        }
        var glyphKey = getGlyphCacheKey(glyph);
        var cacheValue = this._cacheMap.get(glyphKey);
        if (cacheValue !== null && cacheValue !== undefined) {
            this._drawFromCache(ctx, cacheValue, x, y);
            return true;
        }
        else if (this._drawToCacheCount < FRAME_CACHE_DRAW_LIMIT) {
            var index = void 0;
            if (this._cacheMap.size < this._cacheMap.capacity) {
                index = this._cacheMap.size;
            }
            else {
                index = this._cacheMap.peek().index;
            }
            var cacheValue_1 = this._drawToCache(glyph, index);
            this._cacheMap.set(glyphKey, cacheValue_1);
            this._drawFromCache(ctx, cacheValue_1, x, y);
            return true;
        }
        return false;
    };
    DynamicCharAtlas.prototype._canCache = function (glyph) {
        return glyph.code < 256;
    };
    DynamicCharAtlas.prototype._toCoordinateX = function (index) {
        return (index % this._width) * this._config.scaledCharWidth;
    };
    DynamicCharAtlas.prototype._toCoordinateY = function (index) {
        return Math.floor(index / this._width) * this._config.scaledCharHeight;
    };
    DynamicCharAtlas.prototype._drawFromCache = function (ctx, cacheValue, x, y) {
        if (cacheValue.isEmpty) {
            return;
        }
        var cacheX = this._toCoordinateX(cacheValue.index);
        var cacheY = this._toCoordinateY(cacheValue.index);
        ctx.drawImage(cacheValue.inBitmap ? this._bitmap : this._cacheCanvas, cacheX, cacheY, this._config.scaledCharWidth, this._config.scaledCharHeight, x, y, this._config.scaledCharWidth, this._config.scaledCharHeight);
    };
    DynamicCharAtlas.prototype._getColorFromAnsiIndex = function (idx) {
        if (idx < this._config.colors.ansi.length) {
            return this._config.colors.ansi[idx];
        }
        return ColorManager_1.DEFAULT_ANSI_COLORS[idx];
    };
    DynamicCharAtlas.prototype._getBackgroundColor = function (glyph) {
        if (this._config.allowTransparency) {
            return TRANSPARENT_COLOR;
        }
        else if (glyph.bg === Constants_1.INVERTED_DEFAULT_COLOR) {
            return this._config.colors.foreground;
        }
        else if (glyph.bg < 256) {
            return this._getColorFromAnsiIndex(glyph.bg);
        }
        return this._config.colors.background;
    };
    DynamicCharAtlas.prototype._getForegroundColor = function (glyph) {
        if (glyph.fg === Constants_1.INVERTED_DEFAULT_COLOR) {
            return this._config.colors.background;
        }
        else if (glyph.fg < 256) {
            return this._getColorFromAnsiIndex(glyph.fg);
        }
        return this._config.colors.foreground;
    };
    DynamicCharAtlas.prototype._drawToCache = function (glyph, index) {
        this._drawToCacheCount++;
        this._tmpCtx.save();
        var backgroundColor = this._getBackgroundColor(glyph);
        this._tmpCtx.globalCompositeOperation = 'copy';
        this._tmpCtx.fillStyle = backgroundColor.css;
        this._tmpCtx.fillRect(0, 0, this._config.scaledCharWidth, this._config.scaledCharHeight);
        this._tmpCtx.globalCompositeOperation = 'source-over';
        var fontWeight = glyph.bold ? this._config.fontWeightBold : this._config.fontWeight;
        var fontStyle = glyph.italic ? 'italic' : '';
        this._tmpCtx.font =
            fontStyle + " " + fontWeight + " " + this._config.fontSize * this._config.devicePixelRatio + "px " + this._config.fontFamily;
        this._tmpCtx.textBaseline = 'middle';
        this._tmpCtx.fillStyle = this._getForegroundColor(glyph).css;
        if (glyph.dim) {
            this._tmpCtx.globalAlpha = Constants_1.DIM_OPACITY;
        }
        this._tmpCtx.fillText(glyph.chars, 0, this._config.scaledCharHeight / 2);
        this._tmpCtx.restore();
        var imageData = this._tmpCtx.getImageData(0, 0, this._config.scaledCharWidth, this._config.scaledCharHeight);
        var isEmpty = false;
        if (!this._config.allowTransparency) {
            isEmpty = clearColor(imageData, backgroundColor);
        }
        var x = this._toCoordinateX(index);
        var y = this._toCoordinateY(index);
        this._cacheCtx.putImageData(imageData, x, y);
        var cacheValue = {
            index: index,
            isEmpty: isEmpty,
            inBitmap: false
        };
        this._addGlyphToBitmap(cacheValue);
        return cacheValue;
    };
    DynamicCharAtlas.prototype._addGlyphToBitmap = function (cacheValue) {
        var _this = this;
        if (!('createImageBitmap' in window) || Platform_1.isFirefox || Platform_1.isSafari) {
            return;
        }
        this._glyphsWaitingOnBitmap.push(cacheValue);
        if (this._bitmapCommitTimeout !== null) {
            return;
        }
        this._bitmapCommitTimeout = window.setTimeout(function () { return _this._generateBitmap(); }, GLYPH_BITMAP_COMMIT_DELAY);
    };
    DynamicCharAtlas.prototype._generateBitmap = function () {
        var _this = this;
        var glyphsMovingToBitmap = this._glyphsWaitingOnBitmap;
        this._glyphsWaitingOnBitmap = [];
        window.createImageBitmap(this._cacheCanvas).then(function (bitmap) {
            _this._bitmap = bitmap;
            for (var i = 0; i < glyphsMovingToBitmap.length; i++) {
                var value = glyphsMovingToBitmap[i];
                value.inBitmap = true;
            }
        });
        this._bitmapCommitTimeout = null;
    };
    return DynamicCharAtlas;
}(BaseCharAtlas_1.BaseCharAtlas));
exports.DynamicCharAtlas = DynamicCharAtlas;
var NoneCharAtlas = (function (_super) {
    __extends(NoneCharAtlas, _super);
    function NoneCharAtlas(document, config) {
        return _super.call(this) || this;
    }
    NoneCharAtlas.prototype.draw = function (ctx, glyph, x, y) {
        return false;
    };
    return NoneCharAtlas;
}(BaseCharAtlas_1.BaseCharAtlas));
exports.NoneCharAtlas = NoneCharAtlas;
function clearColor(imageData, color) {
    var isEmpty = true;
    var r = color.rgba >>> 24;
    var g = color.rgba >>> 16 & 0xFF;
    var b = color.rgba >>> 8 & 0xFF;
    for (var offset = 0; offset < imageData.data.length; offset += 4) {
        if (imageData.data[offset] === r &&
            imageData.data[offset + 1] === g &&
            imageData.data[offset + 2] === b) {
            imageData.data[offset + 3] = 0;
        }
        else {
            isEmpty = false;
        }
    }
    return isEmpty;
}


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var BaseCharAtlas = (function () {
    function BaseCharAtlas() {
        this._didWarmUp = false;
    }
    BaseCharAtlas.prototype.dispose = function () { };
    BaseCharAtlas.prototype.warmUp = function () {
        if (!this._didWarmUp) {
            this._doWarmUp();
            this._didWarmUp = true;
        }
    };
    BaseCharAtlas.prototype._doWarmUp = function () { };
    BaseCharAtlas.prototype.beginFrame = function () { };
    return BaseCharAtlas;
}());
exports.BaseCharAtlas = BaseCharAtlas;


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var LRUMap = (function () {
    function LRUMap(capacity) {
        this.capacity = capacity;
        this._map = {};
        this._head = null;
        this._tail = null;
        this._nodePool = [];
        this.size = 0;
    }
    LRUMap.prototype._unlinkNode = function (node) {
        var prev = node.prev;
        var next = node.next;
        if (node === this._head) {
            this._head = next;
        }
        if (node === this._tail) {
            this._tail = prev;
        }
        if (prev !== null) {
            prev.next = next;
        }
        if (next !== null) {
            next.prev = prev;
        }
    };
    LRUMap.prototype._appendNode = function (node) {
        var tail = this._tail;
        if (tail !== null) {
            tail.next = node;
        }
        node.prev = tail;
        node.next = null;
        this._tail = node;
        if (this._head === null) {
            this._head = node;
        }
    };
    LRUMap.prototype.prealloc = function (count) {
        var nodePool = this._nodePool;
        for (var i = 0; i < count; i++) {
            nodePool.push({
                prev: null,
                next: null,
                key: null,
                value: null
            });
        }
    };
    LRUMap.prototype.get = function (key) {
        var node = this._map[key];
        if (node !== undefined) {
            this._unlinkNode(node);
            this._appendNode(node);
            return node.value;
        }
        return null;
    };
    LRUMap.prototype.peekValue = function (key) {
        var node = this._map[key];
        if (node !== undefined) {
            return node.value;
        }
        return null;
    };
    LRUMap.prototype.peek = function () {
        var head = this._head;
        return head === null ? null : head.value;
    };
    LRUMap.prototype.set = function (key, value) {
        var node = this._map[key];
        if (node !== undefined) {
            node = this._map[key];
            this._unlinkNode(node);
            node.value = value;
        }
        else if (this.size >= this.capacity) {
            node = this._head;
            this._unlinkNode(node);
            delete this._map[node.key];
            node.key = key;
            node.value = value;
            this._map[key] = node;
        }
        else {
            var nodePool = this._nodePool;
            if (nodePool.length > 0) {
                node = nodePool.pop();
                node.key = key;
                node.value = value;
            }
            else {
                node = {
                    prev: null,
                    next: null,
                    key: key,
                    value: value
                };
            }
            this._map[key] = node;
            this.size++;
        }
        this._appendNode(node);
    };
    return LRUMap;
}());
exports.LRUMap = LRUMap;


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BaseRenderLayer_1 = __webpack_require__(12);
var SelectionRenderLayer = (function (_super) {
    __extends(SelectionRenderLayer, _super);
    function SelectionRenderLayer(container, zIndex, colors, rendererId, bufferService, optionsService) {
        var _this = _super.call(this, container, 'selection', zIndex, true, colors, rendererId, bufferService, optionsService) || this;
        _this.bufferService = bufferService;
        _this.optionsService = optionsService;
        _this._clearState();
        return _this;
    }
    SelectionRenderLayer.prototype._clearState = function () {
        this._state = {
            start: undefined,
            end: undefined,
            columnSelectMode: undefined,
            ydisp: undefined
        };
    };
    SelectionRenderLayer.prototype.resize = function (dim) {
        _super.prototype.resize.call(this, dim);
        this._clearState();
    };
    SelectionRenderLayer.prototype.reset = function () {
        if (this._state.start && this._state.end) {
            this._clearState();
            this._clearAll();
        }
    };
    SelectionRenderLayer.prototype.onSelectionChanged = function (start, end, columnSelectMode) {
        if (!this._didStateChange(start, end, columnSelectMode, this._bufferService.buffer.ydisp)) {
            return;
        }
        this._clearAll();
        if (!start || !end) {
            this._clearState();
            return;
        }
        var viewportStartRow = start[1] - this._bufferService.buffer.ydisp;
        var viewportEndRow = end[1] - this._bufferService.buffer.ydisp;
        var viewportCappedStartRow = Math.max(viewportStartRow, 0);
        var viewportCappedEndRow = Math.min(viewportEndRow, this._bufferService.rows - 1);
        if (viewportCappedStartRow >= this._bufferService.rows || viewportCappedEndRow < 0) {
            return;
        }
        this._ctx.fillStyle = this._colors.selection.css;
        if (columnSelectMode) {
            var startCol = start[0];
            var width = end[0] - startCol;
            var height = viewportCappedEndRow - viewportCappedStartRow + 1;
            this._fillCells(startCol, viewportCappedStartRow, width, height);
        }
        else {
            var startCol = viewportStartRow === viewportCappedStartRow ? start[0] : 0;
            var startRowEndCol = viewportCappedStartRow === viewportCappedEndRow ? end[0] : this._bufferService.cols;
            this._fillCells(startCol, viewportCappedStartRow, startRowEndCol - startCol, 1);
            var middleRowsCount = Math.max(viewportCappedEndRow - viewportCappedStartRow - 1, 0);
            this._fillCells(0, viewportCappedStartRow + 1, this._bufferService.cols, middleRowsCount);
            if (viewportCappedStartRow !== viewportCappedEndRow) {
                var endCol = viewportEndRow === viewportCappedEndRow ? end[0] : this._bufferService.cols;
                this._fillCells(0, viewportCappedEndRow, endCol, 1);
            }
        }
        this._state.start = [start[0], start[1]];
        this._state.end = [end[0], end[1]];
        this._state.columnSelectMode = columnSelectMode;
        this._state.ydisp = this._bufferService.buffer.ydisp;
    };
    SelectionRenderLayer.prototype._didStateChange = function (start, end, columnSelectMode, ydisp) {
        return !this._areCoordinatesEqual(start, this._state.start) ||
            !this._areCoordinatesEqual(end, this._state.end) ||
            columnSelectMode !== this._state.columnSelectMode ||
            ydisp !== this._state.ydisp;
    };
    SelectionRenderLayer.prototype._areCoordinatesEqual = function (coord1, coord2) {
        if (!coord1 || !coord2) {
            return false;
        }
        return coord1[0] === coord2[0] && coord1[1] === coord2[1];
    };
    return SelectionRenderLayer;
}(BaseRenderLayer_1.BaseRenderLayer));
exports.SelectionRenderLayer = SelectionRenderLayer;


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BaseRenderLayer_1 = __webpack_require__(12);
var CellData_1 = __webpack_require__(4);
var BLINK_INTERVAL = 600;
var CursorRenderLayer = (function (_super) {
    __extends(CursorRenderLayer, _super);
    function CursorRenderLayer(container, zIndex, colors, _terminal, rendererId, bufferService, optionsService) {
        var _this = _super.call(this, container, 'cursor', zIndex, true, colors, rendererId, bufferService, optionsService) || this;
        _this._terminal = _terminal;
        _this.bufferService = bufferService;
        _this.optionsService = optionsService;
        _this._cell = new CellData_1.CellData();
        _this._state = {
            x: null,
            y: null,
            isFocused: null,
            style: null,
            width: null
        };
        _this._cursorRenderers = {
            'bar': _this._renderBarCursor.bind(_this),
            'block': _this._renderBlockCursor.bind(_this),
            'underline': _this._renderUnderlineCursor.bind(_this)
        };
        return _this;
    }
    CursorRenderLayer.prototype.resize = function (dim) {
        _super.prototype.resize.call(this, dim);
        this._state = {
            x: null,
            y: null,
            isFocused: null,
            style: null,
            width: null
        };
    };
    CursorRenderLayer.prototype.reset = function () {
        this._clearCursor();
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.dispose();
            this._cursorBlinkStateManager = null;
            this.onOptionsChanged();
        }
    };
    CursorRenderLayer.prototype.onBlur = function () {
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.pause();
        }
        this._terminal.refresh(this._bufferService.buffer.y, this._bufferService.buffer.y);
    };
    CursorRenderLayer.prototype.onFocus = function () {
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.resume();
        }
        else {
            this._terminal.refresh(this._bufferService.buffer.y, this._bufferService.buffer.y);
        }
    };
    CursorRenderLayer.prototype.onOptionsChanged = function () {
        var _this = this;
        if (this._optionsService.options.cursorBlink) {
            if (!this._cursorBlinkStateManager) {
                this._cursorBlinkStateManager = new CursorBlinkStateManager(this._terminal.isFocused, function () {
                    _this._render(true);
                });
            }
        }
        else {
            if (this._cursorBlinkStateManager) {
                this._cursorBlinkStateManager.dispose();
                this._cursorBlinkStateManager = null;
            }
        }
        this._terminal.refresh(this._bufferService.buffer.y, this._bufferService.buffer.y);
    };
    CursorRenderLayer.prototype.onCursorMove = function () {
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.restartBlinkAnimation();
        }
    };
    CursorRenderLayer.prototype.onGridChanged = function (startRow, endRow) {
        if (!this._cursorBlinkStateManager || this._cursorBlinkStateManager.isPaused) {
            this._render(false);
        }
        else {
            this._cursorBlinkStateManager.restartBlinkAnimation();
        }
    };
    CursorRenderLayer.prototype._render = function (triggeredByAnimationFrame) {
        if (!this._terminal.cursorState || this._terminal.cursorHidden) {
            this._clearCursor();
            return;
        }
        var cursorY = this._bufferService.buffer.ybase + this._bufferService.buffer.y;
        var viewportRelativeCursorY = cursorY - this._bufferService.buffer.ydisp;
        if (viewportRelativeCursorY < 0 || viewportRelativeCursorY >= this._bufferService.rows) {
            this._clearCursor();
            return;
        }
        this._bufferService.buffer.lines.get(cursorY).loadCell(this._bufferService.buffer.x, this._cell);
        if (this._cell.content === undefined) {
            return;
        }
        if (!this._terminal.isFocused) {
            this._clearCursor();
            this._ctx.save();
            this._ctx.fillStyle = this._colors.cursor.css;
            var cursorStyle = this._optionsService.options.cursorStyle;
            if (cursorStyle && cursorStyle !== 'block') {
                this._cursorRenderers[cursorStyle](this._bufferService.buffer.x, viewportRelativeCursorY, this._cell);
            }
            else {
                this._renderBlurCursor(this._bufferService.buffer.x, viewportRelativeCursorY, this._cell);
            }
            this._ctx.restore();
            this._state.x = this._bufferService.buffer.x;
            this._state.y = viewportRelativeCursorY;
            this._state.isFocused = false;
            this._state.style = cursorStyle;
            this._state.width = this._cell.getWidth();
            return;
        }
        if (this._cursorBlinkStateManager && !this._cursorBlinkStateManager.isCursorVisible) {
            this._clearCursor();
            return;
        }
        if (this._state) {
            if (this._state.x === this._bufferService.buffer.x &&
                this._state.y === viewportRelativeCursorY &&
                this._state.isFocused === this._terminal.isFocused &&
                this._state.style === this._optionsService.options.cursorStyle &&
                this._state.width === this._cell.getWidth()) {
                return;
            }
            this._clearCursor();
        }
        this._ctx.save();
        this._cursorRenderers[this._optionsService.options.cursorStyle || 'block'](this._bufferService.buffer.x, viewportRelativeCursorY, this._cell);
        this._ctx.restore();
        this._state.x = this._bufferService.buffer.x;
        this._state.y = viewportRelativeCursorY;
        this._state.isFocused = false;
        this._state.style = this._optionsService.options.cursorStyle;
        this._state.width = this._cell.getWidth();
    };
    CursorRenderLayer.prototype._clearCursor = function () {
        if (this._state) {
            this._clearCells(this._state.x, this._state.y, this._state.width, 1);
            this._state = {
                x: null,
                y: null,
                isFocused: null,
                style: null,
                width: null
            };
        }
    };
    CursorRenderLayer.prototype._renderBarCursor = function (x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._colors.cursor.css;
        this._fillLeftLineAtCell(x, y);
        this._ctx.restore();
    };
    CursorRenderLayer.prototype._renderBlockCursor = function (x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._colors.cursor.css;
        this._fillCells(x, y, cell.getWidth(), 1);
        this._ctx.fillStyle = this._colors.cursorAccent.css;
        this._fillCharTrueColor(cell, x, y);
        this._ctx.restore();
    };
    CursorRenderLayer.prototype._renderUnderlineCursor = function (x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._colors.cursor.css;
        this._fillBottomLineAtCells(x, y);
        this._ctx.restore();
    };
    CursorRenderLayer.prototype._renderBlurCursor = function (x, y, cell) {
        this._ctx.save();
        this._ctx.strokeStyle = this._colors.cursor.css;
        this._strokeRectAtCell(x, y, cell.getWidth(), 1);
        this._ctx.restore();
    };
    return CursorRenderLayer;
}(BaseRenderLayer_1.BaseRenderLayer));
exports.CursorRenderLayer = CursorRenderLayer;
var CursorBlinkStateManager = (function () {
    function CursorBlinkStateManager(isFocused, _renderCallback) {
        this._renderCallback = _renderCallback;
        this.isCursorVisible = true;
        if (isFocused) {
            this._restartInterval();
        }
    }
    Object.defineProperty(CursorBlinkStateManager.prototype, "isPaused", {
        get: function () { return !(this._blinkStartTimeout || this._blinkInterval); },
        enumerable: true,
        configurable: true
    });
    CursorBlinkStateManager.prototype.dispose = function () {
        if (this._blinkInterval) {
            window.clearInterval(this._blinkInterval);
            this._blinkInterval = null;
        }
        if (this._blinkStartTimeout) {
            window.clearTimeout(this._blinkStartTimeout);
            this._blinkStartTimeout = null;
        }
        if (this._animationFrame) {
            window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = null;
        }
    };
    CursorBlinkStateManager.prototype.restartBlinkAnimation = function () {
        var _this = this;
        if (this.isPaused) {
            return;
        }
        this._animationTimeRestarted = Date.now();
        this.isCursorVisible = true;
        if (!this._animationFrame) {
            this._animationFrame = window.requestAnimationFrame(function () {
                _this._renderCallback();
                _this._animationFrame = null;
            });
        }
    };
    CursorBlinkStateManager.prototype._restartInterval = function (timeToStart) {
        var _this = this;
        if (timeToStart === void 0) { timeToStart = BLINK_INTERVAL; }
        if (this._blinkInterval) {
            window.clearInterval(this._blinkInterval);
        }
        this._blinkStartTimeout = setTimeout(function () {
            if (_this._animationTimeRestarted) {
                var time = BLINK_INTERVAL - (Date.now() - _this._animationTimeRestarted);
                _this._animationTimeRestarted = null;
                if (time > 0) {
                    _this._restartInterval(time);
                    return;
                }
            }
            _this.isCursorVisible = false;
            _this._animationFrame = window.requestAnimationFrame(function () {
                _this._renderCallback();
                _this._animationFrame = null;
            });
            _this._blinkInterval = setInterval(function () {
                if (_this._animationTimeRestarted) {
                    var time = BLINK_INTERVAL - (Date.now() - _this._animationTimeRestarted);
                    _this._animationTimeRestarted = null;
                    _this._restartInterval(time);
                    return;
                }
                _this.isCursorVisible = !_this.isCursorVisible;
                _this._animationFrame = window.requestAnimationFrame(function () {
                    _this._renderCallback();
                    _this._animationFrame = null;
                });
            }, BLINK_INTERVAL);
        }, timeToStart);
    };
    CursorBlinkStateManager.prototype.pause = function () {
        this.isCursorVisible = true;
        if (this._blinkInterval) {
            window.clearInterval(this._blinkInterval);
            this._blinkInterval = null;
        }
        if (this._blinkStartTimeout) {
            window.clearTimeout(this._blinkStartTimeout);
            this._blinkStartTimeout = null;
        }
        if (this._animationFrame) {
            window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = null;
        }
    };
    CursorBlinkStateManager.prototype.resume = function () {
        this._animationTimeRestarted = null;
        this._restartInterval();
        this.restartBlinkAnimation();
    };
    return CursorBlinkStateManager;
}());


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BaseRenderLayer_1 = __webpack_require__(12);
var Constants_1 = __webpack_require__(9);
var CharAtlasUtils_1 = __webpack_require__(24);
var LinkRenderLayer = (function (_super) {
    __extends(LinkRenderLayer, _super);
    function LinkRenderLayer(container, zIndex, colors, rendererId, linkifier, bufferService, optionsService) {
        var _this = _super.call(this, container, 'link', zIndex, true, colors, rendererId, bufferService, optionsService) || this;
        _this.bufferService = bufferService;
        _this.optionsService = optionsService;
        linkifier.onLinkHover(function (e) { return _this._onLinkHover(e); });
        linkifier.onLinkLeave(function (e) { return _this._onLinkLeave(e); });
        return _this;
    }
    LinkRenderLayer.prototype.resize = function (dim) {
        _super.prototype.resize.call(this, dim);
        this._state = undefined;
    };
    LinkRenderLayer.prototype.reset = function () {
        this._clearCurrentLink();
    };
    LinkRenderLayer.prototype._clearCurrentLink = function () {
        if (this._state) {
            this._clearCells(this._state.x1, this._state.y1, this._state.cols - this._state.x1, 1);
            var middleRowCount = this._state.y2 - this._state.y1 - 1;
            if (middleRowCount > 0) {
                this._clearCells(0, this._state.y1 + 1, this._state.cols, middleRowCount);
            }
            this._clearCells(0, this._state.y2, this._state.x2, 1);
            this._state = undefined;
        }
    };
    LinkRenderLayer.prototype._onLinkHover = function (e) {
        if (e.fg === Constants_1.INVERTED_DEFAULT_COLOR) {
            this._ctx.fillStyle = this._colors.background.css;
        }
        else if (e.fg && CharAtlasUtils_1.is256Color(e.fg)) {
            this._ctx.fillStyle = this._colors.ansi[e.fg].css;
        }
        else {
            this._ctx.fillStyle = this._colors.foreground.css;
        }
        if (e.y1 === e.y2) {
            this._fillBottomLineAtCells(e.x1, e.y1, e.x2 - e.x1);
        }
        else {
            this._fillBottomLineAtCells(e.x1, e.y1, e.cols - e.x1);
            for (var y = e.y1 + 1; y < e.y2; y++) {
                this._fillBottomLineAtCells(0, y, e.cols);
            }
            this._fillBottomLineAtCells(0, e.y2, e.x2);
        }
        this._state = e;
    };
    LinkRenderLayer.prototype._onLinkLeave = function (e) {
        this._clearCurrentLink();
    };
    return LinkRenderLayer;
}(BaseRenderLayer_1.BaseRenderLayer));
exports.LinkRenderLayer = LinkRenderLayer;


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CharWidth_1 = __webpack_require__(18);
var EventEmitter_1 = __webpack_require__(1);
var OVERSCAN_CHAR_LIMIT = 2000;
var Linkifier = (function () {
    function Linkifier(_bufferService, _logService) {
        this._bufferService = _bufferService;
        this._logService = _logService;
        this._linkMatchers = [];
        this._nextLinkMatcherId = 0;
        this._onLinkHover = new EventEmitter_1.EventEmitter();
        this._onLinkLeave = new EventEmitter_1.EventEmitter();
        this._onLinkTooltip = new EventEmitter_1.EventEmitter();
        this._rowsToLinkify = {
            start: undefined,
            end: undefined
        };
    }
    Object.defineProperty(Linkifier.prototype, "onLinkHover", {
        get: function () { return this._onLinkHover.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Linkifier.prototype, "onLinkLeave", {
        get: function () { return this._onLinkLeave.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Linkifier.prototype, "onLinkTooltip", {
        get: function () { return this._onLinkTooltip.event; },
        enumerable: true,
        configurable: true
    });
    Linkifier.prototype.attachToDom = function (element, mouseZoneManager) {
        this._element = element;
        this._mouseZoneManager = mouseZoneManager;
    };
    Linkifier.prototype.linkifyRows = function (start, end) {
        var _this = this;
        if (!this._mouseZoneManager) {
            return;
        }
        if (this._rowsToLinkify.start === undefined || this._rowsToLinkify.end === undefined) {
            this._rowsToLinkify.start = start;
            this._rowsToLinkify.end = end;
        }
        else {
            this._rowsToLinkify.start = Math.min(this._rowsToLinkify.start, start);
            this._rowsToLinkify.end = Math.max(this._rowsToLinkify.end, end);
        }
        this._mouseZoneManager.clearAll(start, end);
        if (this._rowsTimeoutId) {
            clearTimeout(this._rowsTimeoutId);
        }
        this._rowsTimeoutId = setTimeout(function () { return _this._linkifyRows(); }, Linkifier._timeBeforeLatency);
    };
    Linkifier.prototype._linkifyRows = function () {
        this._rowsTimeoutId = undefined;
        var buffer = this._bufferService.buffer;
        if (this._rowsToLinkify.start === undefined || this._rowsToLinkify.end === undefined) {
            this._logService.debug('_rowToLinkify was unset before _linkifyRows was called');
            return;
        }
        var absoluteRowIndexStart = buffer.ydisp + this._rowsToLinkify.start;
        if (absoluteRowIndexStart >= buffer.lines.length) {
            return;
        }
        var absoluteRowIndexEnd = buffer.ydisp + Math.min(this._rowsToLinkify.end, this._bufferService.rows) + 1;
        var overscanLineLimit = Math.ceil(OVERSCAN_CHAR_LIMIT / this._bufferService.cols);
        var iterator = this._bufferService.buffer.iterator(false, absoluteRowIndexStart, absoluteRowIndexEnd, overscanLineLimit, overscanLineLimit);
        while (iterator.hasNext()) {
            var lineData = iterator.next();
            for (var i = 0; i < this._linkMatchers.length; i++) {
                this._doLinkifyRow(lineData.range.first, lineData.content, this._linkMatchers[i]);
            }
        }
        this._rowsToLinkify.start = undefined;
        this._rowsToLinkify.end = undefined;
    };
    Linkifier.prototype.registerLinkMatcher = function (regex, handler, options) {
        if (options === void 0) { options = {}; }
        if (!handler) {
            throw new Error('handler must be defined');
        }
        var matcher = {
            id: this._nextLinkMatcherId++,
            regex: regex,
            handler: handler,
            matchIndex: options.matchIndex,
            validationCallback: options.validationCallback,
            hoverTooltipCallback: options.tooltipCallback,
            hoverLeaveCallback: options.leaveCallback,
            willLinkActivate: options.willLinkActivate,
            priority: options.priority || 0
        };
        this._addLinkMatcherToList(matcher);
        return matcher.id;
    };
    Linkifier.prototype._addLinkMatcherToList = function (matcher) {
        if (this._linkMatchers.length === 0) {
            this._linkMatchers.push(matcher);
            return;
        }
        for (var i = this._linkMatchers.length - 1; i >= 0; i--) {
            if (matcher.priority <= this._linkMatchers[i].priority) {
                this._linkMatchers.splice(i + 1, 0, matcher);
                return;
            }
        }
        this._linkMatchers.splice(0, 0, matcher);
    };
    Linkifier.prototype.deregisterLinkMatcher = function (matcherId) {
        for (var i = 0; i < this._linkMatchers.length; i++) {
            if (this._linkMatchers[i].id === matcherId) {
                this._linkMatchers.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    Linkifier.prototype._doLinkifyRow = function (rowIndex, text, matcher) {
        var _this = this;
        var rex = new RegExp(matcher.regex.source, (matcher.regex.flags || '') + 'g');
        var match;
        var stringIndex = -1;
        var _loop_1 = function () {
            var uri = match[typeof matcher.matchIndex !== 'number' ? 0 : matcher.matchIndex];
            if (!uri) {
                this_1._logService.debug('match found without corresponding matchIndex', match, matcher);
                return "break";
            }
            stringIndex = text.indexOf(uri, stringIndex + 1);
            rex.lastIndex = stringIndex + uri.length;
            if (stringIndex < 0) {
                return "break";
            }
            var bufferIndex = this_1._bufferService.buffer.stringIndexToBufferIndex(rowIndex, stringIndex);
            if (bufferIndex[0] < 0) {
                return "break";
            }
            var line = this_1._bufferService.buffer.lines.get(bufferIndex[0]);
            if (!line) {
                return "break";
            }
            var attr = line.getFg(bufferIndex[1]);
            var fg = attr ? (attr >> 9) & 0x1ff : undefined;
            if (matcher.validationCallback) {
                matcher.validationCallback(uri, function (isValid) {
                    if (_this._rowsTimeoutId) {
                        return;
                    }
                    if (isValid) {
                        _this._addLink(bufferIndex[1], bufferIndex[0] - _this._bufferService.buffer.ydisp, uri, matcher, fg);
                    }
                });
            }
            else {
                this_1._addLink(bufferIndex[1], bufferIndex[0] - this_1._bufferService.buffer.ydisp, uri, matcher, fg);
            }
        };
        var this_1 = this;
        while ((match = rex.exec(text)) !== null) {
            var state_1 = _loop_1();
            if (state_1 === "break")
                break;
        }
    };
    Linkifier.prototype._addLink = function (x, y, uri, matcher, fg) {
        var _this = this;
        if (!this._mouseZoneManager || !this._element) {
            return;
        }
        var width = CharWidth_1.getStringCellWidth(uri);
        var x1 = x % this._bufferService.cols;
        var y1 = y + Math.floor(x / this._bufferService.cols);
        var x2 = (x1 + width) % this._bufferService.cols;
        var y2 = y1 + Math.floor((x1 + width) / this._bufferService.cols);
        if (x2 === 0) {
            x2 = this._bufferService.cols;
            y2--;
        }
        this._mouseZoneManager.add(new MouseZone(x1 + 1, y1 + 1, x2 + 1, y2 + 1, function (e) {
            if (matcher.handler) {
                return matcher.handler(e, uri);
            }
            window.open(uri, '_blank');
        }, function () {
            _this._onLinkHover.fire(_this._createLinkHoverEvent(x1, y1, x2, y2, fg));
            _this._element.classList.add('xterm-cursor-pointer');
        }, function (e) {
            _this._onLinkTooltip.fire(_this._createLinkHoverEvent(x1, y1, x2, y2, fg));
            if (matcher.hoverTooltipCallback) {
                matcher.hoverTooltipCallback(e, uri, { start: { x: x1, y: y1 }, end: { x: x2, y: y2 } });
            }
        }, function () {
            _this._onLinkLeave.fire(_this._createLinkHoverEvent(x1, y1, x2, y2, fg));
            _this._element.classList.remove('xterm-cursor-pointer');
            if (matcher.hoverLeaveCallback) {
                matcher.hoverLeaveCallback();
            }
        }, function (e) {
            if (matcher.willLinkActivate) {
                return matcher.willLinkActivate(e, uri);
            }
            return true;
        }));
    };
    Linkifier.prototype._createLinkHoverEvent = function (x1, y1, x2, y2, fg) {
        return { x1: x1, y1: y1, x2: x2, y2: y2, cols: this._bufferService.cols, fg: fg };
    };
    Linkifier._timeBeforeLatency = 200;
    return Linkifier;
}());
exports.Linkifier = Linkifier;
var MouseZone = (function () {
    function MouseZone(x1, y1, x2, y2, clickCallback, hoverCallback, tooltipCallback, leaveCallback, willLinkActivate) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.clickCallback = clickCallback;
        this.hoverCallback = hoverCallback;
        this.tooltipCallback = tooltipCallback;
        this.leaveCallback = leaveCallback;
        this.willLinkActivate = willLinkActivate;
    }
    return MouseZone;
}());
exports.MouseZone = MouseZone;


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Browser = __webpack_require__(10);
var SelectionModel_1 = __webpack_require__(50);
var CellData_1 = __webpack_require__(4);
var EventEmitter_1 = __webpack_require__(1);
var Services_1 = __webpack_require__(5);
var Services_2 = __webpack_require__(0);
var Mouse_1 = __webpack_require__(28);
var MoveToCell_1 = __webpack_require__(51);
var DRAG_SCROLL_MAX_THRESHOLD = 50;
var DRAG_SCROLL_MAX_SPEED = 15;
var DRAG_SCROLL_INTERVAL = 50;
var ALT_CLICK_MOVE_CURSOR_TIME = 500;
var NON_BREAKING_SPACE_CHAR = String.fromCharCode(160);
var ALL_NON_BREAKING_SPACE_REGEX = new RegExp(NON_BREAKING_SPACE_CHAR, 'g');
var SelectionService = (function () {
    function SelectionService(_scrollLines, _element, _screenElement, _charSizeService, _bufferService, _coreService, _mouseService, _optionsService) {
        var _this = this;
        this._scrollLines = _scrollLines;
        this._element = _element;
        this._screenElement = _screenElement;
        this._charSizeService = _charSizeService;
        this._bufferService = _bufferService;
        this._coreService = _coreService;
        this._mouseService = _mouseService;
        this._optionsService = _optionsService;
        this._dragScrollAmount = 0;
        this._enabled = true;
        this._workCell = new CellData_1.CellData();
        this._mouseDownTimeStamp = 0;
        this._onLinuxMouseSelection = new EventEmitter_1.EventEmitter();
        this._onRedrawRequest = new EventEmitter_1.EventEmitter();
        this._onSelectionChange = new EventEmitter_1.EventEmitter();
        this._mouseMoveListener = function (event) { return _this._onMouseMove(event); };
        this._mouseUpListener = function (event) { return _this._onMouseUp(event); };
        this._coreService.onUserInput(function () {
            if (_this.hasSelection) {
                _this.clearSelection();
            }
        });
        this._trimListener = this._bufferService.buffer.lines.onTrim(function (amount) { return _this._onTrim(amount); });
        this._bufferService.buffers.onBufferActivate(function (e) { return _this._onBufferActivate(e); });
        this.enable();
        this._model = new SelectionModel_1.SelectionModel(this._bufferService);
        this._activeSelectionMode = 0;
    }
    Object.defineProperty(SelectionService.prototype, "onLinuxMouseSelection", {
        get: function () { return this._onLinuxMouseSelection.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "onRedrawRequest", {
        get: function () { return this._onRedrawRequest.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "onSelectionChange", {
        get: function () { return this._onSelectionChange.event; },
        enumerable: true,
        configurable: true
    });
    SelectionService.prototype.dispose = function () {
        this._removeMouseDownListeners();
    };
    SelectionService.prototype.reset = function () {
        this.clearSelection();
    };
    SelectionService.prototype.disable = function () {
        this.clearSelection();
        this._enabled = false;
    };
    SelectionService.prototype.enable = function () {
        this._enabled = true;
    };
    Object.defineProperty(SelectionService.prototype, "selectionStart", {
        get: function () { return this._model.finalSelectionStart; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "selectionEnd", {
        get: function () { return this._model.finalSelectionEnd; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "hasSelection", {
        get: function () {
            var start = this._model.finalSelectionStart;
            var end = this._model.finalSelectionEnd;
            if (!start || !end) {
                return false;
            }
            return start[0] !== end[0] || start[1] !== end[1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "selectionText", {
        get: function () {
            var start = this._model.finalSelectionStart;
            var end = this._model.finalSelectionEnd;
            if (!start || !end) {
                return '';
            }
            var buffer = this._bufferService.buffer;
            var result = [];
            if (this._activeSelectionMode === 3) {
                if (start[0] === end[0]) {
                    return '';
                }
                for (var i = start[1]; i <= end[1]; i++) {
                    var lineText = buffer.translateBufferLineToString(i, true, start[0], end[0]);
                    result.push(lineText);
                }
            }
            else {
                var startRowEndCol = start[1] === end[1] ? end[0] : undefined;
                result.push(buffer.translateBufferLineToString(start[1], true, start[0], startRowEndCol));
                for (var i = start[1] + 1; i <= end[1] - 1; i++) {
                    var bufferLine = buffer.lines.get(i);
                    var lineText = buffer.translateBufferLineToString(i, true);
                    if (bufferLine && bufferLine.isWrapped) {
                        result[result.length - 1] += lineText;
                    }
                    else {
                        result.push(lineText);
                    }
                }
                if (start[1] !== end[1]) {
                    var bufferLine = buffer.lines.get(end[1]);
                    var lineText = buffer.translateBufferLineToString(end[1], true, 0, end[0]);
                    if (bufferLine && bufferLine.isWrapped) {
                        result[result.length - 1] += lineText;
                    }
                    else {
                        result.push(lineText);
                    }
                }
            }
            var formattedResult = result.map(function (line) {
                return line.replace(ALL_NON_BREAKING_SPACE_REGEX, ' ');
            }).join(Browser.isWindows ? '\r\n' : '\n');
            return formattedResult;
        },
        enumerable: true,
        configurable: true
    });
    SelectionService.prototype.clearSelection = function () {
        this._model.clearSelection();
        this._removeMouseDownListeners();
        this.refresh();
        this._onSelectionChange.fire();
    };
    SelectionService.prototype.refresh = function (isLinuxMouseSelection) {
        var _this = this;
        if (!this._refreshAnimationFrame) {
            this._refreshAnimationFrame = window.requestAnimationFrame(function () { return _this._refresh(); });
        }
        if (Browser.isLinux && isLinuxMouseSelection) {
            var selectionText = this.selectionText;
            if (selectionText.length) {
                this._onLinuxMouseSelection.fire(this.selectionText);
            }
        }
    };
    SelectionService.prototype._refresh = function () {
        this._refreshAnimationFrame = undefined;
        this._onRedrawRequest.fire({
            start: this._model.finalSelectionStart,
            end: this._model.finalSelectionEnd,
            columnSelectMode: this._activeSelectionMode === 3
        });
    };
    SelectionService.prototype.isClickInSelection = function (event) {
        var coords = this._getMouseBufferCoords(event);
        var start = this._model.finalSelectionStart;
        var end = this._model.finalSelectionEnd;
        if (!start || !end || !coords) {
            return false;
        }
        return this._areCoordsInSelection(coords, start, end);
    };
    SelectionService.prototype._areCoordsInSelection = function (coords, start, end) {
        return (coords[1] > start[1] && coords[1] < end[1]) ||
            (start[1] === end[1] && coords[1] === start[1] && coords[0] >= start[0] && coords[0] < end[0]) ||
            (start[1] < end[1] && coords[1] === end[1] && coords[0] < end[0]) ||
            (start[1] < end[1] && coords[1] === start[1] && coords[0] >= start[0]);
    };
    SelectionService.prototype.selectWordAtCursor = function (event) {
        var coords = this._getMouseBufferCoords(event);
        if (coords) {
            this._selectWordAt(coords, false);
            this._model.selectionEnd = undefined;
            this.refresh(true);
        }
    };
    SelectionService.prototype.selectAll = function () {
        this._model.isSelectAllActive = true;
        this.refresh();
        this._onSelectionChange.fire();
    };
    SelectionService.prototype.selectLines = function (start, end) {
        this._model.clearSelection();
        start = Math.max(start, 0);
        end = Math.min(end, this._bufferService.buffer.lines.length - 1);
        this._model.selectionStart = [0, start];
        this._model.selectionEnd = [this._bufferService.cols, end];
        this.refresh();
        this._onSelectionChange.fire();
    };
    SelectionService.prototype._onTrim = function (amount) {
        var needsRefresh = this._model.onTrim(amount);
        if (needsRefresh) {
            this.refresh();
        }
    };
    SelectionService.prototype._getMouseBufferCoords = function (event) {
        var coords = this._mouseService.getCoords(event, this._screenElement, this._bufferService.cols, this._bufferService.rows, true);
        if (!coords) {
            return undefined;
        }
        coords[0]--;
        coords[1]--;
        coords[1] += this._bufferService.buffer.ydisp;
        return coords;
    };
    SelectionService.prototype._getMouseEventScrollAmount = function (event) {
        var offset = Mouse_1.getCoordsRelativeToElement(event, this._screenElement)[1];
        var terminalHeight = this._bufferService.rows * Math.ceil(this._charSizeService.height * this._optionsService.options.lineHeight);
        if (offset >= 0 && offset <= terminalHeight) {
            return 0;
        }
        if (offset > terminalHeight) {
            offset -= terminalHeight;
        }
        offset = Math.min(Math.max(offset, -DRAG_SCROLL_MAX_THRESHOLD), DRAG_SCROLL_MAX_THRESHOLD);
        offset /= DRAG_SCROLL_MAX_THRESHOLD;
        return (offset / Math.abs(offset)) + Math.round(offset * (DRAG_SCROLL_MAX_SPEED - 1));
    };
    SelectionService.prototype.shouldForceSelection = function (event) {
        if (Browser.isMac) {
            return event.altKey && this._optionsService.options.macOptionClickForcesSelection;
        }
        return event.shiftKey;
    };
    SelectionService.prototype.onMouseDown = function (event) {
        this._mouseDownTimeStamp = event.timeStamp;
        if (event.button === 2 && this.hasSelection) {
            return;
        }
        if (event.button !== 0) {
            return;
        }
        if (!this._enabled) {
            if (!this.shouldForceSelection(event)) {
                return;
            }
            event.stopPropagation();
        }
        event.preventDefault();
        this._dragScrollAmount = 0;
        if (this._enabled && event.shiftKey) {
            this._onIncrementalClick(event);
        }
        else {
            if (event.detail === 1) {
                this._onSingleClick(event);
            }
            else if (event.detail === 2) {
                this._onDoubleClick(event);
            }
            else if (event.detail === 3) {
                this._onTripleClick(event);
            }
        }
        this._addMouseDownListeners();
        this.refresh(true);
    };
    SelectionService.prototype._addMouseDownListeners = function () {
        var _this = this;
        if (this._screenElement.ownerDocument) {
            this._screenElement.ownerDocument.addEventListener('mousemove', this._mouseMoveListener);
            this._screenElement.ownerDocument.addEventListener('mouseup', this._mouseUpListener);
        }
        this._dragScrollIntervalTimer = window.setInterval(function () { return _this._dragScroll(); }, DRAG_SCROLL_INTERVAL);
    };
    SelectionService.prototype._removeMouseDownListeners = function () {
        if (this._screenElement.ownerDocument) {
            this._screenElement.ownerDocument.removeEventListener('mousemove', this._mouseMoveListener);
            this._screenElement.ownerDocument.removeEventListener('mouseup', this._mouseUpListener);
        }
        clearInterval(this._dragScrollIntervalTimer);
        this._dragScrollIntervalTimer = undefined;
    };
    SelectionService.prototype._onIncrementalClick = function (event) {
        if (this._model.selectionStart) {
            this._model.selectionEnd = this._getMouseBufferCoords(event);
        }
    };
    SelectionService.prototype._onSingleClick = function (event) {
        this._model.selectionStartLength = 0;
        this._model.isSelectAllActive = false;
        this._activeSelectionMode = this.shouldColumnSelect(event) ? 3 : 0;
        this._model.selectionStart = this._getMouseBufferCoords(event);
        if (!this._model.selectionStart) {
            return;
        }
        this._model.selectionEnd = undefined;
        var line = this._bufferService.buffer.lines.get(this._model.selectionStart[1]);
        if (!line) {
            return;
        }
        if (line.length === this._model.selectionStart[0]) {
            return;
        }
        if (line.hasWidth(this._model.selectionStart[0]) === 0) {
            this._model.selectionStart[0]++;
        }
    };
    SelectionService.prototype._onDoubleClick = function (event) {
        var coords = this._getMouseBufferCoords(event);
        if (coords) {
            this._activeSelectionMode = 1;
            this._selectWordAt(coords, true);
        }
    };
    SelectionService.prototype._onTripleClick = function (event) {
        var coords = this._getMouseBufferCoords(event);
        if (coords) {
            this._activeSelectionMode = 2;
            this._selectLineAt(coords[1]);
        }
    };
    SelectionService.prototype.shouldColumnSelect = function (event) {
        return event.altKey && !(Browser.isMac && this._optionsService.options.macOptionClickForcesSelection);
    };
    SelectionService.prototype._onMouseMove = function (event) {
        event.stopImmediatePropagation();
        if (!this._model.selectionStart) {
            return;
        }
        var previousSelectionEnd = this._model.selectionEnd ? [this._model.selectionEnd[0], this._model.selectionEnd[1]] : null;
        this._model.selectionEnd = this._getMouseBufferCoords(event);
        if (!this._model.selectionEnd) {
            this.refresh(true);
            return;
        }
        if (this._activeSelectionMode === 2) {
            if (this._model.selectionEnd[1] < this._model.selectionStart[1]) {
                this._model.selectionEnd[0] = 0;
            }
            else {
                this._model.selectionEnd[0] = this._bufferService.cols;
            }
        }
        else if (this._activeSelectionMode === 1) {
            this._selectToWordAt(this._model.selectionEnd);
        }
        this._dragScrollAmount = this._getMouseEventScrollAmount(event);
        if (this._activeSelectionMode !== 3) {
            if (this._dragScrollAmount > 0) {
                this._model.selectionEnd[0] = this._bufferService.cols;
            }
            else if (this._dragScrollAmount < 0) {
                this._model.selectionEnd[0] = 0;
            }
        }
        var buffer = this._bufferService.buffer;
        if (this._model.selectionEnd[1] < buffer.lines.length) {
            var line = buffer.lines.get(this._model.selectionEnd[1]);
            if (line && line.hasWidth(this._model.selectionEnd[0]) === 0) {
                this._model.selectionEnd[0]++;
            }
        }
        if (!previousSelectionEnd ||
            previousSelectionEnd[0] !== this._model.selectionEnd[0] ||
            previousSelectionEnd[1] !== this._model.selectionEnd[1]) {
            this.refresh(true);
        }
    };
    SelectionService.prototype._dragScroll = function () {
        if (!this._model.selectionEnd || !this._model.selectionStart) {
            return;
        }
        if (this._dragScrollAmount) {
            this._scrollLines(this._dragScrollAmount, false);
            var buffer = this._bufferService.buffer;
            if (this._dragScrollAmount > 0) {
                if (this._activeSelectionMode !== 3) {
                    this._model.selectionEnd[0] = this._bufferService.cols;
                }
                this._model.selectionEnd[1] = Math.min(buffer.ydisp + this._bufferService.rows, buffer.lines.length - 1);
            }
            else {
                if (this._activeSelectionMode !== 3) {
                    this._model.selectionEnd[0] = 0;
                }
                this._model.selectionEnd[1] = buffer.ydisp;
            }
            this.refresh();
        }
    };
    SelectionService.prototype._onMouseUp = function (event) {
        var timeElapsed = event.timeStamp - this._mouseDownTimeStamp;
        this._removeMouseDownListeners();
        if (this.selectionText.length <= 1 && timeElapsed < ALT_CLICK_MOVE_CURSOR_TIME) {
            if (event.altKey && this._bufferService.buffer.ybase === this._bufferService.buffer.ydisp) {
                var coordinates = this._mouseService.getCoords(event, this._element, this._bufferService.cols, this._bufferService.rows, false);
                if (coordinates && coordinates[0] !== undefined && coordinates[1] !== undefined) {
                    var sequence = MoveToCell_1.moveToCellSequence(coordinates[0] - 1, coordinates[1] - 1, this._bufferService, this._coreService.decPrivateModes.applicationCursorKeys);
                    this._coreService.triggerDataEvent(sequence, true);
                }
            }
        }
        else if (this.hasSelection) {
            this._onSelectionChange.fire();
        }
    };
    SelectionService.prototype._onBufferActivate = function (e) {
        var _this = this;
        this.clearSelection();
        if (this._trimListener) {
            this._trimListener.dispose();
        }
        this._trimListener = e.activeBuffer.lines.onTrim(function (amount) { return _this._onTrim(amount); });
    };
    SelectionService.prototype._convertViewportColToCharacterIndex = function (bufferLine, coords) {
        var charIndex = coords[0];
        for (var i = 0; coords[0] >= i; i++) {
            var length_1 = bufferLine.loadCell(i, this._workCell).getChars().length;
            if (this._workCell.getWidth() === 0) {
                charIndex--;
            }
            else if (length_1 > 1 && coords[0] !== i) {
                charIndex += length_1 - 1;
            }
        }
        return charIndex;
    };
    SelectionService.prototype.setSelection = function (col, row, length) {
        this._model.clearSelection();
        this._removeMouseDownListeners();
        this._model.selectionStart = [col, row];
        this._model.selectionStartLength = length;
        this.refresh();
    };
    SelectionService.prototype._getWordAt = function (coords, allowWhitespaceOnlySelection, followWrappedLinesAbove, followWrappedLinesBelow) {
        if (followWrappedLinesAbove === void 0) { followWrappedLinesAbove = true; }
        if (followWrappedLinesBelow === void 0) { followWrappedLinesBelow = true; }
        if (coords[0] >= this._bufferService.cols) {
            return undefined;
        }
        var buffer = this._bufferService.buffer;
        var bufferLine = buffer.lines.get(coords[1]);
        if (!bufferLine) {
            return undefined;
        }
        var line = buffer.translateBufferLineToString(coords[1], false);
        var startIndex = this._convertViewportColToCharacterIndex(bufferLine, coords);
        var endIndex = startIndex;
        var charOffset = coords[0] - startIndex;
        var leftWideCharCount = 0;
        var rightWideCharCount = 0;
        var leftLongCharOffset = 0;
        var rightLongCharOffset = 0;
        if (line.charAt(startIndex) === ' ') {
            while (startIndex > 0 && line.charAt(startIndex - 1) === ' ') {
                startIndex--;
            }
            while (endIndex < line.length && line.charAt(endIndex + 1) === ' ') {
                endIndex++;
            }
        }
        else {
            var startCol = coords[0];
            var endCol = coords[0];
            if (bufferLine.getWidth(startCol) === 0) {
                leftWideCharCount++;
                startCol--;
            }
            if (bufferLine.getWidth(endCol) === 2) {
                rightWideCharCount++;
                endCol++;
            }
            var length_2 = bufferLine.getString(endCol).length;
            if (length_2 > 1) {
                rightLongCharOffset += length_2 - 1;
                endIndex += length_2 - 1;
            }
            while (startCol > 0 && startIndex > 0 && !this._isCharWordSeparator(bufferLine.loadCell(startCol - 1, this._workCell))) {
                bufferLine.loadCell(startCol - 1, this._workCell);
                var length_3 = this._workCell.getChars().length;
                if (this._workCell.getWidth() === 0) {
                    leftWideCharCount++;
                    startCol--;
                }
                else if (length_3 > 1) {
                    leftLongCharOffset += length_3 - 1;
                    startIndex -= length_3 - 1;
                }
                startIndex--;
                startCol--;
            }
            while (endCol < bufferLine.length && endIndex + 1 < line.length && !this._isCharWordSeparator(bufferLine.loadCell(endCol + 1, this._workCell))) {
                bufferLine.loadCell(endCol + 1, this._workCell);
                var length_4 = this._workCell.getChars().length;
                if (this._workCell.getWidth() === 2) {
                    rightWideCharCount++;
                    endCol++;
                }
                else if (length_4 > 1) {
                    rightLongCharOffset += length_4 - 1;
                    endIndex += length_4 - 1;
                }
                endIndex++;
                endCol++;
            }
        }
        endIndex++;
        var start = startIndex
            + charOffset
            - leftWideCharCount
            + leftLongCharOffset;
        var length = Math.min(this._bufferService.cols, endIndex
            - startIndex
            + leftWideCharCount
            + rightWideCharCount
            - leftLongCharOffset
            - rightLongCharOffset);
        if (!allowWhitespaceOnlySelection && line.slice(startIndex, endIndex).trim() === '') {
            return undefined;
        }
        if (followWrappedLinesAbove) {
            if (start === 0 && bufferLine.getCodePoint(0) !== 32) {
                var previousBufferLine = buffer.lines.get(coords[1] - 1);
                if (previousBufferLine && bufferLine.isWrapped && previousBufferLine.getCodePoint(this._bufferService.cols - 1) !== 32) {
                    var previousLineWordPosition = this._getWordAt([this._bufferService.cols - 1, coords[1] - 1], false, true, false);
                    if (previousLineWordPosition) {
                        var offset = this._bufferService.cols - previousLineWordPosition.start;
                        start -= offset;
                        length += offset;
                    }
                }
            }
        }
        if (followWrappedLinesBelow) {
            if (start + length === this._bufferService.cols && bufferLine.getCodePoint(this._bufferService.cols - 1) !== 32) {
                var nextBufferLine = buffer.lines.get(coords[1] + 1);
                if (nextBufferLine && nextBufferLine.isWrapped && nextBufferLine.getCodePoint(0) !== 32) {
                    var nextLineWordPosition = this._getWordAt([0, coords[1] + 1], false, false, true);
                    if (nextLineWordPosition) {
                        length += nextLineWordPosition.length;
                    }
                }
            }
        }
        return { start: start, length: length };
    };
    SelectionService.prototype._selectWordAt = function (coords, allowWhitespaceOnlySelection) {
        var wordPosition = this._getWordAt(coords, allowWhitespaceOnlySelection);
        if (wordPosition) {
            while (wordPosition.start < 0) {
                wordPosition.start += this._bufferService.cols;
                coords[1]--;
            }
            this._model.selectionStart = [wordPosition.start, coords[1]];
            this._model.selectionStartLength = wordPosition.length;
        }
    };
    SelectionService.prototype._selectToWordAt = function (coords) {
        var wordPosition = this._getWordAt(coords, true);
        if (wordPosition) {
            var endRow = coords[1];
            while (wordPosition.start < 0) {
                wordPosition.start += this._bufferService.cols;
                endRow--;
            }
            if (!this._model.areSelectionValuesReversed()) {
                while (wordPosition.start + wordPosition.length > this._bufferService.cols) {
                    wordPosition.length -= this._bufferService.cols;
                    endRow++;
                }
            }
            this._model.selectionEnd = [this._model.areSelectionValuesReversed() ? wordPosition.start : wordPosition.start + wordPosition.length, endRow];
        }
    };
    SelectionService.prototype._isCharWordSeparator = function (cell) {
        if (cell.getWidth() === 0) {
            return false;
        }
        return this._optionsService.options.wordSeparator.indexOf(cell.getChars()) >= 0;
    };
    SelectionService.prototype._selectLineAt = function (line) {
        var wrappedRange = this._bufferService.buffer.getWrappedRangeForLine(line);
        this._model.selectionStart = [0, wrappedRange.first];
        this._model.selectionEnd = [this._bufferService.cols, wrappedRange.last];
        this._model.selectionStartLength = 0;
    };
    SelectionService = __decorate([
        __param(3, Services_1.ICharSizeService),
        __param(4, Services_2.IBufferService),
        __param(5, Services_2.ICoreService),
        __param(6, Services_1.IMouseService),
        __param(7, Services_2.IOptionsService)
    ], SelectionService);
    return SelectionService;
}());
exports.SelectionService = SelectionService;


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var SelectionModel = (function () {
    function SelectionModel(_bufferService) {
        this._bufferService = _bufferService;
        this.isSelectAllActive = false;
        this.selectionStartLength = 0;
    }
    SelectionModel.prototype.clearSelection = function () {
        this.selectionStart = undefined;
        this.selectionEnd = undefined;
        this.isSelectAllActive = false;
        this.selectionStartLength = 0;
    };
    Object.defineProperty(SelectionModel.prototype, "finalSelectionStart", {
        get: function () {
            if (this.isSelectAllActive) {
                return [0, 0];
            }
            if (!this.selectionEnd || !this.selectionStart) {
                return this.selectionStart;
            }
            return this.areSelectionValuesReversed() ? this.selectionEnd : this.selectionStart;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectionModel.prototype, "finalSelectionEnd", {
        get: function () {
            if (this.isSelectAllActive) {
                return [this._bufferService.cols, this._bufferService.buffer.ybase + this._bufferService.rows - 1];
            }
            if (!this.selectionStart) {
                return undefined;
            }
            if (!this.selectionEnd || this.areSelectionValuesReversed()) {
                var startPlusLength = this.selectionStart[0] + this.selectionStartLength;
                if (startPlusLength > this._bufferService.cols) {
                    return [startPlusLength % this._bufferService.cols, this.selectionStart[1] + Math.floor(startPlusLength / this._bufferService.cols)];
                }
                return [startPlusLength, this.selectionStart[1]];
            }
            if (this.selectionStartLength) {
                if (this.selectionEnd[1] === this.selectionStart[1]) {
                    return [Math.max(this.selectionStart[0] + this.selectionStartLength, this.selectionEnd[0]), this.selectionEnd[1]];
                }
            }
            return this.selectionEnd;
        },
        enumerable: true,
        configurable: true
    });
    SelectionModel.prototype.areSelectionValuesReversed = function () {
        var start = this.selectionStart;
        var end = this.selectionEnd;
        if (!start || !end) {
            return false;
        }
        return start[1] > end[1] || (start[1] === end[1] && start[0] > end[0]);
    };
    SelectionModel.prototype.onTrim = function (amount) {
        if (this.selectionStart) {
            this.selectionStart[1] -= amount;
        }
        if (this.selectionEnd) {
            this.selectionEnd[1] -= amount;
        }
        if (this.selectionEnd && this.selectionEnd[1] < 0) {
            this.clearSelection();
            return true;
        }
        if (this.selectionStart && this.selectionStart[1] < 0) {
            this.selectionStart[1] = 0;
        }
        return false;
    };
    return SelectionModel;
}());
exports.SelectionModel = SelectionModel;


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var EscapeSequences_1 = __webpack_require__(11);
function moveToCellSequence(targetX, targetY, bufferService, applicationCursor) {
    var startX = bufferService.buffer.x;
    var startY = bufferService.buffer.y;
    if (!bufferService.buffer.hasScrollback) {
        return resetStartingRow(startX, startY, targetX, targetY, bufferService, applicationCursor) +
            moveToRequestedRow(startY, targetY, bufferService, applicationCursor) +
            moveToRequestedCol(startX, startY, targetX, targetY, bufferService, applicationCursor);
    }
    return moveHorizontallyOnly(startX, startY, targetX, targetY, bufferService, applicationCursor);
}
exports.moveToCellSequence = moveToCellSequence;
function resetStartingRow(startX, startY, targetX, targetY, bufferService, applicationCursor) {
    if (moveToRequestedRow(startY, targetY, bufferService, applicationCursor).length === 0) {
        return '';
    }
    return repeat(bufferLine(startX, startY, startX, startY - wrappedRowsForRow(bufferService, startY), false, bufferService).length, sequence("D", applicationCursor));
}
function moveToRequestedRow(startY, targetY, bufferService, applicationCursor) {
    var startRow = startY - wrappedRowsForRow(bufferService, startY);
    var endRow = targetY - wrappedRowsForRow(bufferService, targetY);
    var rowsToMove = Math.abs(startRow - endRow) - wrappedRowsCount(startY, targetY, bufferService);
    return repeat(rowsToMove, sequence(verticalDirection(startY, targetY), applicationCursor));
}
function moveToRequestedCol(startX, startY, targetX, targetY, bufferService, applicationCursor) {
    var startRow;
    if (moveToRequestedRow(startY, targetY, bufferService, applicationCursor).length > 0) {
        startRow = targetY - wrappedRowsForRow(bufferService, targetY);
    }
    else {
        startRow = startY;
    }
    var endRow = targetY;
    var direction = horizontalDirection(startX, startY, targetX, targetY, bufferService, applicationCursor);
    return repeat(bufferLine(startX, startRow, targetX, endRow, direction === "C", bufferService).length, sequence(direction, applicationCursor));
}
function moveHorizontallyOnly(startX, startY, targetX, targetY, bufferService, applicationCursor) {
    var direction = horizontalDirection(startX, startY, targetX, targetY, bufferService, applicationCursor);
    return repeat(Math.abs(startX - targetX), sequence(direction, applicationCursor));
}
function wrappedRowsCount(startY, targetY, bufferService) {
    var wrappedRows = 0;
    var startRow = startY - wrappedRowsForRow(bufferService, startY);
    var endRow = targetY - wrappedRowsForRow(bufferService, targetY);
    for (var i = 0; i < Math.abs(startRow - endRow); i++) {
        var direction = verticalDirection(startY, targetY) === "A" ? -1 : 1;
        var line = bufferService.buffer.lines.get(startRow + (direction * i));
        if (line && line.isWrapped) {
            wrappedRows++;
        }
    }
    return wrappedRows;
}
function wrappedRowsForRow(bufferService, currentRow) {
    var rowCount = 0;
    var line = bufferService.buffer.lines.get(currentRow);
    var lineWraps = line && line.isWrapped;
    while (lineWraps && currentRow >= 0 && currentRow < bufferService.rows) {
        rowCount++;
        line = bufferService.buffer.lines.get(--currentRow);
        lineWraps = line && line.isWrapped;
    }
    return rowCount;
}
function horizontalDirection(startX, startY, targetX, targetY, bufferService, applicationCursor) {
    var startRow;
    if (moveToRequestedRow(targetX, targetY, bufferService, applicationCursor).length > 0) {
        startRow = targetY - wrappedRowsForRow(bufferService, targetY);
    }
    else {
        startRow = startY;
    }
    if ((startX < targetX &&
        startRow <= targetY) ||
        (startX >= targetX &&
            startRow < targetY)) {
        return "C";
    }
    return "D";
}
function verticalDirection(startY, targetY) {
    return startY > targetY ? "A" : "B";
}
function bufferLine(startCol, startRow, endCol, endRow, forward, bufferService) {
    var currentCol = startCol;
    var currentRow = startRow;
    var bufferStr = '';
    while (currentCol !== endCol || currentRow !== endRow) {
        currentCol += forward ? 1 : -1;
        if (forward && currentCol > bufferService.cols - 1) {
            bufferStr += bufferService.buffer.translateBufferLineToString(currentRow, false, startCol, currentCol);
            currentCol = 0;
            startCol = 0;
            currentRow++;
        }
        else if (!forward && currentCol < 0) {
            bufferStr += bufferService.buffer.translateBufferLineToString(currentRow, false, 0, startCol + 1);
            currentCol = bufferService.cols - 1;
            startCol = currentCol;
            currentRow--;
        }
    }
    return bufferStr + bufferService.buffer.translateBufferLineToString(currentRow, false, startCol, currentCol);
}
function sequence(direction, applicationCursor) {
    var mod = applicationCursor ? 'O' : '[';
    return EscapeSequences_1.C0.ESC + mod + direction;
}
function repeat(count, str) {
    count = Math.floor(count);
    var rpt = '';
    for (var i = 0; i < count; i++) {
        rpt += str;
    }
    return rpt;
}


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Services_1 = __webpack_require__(0);
var SoundService = (function () {
    function SoundService(_optionsService) {
        this._optionsService = _optionsService;
    }
    Object.defineProperty(SoundService, "audioContext", {
        get: function () {
            if (!SoundService._audioContext) {
                var audioContextCtor = window.AudioContext || window.webkitAudioContext;
                if (!audioContextCtor) {
                    console.warn('Web Audio API is not supported by this browser. Consider upgrading to the latest version');
                    return null;
                }
                SoundService._audioContext = new audioContextCtor();
            }
            return SoundService._audioContext;
        },
        enumerable: true,
        configurable: true
    });
    SoundService.prototype.playBellSound = function () {
        var ctx = SoundService.audioContext;
        if (!ctx) {
            return;
        }
        var bellAudioSource = ctx.createBufferSource();
        ctx.decodeAudioData(this._base64ToArrayBuffer(this._removeMimeType(this._optionsService.options.bellSound)), function (buffer) {
            bellAudioSource.buffer = buffer;
            bellAudioSource.connect(ctx.destination);
            bellAudioSource.start(0);
        });
    };
    SoundService.prototype._base64ToArrayBuffer = function (base64) {
        var binaryString = window.atob(base64);
        var len = binaryString.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };
    SoundService.prototype._removeMimeType = function (dataURI) {
        var splitUri = dataURI.split(',');
        return splitUri[1];
    };
    SoundService = __decorate([
        __param(0, Services_1.IOptionsService)
    ], SoundService);
    return SoundService;
}());
exports.SoundService = SoundService;


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Lifecycle_1 = __webpack_require__(2);
var Lifecycle_2 = __webpack_require__(7);
var Services_1 = __webpack_require__(5);
var Services_2 = __webpack_require__(0);
var HOVER_DURATION = 500;
var MouseZoneManager = (function (_super) {
    __extends(MouseZoneManager, _super);
    function MouseZoneManager(_element, _screenElement, _bufferService, _mouseService, _selectionService) {
        var _this = _super.call(this) || this;
        _this._element = _element;
        _this._screenElement = _screenElement;
        _this._bufferService = _bufferService;
        _this._mouseService = _mouseService;
        _this._selectionService = _selectionService;
        _this._zones = [];
        _this._areZonesActive = false;
        _this._lastHoverCoords = [undefined, undefined];
        _this._initialSelectionLength = 0;
        _this.register(Lifecycle_2.addDisposableDomListener(_this._element, 'mousedown', function (e) { return _this._onMouseDown(e); }));
        _this._mouseMoveListener = function (e) { return _this._onMouseMove(e); };
        _this._mouseLeaveListener = function (e) { return _this._onMouseLeave(e); };
        _this._clickListener = function (e) { return _this._onClick(e); };
        return _this;
    }
    MouseZoneManager.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._deactivate();
    };
    MouseZoneManager.prototype.add = function (zone) {
        this._zones.push(zone);
        if (this._zones.length === 1) {
            this._activate();
        }
    };
    MouseZoneManager.prototype.clearAll = function (start, end) {
        if (this._zones.length === 0) {
            return;
        }
        if (!start || !end) {
            start = 0;
            end = this._bufferService.rows - 1;
        }
        for (var i = 0; i < this._zones.length; i++) {
            var zone = this._zones[i];
            if ((zone.y1 > start && zone.y1 <= end + 1) ||
                (zone.y2 > start && zone.y2 <= end + 1) ||
                (zone.y1 < start && zone.y2 > end + 1)) {
                if (this._currentZone && this._currentZone === zone) {
                    this._currentZone.leaveCallback();
                    this._currentZone = undefined;
                }
                this._zones.splice(i--, 1);
            }
        }
        if (this._zones.length === 0) {
            this._deactivate();
        }
    };
    MouseZoneManager.prototype._activate = function () {
        if (!this._areZonesActive) {
            this._areZonesActive = true;
            this._element.addEventListener('mousemove', this._mouseMoveListener);
            this._element.addEventListener('mouseleave', this._mouseLeaveListener);
            this._element.addEventListener('click', this._clickListener);
        }
    };
    MouseZoneManager.prototype._deactivate = function () {
        if (this._areZonesActive) {
            this._areZonesActive = false;
            this._element.removeEventListener('mousemove', this._mouseMoveListener);
            this._element.removeEventListener('mouseleave', this._mouseLeaveListener);
            this._element.removeEventListener('click', this._clickListener);
        }
    };
    MouseZoneManager.prototype._onMouseMove = function (e) {
        if (this._lastHoverCoords[0] !== e.pageX || this._lastHoverCoords[1] !== e.pageY) {
            this._onHover(e);
            this._lastHoverCoords = [e.pageX, e.pageY];
        }
    };
    MouseZoneManager.prototype._onHover = function (e) {
        var _this = this;
        var zone = this._findZoneEventAt(e);
        if (zone === this._currentZone) {
            return;
        }
        if (this._currentZone) {
            this._currentZone.leaveCallback();
            this._currentZone = undefined;
            if (this._tooltipTimeout) {
                clearTimeout(this._tooltipTimeout);
            }
        }
        if (!zone) {
            return;
        }
        this._currentZone = zone;
        if (zone.hoverCallback) {
            zone.hoverCallback(e);
        }
        this._tooltipTimeout = setTimeout(function () { return _this._onTooltip(e); }, HOVER_DURATION);
    };
    MouseZoneManager.prototype._onTooltip = function (e) {
        this._tooltipTimeout = undefined;
        var zone = this._findZoneEventAt(e);
        if (zone && zone.tooltipCallback) {
            zone.tooltipCallback(e);
        }
    };
    MouseZoneManager.prototype._onMouseDown = function (e) {
        this._initialSelectionLength = this._getSelectionLength();
        if (!this._areZonesActive) {
            return;
        }
        var zone = this._findZoneEventAt(e);
        if (zone) {
            if (zone.willLinkActivate(e)) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }
    };
    MouseZoneManager.prototype._onMouseLeave = function (e) {
        if (this._currentZone) {
            this._currentZone.leaveCallback();
            this._currentZone = undefined;
            if (this._tooltipTimeout) {
                clearTimeout(this._tooltipTimeout);
            }
        }
    };
    MouseZoneManager.prototype._onClick = function (e) {
        var zone = this._findZoneEventAt(e);
        var currentSelectionLength = this._getSelectionLength();
        if (zone && currentSelectionLength === this._initialSelectionLength) {
            zone.clickCallback(e);
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    };
    MouseZoneManager.prototype._getSelectionLength = function () {
        var selectionText = this._selectionService.selectionText;
        return selectionText ? selectionText.length : 0;
    };
    MouseZoneManager.prototype._findZoneEventAt = function (e) {
        var coords = this._mouseService.getCoords(e, this._screenElement, this._bufferService.cols, this._bufferService.rows);
        if (!coords) {
            return undefined;
        }
        var x = coords[0];
        var y = coords[1];
        for (var i = 0; i < this._zones.length; i++) {
            var zone = this._zones[i];
            if (zone.y1 === zone.y2) {
                if (y === zone.y1 && x >= zone.x1 && x < zone.x2) {
                    return zone;
                }
            }
            else {
                if ((y === zone.y1 && x >= zone.x1) ||
                    (y === zone.y2 && x < zone.x2) ||
                    (y > zone.y1 && y < zone.y2)) {
                    return zone;
                }
            }
        }
        return undefined;
    };
    MouseZoneManager = __decorate([
        __param(2, Services_2.IBufferService),
        __param(3, Services_1.IMouseService),
        __param(4, Services_1.ISelectionService)
    ], MouseZoneManager);
    return MouseZoneManager;
}(Lifecycle_1.Disposable));
exports.MouseZoneManager = MouseZoneManager;


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Strings = __webpack_require__(16);
var Platform_1 = __webpack_require__(10);
var RenderDebouncer_1 = __webpack_require__(29);
var Lifecycle_1 = __webpack_require__(7);
var Lifecycle_2 = __webpack_require__(2);
var ScreenDprMonitor_1 = __webpack_require__(30);
var MAX_ROWS_TO_READ = 20;
var AccessibilityManager = (function (_super) {
    __extends(AccessibilityManager, _super);
    function AccessibilityManager(_terminal, _renderService) {
        var _this = _super.call(this) || this;
        _this._terminal = _terminal;
        _this._renderService = _renderService;
        _this._liveRegionLineCount = 0;
        _this._charsToConsume = [];
        _this._charsToAnnounce = '';
        _this._accessibilityTreeRoot = document.createElement('div');
        _this._accessibilityTreeRoot.classList.add('xterm-accessibility');
        _this._rowContainer = document.createElement('div');
        _this._rowContainer.classList.add('xterm-accessibility-tree');
        _this._rowElements = [];
        for (var i = 0; i < _this._terminal.rows; i++) {
            _this._rowElements[i] = _this._createAccessibilityTreeNode();
            _this._rowContainer.appendChild(_this._rowElements[i]);
        }
        _this._topBoundaryFocusListener = function (e) { return _this._onBoundaryFocus(e, 0); };
        _this._bottomBoundaryFocusListener = function (e) { return _this._onBoundaryFocus(e, 1); };
        _this._rowElements[0].addEventListener('focus', _this._topBoundaryFocusListener);
        _this._rowElements[_this._rowElements.length - 1].addEventListener('focus', _this._bottomBoundaryFocusListener);
        _this._refreshRowsDimensions();
        _this._accessibilityTreeRoot.appendChild(_this._rowContainer);
        _this._renderRowsDebouncer = new RenderDebouncer_1.RenderDebouncer(_this._renderRows.bind(_this));
        _this._refreshRows();
        _this._liveRegion = document.createElement('div');
        _this._liveRegion.classList.add('live-region');
        _this._liveRegion.setAttribute('aria-live', 'assertive');
        _this._accessibilityTreeRoot.appendChild(_this._liveRegion);
        _this._terminal.element.insertAdjacentElement('afterbegin', _this._accessibilityTreeRoot);
        _this.register(_this._renderRowsDebouncer);
        _this.register(_this._terminal.onResize(function (e) { return _this._onResize(e.rows); }));
        _this.register(_this._terminal.onRender(function (e) { return _this._refreshRows(e.start, e.end); }));
        _this.register(_this._terminal.onScroll(function () { return _this._refreshRows(); }));
        _this.register(_this._terminal.onA11yChar(function (char) { return _this._onChar(char); }));
        _this.register(_this._terminal.onLineFeed(function () { return _this._onChar('\n'); }));
        _this.register(_this._terminal.onA11yTab(function (spaceCount) { return _this._onTab(spaceCount); }));
        _this.register(_this._terminal.onKey(function (e) { return _this._onKey(e.key); }));
        _this.register(_this._terminal.onBlur(function () { return _this._clearLiveRegion(); }));
        _this.register(_this._renderService.onDimensionsChange(function () { return _this._refreshRowsDimensions(); }));
        _this._screenDprMonitor = new ScreenDprMonitor_1.ScreenDprMonitor();
        _this.register(_this._screenDprMonitor);
        _this._screenDprMonitor.setListener(function () { return _this._refreshRowsDimensions(); });
        _this.register(Lifecycle_1.addDisposableDomListener(window, 'resize', function () { return _this._refreshRowsDimensions(); }));
        return _this;
    }
    AccessibilityManager.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._terminal.element.removeChild(this._accessibilityTreeRoot);
        this._rowElements.length = 0;
    };
    AccessibilityManager.prototype._onBoundaryFocus = function (e, position) {
        var boundaryElement = e.target;
        var beforeBoundaryElement = this._rowElements[position === 0 ? 1 : this._rowElements.length - 2];
        var posInSet = boundaryElement.getAttribute('aria-posinset');
        var lastRowPos = position === 0 ? '1' : "" + this._terminal.buffer.lines.length;
        if (posInSet === lastRowPos) {
            return;
        }
        if (e.relatedTarget !== beforeBoundaryElement) {
            return;
        }
        var topBoundaryElement;
        var bottomBoundaryElement;
        if (position === 0) {
            topBoundaryElement = boundaryElement;
            bottomBoundaryElement = this._rowElements.pop();
            this._rowContainer.removeChild(bottomBoundaryElement);
        }
        else {
            topBoundaryElement = this._rowElements.shift();
            bottomBoundaryElement = boundaryElement;
            this._rowContainer.removeChild(topBoundaryElement);
        }
        topBoundaryElement.removeEventListener('focus', this._topBoundaryFocusListener);
        bottomBoundaryElement.removeEventListener('focus', this._bottomBoundaryFocusListener);
        if (position === 0) {
            var newElement = this._createAccessibilityTreeNode();
            this._rowElements.unshift(newElement);
            this._rowContainer.insertAdjacentElement('afterbegin', newElement);
        }
        else {
            var newElement = this._createAccessibilityTreeNode();
            this._rowElements.push(newElement);
            this._rowContainer.appendChild(newElement);
        }
        this._rowElements[0].addEventListener('focus', this._topBoundaryFocusListener);
        this._rowElements[this._rowElements.length - 1].addEventListener('focus', this._bottomBoundaryFocusListener);
        this._terminal.scrollLines(position === 0 ? -1 : 1);
        this._rowElements[position === 0 ? 1 : this._rowElements.length - 2].focus();
        e.preventDefault();
        e.stopImmediatePropagation();
    };
    AccessibilityManager.prototype._onResize = function (rows) {
        this._rowElements[this._rowElements.length - 1].removeEventListener('focus', this._bottomBoundaryFocusListener);
        for (var i = this._rowContainer.children.length; i < this._terminal.rows; i++) {
            this._rowElements[i] = this._createAccessibilityTreeNode();
            this._rowContainer.appendChild(this._rowElements[i]);
        }
        while (this._rowElements.length > rows) {
            this._rowContainer.removeChild(this._rowElements.pop());
        }
        this._rowElements[this._rowElements.length - 1].addEventListener('focus', this._bottomBoundaryFocusListener);
        this._refreshRowsDimensions();
    };
    AccessibilityManager.prototype._createAccessibilityTreeNode = function () {
        var element = document.createElement('div');
        element.setAttribute('role', 'listitem');
        element.tabIndex = -1;
        this._refreshRowDimensions(element);
        return element;
    };
    AccessibilityManager.prototype._onTab = function (spaceCount) {
        for (var i = 0; i < spaceCount; i++) {
            this._onChar(' ');
        }
    };
    AccessibilityManager.prototype._onChar = function (char) {
        var _this = this;
        if (this._liveRegionLineCount < MAX_ROWS_TO_READ + 1) {
            if (this._charsToConsume.length > 0) {
                var shiftedChar = this._charsToConsume.shift();
                if (shiftedChar !== char) {
                    this._charsToAnnounce += char;
                }
            }
            else {
                this._charsToAnnounce += char;
            }
            if (char === '\n') {
                this._liveRegionLineCount++;
                if (this._liveRegionLineCount === MAX_ROWS_TO_READ + 1) {
                    this._liveRegion.textContent += Strings.tooMuchOutput;
                }
            }
            if (Platform_1.isMac) {
                if (this._liveRegion.textContent && this._liveRegion.textContent.length > 0 && !this._liveRegion.parentNode) {
                    setTimeout(function () {
                        _this._accessibilityTreeRoot.appendChild(_this._liveRegion);
                    }, 0);
                }
            }
        }
    };
    AccessibilityManager.prototype._clearLiveRegion = function () {
        this._liveRegion.textContent = '';
        this._liveRegionLineCount = 0;
        if (Platform_1.isMac) {
            if (this._liveRegion.parentNode) {
                this._accessibilityTreeRoot.removeChild(this._liveRegion);
            }
        }
    };
    AccessibilityManager.prototype._onKey = function (keyChar) {
        this._clearLiveRegion();
        this._charsToConsume.push(keyChar);
    };
    AccessibilityManager.prototype._refreshRows = function (start, end) {
        this._renderRowsDebouncer.refresh(start, end, this._terminal.rows);
    };
    AccessibilityManager.prototype._renderRows = function (start, end) {
        var buffer = this._terminal.buffer;
        var setSize = buffer.lines.length.toString();
        for (var i = start; i <= end; i++) {
            var lineData = buffer.translateBufferLineToString(buffer.ydisp + i, true);
            var posInSet = (buffer.ydisp + i + 1).toString();
            var element = this._rowElements[i];
            if (element) {
                if (lineData.length === 0) {
                    element.innerHTML = '&nbsp;';
                }
                else {
                    element.textContent = lineData;
                }
                element.setAttribute('aria-posinset', posInSet);
                element.setAttribute('aria-setsize', setSize);
            }
        }
        this._announceCharacters();
    };
    AccessibilityManager.prototype._refreshRowsDimensions = function () {
        if (!this._renderService.dimensions.actualCellHeight) {
            return;
        }
        if (this._rowElements.length !== this._terminal.rows) {
            this._onResize(this._terminal.rows);
        }
        for (var i = 0; i < this._terminal.rows; i++) {
            this._refreshRowDimensions(this._rowElements[i]);
        }
    };
    AccessibilityManager.prototype._refreshRowDimensions = function (element) {
        element.style.height = this._renderService.dimensions.actualCellHeight + "px";
    };
    AccessibilityManager.prototype._announceCharacters = function () {
        if (this._charsToAnnounce.length === 0) {
            return;
        }
        this._liveRegion.textContent += this._charsToAnnounce;
        this._charsToAnnounce = '';
    };
    return AccessibilityManager;
}(Lifecycle_2.Disposable));
exports.AccessibilityManager = AccessibilityManager;


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var DomRendererRowFactory_1 = __webpack_require__(56);
var Constants_1 = __webpack_require__(9);
var Lifecycle_1 = __webpack_require__(2);
var TERMINAL_CLASS_PREFIX = 'xterm-dom-renderer-owner-';
var ROW_CONTAINER_CLASS = 'xterm-rows';
var FG_CLASS_PREFIX = 'xterm-fg-';
var BG_CLASS_PREFIX = 'xterm-bg-';
var FOCUS_CLASS = 'xterm-focus';
var SELECTION_CLASS = 'xterm-selection';
var nextTerminalId = 1;
var DomRenderer = (function (_super) {
    __extends(DomRenderer, _super);
    function DomRenderer(_terminal, _colors, _charSizeService, _optionsService) {
        var _this = _super.call(this) || this;
        _this._terminal = _terminal;
        _this._colors = _colors;
        _this._charSizeService = _charSizeService;
        _this._optionsService = _optionsService;
        _this._terminalClass = nextTerminalId++;
        _this._rowElements = [];
        _this._rowContainer = document.createElement('div');
        _this._rowContainer.classList.add(ROW_CONTAINER_CLASS);
        _this._rowContainer.style.lineHeight = 'normal';
        _this._rowContainer.setAttribute('aria-hidden', 'true');
        _this._refreshRowElements(_this._terminal.cols, _this._terminal.rows);
        _this._selectionContainer = document.createElement('div');
        _this._selectionContainer.classList.add(SELECTION_CLASS);
        _this._selectionContainer.setAttribute('aria-hidden', 'true');
        _this.dimensions = {
            scaledCharWidth: null,
            scaledCharHeight: null,
            scaledCellWidth: null,
            scaledCellHeight: null,
            scaledCharLeft: null,
            scaledCharTop: null,
            scaledCanvasWidth: null,
            scaledCanvasHeight: null,
            canvasWidth: null,
            canvasHeight: null,
            actualCellWidth: null,
            actualCellHeight: null
        };
        _this._updateDimensions();
        _this._injectCss();
        _this._rowFactory = new DomRendererRowFactory_1.DomRendererRowFactory(document, _this._optionsService);
        _this._terminal.element.classList.add(TERMINAL_CLASS_PREFIX + _this._terminalClass);
        _this._terminal.screenElement.appendChild(_this._rowContainer);
        _this._terminal.screenElement.appendChild(_this._selectionContainer);
        _this._terminal.linkifier.onLinkHover(function (e) { return _this._onLinkHover(e); });
        _this._terminal.linkifier.onLinkLeave(function (e) { return _this._onLinkLeave(e); });
        return _this;
    }
    DomRenderer.prototype.dispose = function () {
        this._terminal.element.classList.remove(TERMINAL_CLASS_PREFIX + this._terminalClass);
        this._terminal.screenElement.removeChild(this._rowContainer);
        this._terminal.screenElement.removeChild(this._selectionContainer);
        this._terminal.screenElement.removeChild(this._themeStyleElement);
        this._terminal.screenElement.removeChild(this._dimensionsStyleElement);
        _super.prototype.dispose.call(this);
    };
    DomRenderer.prototype._updateDimensions = function () {
        var _this = this;
        this.dimensions.scaledCharWidth = this._charSizeService.width * window.devicePixelRatio;
        this.dimensions.scaledCharHeight = Math.ceil(this._charSizeService.height * window.devicePixelRatio);
        this.dimensions.scaledCellWidth = this.dimensions.scaledCharWidth + Math.round(this._terminal.options.letterSpacing);
        this.dimensions.scaledCellHeight = Math.floor(this.dimensions.scaledCharHeight * this._terminal.options.lineHeight);
        this.dimensions.scaledCharLeft = 0;
        this.dimensions.scaledCharTop = 0;
        this.dimensions.scaledCanvasWidth = this.dimensions.scaledCellWidth * this._terminal.cols;
        this.dimensions.scaledCanvasHeight = this.dimensions.scaledCellHeight * this._terminal.rows;
        this.dimensions.canvasWidth = Math.round(this.dimensions.scaledCanvasWidth / window.devicePixelRatio);
        this.dimensions.canvasHeight = Math.round(this.dimensions.scaledCanvasHeight / window.devicePixelRatio);
        this.dimensions.actualCellWidth = this.dimensions.canvasWidth / this._terminal.cols;
        this.dimensions.actualCellHeight = this.dimensions.canvasHeight / this._terminal.rows;
        this._rowElements.forEach(function (element) {
            element.style.width = _this.dimensions.canvasWidth + "px";
            element.style.height = _this.dimensions.actualCellHeight + "px";
            element.style.lineHeight = _this.dimensions.actualCellHeight + "px";
            element.style.overflow = 'hidden';
        });
        if (!this._dimensionsStyleElement) {
            this._dimensionsStyleElement = document.createElement('style');
            this._terminal.screenElement.appendChild(this._dimensionsStyleElement);
        }
        var styles = this._terminalSelector + " ." + ROW_CONTAINER_CLASS + " span {" +
            " display: inline-block;" +
            " height: 100%;" +
            " vertical-align: top;" +
            (" width: " + this.dimensions.actualCellWidth + "px") +
            "}";
        this._dimensionsStyleElement.innerHTML = styles;
        this._selectionContainer.style.height = this._terminal._viewportElement.style.height;
        this._terminal.screenElement.style.width = this.dimensions.canvasWidth + "px";
        this._terminal.screenElement.style.height = this.dimensions.canvasHeight + "px";
    };
    DomRenderer.prototype.setColors = function (colors) {
        this._colors = colors;
        this._injectCss();
    };
    DomRenderer.prototype._injectCss = function () {
        var _this = this;
        if (!this._themeStyleElement) {
            this._themeStyleElement = document.createElement('style');
            this._terminal.screenElement.appendChild(this._themeStyleElement);
        }
        var styles = this._terminalSelector + " ." + ROW_CONTAINER_CLASS + " {" +
            (" color: " + this._colors.foreground.css + ";") +
            (" background-color: " + this._colors.background.css + ";") +
            (" font-family: " + this._terminal.options.fontFamily + ";") +
            (" font-size: " + this._terminal.options.fontSize + "px;") +
            "}";
        styles +=
            this._terminalSelector + " span:not(." + DomRendererRowFactory_1.BOLD_CLASS + ") {" +
                (" font-weight: " + this._terminal.options.fontWeight + ";") +
                "}" +
                (this._terminalSelector + " span." + DomRendererRowFactory_1.BOLD_CLASS + " {") +
                (" font-weight: " + this._terminal.options.fontWeightBold + ";") +
                "}" +
                (this._terminalSelector + " span." + DomRendererRowFactory_1.ITALIC_CLASS + " {") +
                " font-style: italic;" +
                "}";
        styles +=
            "@keyframes blink_box_shadow {" +
                " 50% {" +
                "  box-shadow: none;" +
                " }" +
                "}";
        styles +=
            "@keyframes blink_block {" +
                " 0% {" +
                ("  background-color: " + this._colors.cursor.css + ";") +
                ("  color: " + this._colors.cursorAccent.css + ";") +
                " }" +
                " 50% {" +
                ("  background-color: " + this._colors.cursorAccent.css + ";") +
                ("  color: " + this._colors.cursor.css + ";") +
                " }" +
                "}";
        styles +=
            this._terminalSelector + " ." + ROW_CONTAINER_CLASS + ":not(." + FOCUS_CLASS + ") ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_STYLE_BLOCK_CLASS + " {" +
                (" outline: 1px solid " + this._colors.cursor.css + ";") +
                " outline-offset: -1px;" +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + "." + FOCUS_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_BLINK_CLASS + ":not(." + DomRendererRowFactory_1.CURSOR_STYLE_BLOCK_CLASS + ") {") +
                " animation: blink_box_shadow 1s step-end infinite;" +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + "." + FOCUS_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_BLINK_CLASS + "." + DomRendererRowFactory_1.CURSOR_STYLE_BLOCK_CLASS + " {") +
                " animation: blink_block 1s step-end infinite;" +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + "." + FOCUS_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_STYLE_BLOCK_CLASS + " {") +
                (" background-color: " + this._colors.cursor.css + ";") +
                (" color: " + this._colors.cursorAccent.css + ";") +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_STYLE_BAR_CLASS + " {") +
                (" box-shadow: 1px 0 0 " + this._colors.cursor.css + " inset;") +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_STYLE_UNDERLINE_CLASS + " {") +
                (" box-shadow: 0 -1px 0 " + this._colors.cursor.css + " inset;") +
                "}";
        styles +=
            this._terminalSelector + " ." + SELECTION_CLASS + " {" +
                " position: absolute;" +
                " top: 0;" +
                " left: 0;" +
                " z-index: 1;" +
                " pointer-events: none;" +
                "}" +
                (this._terminalSelector + " ." + SELECTION_CLASS + " div {") +
                " position: absolute;" +
                (" background-color: " + this._colors.selection.css + ";") +
                "}";
        this._colors.ansi.forEach(function (c, i) {
            styles +=
                _this._terminalSelector + " ." + FG_CLASS_PREFIX + i + " { color: " + c.css + "; }" +
                    (_this._terminalSelector + " ." + BG_CLASS_PREFIX + i + " { background-color: " + c.css + "; }");
        });
        styles +=
            this._terminalSelector + " ." + FG_CLASS_PREFIX + Constants_1.INVERTED_DEFAULT_COLOR + " { color: " + this._colors.background.css + "; }" +
                (this._terminalSelector + " ." + BG_CLASS_PREFIX + Constants_1.INVERTED_DEFAULT_COLOR + " { background-color: " + this._colors.foreground.css + "; }");
        this._themeStyleElement.innerHTML = styles;
    };
    DomRenderer.prototype.onDevicePixelRatioChange = function () {
        this._updateDimensions();
    };
    DomRenderer.prototype._refreshRowElements = function (cols, rows) {
        for (var i = this._rowElements.length; i <= rows; i++) {
            var row = document.createElement('div');
            this._rowContainer.appendChild(row);
            this._rowElements.push(row);
        }
        while (this._rowElements.length > rows) {
            this._rowContainer.removeChild(this._rowElements.pop());
        }
    };
    DomRenderer.prototype.onResize = function (cols, rows) {
        this._refreshRowElements(cols, rows);
        this._updateDimensions();
    };
    DomRenderer.prototype.onCharSizeChanged = function () {
        this._updateDimensions();
    };
    DomRenderer.prototype.onBlur = function () {
        this._rowContainer.classList.remove(FOCUS_CLASS);
    };
    DomRenderer.prototype.onFocus = function () {
        this._rowContainer.classList.add(FOCUS_CLASS);
    };
    DomRenderer.prototype.onSelectionChanged = function (start, end, columnSelectMode) {
        while (this._selectionContainer.children.length) {
            this._selectionContainer.removeChild(this._selectionContainer.children[0]);
        }
        if (!start || !end) {
            return;
        }
        var viewportStartRow = start[1] - this._terminal.buffer.ydisp;
        var viewportEndRow = end[1] - this._terminal.buffer.ydisp;
        var viewportCappedStartRow = Math.max(viewportStartRow, 0);
        var viewportCappedEndRow = Math.min(viewportEndRow, this._terminal.rows - 1);
        if (viewportCappedStartRow >= this._terminal.rows || viewportCappedEndRow < 0) {
            return;
        }
        var documentFragment = document.createDocumentFragment();
        if (columnSelectMode) {
            documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow, start[0], end[0], viewportCappedEndRow - viewportCappedStartRow + 1));
        }
        else {
            var startCol = viewportStartRow === viewportCappedStartRow ? start[0] : 0;
            var endCol = viewportCappedStartRow === viewportCappedEndRow ? end[0] : this._terminal.cols;
            documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow, startCol, endCol));
            var middleRowsCount = viewportCappedEndRow - viewportCappedStartRow - 1;
            documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow + 1, 0, this._terminal.cols, middleRowsCount));
            if (viewportCappedStartRow !== viewportCappedEndRow) {
                var endCol_1 = viewportEndRow === viewportCappedEndRow ? end[0] : this._terminal.cols;
                documentFragment.appendChild(this._createSelectionElement(viewportCappedEndRow, 0, endCol_1));
            }
        }
        this._selectionContainer.appendChild(documentFragment);
    };
    DomRenderer.prototype._createSelectionElement = function (row, colStart, colEnd, rowCount) {
        if (rowCount === void 0) { rowCount = 1; }
        var element = document.createElement('div');
        element.style.height = rowCount * this.dimensions.actualCellHeight + "px";
        element.style.top = row * this.dimensions.actualCellHeight + "px";
        element.style.left = colStart * this.dimensions.actualCellWidth + "px";
        element.style.width = this.dimensions.actualCellWidth * (colEnd - colStart) + "px";
        return element;
    };
    DomRenderer.prototype.onCursorMove = function () {
    };
    DomRenderer.prototype.onOptionsChanged = function () {
        this._updateDimensions();
        this._injectCss();
        this._terminal.refresh(0, this._terminal.rows - 1);
    };
    DomRenderer.prototype.clear = function () {
        this._rowElements.forEach(function (e) { return e.innerHTML = ''; });
    };
    DomRenderer.prototype.renderRows = function (start, end) {
        var terminal = this._terminal;
        var cursorAbsoluteY = terminal.buffer.ybase + terminal.buffer.y;
        var cursorX = this._terminal.buffer.x;
        var cursorBlink = this._terminal.options.cursorBlink;
        for (var y = start; y <= end; y++) {
            var rowElement = this._rowElements[y];
            rowElement.innerHTML = '';
            var row = y + terminal.buffer.ydisp;
            var lineData = terminal.buffer.lines.get(row);
            var cursorStyle = terminal.options.cursorStyle;
            rowElement.appendChild(this._rowFactory.createRow(lineData, row === cursorAbsoluteY, cursorStyle, cursorX, cursorBlink, this.dimensions.actualCellWidth, terminal.cols));
        }
    };
    Object.defineProperty(DomRenderer.prototype, "_terminalSelector", {
        get: function () {
            return "." + TERMINAL_CLASS_PREFIX + this._terminalClass;
        },
        enumerable: true,
        configurable: true
    });
    DomRenderer.prototype.registerCharacterJoiner = function (handler) { return -1; };
    DomRenderer.prototype.deregisterCharacterJoiner = function (joinerId) { return false; };
    DomRenderer.prototype._onLinkHover = function (e) {
        this._setCellUnderline(e.x1, e.x2, e.y1, e.y2, e.cols, true);
    };
    DomRenderer.prototype._onLinkLeave = function (e) {
        this._setCellUnderline(e.x1, e.x2, e.y1, e.y2, e.cols, false);
    };
    DomRenderer.prototype._setCellUnderline = function (x, x2, y, y2, cols, enabled) {
        while (x !== x2 || y !== y2) {
            var row = this._rowElements[y];
            if (!row) {
                return;
            }
            var span = row.children[x];
            if (span) {
                span.style.textDecoration = enabled ? 'underline' : 'none';
            }
            if (++x >= cols) {
                x = 0;
                y++;
            }
        }
    };
    return DomRenderer;
}(Lifecycle_1.Disposable));
exports.DomRenderer = DomRenderer;


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Constants_1 = __webpack_require__(9);
var AttributeData_1 = __webpack_require__(6);
var Constants_2 = __webpack_require__(3);
var CellData_1 = __webpack_require__(4);
exports.BOLD_CLASS = 'xterm-bold';
exports.DIM_CLASS = 'xterm-dim';
exports.ITALIC_CLASS = 'xterm-italic';
exports.UNDERLINE_CLASS = 'xterm-underline';
exports.CURSOR_CLASS = 'xterm-cursor';
exports.CURSOR_BLINK_CLASS = 'xterm-cursor-blink';
exports.CURSOR_STYLE_BLOCK_CLASS = 'xterm-cursor-block';
exports.CURSOR_STYLE_BAR_CLASS = 'xterm-cursor-bar';
exports.CURSOR_STYLE_UNDERLINE_CLASS = 'xterm-cursor-underline';
var DomRendererRowFactory = (function () {
    function DomRendererRowFactory(_document, _optionsService) {
        this._document = _document;
        this._optionsService = _optionsService;
        this._workCell = new CellData_1.CellData();
    }
    DomRendererRowFactory.prototype.createRow = function (lineData, isCursorRow, cursorStyle, cursorX, cursorBlink, cellWidth, cols) {
        var fragment = this._document.createDocumentFragment();
        var lineLength = 0;
        for (var x = Math.min(lineData.length, cols) - 1; x >= 0; x--) {
            if (lineData.loadCell(x, this._workCell).getCode() !== Constants_2.NULL_CELL_CODE || (isCursorRow && x === cursorX)) {
                lineLength = x + 1;
                break;
            }
        }
        for (var x = 0; x < lineLength; x++) {
            lineData.loadCell(x, this._workCell);
            var width = this._workCell.getWidth();
            if (width === 0) {
                continue;
            }
            var charElement = this._document.createElement('span');
            if (width > 1) {
                charElement.style.width = cellWidth * width + "px";
            }
            if (isCursorRow && x === cursorX) {
                charElement.classList.add(exports.CURSOR_CLASS);
                if (cursorBlink) {
                    charElement.classList.add(exports.CURSOR_BLINK_CLASS);
                }
                switch (cursorStyle) {
                    case 'bar':
                        charElement.classList.add(exports.CURSOR_STYLE_BAR_CLASS);
                        break;
                    case 'underline':
                        charElement.classList.add(exports.CURSOR_STYLE_UNDERLINE_CLASS);
                        break;
                    default:
                        charElement.classList.add(exports.CURSOR_STYLE_BLOCK_CLASS);
                        break;
                }
            }
            if (this._workCell.isBold()) {
                charElement.classList.add(exports.BOLD_CLASS);
            }
            if (this._workCell.isItalic()) {
                charElement.classList.add(exports.ITALIC_CLASS);
            }
            if (this._workCell.isDim()) {
                charElement.classList.add(exports.DIM_CLASS);
            }
            if (this._workCell.isUnderline()) {
                charElement.classList.add(exports.UNDERLINE_CLASS);
            }
            charElement.textContent = this._workCell.getChars() || Constants_2.WHITESPACE_CELL_CHAR;
            var swapColor = this._workCell.isInverse();
            if (this._workCell.isFgRGB()) {
                var style = charElement.getAttribute('style') || '';
                style += (swapColor ? 'background-' : '') + "color:rgb(" + (AttributeData_1.AttributeData.toColorRGB(this._workCell.getFgColor())).join(',') + ");";
                charElement.setAttribute('style', style);
            }
            else if (this._workCell.isFgPalette()) {
                var fg = this._workCell.getFgColor();
                if (this._workCell.isBold() && fg < 8 && !swapColor && this._optionsService.options.drawBoldTextInBrightColors) {
                    fg += 8;
                }
                charElement.classList.add("xterm-" + (swapColor ? 'b' : 'f') + "g-" + fg);
            }
            else if (swapColor) {
                charElement.classList.add("xterm-bg-" + Constants_1.INVERTED_DEFAULT_COLOR);
            }
            if (this._workCell.isBgRGB()) {
                var style = charElement.getAttribute('style') || '';
                style += (swapColor ? '' : 'background-') + "color:rgb(" + (AttributeData_1.AttributeData.toColorRGB(this._workCell.getBgColor())).join(',') + ");";
                charElement.setAttribute('style', style);
            }
            else if (this._workCell.isBgPalette()) {
                charElement.classList.add("xterm-" + (swapColor ? 'f' : 'b') + "g-" + this._workCell.getBgColor());
            }
            else if (swapColor) {
                charElement.classList.add("xterm-fg-" + Constants_1.INVERTED_DEFAULT_COLOR);
            }
            fragment.appendChild(charElement);
        }
        return fragment;
    };
    return DomRendererRowFactory;
}());
exports.DomRendererRowFactory = DomRendererRowFactory;


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var EscapeSequences_1 = __webpack_require__(11);
var KEYCODE_KEY_MAPPINGS = {
    48: ['0', ')'],
    49: ['1', '!'],
    50: ['2', '@'],
    51: ['3', '#'],
    52: ['4', '$'],
    53: ['5', '%'],
    54: ['6', '^'],
    55: ['7', '&'],
    56: ['8', '*'],
    57: ['9', '('],
    186: [';', ':'],
    187: ['=', '+'],
    188: [',', '<'],
    189: ['-', '_'],
    190: ['.', '>'],
    191: ['/', '?'],
    192: ['`', '~'],
    219: ['[', '{'],
    220: ['\\', '|'],
    221: [']', '}'],
    222: ['\'', '"']
};
function evaluateKeyboardEvent(ev, applicationCursorMode, isMac, macOptionIsMeta) {
    var result = {
        type: 0,
        cancel: false,
        key: undefined
    };
    var modifiers = (ev.shiftKey ? 1 : 0) | (ev.altKey ? 2 : 0) | (ev.ctrlKey ? 4 : 0) | (ev.metaKey ? 8 : 0);
    switch (ev.keyCode) {
        case 0:
            if (ev.key === 'UIKeyInputUpArrow') {
                if (applicationCursorMode) {
                    result.key = EscapeSequences_1.C0.ESC + 'OA';
                }
                else {
                    result.key = EscapeSequences_1.C0.ESC + '[A';
                }
            }
            else if (ev.key === 'UIKeyInputLeftArrow') {
                if (applicationCursorMode) {
                    result.key = EscapeSequences_1.C0.ESC + 'OD';
                }
                else {
                    result.key = EscapeSequences_1.C0.ESC + '[D';
                }
            }
            else if (ev.key === 'UIKeyInputRightArrow') {
                if (applicationCursorMode) {
                    result.key = EscapeSequences_1.C0.ESC + 'OC';
                }
                else {
                    result.key = EscapeSequences_1.C0.ESC + '[C';
                }
            }
            else if (ev.key === 'UIKeyInputDownArrow') {
                if (applicationCursorMode) {
                    result.key = EscapeSequences_1.C0.ESC + 'OB';
                }
                else {
                    result.key = EscapeSequences_1.C0.ESC + '[B';
                }
            }
            break;
        case 8:
            if (ev.shiftKey) {
                result.key = EscapeSequences_1.C0.BS;
                break;
            }
            else if (ev.altKey) {
                result.key = EscapeSequences_1.C0.ESC + EscapeSequences_1.C0.DEL;
                break;
            }
            result.key = EscapeSequences_1.C0.DEL;
            break;
        case 9:
            if (ev.shiftKey) {
                result.key = EscapeSequences_1.C0.ESC + '[Z';
                break;
            }
            result.key = EscapeSequences_1.C0.HT;
            result.cancel = true;
            break;
        case 13:
            result.key = EscapeSequences_1.C0.CR;
            result.cancel = true;
            break;
        case 27:
            result.key = EscapeSequences_1.C0.ESC;
            result.cancel = true;
            break;
        case 37:
            if (ev.metaKey) {
                break;
            }
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'D';
                if (result.key === EscapeSequences_1.C0.ESC + '[1;3D') {
                    result.key = EscapeSequences_1.C0.ESC + (isMac ? 'b' : '[1;5D');
                }
            }
            else if (applicationCursorMode) {
                result.key = EscapeSequences_1.C0.ESC + 'OD';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[D';
            }
            break;
        case 39:
            if (ev.metaKey) {
                break;
            }
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'C';
                if (result.key === EscapeSequences_1.C0.ESC + '[1;3C') {
                    result.key = EscapeSequences_1.C0.ESC + (isMac ? 'f' : '[1;5C');
                }
            }
            else if (applicationCursorMode) {
                result.key = EscapeSequences_1.C0.ESC + 'OC';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[C';
            }
            break;
        case 38:
            if (ev.metaKey) {
                break;
            }
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'A';
                if (!isMac && result.key === EscapeSequences_1.C0.ESC + '[1;3A') {
                    result.key = EscapeSequences_1.C0.ESC + '[1;5A';
                }
            }
            else if (applicationCursorMode) {
                result.key = EscapeSequences_1.C0.ESC + 'OA';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[A';
            }
            break;
        case 40:
            if (ev.metaKey) {
                break;
            }
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'B';
                if (!isMac && result.key === EscapeSequences_1.C0.ESC + '[1;3B') {
                    result.key = EscapeSequences_1.C0.ESC + '[1;5B';
                }
            }
            else if (applicationCursorMode) {
                result.key = EscapeSequences_1.C0.ESC + 'OB';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[B';
            }
            break;
        case 45:
            if (!ev.shiftKey && !ev.ctrlKey) {
                result.key = EscapeSequences_1.C0.ESC + '[2~';
            }
            break;
        case 46:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[3;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[3~';
            }
            break;
        case 36:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'H';
            }
            else if (applicationCursorMode) {
                result.key = EscapeSequences_1.C0.ESC + 'OH';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[H';
            }
            break;
        case 35:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'F';
            }
            else if (applicationCursorMode) {
                result.key = EscapeSequences_1.C0.ESC + 'OF';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[F';
            }
            break;
        case 33:
            if (ev.shiftKey) {
                result.type = 2;
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[5~';
            }
            break;
        case 34:
            if (ev.shiftKey) {
                result.type = 3;
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[6~';
            }
            break;
        case 112:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'P';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + 'OP';
            }
            break;
        case 113:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'Q';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + 'OQ';
            }
            break;
        case 114:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'R';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + 'OR';
            }
            break;
        case 115:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'S';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + 'OS';
            }
            break;
        case 116:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[15;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[15~';
            }
            break;
        case 117:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[17;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[17~';
            }
            break;
        case 118:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[18;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[18~';
            }
            break;
        case 119:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[19;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[19~';
            }
            break;
        case 120:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[20;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[20~';
            }
            break;
        case 121:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[21;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[21~';
            }
            break;
        case 122:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[23;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[23~';
            }
            break;
        case 123:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[24;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[24~';
            }
            break;
        default:
            if (ev.ctrlKey && !ev.shiftKey && !ev.altKey && !ev.metaKey) {
                if (ev.keyCode >= 65 && ev.keyCode <= 90) {
                    result.key = String.fromCharCode(ev.keyCode - 64);
                }
                else if (ev.keyCode === 32) {
                    result.key = EscapeSequences_1.C0.NUL;
                }
                else if (ev.keyCode >= 51 && ev.keyCode <= 55) {
                    result.key = String.fromCharCode(ev.keyCode - 51 + 27);
                }
                else if (ev.keyCode === 56) {
                    result.key = EscapeSequences_1.C0.DEL;
                }
                else if (ev.keyCode === 219) {
                    result.key = EscapeSequences_1.C0.ESC;
                }
                else if (ev.keyCode === 220) {
                    result.key = EscapeSequences_1.C0.FS;
                }
                else if (ev.keyCode === 221) {
                    result.key = EscapeSequences_1.C0.GS;
                }
            }
            else if ((!isMac || macOptionIsMeta) && ev.altKey && !ev.metaKey) {
                var keyMapping = KEYCODE_KEY_MAPPINGS[ev.keyCode];
                var key = keyMapping && keyMapping[!ev.shiftKey ? 0 : 1];
                if (key) {
                    result.key = EscapeSequences_1.C0.ESC + key;
                }
                else if (ev.keyCode >= 65 && ev.keyCode <= 90) {
                    var keyCode = ev.ctrlKey ? ev.keyCode - 64 : ev.keyCode + 32;
                    result.key = EscapeSequences_1.C0.ESC + String.fromCharCode(keyCode);
                }
            }
            else if (isMac && !ev.altKey && !ev.ctrlKey && ev.metaKey) {
                if (ev.keyCode === 65) {
                    result.type = 1;
                }
            }
            else if (ev.key && !ev.ctrlKey && !ev.altKey && !ev.metaKey && ev.keyCode >= 48 && ev.key.length === 1) {
                result.key = ev.key;
            }
            else if (ev.key && ev.ctrlKey) {
                if (ev.key === '_') {
                    result.key = EscapeSequences_1.C0.US;
                }
            }
            break;
    }
    return result;
}
exports.evaluateKeyboardEvent = evaluateKeyboardEvent;


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Constants_1 = __webpack_require__(3);
function applyWindowsMode(terminal) {
    return terminal.onLineFeed(function () {
        var line = terminal.buffer.lines.get(terminal.buffer.ybase + terminal.buffer.y - 1);
        var lastChar = line.get(terminal.cols - 1);
        var nextLine = terminal.buffer.lines.get(terminal.buffer.ybase + terminal.buffer.y);
        nextLine.isWrapped = (lastChar[Constants_1.CHAR_DATA_CODE_INDEX] !== Constants_1.NULL_CELL_CODE && lastChar[Constants_1.CHAR_DATA_CODE_INDEX] !== Constants_1.WHITESPACE_CELL_CODE);
    });
}
exports.applyWindowsMode = applyWindowsMode;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var RenderDebouncer_1 = __webpack_require__(29);
var EventEmitter_1 = __webpack_require__(1);
var Lifecycle_1 = __webpack_require__(2);
var ScreenDprMonitor_1 = __webpack_require__(30);
var Lifecycle_2 = __webpack_require__(7);
var Services_1 = __webpack_require__(0);
var Services_2 = __webpack_require__(5);
var RenderService = (function (_super) {
    __extends(RenderService, _super);
    function RenderService(_renderer, _rowCount, screenElement, optionsService, charSizeService) {
        var _this = _super.call(this) || this;
        _this._renderer = _renderer;
        _this._rowCount = _rowCount;
        _this.screenElement = screenElement;
        _this.optionsService = optionsService;
        _this.charSizeService = charSizeService;
        _this._isPaused = false;
        _this._needsFullRefresh = false;
        _this._canvasWidth = 0;
        _this._canvasHeight = 0;
        _this._onDimensionsChange = new EventEmitter_1.EventEmitter();
        _this._onRender = new EventEmitter_1.EventEmitter();
        _this._onRefreshRequest = new EventEmitter_1.EventEmitter();
        _this._renderDebouncer = new RenderDebouncer_1.RenderDebouncer(function (start, end) { return _this._renderRows(start, end); });
        _this.register(_this._renderDebouncer);
        _this._screenDprMonitor = new ScreenDprMonitor_1.ScreenDprMonitor();
        _this._screenDprMonitor.setListener(function () { return _this.onDevicePixelRatioChange(); });
        _this.register(_this._screenDprMonitor);
        _this.register(optionsService.onOptionChange(function () { return _this._renderer.onOptionsChanged(); }));
        _this.register(charSizeService.onCharSizeChange(function () { return _this.onCharSizeChanged(); }));
        _this.register(Lifecycle_2.addDisposableDomListener(window, 'resize', function () { return _this.onDevicePixelRatioChange(); }));
        if ('IntersectionObserver' in window) {
            var observer_1 = new IntersectionObserver(function (e) { return _this._onIntersectionChange(e[e.length - 1]); }, { threshold: 0 });
            observer_1.observe(screenElement);
            _this.register({ dispose: function () { return observer_1.disconnect(); } });
        }
        return _this;
    }
    Object.defineProperty(RenderService.prototype, "onDimensionsChange", {
        get: function () { return this._onDimensionsChange.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RenderService.prototype, "onRender", {
        get: function () { return this._onRender.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RenderService.prototype, "onRefreshRequest", {
        get: function () { return this._onRefreshRequest.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RenderService.prototype, "dimensions", {
        get: function () { return this._renderer.dimensions; },
        enumerable: true,
        configurable: true
    });
    RenderService.prototype._onIntersectionChange = function (entry) {
        this._isPaused = entry.intersectionRatio === 0;
        if (!this._isPaused && this._needsFullRefresh) {
            this.refreshRows(0, this._rowCount - 1);
            this._needsFullRefresh = false;
        }
    };
    RenderService.prototype.refreshRows = function (start, end) {
        if (this._isPaused) {
            this._needsFullRefresh = true;
            return;
        }
        this._renderDebouncer.refresh(start, end, this._rowCount);
    };
    RenderService.prototype._renderRows = function (start, end) {
        this._renderer.renderRows(start, end);
        this._onRender.fire({ start: start, end: end });
    };
    RenderService.prototype.resize = function (cols, rows) {
        this._rowCount = rows;
        this._fireOnCanvasResize();
    };
    RenderService.prototype.changeOptions = function () {
        this._renderer.onOptionsChanged();
        this._fireOnCanvasResize();
    };
    RenderService.prototype._fireOnCanvasResize = function () {
        if (this._renderer.dimensions.canvasWidth === this._canvasWidth && this._renderer.dimensions.canvasHeight === this._canvasHeight) {
            return;
        }
        this._onDimensionsChange.fire(this._renderer.dimensions);
    };
    RenderService.prototype.dispose = function () {
        this._renderer.dispose();
    };
    RenderService.prototype.setRenderer = function (renderer) {
        this._renderer.dispose();
        this._renderer = renderer;
        this.refreshRows(0, this._rowCount - 1);
    };
    RenderService.prototype._fullRefresh = function () {
        if (this._isPaused) {
            this._needsFullRefresh = true;
        }
        else {
            this.refreshRows(0, this._rowCount - 1);
        }
    };
    RenderService.prototype.setColors = function (colors) {
        this._renderer.setColors(colors);
        this._fullRefresh();
    };
    RenderService.prototype.onDevicePixelRatioChange = function () {
        this._renderer.onDevicePixelRatioChange();
        this.refreshRows(0, this._rowCount - 1);
    };
    RenderService.prototype.onResize = function (cols, rows) {
        this._renderer.onResize(cols, rows);
        this._fullRefresh();
    };
    RenderService.prototype.onCharSizeChanged = function () {
        this._renderer.onCharSizeChanged();
    };
    RenderService.prototype.onBlur = function () {
        this._renderer.onBlur();
    };
    RenderService.prototype.onFocus = function () {
        this._renderer.onFocus();
    };
    RenderService.prototype.onSelectionChanged = function (start, end, columnSelectMode) {
        this._renderer.onSelectionChanged(start, end, columnSelectMode);
    };
    RenderService.prototype.onCursorMove = function () {
        this._renderer.onCursorMove();
    };
    RenderService.prototype.clear = function () {
        this._renderer.clear();
    };
    RenderService.prototype.registerCharacterJoiner = function (handler) {
        return this._renderer.registerCharacterJoiner(handler);
    };
    RenderService.prototype.deregisterCharacterJoiner = function (joinerId) {
        return this._renderer.deregisterCharacterJoiner(joinerId);
    };
    RenderService = __decorate([
        __param(3, Services_1.IOptionsService),
        __param(4, Services_2.ICharSizeService)
    ], RenderService);
    return RenderService;
}(Lifecycle_1.Disposable));
exports.RenderService = RenderService;


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter_1 = __webpack_require__(1);
var Platform_1 = __webpack_require__(10);
var Clone_1 = __webpack_require__(31);
exports.DEFAULT_BELL_SOUND = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjMyLjEwNAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//WreyTRUoAWgBgkOAGbZHBgG1OF6zM82DWbZaUmMBptgQhGjsyYqc9ae9XFz280948NMBWInljyzsNRFLPWdnZGWrddDsjK1unuSrVN9jJsK8KuQtQCtMBjCEtImISdNKJOopIpBFpNSMbIHCSRpRR5iakjTiyzLhchUUBwCgyKiweBv/7UsQbg8isVNoMPMjAAAA0gAAABEVFGmgqK////9bP/6XCykxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
exports.DEFAULT_OPTIONS = Object.freeze({
    cols: 80,
    rows: 24,
    cursorBlink: false,
    cursorStyle: 'block',
    bellSound: exports.DEFAULT_BELL_SOUND,
    bellStyle: 'none',
    drawBoldTextInBrightColors: true,
    fastScrollModifier: 'alt',
    fastScrollSensitivity: 5,
    fontFamily: 'courier-new, courier, monospace',
    fontSize: 15,
    fontWeight: 'normal',
    fontWeightBold: 'bold',
    lineHeight: 1.0,
    letterSpacing: 0,
    logLevel: 'info',
    scrollback: 1000,
    scrollSensitivity: 1,
    screenReaderMode: false,
    macOptionIsMeta: false,
    macOptionClickForcesSelection: false,
    disableStdin: false,
    allowTransparency: false,
    tabStopWidth: 8,
    theme: {},
    rightClickSelectsWord: Platform_1.isMac,
    rendererType: 'canvas',
    windowsMode: false,
    convertEol: false,
    termName: 'xterm',
    screenKeys: false,
    cancelEvents: false,
    useFlowControl: false,
    wordSeparator: ' ()[]{}\',:;"'
});
var CONSTRUCTOR_ONLY_OPTIONS = ['cols', 'rows'];
var OptionsService = (function () {
    function OptionsService(options) {
        var _this = this;
        this._onOptionChange = new EventEmitter_1.EventEmitter();
        this.options = Clone_1.clone(exports.DEFAULT_OPTIONS);
        Object.keys(options).forEach(function (k) {
            if (k in _this.options) {
                var newValue = options[k];
                _this.options[k] = newValue;
            }
        });
    }
    Object.defineProperty(OptionsService.prototype, "onOptionChange", {
        get: function () { return this._onOptionChange.event; },
        enumerable: true,
        configurable: true
    });
    OptionsService.prototype.setOption = function (key, value) {
        if (!(key in exports.DEFAULT_OPTIONS)) {
            throw new Error('No option with key "' + key + '"');
        }
        if (CONSTRUCTOR_ONLY_OPTIONS.indexOf(key) !== -1) {
            throw new Error("Option \"" + key + "\" can only be set in the constructor");
        }
        if (this.options[key] === value) {
            return;
        }
        value = this._sanitizeAndValidateOption(key, value);
        if (this.options[key] === value) {
            return;
        }
        this.options[key] = value;
        this._onOptionChange.fire(key);
    };
    OptionsService.prototype._sanitizeAndValidateOption = function (key, value) {
        switch (key) {
            case 'bellStyle':
            case 'cursorStyle':
            case 'fontWeight':
            case 'fontWeightBold':
            case 'rendererType':
            case 'wordSeparator':
                if (!value) {
                    value = exports.DEFAULT_OPTIONS[key];
                }
                break;
            case 'lineHeight':
            case 'tabStopWidth':
                if (value < 1) {
                    throw new Error(key + " cannot be less than 1, value: " + value);
                }
                break;
            case 'scrollback':
                value = Math.min(value, 4294967295);
                if (value < 0) {
                    throw new Error(key + " cannot be less than 0, value: " + value);
                }
                break;
            case 'fastScrollSensitivity':
            case 'scrollSensitivity':
                if (value <= 0) {
                    throw new Error(key + " cannot be less than or equal to 0, value: " + value);
                }
                break;
        }
        return value;
    };
    OptionsService.prototype.getOption = function (key) {
        if (!(key in exports.DEFAULT_OPTIONS)) {
            throw new Error("No option with key \"" + key + "\"");
        }
        return this.options[key];
    };
    return OptionsService;
}());
exports.OptionsService = OptionsService;


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Services_1 = __webpack_require__(0);
var EventEmitter_1 = __webpack_require__(1);
var CharSizeService = (function () {
    function CharSizeService(document, parentElement, _optionsService) {
        this.document = document;
        this.parentElement = parentElement;
        this._optionsService = _optionsService;
        this.width = 0;
        this.height = 0;
        this._onCharSizeChange = new EventEmitter_1.EventEmitter();
        this._measureStrategy = new DomMeasureStrategy(document, parentElement, this._optionsService);
    }
    Object.defineProperty(CharSizeService.prototype, "hasValidSize", {
        get: function () { return this.width > 0 && this.height > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CharSizeService.prototype, "onCharSizeChange", {
        get: function () { return this._onCharSizeChange.event; },
        enumerable: true,
        configurable: true
    });
    CharSizeService.prototype.measure = function () {
        var result = this._measureStrategy.measure();
        if (result.width !== this.width || result.height !== this.height) {
            this.width = result.width;
            this.height = result.height;
            this._onCharSizeChange.fire();
        }
    };
    CharSizeService = __decorate([
        __param(2, Services_1.IOptionsService)
    ], CharSizeService);
    return CharSizeService;
}());
exports.CharSizeService = CharSizeService;
var DomMeasureStrategy = (function () {
    function DomMeasureStrategy(_document, _parentElement, _optionsService) {
        this._document = _document;
        this._parentElement = _parentElement;
        this._optionsService = _optionsService;
        this._result = { width: 0, height: 0 };
        this._measureElement = this._document.createElement('span');
        this._measureElement.classList.add('xterm-char-measure-element');
        this._measureElement.textContent = 'W';
        this._measureElement.setAttribute('aria-hidden', 'true');
        this._parentElement.appendChild(this._measureElement);
    }
    DomMeasureStrategy.prototype.measure = function () {
        this._measureElement.style.fontFamily = this._optionsService.options.fontFamily;
        this._measureElement.style.fontSize = this._optionsService.options.fontSize + "px";
        var geometry = this._measureElement.getBoundingClientRect();
        if (geometry.width !== 0 && geometry.height !== 0) {
            this._result.width = geometry.width;
            this._result.height = Math.ceil(geometry.height);
        }
        return this._result;
    };
    return DomMeasureStrategy;
}());


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Services_1 = __webpack_require__(0);
var BufferSet_1 = __webpack_require__(63);
exports.MINIMUM_COLS = 2;
exports.MINIMUM_ROWS = 1;
var BufferService = (function () {
    function BufferService(_optionsService) {
        this._optionsService = _optionsService;
        this.cols = Math.max(_optionsService.options.cols, exports.MINIMUM_COLS);
        this.rows = Math.max(_optionsService.options.rows, exports.MINIMUM_ROWS);
        this.buffers = new BufferSet_1.BufferSet(_optionsService, this);
    }
    Object.defineProperty(BufferService.prototype, "buffer", {
        get: function () { return this.buffers.active; },
        enumerable: true,
        configurable: true
    });
    BufferService.prototype.resize = function (cols, rows) {
        this.cols = cols;
        this.rows = rows;
    };
    BufferService.prototype.reset = function () {
        this.buffers = new BufferSet_1.BufferSet(this._optionsService, this);
    };
    BufferService = __decorate([
        __param(0, Services_1.IOptionsService)
    ], BufferService);
    return BufferService;
}());
exports.BufferService = BufferService;


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Buffer_1 = __webpack_require__(64);
var EventEmitter_1 = __webpack_require__(1);
var BufferSet = (function () {
    function BufferSet(optionsService, bufferService) {
        this.optionsService = optionsService;
        this.bufferService = bufferService;
        this._onBufferActivate = new EventEmitter_1.EventEmitter();
        this._normal = new Buffer_1.Buffer(true, optionsService, bufferService);
        this._normal.fillViewportRows();
        this._alt = new Buffer_1.Buffer(false, optionsService, bufferService);
        this._activeBuffer = this._normal;
        this.setupTabStops();
    }
    Object.defineProperty(BufferSet.prototype, "onBufferActivate", {
        get: function () { return this._onBufferActivate.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BufferSet.prototype, "alt", {
        get: function () {
            return this._alt;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BufferSet.prototype, "active", {
        get: function () {
            return this._activeBuffer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BufferSet.prototype, "normal", {
        get: function () {
            return this._normal;
        },
        enumerable: true,
        configurable: true
    });
    BufferSet.prototype.activateNormalBuffer = function () {
        if (this._activeBuffer === this._normal) {
            return;
        }
        this._normal.x = this._alt.x;
        this._normal.y = this._alt.y;
        this._alt.clear();
        this._activeBuffer = this._normal;
        this._onBufferActivate.fire({
            activeBuffer: this._normal,
            inactiveBuffer: this._alt
        });
    };
    BufferSet.prototype.activateAltBuffer = function (fillAttr) {
        if (this._activeBuffer === this._alt) {
            return;
        }
        this._alt.fillViewportRows(fillAttr);
        this._alt.x = this._normal.x;
        this._alt.y = this._normal.y;
        this._activeBuffer = this._alt;
        this._onBufferActivate.fire({
            activeBuffer: this._alt,
            inactiveBuffer: this._normal
        });
    };
    BufferSet.prototype.resize = function (newCols, newRows) {
        this._normal.resize(newCols, newRows);
        this._alt.resize(newCols, newRows);
    };
    BufferSet.prototype.setupTabStops = function (i) {
        this._normal.setupTabStops(i);
        this._alt.setupTabStops(i);
    };
    return BufferSet;
}());
exports.BufferSet = BufferSet;


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CircularList_1 = __webpack_require__(65);
var BufferLine_1 = __webpack_require__(15);
var CellData_1 = __webpack_require__(4);
var Constants_1 = __webpack_require__(3);
var BufferReflow_1 = __webpack_require__(66);
var Marker_1 = __webpack_require__(67);
var Charsets_1 = __webpack_require__(17);
exports.MAX_BUFFER_SIZE = 4294967295;
var Buffer = (function () {
    function Buffer(_hasScrollback, _optionsService, _bufferService) {
        this._hasScrollback = _hasScrollback;
        this._optionsService = _optionsService;
        this._bufferService = _bufferService;
        this.ydisp = 0;
        this.ybase = 0;
        this.y = 0;
        this.x = 0;
        this.savedY = 0;
        this.savedX = 0;
        this.savedCurAttrData = BufferLine_1.DEFAULT_ATTR_DATA.clone();
        this.savedCharset = Charsets_1.DEFAULT_CHARSET;
        this.markers = [];
        this._nullCell = CellData_1.CellData.fromCharData([0, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]);
        this._whitespaceCell = CellData_1.CellData.fromCharData([0, Constants_1.WHITESPACE_CELL_CHAR, Constants_1.WHITESPACE_CELL_WIDTH, Constants_1.WHITESPACE_CELL_CODE]);
        this._cols = this._bufferService.cols;
        this._rows = this._bufferService.rows;
        this.lines = new CircularList_1.CircularList(this._getCorrectBufferLength(this._rows));
        this.scrollTop = 0;
        this.scrollBottom = this._rows - 1;
        this.setupTabStops();
    }
    Buffer.prototype.getNullCell = function (attr) {
        if (attr) {
            this._nullCell.fg = attr.fg;
            this._nullCell.bg = attr.bg;
        }
        else {
            this._nullCell.fg = 0;
            this._nullCell.bg = 0;
        }
        return this._nullCell;
    };
    Buffer.prototype.getWhitespaceCell = function (attr) {
        if (attr) {
            this._whitespaceCell.fg = attr.fg;
            this._whitespaceCell.bg = attr.bg;
        }
        else {
            this._whitespaceCell.fg = 0;
            this._whitespaceCell.bg = 0;
        }
        return this._whitespaceCell;
    };
    Buffer.prototype.getBlankLine = function (attr, isWrapped) {
        return new BufferLine_1.BufferLine(this._bufferService.cols, this.getNullCell(attr), isWrapped);
    };
    Object.defineProperty(Buffer.prototype, "hasScrollback", {
        get: function () {
            return this._hasScrollback && this.lines.maxLength > this._rows;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Buffer.prototype, "isCursorInViewport", {
        get: function () {
            var absoluteY = this.ybase + this.y;
            var relativeY = absoluteY - this.ydisp;
            return (relativeY >= 0 && relativeY < this._rows);
        },
        enumerable: true,
        configurable: true
    });
    Buffer.prototype._getCorrectBufferLength = function (rows) {
        if (!this._hasScrollback) {
            return rows;
        }
        var correctBufferLength = rows + this._optionsService.options.scrollback;
        return correctBufferLength > exports.MAX_BUFFER_SIZE ? exports.MAX_BUFFER_SIZE : correctBufferLength;
    };
    Buffer.prototype.fillViewportRows = function (fillAttr) {
        if (this.lines.length === 0) {
            if (fillAttr === undefined) {
                fillAttr = BufferLine_1.DEFAULT_ATTR_DATA;
            }
            var i = this._rows;
            while (i--) {
                this.lines.push(this.getBlankLine(fillAttr));
            }
        }
    };
    Buffer.prototype.clear = function () {
        this.ydisp = 0;
        this.ybase = 0;
        this.y = 0;
        this.x = 0;
        this.lines = new CircularList_1.CircularList(this._getCorrectBufferLength(this._rows));
        this.scrollTop = 0;
        this.scrollBottom = this._rows - 1;
        this.setupTabStops();
    };
    Buffer.prototype.resize = function (newCols, newRows) {
        var nullCell = this.getNullCell(BufferLine_1.DEFAULT_ATTR_DATA);
        var newMaxLength = this._getCorrectBufferLength(newRows);
        if (newMaxLength > this.lines.maxLength) {
            this.lines.maxLength = newMaxLength;
        }
        if (this.lines.length > 0) {
            if (this._cols < newCols) {
                for (var i = 0; i < this.lines.length; i++) {
                    this.lines.get(i).resize(newCols, nullCell);
                }
            }
            var addToY = 0;
            if (this._rows < newRows) {
                for (var y = this._rows; y < newRows; y++) {
                    if (this.lines.length < newRows + this.ybase) {
                        if (this._optionsService.options.windowsMode) {
                            this.lines.push(new BufferLine_1.BufferLine(newCols, nullCell));
                        }
                        else {
                            if (this.ybase > 0 && this.lines.length <= this.ybase + this.y + addToY + 1) {
                                this.ybase--;
                                addToY++;
                                if (this.ydisp > 0) {
                                    this.ydisp--;
                                }
                            }
                            else {
                                this.lines.push(new BufferLine_1.BufferLine(newCols, nullCell));
                            }
                        }
                    }
                }
            }
            else {
                for (var y = this._rows; y > newRows; y--) {
                    if (this.lines.length > newRows + this.ybase) {
                        if (this.lines.length > this.ybase + this.y + 1) {
                            this.lines.pop();
                        }
                        else {
                            this.ybase++;
                            this.ydisp++;
                        }
                    }
                }
            }
            if (newMaxLength < this.lines.maxLength) {
                var amountToTrim = this.lines.length - newMaxLength;
                if (amountToTrim > 0) {
                    this.lines.trimStart(amountToTrim);
                    this.ybase = Math.max(this.ybase - amountToTrim, 0);
                    this.ydisp = Math.max(this.ydisp - amountToTrim, 0);
                    this.savedY = Math.max(this.savedY - amountToTrim, 0);
                }
                this.lines.maxLength = newMaxLength;
            }
            this.x = Math.min(this.x, newCols - 1);
            this.y = Math.min(this.y, newRows - 1);
            if (addToY) {
                this.y += addToY;
            }
            this.savedX = Math.min(this.savedX, newCols - 1);
            this.scrollTop = 0;
        }
        this.scrollBottom = newRows - 1;
        if (this._isReflowEnabled) {
            this._reflow(newCols, newRows);
            if (this._cols > newCols) {
                for (var i = 0; i < this.lines.length; i++) {
                    this.lines.get(i).resize(newCols, nullCell);
                }
            }
        }
        this._cols = newCols;
        this._rows = newRows;
    };
    Object.defineProperty(Buffer.prototype, "_isReflowEnabled", {
        get: function () {
            return this._hasScrollback && !this._optionsService.options.windowsMode;
        },
        enumerable: true,
        configurable: true
    });
    Buffer.prototype._reflow = function (newCols, newRows) {
        if (this._cols === newCols) {
            return;
        }
        if (newCols > this._cols) {
            this._reflowLarger(newCols, newRows);
        }
        else {
            this._reflowSmaller(newCols, newRows);
        }
    };
    Buffer.prototype._reflowLarger = function (newCols, newRows) {
        var toRemove = BufferReflow_1.reflowLargerGetLinesToRemove(this.lines, this._cols, newCols, this.ybase + this.y, this.getNullCell(BufferLine_1.DEFAULT_ATTR_DATA));
        if (toRemove.length > 0) {
            var newLayoutResult = BufferReflow_1.reflowLargerCreateNewLayout(this.lines, toRemove);
            BufferReflow_1.reflowLargerApplyNewLayout(this.lines, newLayoutResult.layout);
            this._reflowLargerAdjustViewport(newCols, newRows, newLayoutResult.countRemoved);
        }
    };
    Buffer.prototype._reflowLargerAdjustViewport = function (newCols, newRows, countRemoved) {
        var nullCell = this.getNullCell(BufferLine_1.DEFAULT_ATTR_DATA);
        var viewportAdjustments = countRemoved;
        while (viewportAdjustments-- > 0) {
            if (this.ybase === 0) {
                if (this.y > 0) {
                    this.y--;
                }
                if (this.lines.length < newRows) {
                    this.lines.push(new BufferLine_1.BufferLine(newCols, nullCell));
                }
            }
            else {
                if (this.ydisp === this.ybase) {
                    this.ydisp--;
                }
                this.ybase--;
            }
        }
        this.savedY = Math.max(this.savedY - countRemoved, 0);
    };
    Buffer.prototype._reflowSmaller = function (newCols, newRows) {
        var nullCell = this.getNullCell(BufferLine_1.DEFAULT_ATTR_DATA);
        var toInsert = [];
        var countToInsert = 0;
        for (var y = this.lines.length - 1; y >= 0; y--) {
            var nextLine = this.lines.get(y);
            if (!nextLine || !nextLine.isWrapped && nextLine.getTrimmedLength() <= newCols) {
                continue;
            }
            var wrappedLines = [nextLine];
            while (nextLine.isWrapped && y > 0) {
                nextLine = this.lines.get(--y);
                wrappedLines.unshift(nextLine);
            }
            var absoluteY = this.ybase + this.y;
            if (absoluteY >= y && absoluteY < y + wrappedLines.length) {
                continue;
            }
            var lastLineLength = wrappedLines[wrappedLines.length - 1].getTrimmedLength();
            var destLineLengths = BufferReflow_1.reflowSmallerGetNewLineLengths(wrappedLines, this._cols, newCols);
            var linesToAdd = destLineLengths.length - wrappedLines.length;
            var trimmedLines = void 0;
            if (this.ybase === 0 && this.y !== this.lines.length - 1) {
                trimmedLines = Math.max(0, this.y - this.lines.maxLength + linesToAdd);
            }
            else {
                trimmedLines = Math.max(0, this.lines.length - this.lines.maxLength + linesToAdd);
            }
            var newLines = [];
            for (var i = 0; i < linesToAdd; i++) {
                var newLine = this.getBlankLine(BufferLine_1.DEFAULT_ATTR_DATA, true);
                newLines.push(newLine);
            }
            if (newLines.length > 0) {
                toInsert.push({
                    start: y + wrappedLines.length + countToInsert,
                    newLines: newLines
                });
                countToInsert += newLines.length;
            }
            wrappedLines.push.apply(wrappedLines, newLines);
            var destLineIndex = destLineLengths.length - 1;
            var destCol = destLineLengths[destLineIndex];
            if (destCol === 0) {
                destLineIndex--;
                destCol = destLineLengths[destLineIndex];
            }
            var srcLineIndex = wrappedLines.length - linesToAdd - 1;
            var srcCol = lastLineLength;
            while (srcLineIndex >= 0) {
                var cellsToCopy = Math.min(srcCol, destCol);
                wrappedLines[destLineIndex].copyCellsFrom(wrappedLines[srcLineIndex], srcCol - cellsToCopy, destCol - cellsToCopy, cellsToCopy, true);
                destCol -= cellsToCopy;
                if (destCol === 0) {
                    destLineIndex--;
                    destCol = destLineLengths[destLineIndex];
                }
                srcCol -= cellsToCopy;
                if (srcCol === 0) {
                    srcLineIndex--;
                    var wrappedLinesIndex = Math.max(srcLineIndex, 0);
                    srcCol = BufferReflow_1.getWrappedLineTrimmedLength(wrappedLines, wrappedLinesIndex, this._cols);
                }
            }
            for (var i = 0; i < wrappedLines.length; i++) {
                if (destLineLengths[i] < newCols) {
                    wrappedLines[i].setCell(destLineLengths[i], nullCell);
                }
            }
            var viewportAdjustments = linesToAdd - trimmedLines;
            while (viewportAdjustments-- > 0) {
                if (this.ybase === 0) {
                    if (this.y < newRows - 1) {
                        this.y++;
                        this.lines.pop();
                    }
                    else {
                        this.ybase++;
                        this.ydisp++;
                    }
                }
                else {
                    if (this.ybase < Math.min(this.lines.maxLength, this.lines.length + countToInsert) - newRows) {
                        if (this.ybase === this.ydisp) {
                            this.ydisp++;
                        }
                        this.ybase++;
                    }
                }
            }
            this.savedY = Math.min(this.savedY + linesToAdd, this.ybase + newRows - 1);
        }
        if (toInsert.length > 0) {
            var insertEvents = [];
            var originalLines = [];
            for (var i = 0; i < this.lines.length; i++) {
                originalLines.push(this.lines.get(i));
            }
            var originalLinesLength = this.lines.length;
            var originalLineIndex = originalLinesLength - 1;
            var nextToInsertIndex = 0;
            var nextToInsert = toInsert[nextToInsertIndex];
            this.lines.length = Math.min(this.lines.maxLength, this.lines.length + countToInsert);
            var countInsertedSoFar = 0;
            for (var i = Math.min(this.lines.maxLength - 1, originalLinesLength + countToInsert - 1); i >= 0; i--) {
                if (nextToInsert && nextToInsert.start > originalLineIndex + countInsertedSoFar) {
                    for (var nextI = nextToInsert.newLines.length - 1; nextI >= 0; nextI--) {
                        this.lines.set(i--, nextToInsert.newLines[nextI]);
                    }
                    i++;
                    insertEvents.push({
                        index: originalLineIndex + 1,
                        amount: nextToInsert.newLines.length
                    });
                    countInsertedSoFar += nextToInsert.newLines.length;
                    nextToInsert = toInsert[++nextToInsertIndex];
                }
                else {
                    this.lines.set(i, originalLines[originalLineIndex--]);
                }
            }
            var insertCountEmitted = 0;
            for (var i = insertEvents.length - 1; i >= 0; i--) {
                insertEvents[i].index += insertCountEmitted;
                this.lines.onInsertEmitter.fire(insertEvents[i]);
                insertCountEmitted += insertEvents[i].amount;
            }
            var amountToTrim = Math.max(0, originalLinesLength + countToInsert - this.lines.maxLength);
            if (amountToTrim > 0) {
                this.lines.onTrimEmitter.fire(amountToTrim);
            }
        }
    };
    Buffer.prototype.stringIndexToBufferIndex = function (lineIndex, stringIndex, trimRight) {
        if (trimRight === void 0) { trimRight = false; }
        while (stringIndex) {
            var line = this.lines.get(lineIndex);
            if (!line) {
                return [-1, -1];
            }
            var length = (trimRight) ? line.getTrimmedLength() : line.length;
            for (var i = 0; i < length; ++i) {
                if (line.get(i)[Constants_1.CHAR_DATA_WIDTH_INDEX]) {
                    stringIndex -= line.get(i)[Constants_1.CHAR_DATA_CHAR_INDEX].length || 1;
                }
                if (stringIndex < 0) {
                    return [lineIndex, i];
                }
            }
            lineIndex++;
        }
        return [lineIndex, 0];
    };
    Buffer.prototype.translateBufferLineToString = function (lineIndex, trimRight, startCol, endCol) {
        if (startCol === void 0) { startCol = 0; }
        var line = this.lines.get(lineIndex);
        if (!line) {
            return '';
        }
        return line.translateToString(trimRight, startCol, endCol);
    };
    Buffer.prototype.getWrappedRangeForLine = function (y) {
        var first = y;
        var last = y;
        while (first > 0 && this.lines.get(first).isWrapped) {
            first--;
        }
        while (last + 1 < this.lines.length && this.lines.get(last + 1).isWrapped) {
            last++;
        }
        return { first: first, last: last };
    };
    Buffer.prototype.setupTabStops = function (i) {
        if (i !== null && i !== undefined) {
            if (!this.tabs[i]) {
                i = this.prevStop(i);
            }
        }
        else {
            this.tabs = {};
            i = 0;
        }
        for (; i < this._cols; i += this._optionsService.options.tabStopWidth) {
            this.tabs[i] = true;
        }
    };
    Buffer.prototype.prevStop = function (x) {
        if (x === null || x === undefined) {
            x = this.x;
        }
        while (!this.tabs[--x] && x > 0)
            ;
        return x >= this._cols ? this._cols - 1 : x < 0 ? 0 : x;
    };
    Buffer.prototype.nextStop = function (x) {
        if (x === null || x === undefined) {
            x = this.x;
        }
        while (!this.tabs[++x] && x < this._cols)
            ;
        return x >= this._cols ? this._cols - 1 : x < 0 ? 0 : x;
    };
    Buffer.prototype.addMarker = function (y) {
        var _this = this;
        var marker = new Marker_1.Marker(y);
        this.markers.push(marker);
        marker.register(this.lines.onTrim(function (amount) {
            marker.line -= amount;
            if (marker.line < 0) {
                marker.dispose();
            }
        }));
        marker.register(this.lines.onInsert(function (event) {
            if (marker.line >= event.index) {
                marker.line += event.amount;
            }
        }));
        marker.register(this.lines.onDelete(function (event) {
            if (marker.line >= event.index && marker.line < event.index + event.amount) {
                marker.dispose();
            }
            if (marker.line > event.index) {
                marker.line -= event.amount;
            }
        }));
        marker.register(marker.onDispose(function () { return _this._removeMarker(marker); }));
        return marker;
    };
    Buffer.prototype._removeMarker = function (marker) {
        this.markers.splice(this.markers.indexOf(marker), 1);
    };
    Buffer.prototype.iterator = function (trimRight, startIndex, endIndex, startOverscan, endOverscan) {
        return new BufferStringIterator(this, trimRight, startIndex, endIndex, startOverscan, endOverscan);
    };
    return Buffer;
}());
exports.Buffer = Buffer;
var BufferStringIterator = (function () {
    function BufferStringIterator(_buffer, _trimRight, _startIndex, _endIndex, _startOverscan, _endOverscan) {
        if (_startIndex === void 0) { _startIndex = 0; }
        if (_endIndex === void 0) { _endIndex = _buffer.lines.length; }
        if (_startOverscan === void 0) { _startOverscan = 0; }
        if (_endOverscan === void 0) { _endOverscan = 0; }
        this._buffer = _buffer;
        this._trimRight = _trimRight;
        this._startIndex = _startIndex;
        this._endIndex = _endIndex;
        this._startOverscan = _startOverscan;
        this._endOverscan = _endOverscan;
        if (this._startIndex < 0) {
            this._startIndex = 0;
        }
        if (this._endIndex > this._buffer.lines.length) {
            this._endIndex = this._buffer.lines.length;
        }
        this._current = this._startIndex;
    }
    BufferStringIterator.prototype.hasNext = function () {
        return this._current < this._endIndex;
    };
    BufferStringIterator.prototype.next = function () {
        var range = this._buffer.getWrappedRangeForLine(this._current);
        if (range.first < this._startIndex - this._startOverscan) {
            range.first = this._startIndex - this._startOverscan;
        }
        if (range.last > this._endIndex + this._endOverscan) {
            range.last = this._endIndex + this._endOverscan;
        }
        range.first = Math.max(range.first, 0);
        range.last = Math.min(range.last, this._buffer.lines.length);
        var result = '';
        for (var i = range.first; i <= range.last; ++i) {
            result += this._buffer.translateBufferLineToString(i, this._trimRight);
        }
        this._current = range.last + 1;
        return { range: range, content: result };
    };
    return BufferStringIterator;
}());
exports.BufferStringIterator = BufferStringIterator;


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter_1 = __webpack_require__(1);
var CircularList = (function () {
    function CircularList(_maxLength) {
        this._maxLength = _maxLength;
        this.onDeleteEmitter = new EventEmitter_1.EventEmitter();
        this.onInsertEmitter = new EventEmitter_1.EventEmitter();
        this.onTrimEmitter = new EventEmitter_1.EventEmitter();
        this._array = new Array(this._maxLength);
        this._startIndex = 0;
        this._length = 0;
    }
    Object.defineProperty(CircularList.prototype, "onDelete", {
        get: function () { return this.onDeleteEmitter.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CircularList.prototype, "onInsert", {
        get: function () { return this.onInsertEmitter.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CircularList.prototype, "onTrim", {
        get: function () { return this.onTrimEmitter.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CircularList.prototype, "maxLength", {
        get: function () {
            return this._maxLength;
        },
        set: function (newMaxLength) {
            if (this._maxLength === newMaxLength) {
                return;
            }
            var newArray = new Array(newMaxLength);
            for (var i = 0; i < Math.min(newMaxLength, this.length); i++) {
                newArray[i] = this._array[this._getCyclicIndex(i)];
            }
            this._array = newArray;
            this._maxLength = newMaxLength;
            this._startIndex = 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CircularList.prototype, "length", {
        get: function () {
            return this._length;
        },
        set: function (newLength) {
            if (newLength > this._length) {
                for (var i = this._length; i < newLength; i++) {
                    this._array[i] = undefined;
                }
            }
            this._length = newLength;
        },
        enumerable: true,
        configurable: true
    });
    CircularList.prototype.get = function (index) {
        return this._array[this._getCyclicIndex(index)];
    };
    CircularList.prototype.set = function (index, value) {
        this._array[this._getCyclicIndex(index)] = value;
    };
    CircularList.prototype.push = function (value) {
        this._array[this._getCyclicIndex(this._length)] = value;
        if (this._length === this._maxLength) {
            this._startIndex = ++this._startIndex % this._maxLength;
            this.onTrimEmitter.fire(1);
        }
        else {
            this._length++;
        }
    };
    CircularList.prototype.recycle = function () {
        if (this._length !== this._maxLength) {
            throw new Error('Can only recycle when the buffer is full');
        }
        this._startIndex = ++this._startIndex % this._maxLength;
        this.onTrimEmitter.fire(1);
        return this._array[this._getCyclicIndex(this._length - 1)];
    };
    Object.defineProperty(CircularList.prototype, "isFull", {
        get: function () {
            return this._length === this._maxLength;
        },
        enumerable: true,
        configurable: true
    });
    CircularList.prototype.pop = function () {
        return this._array[this._getCyclicIndex(this._length-- - 1)];
    };
    CircularList.prototype.splice = function (start, deleteCount) {
        var items = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            items[_i - 2] = arguments[_i];
        }
        if (deleteCount) {
            for (var i = start; i < this._length - deleteCount; i++) {
                this._array[this._getCyclicIndex(i)] = this._array[this._getCyclicIndex(i + deleteCount)];
            }
            this._length -= deleteCount;
        }
        for (var i = this._length - 1; i >= start; i--) {
            this._array[this._getCyclicIndex(i + items.length)] = this._array[this._getCyclicIndex(i)];
        }
        for (var i = 0; i < items.length; i++) {
            this._array[this._getCyclicIndex(start + i)] = items[i];
        }
        if (this._length + items.length > this._maxLength) {
            var countToTrim = (this._length + items.length) - this._maxLength;
            this._startIndex += countToTrim;
            this._length = this._maxLength;
            this.onTrimEmitter.fire(countToTrim);
        }
        else {
            this._length += items.length;
        }
    };
    CircularList.prototype.trimStart = function (count) {
        if (count > this._length) {
            count = this._length;
        }
        this._startIndex += count;
        this._length -= count;
        this.onTrimEmitter.fire(count);
    };
    CircularList.prototype.shiftElements = function (start, count, offset) {
        if (count <= 0) {
            return;
        }
        if (start < 0 || start >= this._length) {
            throw new Error('start argument out of range');
        }
        if (start + offset < 0) {
            throw new Error('Cannot shift elements in list beyond index 0');
        }
        if (offset > 0) {
            for (var i = count - 1; i >= 0; i--) {
                this.set(start + i + offset, this.get(start + i));
            }
            var expandListBy = (start + count + offset) - this._length;
            if (expandListBy > 0) {
                this._length += expandListBy;
                while (this._length > this._maxLength) {
                    this._length--;
                    this._startIndex++;
                    this.onTrimEmitter.fire(1);
                }
            }
        }
        else {
            for (var i = 0; i < count; i++) {
                this.set(start + i + offset, this.get(start + i));
            }
        }
    };
    CircularList.prototype._getCyclicIndex = function (index) {
        return (this._startIndex + index) % this._maxLength;
    };
    return CircularList;
}());
exports.CircularList = CircularList;


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function reflowLargerGetLinesToRemove(lines, oldCols, newCols, bufferAbsoluteY, nullCell) {
    var toRemove = [];
    for (var y = 0; y < lines.length - 1; y++) {
        var i = y;
        var nextLine = lines.get(++i);
        if (!nextLine.isWrapped) {
            continue;
        }
        var wrappedLines = [lines.get(y)];
        while (i < lines.length && nextLine.isWrapped) {
            wrappedLines.push(nextLine);
            nextLine = lines.get(++i);
        }
        if (bufferAbsoluteY >= y && bufferAbsoluteY < i) {
            y += wrappedLines.length - 1;
            continue;
        }
        var destLineIndex = 0;
        var destCol = getWrappedLineTrimmedLength(wrappedLines, destLineIndex, oldCols);
        var srcLineIndex = 1;
        var srcCol = 0;
        while (srcLineIndex < wrappedLines.length) {
            var srcTrimmedTineLength = getWrappedLineTrimmedLength(wrappedLines, srcLineIndex, oldCols);
            var srcRemainingCells = srcTrimmedTineLength - srcCol;
            var destRemainingCells = newCols - destCol;
            var cellsToCopy = Math.min(srcRemainingCells, destRemainingCells);
            wrappedLines[destLineIndex].copyCellsFrom(wrappedLines[srcLineIndex], srcCol, destCol, cellsToCopy, false);
            destCol += cellsToCopy;
            if (destCol === newCols) {
                destLineIndex++;
                destCol = 0;
            }
            srcCol += cellsToCopy;
            if (srcCol === srcTrimmedTineLength) {
                srcLineIndex++;
                srcCol = 0;
            }
            if (destCol === 0 && destLineIndex !== 0) {
                if (wrappedLines[destLineIndex - 1].getWidth(newCols - 1) === 2) {
                    wrappedLines[destLineIndex].copyCellsFrom(wrappedLines[destLineIndex - 1], newCols - 1, destCol++, 1, false);
                    wrappedLines[destLineIndex - 1].setCell(newCols - 1, nullCell);
                }
            }
        }
        wrappedLines[destLineIndex].replaceCells(destCol, newCols, nullCell);
        var countToRemove = 0;
        for (var i_1 = wrappedLines.length - 1; i_1 > 0; i_1--) {
            if (i_1 > destLineIndex || wrappedLines[i_1].getTrimmedLength() === 0) {
                countToRemove++;
            }
            else {
                break;
            }
        }
        if (countToRemove > 0) {
            toRemove.push(y + wrappedLines.length - countToRemove);
            toRemove.push(countToRemove);
        }
        y += wrappedLines.length - 1;
    }
    return toRemove;
}
exports.reflowLargerGetLinesToRemove = reflowLargerGetLinesToRemove;
function reflowLargerCreateNewLayout(lines, toRemove) {
    var layout = [];
    var nextToRemoveIndex = 0;
    var nextToRemoveStart = toRemove[nextToRemoveIndex];
    var countRemovedSoFar = 0;
    for (var i = 0; i < lines.length; i++) {
        if (nextToRemoveStart === i) {
            var countToRemove = toRemove[++nextToRemoveIndex];
            lines.onDeleteEmitter.fire({
                index: i - countRemovedSoFar,
                amount: countToRemove
            });
            i += countToRemove - 1;
            countRemovedSoFar += countToRemove;
            nextToRemoveStart = toRemove[++nextToRemoveIndex];
        }
        else {
            layout.push(i);
        }
    }
    return {
        layout: layout,
        countRemoved: countRemovedSoFar
    };
}
exports.reflowLargerCreateNewLayout = reflowLargerCreateNewLayout;
function reflowLargerApplyNewLayout(lines, newLayout) {
    var newLayoutLines = [];
    for (var i = 0; i < newLayout.length; i++) {
        newLayoutLines.push(lines.get(newLayout[i]));
    }
    for (var i = 0; i < newLayoutLines.length; i++) {
        lines.set(i, newLayoutLines[i]);
    }
    lines.length = newLayout.length;
}
exports.reflowLargerApplyNewLayout = reflowLargerApplyNewLayout;
function reflowSmallerGetNewLineLengths(wrappedLines, oldCols, newCols) {
    var newLineLengths = [];
    var cellsNeeded = wrappedLines.map(function (l, i) { return getWrappedLineTrimmedLength(wrappedLines, i, oldCols); }).reduce(function (p, c) { return p + c; });
    var srcCol = 0;
    var srcLine = 0;
    var cellsAvailable = 0;
    while (cellsAvailable < cellsNeeded) {
        if (cellsNeeded - cellsAvailable < newCols) {
            newLineLengths.push(cellsNeeded - cellsAvailable);
            break;
        }
        srcCol += newCols;
        var oldTrimmedLength = getWrappedLineTrimmedLength(wrappedLines, srcLine, oldCols);
        if (srcCol > oldTrimmedLength) {
            srcCol -= oldTrimmedLength;
            srcLine++;
        }
        var endsWithWide = wrappedLines[srcLine].getWidth(srcCol - 1) === 2;
        if (endsWithWide) {
            srcCol--;
        }
        var lineLength = endsWithWide ? newCols - 1 : newCols;
        newLineLengths.push(lineLength);
        cellsAvailable += lineLength;
    }
    return newLineLengths;
}
exports.reflowSmallerGetNewLineLengths = reflowSmallerGetNewLineLengths;
function getWrappedLineTrimmedLength(lines, i, cols) {
    if (i === lines.length - 1) {
        return lines[i].getTrimmedLength();
    }
    var endsInNull = !(lines[i].hasContent(cols - 1)) && lines[i].getWidth(cols - 1) === 1;
    var followingLineStartsWithWide = lines[i + 1].getWidth(0) === 2;
    if (endsInNull && followingLineStartsWithWide) {
        return cols - 1;
    }
    return cols;
}
exports.getWrappedLineTrimmedLength = getWrappedLineTrimmedLength;


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter_1 = __webpack_require__(1);
var Lifecycle_1 = __webpack_require__(2);
var Marker = (function (_super) {
    __extends(Marker, _super);
    function Marker(line) {
        var _this = _super.call(this) || this;
        _this.line = line;
        _this._id = Marker._nextId++;
        _this.isDisposed = false;
        _this._onDispose = new EventEmitter_1.EventEmitter();
        return _this;
    }
    Object.defineProperty(Marker.prototype, "id", {
        get: function () { return this._id; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "onDispose", {
        get: function () { return this._onDispose.event; },
        enumerable: true,
        configurable: true
    });
    Marker.prototype.dispose = function () {
        if (this.isDisposed) {
            return;
        }
        this.isDisposed = true;
        this.line = -1;
        this._onDispose.fire();
    };
    Marker._nextId = 1;
    return Marker;
}(Lifecycle_1.Disposable));
exports.Marker = Marker;


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Services_1 = __webpack_require__(5);
var Mouse_1 = __webpack_require__(28);
var MouseService = (function () {
    function MouseService(_renderService, _charSizeService) {
        this._renderService = _renderService;
        this._charSizeService = _charSizeService;
    }
    MouseService.prototype.getCoords = function (event, element, colCount, rowCount, isSelection) {
        return Mouse_1.getCoords(event, element, colCount, rowCount, this._charSizeService.hasValidSize, this._renderService.dimensions.actualCellWidth, this._renderService.dimensions.actualCellHeight, isSelection);
    };
    MouseService.prototype.getRawByteCoords = function (event, element, colCount, rowCount) {
        var coords = this.getCoords(event, element, colCount, rowCount);
        return Mouse_1.getRawByteCoords(coords);
    };
    MouseService = __decorate([
        __param(0, Services_1.IRenderService),
        __param(1, Services_1.ICharSizeService)
    ], MouseService);
    return MouseService;
}());
exports.MouseService = MouseService;


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Services_1 = __webpack_require__(0);
var EventEmitter_1 = __webpack_require__(1);
var Clone_1 = __webpack_require__(31);
var DEFAULT_DEC_PRIVATE_MODES = Object.freeze({
    applicationCursorKeys: false
});
var CoreService = (function () {
    function CoreService(_scrollToBottom, _bufferService, _logService, _optionsService) {
        this._scrollToBottom = _scrollToBottom;
        this._bufferService = _bufferService;
        this._logService = _logService;
        this._optionsService = _optionsService;
        this._onData = new EventEmitter_1.EventEmitter();
        this._onUserInput = new EventEmitter_1.EventEmitter();
        this.decPrivateModes = Clone_1.clone(DEFAULT_DEC_PRIVATE_MODES);
    }
    Object.defineProperty(CoreService.prototype, "onData", {
        get: function () { return this._onData.event; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreService.prototype, "onUserInput", {
        get: function () { return this._onUserInput.event; },
        enumerable: true,
        configurable: true
    });
    CoreService.prototype.reset = function () {
        this.decPrivateModes = Clone_1.clone(DEFAULT_DEC_PRIVATE_MODES);
    };
    CoreService.prototype.triggerDataEvent = function (data, wasUserInput) {
        if (wasUserInput === void 0) { wasUserInput = false; }
        if (this._optionsService.options.disableStdin) {
            return;
        }
        var buffer = this._bufferService.buffer;
        if (buffer.ybase !== buffer.ydisp) {
            this._scrollToBottom();
        }
        if (wasUserInput) {
            this._onUserInput.fire();
        }
        this._logService.debug("sending data \"" + data + "\"", function () { return data.split('').map(function (e) { return e.charCodeAt(0); }); });
        this._onData.fire(data);
    };
    CoreService = __decorate([
        __param(1, Services_1.IBufferService),
        __param(2, Services_1.ILogService),
        __param(3, Services_1.IOptionsService)
    ], CoreService);
    return CoreService;
}());
exports.CoreService = CoreService;


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Services_1 = __webpack_require__(0);
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["OFF"] = 4] = "OFF";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var optionsKeyToLogLevel = {
    debug: LogLevel.DEBUG,
    info: LogLevel.INFO,
    warn: LogLevel.WARN,
    error: LogLevel.ERROR,
    off: LogLevel.OFF
};
var LOG_PREFIX = 'xterm.js: ';
var LogService = (function () {
    function LogService(_optionsService) {
        var _this = this;
        this._optionsService = _optionsService;
        this._updateLogLevel();
        this._optionsService.onOptionChange(function (key) {
            if (key === 'logLevel') {
                _this._updateLogLevel();
            }
        });
    }
    LogService.prototype._updateLogLevel = function () {
        this._logLevel = optionsKeyToLogLevel[this._optionsService.options.logLevel];
    };
    LogService.prototype._evalLazyOptionalParams = function (optionalParams) {
        for (var i = 0; i < optionalParams.length; i++) {
            if (typeof optionalParams[i] === 'function') {
                optionalParams[i] = optionalParams[i]();
            }
        }
    };
    LogService.prototype._log = function (type, message, optionalParams) {
        this._evalLazyOptionalParams(optionalParams);
        type.call.apply(type, __spreadArrays([console, LOG_PREFIX + message], optionalParams));
    };
    LogService.prototype.debug = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (this._logLevel <= LogLevel.DEBUG) {
            this._log(console.log, message, optionalParams);
        }
    };
    LogService.prototype.info = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (this._logLevel <= LogLevel.INFO) {
            this._log(console.info, message, optionalParams);
        }
    };
    LogService.prototype.warn = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (this._logLevel <= LogLevel.WARN) {
            this._log(console.warn, message, optionalParams);
        }
    };
    LogService.prototype.error = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (this._logLevel <= LogLevel.ERROR) {
            this._log(console.error, message, optionalParams);
        }
    };
    LogService = __decorate([
        __param(0, Services_1.IOptionsService)
    ], LogService);
    return LogService;
}());
exports.LogService = LogService;


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Services_1 = __webpack_require__(0);
var DirtyRowService = (function () {
    function DirtyRowService(_bufferService) {
        this._bufferService = _bufferService;
        this.clearRange();
    }
    Object.defineProperty(DirtyRowService.prototype, "start", {
        get: function () { return this._start; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirtyRowService.prototype, "end", {
        get: function () { return this._end; },
        enumerable: true,
        configurable: true
    });
    DirtyRowService.prototype.clearRange = function () {
        this._start = this._bufferService.buffer.y;
        this._end = this._bufferService.buffer.y;
    };
    DirtyRowService.prototype.markDirty = function (y) {
        if (y < this._start) {
            this._start = y;
        }
        else if (y > this._end) {
            this._end = y;
        }
    };
    DirtyRowService.prototype.markRangeDirty = function (y1, y2) {
        if (y1 > y2) {
            var temp = y1;
            y1 = y2;
            y2 = temp;
        }
        if (y1 < this._start) {
            this._start = y1;
        }
        if (y2 > this._end) {
            this._end = y2;
        }
    };
    DirtyRowService.prototype.markAllDirty = function () {
        this.markRangeDirty(0, this._bufferService.rows - 1);
    };
    DirtyRowService = __decorate([
        __param(0, Services_1.IBufferService)
    ], DirtyRowService);
    return DirtyRowService;
}());
exports.DirtyRowService = DirtyRowService;


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Services_1 = __webpack_require__(0);
var ServiceRegistry_1 = __webpack_require__(13);
var ServiceCollection = (function () {
    function ServiceCollection() {
        var entries = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            entries[_i] = arguments[_i];
        }
        this._entries = new Map();
        for (var _a = 0, entries_1 = entries; _a < entries_1.length; _a++) {
            var _b = entries_1[_a], id = _b[0], service = _b[1];
            this.set(id, service);
        }
    }
    ServiceCollection.prototype.set = function (id, instance) {
        var result = this._entries.get(id);
        this._entries.set(id, instance);
        return result;
    };
    ServiceCollection.prototype.forEach = function (callback) {
        this._entries.forEach(function (value, key) { return callback(key, value); });
    };
    ServiceCollection.prototype.has = function (id) {
        return this._entries.has(id);
    };
    ServiceCollection.prototype.get = function (id) {
        return this._entries.get(id);
    };
    return ServiceCollection;
}());
exports.ServiceCollection = ServiceCollection;
var InstantiationService = (function () {
    function InstantiationService() {
        this._services = new ServiceCollection();
        this._services.set(Services_1.IInstantiationService, this);
    }
    InstantiationService.prototype.setService = function (id, instance) {
        this._services.set(id, instance);
    };
    InstantiationService.prototype.createInstance = function (ctor) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var serviceDependencies = ServiceRegistry_1.getServiceDependencies(ctor).sort(function (a, b) { return a.index - b.index; });
        var serviceArgs = [];
        for (var _a = 0, serviceDependencies_1 = serviceDependencies; _a < serviceDependencies_1.length; _a++) {
            var dependency = serviceDependencies_1[_a];
            var service = this._services.get(dependency.id);
            if (!service) {
                throw new Error("[createInstance] " + ctor.name + " depends on UNKNOWN service " + dependency.id + ".");
            }
            serviceArgs.push(service);
        }
        var firstServiceArgPos = serviceDependencies.length > 0 ? serviceDependencies[0].index : args.length;
        if (args.length !== firstServiceArgPos) {
            throw new Error("[createInstance] First service dependency of " + ctor.name + " at position " + (firstServiceArgPos + 1) + " conflicts with " + args.length + " static arguments");
        }
        return new (ctor.bind.apply(ctor, __spreadArrays([void 0], __spreadArrays(args, serviceArgs))))();
    };
    return InstantiationService;
}());
exports.InstantiationService = InstantiationService;


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Services_1 = __webpack_require__(0);
var EventEmitter_1 = __webpack_require__(1);
var DEFAULT_PROTOCOLS = {
    NONE: {
        events: 0,
        restrict: function () { return false; }
    },
    X10: {
        events: 1,
        restrict: function (e) {
            if (e.button === 4 || e.action !== 1) {
                return false;
            }
            e.ctrl = false;
            e.alt = false;
            e.shift = false;
            return true;
        }
    },
    VT200: {
        events: 1 | 2 | 16,
        restrict: function (e) {
            if (e.action === 32) {
                return false;
            }
            return true;
        }
    },
    DRAG: {
        events: 1 | 2 | 16 | 4,
        restrict: function (e) {
            if (e.action === 32 && e.button === 3) {
                return false;
            }
            return true;
        }
    },
    ANY: {
        events: 1 | 2 | 16
            | 4 | 8,
        restrict: function (e) { return true; }
    }
};
function eventCode(e, isSGR) {
    var code = (e.ctrl ? 16 : 0) | (e.shift ? 4 : 0) | (e.alt ? 8 : 0);
    if (e.button === 4) {
        code |= 64;
        code |= e.action;
    }
    else {
        code |= e.button & 3;
        if (e.button & 4) {
            code |= 64;
        }
        if (e.button & 8) {
            code |= 128;
        }
        if (e.action === 32) {
            code |= 32;
        }
        else if (e.action === 0 && !isSGR) {
            code |= 3;
        }
    }
    return code;
}
var S = String.fromCharCode;
var DEFAULT_ENCODINGS = {
    DEFAULT: function (e) {
        var params = [eventCode(e, false) + 32, e.col + 32, e.row + 32];
        params = params.map(function (v) { return (v > 127) ? 127 : v; });
        return "\u001B[M" + S(params[0]) + S(params[1]) + S(params[2]);
    },
    SGR: function (e) {
        var final = (e.action === 0 && e.button !== 4) ? 'm' : 'M';
        return "\u001B[<" + eventCode(e, true) + ";" + e.col + ";" + e.row + final;
    }
};
var CoreMouseService = (function () {
    function CoreMouseService(_bufferService, _coreService) {
        var _this = this;
        this._bufferService = _bufferService;
        this._coreService = _coreService;
        this._protocols = {};
        this._encodings = {};
        this._activeProtocol = '';
        this._activeEncoding = '';
        this._onProtocolChange = new EventEmitter_1.EventEmitter();
        this._lastEvent = null;
        Object.keys(DEFAULT_PROTOCOLS).forEach(function (name) { return _this.addProtocol(name, DEFAULT_PROTOCOLS[name]); });
        Object.keys(DEFAULT_ENCODINGS).forEach(function (name) { return _this.addEncoding(name, DEFAULT_ENCODINGS[name]); });
        this.reset();
    }
    CoreMouseService.prototype.addProtocol = function (name, protocol) {
        this._protocols[name] = protocol;
    };
    CoreMouseService.prototype.addEncoding = function (name, encoding) {
        this._encodings[name] = encoding;
    };
    Object.defineProperty(CoreMouseService.prototype, "activeProtocol", {
        get: function () {
            return this._activeProtocol;
        },
        set: function (name) {
            if (!this._protocols[name]) {
                throw new Error("unknown protocol \"" + name + "\"");
            }
            this._activeProtocol = name;
            this._onProtocolChange.fire(this._protocols[name].events);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CoreMouseService.prototype, "activeEncoding", {
        get: function () {
            return this._activeEncoding;
        },
        set: function (name) {
            if (!this._encodings[name]) {
                throw new Error("unknown encoding \"" + name + "\"");
            }
            this._activeEncoding = name;
        },
        enumerable: true,
        configurable: true
    });
    CoreMouseService.prototype.reset = function () {
        this.activeProtocol = 'NONE';
        this.activeEncoding = 'DEFAULT';
        this._lastEvent = null;
    };
    Object.defineProperty(CoreMouseService.prototype, "onProtocolChange", {
        get: function () {
            return this._onProtocolChange.event;
        },
        enumerable: true,
        configurable: true
    });
    CoreMouseService.prototype.triggerMouseEvent = function (e) {
        if (e.col < 0 || e.col >= this._bufferService.cols
            || e.row < 0 || e.row >= this._bufferService.rows) {
            return false;
        }
        if (e.button === 4 && e.action === 32) {
            return false;
        }
        if (e.button === 3 && e.action !== 32) {
            return false;
        }
        if (e.button !== 4 && (e.action === 2 || e.action === 3)) {
            return false;
        }
        e.col++;
        e.row++;
        if (e.action === 32 && this._lastEvent && this._compareEvents(this._lastEvent, e)) {
            return false;
        }
        if (!this._protocols[this._activeProtocol].restrict(e)) {
            return false;
        }
        var report = this._encodings[this._activeEncoding](e);
        this._coreService.triggerDataEvent(report, true);
        this._lastEvent = e;
        return true;
    };
    CoreMouseService.prototype.explainEvents = function (events) {
        return {
            DOWN: !!(events & 1),
            UP: !!(events & 2),
            DRAG: !!(events & 4),
            MOVE: !!(events & 8),
            WHEEL: !!(events & 16)
        };
    };
    CoreMouseService.prototype._compareEvents = function (e1, e2) {
        if (e1.col !== e2.col)
            return false;
        if (e1.row !== e2.row)
            return false;
        if (e1.button !== e2.button)
            return false;
        if (e1.action !== e2.action)
            return false;
        if (e1.ctrl !== e2.ctrl)
            return false;
        if (e1.alt !== e2.alt)
            return false;
        if (e1.shift !== e2.shift)
            return false;
        return true;
    };
    CoreMouseService = __decorate([
        __param(0, Services_1.IBufferService),
        __param(1, Services_1.ICoreService)
    ], CoreMouseService);
    return CoreMouseService;
}());
exports.CoreMouseService = CoreMouseService;


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var DISCARD_WATERMARK = 50000000;
var WRITE_TIMEOUT_MS = 12;
var WRITE_BUFFER_LENGTH_THRESHOLD = 50;
var WriteBuffer = (function () {
    function WriteBuffer(_action) {
        this._action = _action;
        this._writeBuffer = [];
        this._callbacks = [];
        this._pendingData = 0;
        this._bufferOffset = 0;
    }
    WriteBuffer.prototype.writeSync = function (data) {
        if (this._writeBuffer.length) {
            for (var i = this._bufferOffset; i < this._writeBuffer.length; ++i) {
                var data_1 = this._writeBuffer[i];
                var cb = this._callbacks[i];
                this._action(data_1);
                if (cb)
                    cb();
            }
            this._writeBuffer = [];
            this._callbacks = [];
            this._pendingData = 0;
            this._bufferOffset = 0x7FFFFFFF;
        }
        this._action(data);
    };
    WriteBuffer.prototype.write = function (data, callback) {
        var _this = this;
        if (this._pendingData > DISCARD_WATERMARK) {
            throw new Error('write data discarded, use flow control to avoid losing data');
        }
        if (!this._writeBuffer.length) {
            this._bufferOffset = 0;
            setTimeout(function () { return _this._innerWrite(); });
        }
        this._pendingData += data.length;
        this._writeBuffer.push(data);
        this._callbacks.push(callback);
    };
    WriteBuffer.prototype._innerWrite = function () {
        var _this = this;
        var startTime = Date.now();
        while (this._writeBuffer.length > this._bufferOffset) {
            var data = this._writeBuffer[this._bufferOffset];
            var cb = this._callbacks[this._bufferOffset];
            this._bufferOffset++;
            this._action(data);
            this._pendingData -= data.length;
            if (cb)
                cb();
            if (Date.now() - startTime >= WRITE_TIMEOUT_MS) {
                break;
            }
        }
        if (this._writeBuffer.length > this._bufferOffset) {
            if (this._bufferOffset > WRITE_BUFFER_LENGTH_THRESHOLD) {
                this._writeBuffer = this._writeBuffer.slice(this._bufferOffset);
                this._callbacks = this._callbacks.slice(this._bufferOffset);
                this._bufferOffset = 0;
            }
            setTimeout(function () { return _this._innerWrite(); }, 0);
        }
        else {
            this._writeBuffer = [];
            this._callbacks = [];
            this._pendingData = 0;
            this._bufferOffset = 0;
        }
    };
    return WriteBuffer;
}());
exports.WriteBuffer = WriteBuffer;


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var AddonManager = (function () {
    function AddonManager() {
        this._addons = [];
    }
    AddonManager.prototype.dispose = function () {
        for (var i = this._addons.length - 1; i >= 0; i--) {
            this._addons[i].instance.dispose();
        }
    };
    AddonManager.prototype.loadAddon = function (terminal, instance) {
        var _this = this;
        var loadedAddon = {
            instance: instance,
            dispose: instance.dispose,
            isDisposed: false
        };
        this._addons.push(loadedAddon);
        instance.dispose = function () { return _this._wrappedAddonDispose(loadedAddon); };
        instance.activate(terminal);
    };
    AddonManager.prototype._wrappedAddonDispose = function (loadedAddon) {
        if (loadedAddon.isDisposed) {
            return;
        }
        var index = -1;
        for (var i = 0; i < this._addons.length; i++) {
            if (this._addons[i] === loadedAddon) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            throw new Error('Could not dispose an addon that has not been loaded');
        }
        loadedAddon.isDisposed = true;
        loadedAddon.dispose.apply(loadedAddon.instance);
        this._addons.splice(index, 1);
    };
    return AddonManager;
}());
exports.AddonManager = AddonManager;


/***/ })
/******/ ]);
});