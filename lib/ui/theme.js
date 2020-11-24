'use strict';

const { safeGet } = require('../util');

const TERM = process.env.TERM || (process.platform === 'win32' ? 'windows-ansi' : 'xterm');

module.exports = { theme, TERM };

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
