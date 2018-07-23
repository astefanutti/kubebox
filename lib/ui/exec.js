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

    const term = terminal.term;

    const sendResize = function () {
      const adjust = `{"Width":${term.cols},"Height":${term.rows}}`;
      const length = Buffer.byteLength(adjust);
      const buffer = Buffer.allocUnsafe(length + 1);
      buffer.writeUInt8(4, 0);
      buffer.write(adjust, 1, 'binary');
      if (!self.push(buffer)) {
        self.pause();
      }
    };
    term.on('resize', sendResize);

    this.termName = function () {
      return term.getOption('termName');
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
      let message;
      while (message = yield) {
        const channel = message[0].toString();
        message = message.slice(1).toString();
        switch (channel) {
          case '1':
            // An initial ping frame with 0-length data is being sent
            if (message.length === 0) continue;
            term.write(message);
            screen.render();
            break;
          default:
            term.write('error: ' + message);
        }
      }
      // Connection closes
      this.emit('exit');
    };

    // Keep terminal connection alive
    const alive = setInterval(function () {
      const buffer = Buffer.allocUnsafe(1);
      buffer.writeUInt8(0, 0);
      if (!self.push(buffer)) {
        self.pause();
      }
    }, 30 * 1000);

    this.kill = function () {
      clearInterval(alive);
      screen.grabKeys = false;
      screen.ignoreLocked = ignoreLocked;
      terminal.kill();
    };
  }
}

module.exports = Exec;