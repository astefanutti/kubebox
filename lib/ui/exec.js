'use strict';

const clipboardy = require('clipboardy'),
      { Duplex } = require('stream'),
      os         = require('os'),
      scroll     = require('./blessed/scroll'),
      XTerm      = require('./blessed-xterm/blessed-xterm');

class Exec extends Duplex {

  constructor({ screen, status, debug }) {
    super({ allowHalfOpen: false });
    const self = this;
    let ignoreLocked, skipInputDataOnce;

    this._read = function (_) {
      self.resume();
    };

    const input = function (data) {
      const buffer = Buffer.allocUnsafe(data.length + 1);
      // Send to STDIN channel
      buffer.writeUInt8(0, 0);
      if (typeof data === 'string') {
        buffer.write(data, 1, 'binary');
      } else {
        data.copy(buffer, 1);
      }
      if (!self.push(buffer)) {
        self.pause();
      }
    };

    const terminal = new XTerm({
      parent    : screen,
      left      : 0,
      top       : 1,
      width     : '100%',
      bottom    : 1,
      border    : 'line',
      mouse     : 'true',
      scrollbar : {
        ch    : ' ',
        style : { bg: 'white' },
        track : {
          style : { bg: 'grey' },
        }
      },
    });
    this.terminal = terminal;

    const browserCopyToClipboard = function (event) {
      if (terminal.hasSelection()) {
        event.clipboardData.setData('text/plain', terminal.getSelectedText());
        event.preventDefault();
      }
    };

    const browserPasteFromClipboard = function (event) {
      input(event.clipboardData.getData('text/plain'));
      terminal.clearSelection();
      event.preventDefault();
    };

    const focus = function () {
      screen.grabKeys = true;
      ignoreLocked = screen.ignoreLocked;
      screen.ignoreLocked = [];
      if (os.platform() === 'browser') {
        document.addEventListener('copy', browserCopyToClipboard);
        document.addEventListener('paste', browserPasteFromClipboard);
      }
    };

    const blur = function () {
      // Skip keypress data emitted while navigating away from the terminal
      skipInputDataOnce = true;
      screen.grabKeys = false;
      screen.ignoreLocked = ignoreLocked;
      if (os.platform() === 'browser') {
        document.removeEventListener('copy', browserCopyToClipboard);
        document.removeEventListener('paste', browserPasteFromClipboard);
      }
    };

    // Make sure keys are grabbed / released
    terminal.on('blur', blur);
    terminal.on('focus', focus);

    terminal.on('keypress', function (ch, key) {
      if (key.meta && /^[0-9]$/.test(key.name)) {
        // Navigate to pages by id
        blur();
        // Let's re-emit the event
        screen.emit('keypress', ch, key);
      } else if (key.ctrl) {
        // We rely on the clipboard event API in Web browsers
        if (key.name === 'c') {
          // Copy to clipboard
          if (terminal.hasSelection()) {
            if (os.platform() === 'browser') {
              document.execCommand('copy');
            } else {
              clipboardy.writeSync(terminal.getSelectedText());
            }
            skipInputDataOnce = true;
          }
        } else if (key.name === 'v') {
          if (os.platform() === 'browser') {
            document.execCommand('paste');
          } else {
            // Paste from clipboard
            input(clipboardy.readSync());
            terminal.clearSelection();
            // scrolls to bottom
            terminal.setScrollPerc(100);
          }
          skipInputDataOnce = true;
        }
      }
    });
    terminal.on('key S-left', function (ch, key) {
      blur();
      // Let's re-emit the event
      screen.emit('key S-left', ch, key);
    });
    terminal.on('key S-right', function (ch, key) {
      blur();
      // Let's re-emit the event
      screen.emit('key S-right', ch, key);
    });
    // override default ScrollableBox scrolling
    scroll(terminal);

    this.termName = function () {
      return terminal.term.getOption('termName');
    };

    this.setLabel = function (label) {
      terminal.setLabel(label);
    }

    this.render = function () {
      screen.append(terminal);
      screen.append(status);
      terminal.focus();
    };

    const sendResize = function () {
      const adjust = `{"Width":${terminal.term.cols},"Height":${terminal.term.rows}}`;
      const length = Buffer.byteLength(adjust);
      const buffer = Buffer.allocUnsafe(length + 1);
      buffer.writeUInt8(4, 0);
      buffer.write(adjust, 1, 'binary');
      if (!self.push(buffer)) {
        self.pause();
      }
    };

    // Keep terminal connection alive
    const keepAlive = function () {
      return setInterval(function () {
        const buffer = Buffer.allocUnsafe(1);
        buffer.writeUInt8(0, 0);
        if (!self.push(buffer)) {
          self.pause();
        }
      }, 30 * 1000);
    }

    this.output = function* () {
      // Connection opens
      terminal.term.on('resize', sendResize);
      terminal.once('render', function () {
        // In case the terminal was resized while the connection was opening
        terminal.term.resize(terminal.width - terminal.iwidth - 1, terminal.height - terminal.iheight);
        sendResize();
      });

      const onScreenInput = function (data) {
        if (screen.focused !== terminal) return;

        if (skipInputDataOnce) {
          skipInputDataOnce = false;
          return;
        }
        if (!XTerm.isMouse(data)) {
          input(data);
          terminal.clearSelection();
          // scrolls to bottom
          terminal.setScrollPerc(100);
        }
      };
      screen.program.input.on('data', onScreenInput);

      const dispose = function () {
        screen.program.input.removeListener('data', onScreenInput);
        // work around Xterm.js async write
        setTimeout(() => terminal.dispose(), 0);
        // notifies parent element
        self.emit('exit');
      };

      terminal.start();
      const alive = keepAlive();
      let message, error;
      while (message = yield) {
        switch (message[0]) {
          case 1:
            terminal.term.writeUtf8(message.slice(1));
            break;
          case 2:
          case 3:
            error = message.slice(1).toString();
            terminal.write(`\r\n\x1b[31m${error}\x1b[m\r\n`);
            break;
          default:
            throw Error('Unsupported message!');
        }
      }
      // Connection closes
      clearInterval(alive);
      // Ctrl-C throws a SIGINT signal and aborts the current interactive command entry,
      // which is a non-normal state for the command entry. In that case, we still want
      // to dispose the terminal.
      // See: http://tldp.org/LDP/abs/html/exitcodes.html#EXITCODESREF
      if (error && !error.endsWith('Error executing in Docker Container: 130')) {
        terminal.write('\x1b[31mDisconnected\x1b[m\r\n');
        terminal.write('Type Ctrl-C to close\r\n');
        terminal.on('key C-c', () => {
          // enables user to copy instead of closing
          if (!terminal.hasSelection()) {
            dispose();
          }
        });
      } else {
        terminal.write('Disconnected\r\n');
        dispose();
      }
      screen.render();
    };
  }
}

module.exports = Exec;