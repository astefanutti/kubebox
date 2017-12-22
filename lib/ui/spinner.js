class Spinner {

  constructor() {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let interval;
    let i = 0;

    this.start = function (callback) {
      interval = setInterval(function () {
        callback(frames[i++ % frames.length]);
      }, 80);
      return this;
    }

    this.stop = function () {
      clearInterval(interval);
      i = 0;
      return this;
    }
  }
}

function until(screen, promise) {
  let begin, spin, succeed, fail;
  const spinner = new Spinner();
  const spinned = promise.then(
    (result) => {
      spinner.stop();
      if (succeed) {
        succeed('{green-fg}✔{/green-fg}');
        screen.render();
      }
      return result;
    },
    (error) => {
      spinner.stop();
      if (fail) {
        fail('{red-fg}✖{/red-fg}');
        screen.render();
      }
      throw error;
    }
  );

  spinned.begin = function (cb) {
    cb();
    screen.render();
    return spinned;
  };

  spinned.spin = function (cb) {
    spin = cb;
    return spinned;
  };

  spinned.succeed = function (cb) {
    succeed = cb;
    return spinned;
  };

  spinned.fail = function (cb) {
    fail = cb;
    return spinned;
  };

  spinner.start(frame => {
    if (spin) {
      spin(frame);
      screen.render();
    }
  });

  return spinned;
}

module.exports = screen => ({
  until: promise => until(screen, promise),
});
