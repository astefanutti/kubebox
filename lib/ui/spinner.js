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

  const api = {
    then  : spinned.then.bind(spinned),
    catch : spinned.catch.bind(spinned),
  };

  api.begin = function (cb) {
    cb();
    screen.render();
    return api;
  };

  api.spin = function (cb) {
    spin = cb;
    return api;
  };

  api.succeed = function (cb) {
    succeed = cb;
    return api;
  };

  api.fail = function (cb) {
    fail = cb;
    return api;
  };

  api.cancel = function (supplier, cb) {
    supplier(() => {
      spinner.stop();
      if (cb) {
        cb();
        screen.render();
      }
    });
    return api;
  }

  spinner.start(frame => {
    if (spin) {
      spin(frame);
      screen.render();
    }
  });

  return api;
}

module.exports = screen => ({
  until: promise => until(screen, promise),
});
