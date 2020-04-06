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

module.exports.until = function (promise) {
  let element, method, spin, succeed, fail, done;
  const spinner = new Spinner();
  const spinned = promise.then(
    (result) => {
      spinner.stop();
      if (succeed) {
        render(succeed('{green-fg}✔{/green-fg}'));
      }
      if (done) {
        render(done('{green-fg}✔{/green-fg}'));
      }
      return result;
    },
    (error) => {
      spinner.stop();
      if (fail) {
        render(fail('{red-fg}✖{/red-fg}'));
      }
      if (done) {
        render(done('{red-fg}✖{/red-fg}'));
      }
      throw error;
    }
  );

  function render(result) {
    if (!element) {
      return;
    }
    if (typeof method === 'function') {
      method.call(element, result);
    } else if (typeof method === 'string') {
      element[method].call(element, result);
    }
    if (!element.detached) {
      element.screen.render();
    }
  }

  const api = {
    then  : spinned.then.bind(spinned),
    catch : spinned.catch.bind(spinned),
  };

  api.do = function (e, m) {
    element = e;
    method = m;
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

  api.done = function (cb) {
    done = cb;
    return api;
  };

  api.cancel = function (supplier, cb) {
    supplier(() => {
      spinner.stop();
      if (cb) {
        cb();
      }
    });
    return api;
  }

  spinner.start(frame => {
    if (spin) {
      render(spin(frame));
    }
  });

  return api;
}

