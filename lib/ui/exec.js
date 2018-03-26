'use strict';

const blessed    = require('blessed'),
      os         = require('os'),
      { Duplex } = require('stream');

class Exec extends Duplex {

  constructor({ screen, status, namespace, pod, container }) {
    super();
    let terminal, term, self = this;

    this._read = function (size) {
      self.resume();
    };

    let handler = function (data) {
      const buffer = Buffer.allocUnsafe(data.length + 1);
      // send to STDIN
      buffer.writeUInt8(0, 0);
      if(typeof data === "string") {
        // browser
        buffer.write(data, 1, 'binary');
      } else {
        data.copy(buffer, 1);
      }
      if (!self.push(buffer)) {
        self.pause();
      }
    };

    this.kill = function (data) {
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

    // TODO: use xterm.js when in browser
    terminal = blessed.terminal({
      parent      : screen,
      handler     : handler,
      cursor      : 'block',
      cursorBlink : true,
      screenKeys  : true,
      label       : `${namespace}/${pod}/${container}`,
      left        : 0,
      top         : 1,
      width       : '100%',
      bottom      : 1,
      border      : 'line',
    });
    terminal.on('click', terminal.focus.bind(terminal));
    terminal.on('keypress', (ch, key) => {
      switch(key.full) {
        case 'escape':
        self.blur();
        break;
        default:
        return;
      }
    });
    term = terminal.term;
    term.on('resize', self.sendResize.bind(self));

    this.termName = function () {
      return terminal.termName;
    };

    this.blur = function () {
      screen.grabKeys = false;
      terminal.rejectInput = true;
      if (os.platform() === 'browser') {
        screen.program.input.off('data', terminal._onData);
      } else {
        screen.program.input.removeListener('data', terminal._onData);
      }
    };

    this.focus = function () {
      screen.grabKeys = true;
      // this is a workaround to avoid taking input when the terminal is not focused
      const selfT  = terminal;
      terminal.rejectInput = false;
      if (os.platform() === 'browser') {
        screen.program.input.off('data', terminal._onData);
      } else {
        screen.program.input.removeListener('data', terminal._onData);
      }
      screen.program.input.on('data', terminal._onData = function (data) {
        if (selfT.screen.focused === selfT && !selfT._isMouse(data) && !selfT.rejectInput) {
          selfT.handler(data);
        }
      });
      terminal.focus();
    };

    this.render = function () {
      screen.grabKeys = true;
      screen.append(terminal);
      screen.append(status);
      self.focus();
      terminal.once('render', function() {
        terminal.term.resize(terminal.width - terminal.iwidth, terminal.height - terminal.iheight);
      });
    };

    this.print = function* () {
      let message;
      try {
        while (message = yield) {
          // skip empty data frame payload on connect!
          if (message.length <= 1) continue;
          var channel = message[0].toString();
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
        // HTTP chunked transfer-encoding / streaming requests abort on timeout instead of being ended.
        // WebSocket upgraded requests end when timed out on OpenShift.
        console.log(e);
      }
      this.emit('exit');
    };
  }
}

module.exports = Exec;