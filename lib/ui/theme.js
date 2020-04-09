'use strict';

const Module = require('module');
const { safeGet } = require('../util');

const _require = Module.prototype.require;
Module.prototype.require = function (path) {
  const module = _require.apply(this, arguments);
  if (path === './node') {
    const Node = function (options) {
      theme(this, options);
      return module.call(this, options);
    }
    Node.prototype = module.prototype;
    return Node;
  }
  return module;
};

function theme(widget, options) {
  const type = widget.type;
  switch (type) {
    case 'list-table':
      if (safeGet(options, 'style.header.fg') === 'grey') {
        options.style.header.fg = 'white';
      }
    case 'box':
    case 'list':
    case 'log':
    case 'terminal':
      if (safeGet(options, 'scrollbar.track.style.bg') === 'grey') {
        delete options.scrollbar.track.style.bg;
        options.scrollbar.track.style.fg = 'white';
        options.scrollbar.track.ch = '░';
      }
    default:
      if (safeGet(options, 'style.fg') === 'grey') {
        const bg = safeGet(options, 'style.bg') || 'black';
        options.style.fg = bg === 'white' ? 'black' : 'white';
      }
  }
  if (type === 'line') {
    if (typeof safeGet(options, 'style.baseline') === 'object') {
      options.style.baseline = 'white';
    }
  }
}

const blessed = require('blessed');
const _parseTags = blessed.Element.prototype._parseTags;
blessed.Element.prototype._parseTags = function (text) {
  if (!this.parseTags) return text;
  if (!/{\/?[\w\-,;!#]*}/.test(text)) return text;

  return _parseTags.call(this, text.replace(/\{(\/)?grey-fg\}/g, '{$1white-fg}'));
}
