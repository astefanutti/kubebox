'use strict';

const { Duplex } = require('stream'),
      XTerm      = require('./blessed-xterm/blessed-xterm');

class Exec extends Duplex {

  constructor({ screen, status, namespace, pod, container, debug }) {
    super();
    let terminal, term, self = this;

    this._read = function (_) {
      self.resume();
    };

    let handler = function (data) {
      const buffer = Buffer.allocUnsafe(data.length + 1);
      // send to STDIN
      buffer.writeUInt8(0, 0);
      if(typeof data === 'string') {
        // browser
        buffer.write(data, 1, 'binary');
      } else {
        data.copy(buffer, 1);
      }
      if (!self.push(buffer)) {
        self.pause();
      }
    };

    this.kill = function () {
      screen.grabKeys = false;
      terminal.kill();
    };

    this.sendResize = function () {
      const adjust = `{"Width":${term.cols},"Height":${term.rows}}`;
      const length = Buffer.byteLength(adjust);
      const buffer = Buffer.allocUnsafe(length + 1);
      buffer.writeUInt8(4, 0);
      buffer.write(adjust, 1, 'binary');
      if (!self.push(buffer)) {
        self.pause();
      }
    };

    terminal = new XTerm({
      parent     : screen,
      handler    : handler,
      screenKeys : true,
      label      : `${namespace}/${pod}/${container}`,
      left       : 0,
      top        : 1,
      width      : '100%',
      bottom     : 1,
      border     : 'line',
      debug      : debug,
    });

    terminal.on('click', terminal.focus.bind(terminal));

    terminal.on('keypress', (ch, key) => {
      if (key.meta && /^[0-9]$/.test(key.name)) {
        self.blur();
        screen.emit('keypress', ch, key);
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

    term = terminal.term;
    term.on('resize', self.sendResize.bind(self));

    this.termName = function () {
      return term.getOption('termName');
    };

    this.blur = function () {
      screen.grabKeys = false;
      terminal.skipInputDataOnce = true;
      terminal.enableInput(false);
    };

    this.focus = function () {
      terminal.focus();
      screen.grabKeys = true;
      terminal.enableInput(true);
    };

    this.render = function () {
      screen.grabKeys = true;
      screen.append(terminal);
      screen.append(status);
      self.focus();
      terminal.once('render', function () {
        terminal.term.resize(terminal.width - terminal.iwidth, terminal.height - terminal.iheight);
        self.sendResize();
      });
    };

    this.print = function* () {
      let message;
      try {
        while (message = yield) {
          // skip empty data frame payload on connect!
          if (message.length <= 1) continue;
          const channel = message[0].toString();
          message = message.slice(1).toString();
          switch (channel) {
          case '1':
            term.write(message);
            screen.render();
            break;
          default:
            term.write('error: ' + message);
          }
        }
      } catch (e) {
        // FIXME
        console.log(e);
      }
      this.emit('exit');
    };
  }
}

module.exports = Exec;