'use strict';

const blessed = require('blessed'),
      os      = require('os');

class Exec {

  constructor(screen, namespace, pod, container, user) {
    let terminal, term, self = this;

    this.write = function (data) {
      const payload     = Buffer.allocUnsafe(data.length + 1);
      // send to STDIN
      payload.writeUInt8(0, 0);
      if(typeof data === "string") {
        // browser
        payload.write(data, 1, 'binary');
      } else {
        data.copy(payload, 1);
      }
      self.sendData(payload);
    }

    this.kill = function (data) {
      screen.grabKeys = false;
      terminal.kill();
    }

    this.sendResize = function () {
      if(!self.sendData) {
        return;
      }
      const adjust = '{"Width":' + term.cols + ',"Height":' + term.rows + '}';
      const length = Buffer.byteLength(adjust)
      const buffer = Buffer.allocUnsafe(length + 1);
      buffer.writeUInt8(4, 0);
      buffer.write(adjust, 1, 'binary');
      self.sendData(buffer);
    }

    // TODO: use xterm.js when in browser
    terminal = blessed.terminal({
      parent: screen,
      handler: self.write,
      cursor: 'line',
      cursorBlink: true,
      screenKeys: true,
      label: `${namespace}/${pod}/${container}@${user}`,
      left: 0,
      top: 1,
      width: '100%',
      height: '100%',
      border: 'line',
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

    this.blur = function () {
      screen.grabKeys = false;
      terminal.rejectInput = true;
      if (os.platform() === 'browser') {
        screen.program.input.off('data', terminal._onData);
      } else {
        screen.program.input.removeListener('data', terminal._onData);
      }
    }
  
    this.focus = function () {
      screen.grabKeys = true;
      // this is a workaround to avoid taking input when the terminal is not focused
      const selfT  = terminal;
      terminal.rejectInput = false;
      if (os.platform() === 'browser') {
        screen.program.input.off('data', terminal._onData);
      } else {
        screen.program.input.removeListener('data', terminal._onData);
      }      screen.program.input.on('data', terminal._onData = function(data) {
        if (selfT.screen.focused === selfT && !selfT._isMouse(data) && !selfT.rejectInput) {
          selfT.handler(data);
        }
      });
      terminal.focus();
    }
  
    this.render = function () {
      self.sendResize();
      screen.grabKeys = true;
      screen.append(terminal);
      self.focus();
    }
  
    this.print = function* () {
      let message;
      try {
        while (message = yield ) {
          // skip empty data frame payload on connect!
          if (message.length <= 1) continue;
          var channel = message[0].toString();
          message =  message.slice(1).toString();            
          switch(channel) {
          case '1':
            term.write(message);
            screen.render();
            break;
          default:
            term.write('error:' + message );
          }
        }
      } catch (e) {
        // HTTP chunked transfer-encoding / streaming requests abort on timeout instead of being ended.
        // WebSocket upgraded requests end when timed out on OpenShift.
        console.log(e);
      }
    }

  }
}

module.exports = Exec;