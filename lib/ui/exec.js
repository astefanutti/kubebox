'use strict';

const { Duplex } = require('stream'),
      XTerm      = require('./blessed-xterm/blessed-xterm');

class Exec extends Duplex {

  constructor({ screen, status, debug }) {
    super();
    const self = this;
    let ignoreLocked;

    this._read = function (_) {
      self.resume();
    };

    const handler = function (data) {
      const buffer = Buffer.allocUnsafe(data.length + 1);
      // Send to STDIN channel
      buffer.writeUInt8(0, 0);
      if (typeof data === 'string') {
        // Web browser
        buffer.write(data, 1, 'binary');
      } else {
        data.copy(buffer, 1);
      }
      if (!self.push(buffer)) {
        self.pause();
      }
    };

    const terminal = new XTerm({
      parent     : screen,
      handler    : handler,
      screenKeys : true,
      left       : 0,
      top        : 1,
      width      : '100%',
      bottom     : 1,
      border     : 'line',
      debug      : debug,
    });

    terminal.on('click', terminal.focus.bind(terminal));
    terminal.on('blur', function () {
      // Make sure key grabbing is released
      self.blur();
    });
    terminal.on('keypress', function (ch, key) {
      if (key.meta && /^[0-9]$/.test(key.name)) {
        // Navigate to pages by id
        self.blur();
        // Let's re-emit the event
        screen.emit('keypress', ch, key);
      } else if (key.name === 'c' && key.ctrl) {
        // Copy to clipboard
        const text = terminal.getSelectedText();
        if (text.length) {
          terminal.fallbackCopyTextToClipboard(text);
          terminal.skipInputDataOnce = true;
        }
      }
    });
    terminal.on('key S-left', function (ch, key) {
      self.blur();
      // Let's re-emit the event
      screen.emit('key S-left', ch, key);
    });
    terminal.on('key S-right', function (ch, key) {
      self.blur();
      // Let's re-emit the event
      screen.emit('key S-right', ch, key);
    });

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
    terminal.term.on('resize', sendResize);

    // Keep terminal connection alive
    const alive = setInterval(function () {
      const buffer = Buffer.allocUnsafe(1);
      buffer.writeUInt8(0, 0);
      if (!self.push(buffer)) {
        self.pause();
      }
    }, 30 * 1000);

    const dispose = function () {
      // Work around Xterm.js async write
      setTimeout(() => terminal.dispose(), 0);
    };

    this.termName = function () {
      return terminal.term.getOption('termName');
    };

    this.setLabel = function (label) {
      terminal.setLabel(label);
    }

    this.blur = function () {
      screen.grabKeys = false;
      screen.ignoreLocked = ignoreLocked;
      terminal.skipInputDataOnce = true;
      terminal.enableInput(false);
    };

    this.focus = function () {
      terminal.focus();
      screen.grabKeys = true;
      ignoreLocked = screen.ignoreLocked;
      screen.ignoreLocked = [];
      terminal.enableInput(true);
    };

    this.render = function () {
      screen.append(terminal);
      screen.append(status);
      self.focus();
      terminal.once('render', function () {
        terminal.term.resize(terminal.width - terminal.iwidth, terminal.height - terminal.iheight);
        sendResize();
      });
    };

    this.print = function* () {
      let message, error, last;
      while (message = yield) {
        const channel = message[0].toString();
        message = message.slice(1).toString();
        switch (channel) {
          case '1':
            // An initial ping frame with 0-length data is being sent
            if (message.length === 0) continue;
            terminal.write(message);
            last = message;
            screen.render();
            break;
          case '2':
          case '3':
            terminal.write(`\x1b[31m${message}\x1b[m\r\n`);
            error = message;
            screen.render();
            break;
          default:
            throw Error('Unsupported message!');
        }
      }
      // Connection closes
      clearInterval(alive);
      if (error && last !== '\r\nexit\r\n') {
        terminal.write('\x1b[31mDisconnected\x1b[m\r\n');
        terminal.write('Type Ctrl-C to close\r\n');
        terminal.once('key C-c', function () {
          dispose();
          self.emit('exit');
        });
      } else {
        terminal.write('Disconnected\r\n');
        dispose();
        this.emit('exit');
      }
      screen.render();
    };
  }
}

module.exports = Exec;