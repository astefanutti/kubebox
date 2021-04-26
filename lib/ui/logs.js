'use strict';

const clipboardy = require('clipboardy'),
      os         = require('os'),
      XTerm      = require('./blessed-xterm/blessed-xterm');

class Logs extends XTerm {

  constructor(options) {
    super(options);

    const browserCopyToClipboard = (event) => {
      if (this.hasSelection()) {
        event.clipboardData.setData('text/plain', this.getSelectedText());
        event.preventDefault();
      }
    };

    this.on('focus', function () {
      if (os.platform() === 'browser') {
        document.addEventListener('copy', browserCopyToClipboard);
      }
    });

    this.on('blur', function () {
      if (os.platform() === 'browser') {
        document.removeEventListener('copy', browserCopyToClipboard);
      }
    });

    this.on('key C-c', function () {
      if (!this.hasSelection()) {
        return;
      }
      // Copy to clipboard
      if (os.platform() === 'browser') {
        // We rely on the clipboard event API in Web browsers
        document.execCommand('copy');
      } else {
        clipboardy.writeSync(this.getSelectedText());
      }
    });
  }

  get type() {
    return 'log';
  }

  reset() {
    this.clear({ firstLine: true });
    this.setScrollPerc(0);
    this._userScrolled = false;
  };
}

module.exports = Logs;
