
module.exports.throttle = function (el) {
  el.removeAllListeners('wheeldown');
  el.removeAllListeners('wheelup');

  let delta = 0, tick = false;

  const scroll = function (d) {
    delta += d;
    if (!tick) {
      setTimeout(function () {
        if (delta != 0 && !el.detached) {
          el.scroll(delta);
          delta = 0;
          el.screen.render();
        }
        tick = false;
      }, 20);
      tick = true;
    }
  };

  el.on('wheeldown', _ => scroll(1));
  el.on('wheelup', _ => scroll(-1));

  return el;
};

module.exports.scroll = function (el) {
  // Patches the default mouse wheel delta set to -/+ 2 in the List and ScrollableBox constuctors.
  // It may be generalized to all widgets by overriding the constructors,
  // like it's done for theming the options passed to the Node constructor.
  // It also adds support for PgUp/PgDown keys.
  const type = el.type;
  switch (type) {
    case 'list-table':
    case 'list':
      el.removeAllListeners('element wheeldown');
      el.removeAllListeners('element wheelup');

      el.on('element wheeldown', function () {
        this.select(this.selected + 1);
        this.screen.render();
      });

      el.on('element wheelup', function () {
        this.select(this.selected - 1);
        this.screen.render();
      });

      el.removeAllListeners('keypress');

      el.on('keypress', function (_, key) {
        if (key.name === 'up') {
          this.up();
          this.screen.render();
          return;
        }
        if (key.name === 'down') {
          this.down();
          this.screen.render();
          return;
        }
        if (key.name === 'enter') {
          this.enterSelected();
          return;
        }
        if (key.name === 'escape') {
          this.cancelSelected();
          return;
        }
        if (key.name === 'pageup') {
          this.move(-(this.height - this.iheight - 1));
          this.screen.render();
          return;
        }
        if (key.name === 'pagedown') {
          this.move((this.height - this.iheight - 1));
          this.screen.render();
          return;
        }
      });
      break;

    default:
      el.removeAllListeners('wheeldown');
      el.removeAllListeners('wheelup');

      el.on('wheeldown', function () {
        this.scroll(1);
        this.screen.render();
      });

      el.on('wheelup', function () {
        this.scroll(-1);
        this.screen.render();
      });

      el.removeAllListeners('keypress');

      el.on('keypress', function (_, key) {
        if (key.name === 'up') {
          this.scroll(-1);
          this.screen.render();
          return;
        }
        if (key.name === 'down') {
          this.scroll(1);
          this.screen.render();
          return;
        }
        if (key.name === 'pageup') {
          this.scroll(-(this.height - this.iheight) || -1);
          this.screen.render();
          return;
        }
        if (key.name === 'pagedown') {
          this.scroll((this.height - this.iheight) || 1);
          this.screen.render();
          return;
        }
      });
      break;
  }

  return el;
};
