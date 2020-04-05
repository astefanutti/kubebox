const blessed  = require('blessed'),
      Carousel = require('./blessed-contrib/carousel');

const CloseKey = 'C-z';

class NavBar {

  static AddEvent      = 'AddEvent';
  static SelectEvent   = 'SelectEvent';
  static DeselectEvent = 'DeselectEvent';
  static RemoveEvent   = 'RemoveEvent';

  constructor(screen) {
    const navbar = this;

    const menu = blessed.text({
      parent  : screen,
      tags    : true,
      width   : '100%',
      height  : 1,
      top     : 0,
      padding : {
        left  : 1,
        right : 1,
      },
      style : {
        bg : 'white',
        fg : 'black',
      },
      // TODO: add click handler that display Kubebox about modal
      content : '{|}⎈ ❏',
    });

    const tabs = blessed.listbar({
      parent : menu,
      top    : 0,
      left   : 0,
      right  : 4,
      height : 1,
      mouse  : true,
      keys   : true,
      style : {
        bg : 'white',
        item : {
          fg : 'black',
          bg : 'white',
          hover : {
            fg   : 'white',
            bg   : 'grey',
            bold : true,
          },
        },
        selected : {
          fg : 'white',
          bg : 'blue',
        },
      },
      autoCommandKeys : false,
    });
    // Overwrite default autoCommandKeys behavior to be able to select tab by index
    // even while the meta key is pressed, for example within a remote exec terminal
    tabs.onScreenEvent('keypress', function (ch, key) {
      const k = key.name || ch;
      if (/^[0-9]$/.test(k)) {
        let i = +k - 1;
        if (!~i) i = 9;
        tabs.selectTab(i);
      }
    });

    const carousel = new Carousel([], {
      screen      : screen,
      interval    : 0,
      controlKeys : true,
      rotate      : true,
    });

    const items = [];

    const index = function (selector) {
      if (typeof selector === 'string') {
        return items.findIndex(item => item.name === selector);
      } else if (typeof selector === 'number') {
        return selector;
      } else if (typeof selector === 'function') {
        return items.findIndex(item => selector(item));
      } else if (typeof selector === 'object') {
       return items.indexOf(selector);
      }
    }

    let currPage = -1;
    let closableHandler;
    Object.defineProperty(carousel, 'currPage', {
      get: function () {
        return currPage;
      },
      set: function (c) {
        if (currPage >= 0) {
          const page = items[currPage];
          if (page && page.listener) {
            page.listener.emit(NavBar.DeselectEvent, { navbar, page, screen });
          }
          if (closableHandler) {
            screen.unkey(CloseKey, closableHandler);
            closableHandler = null;
          }
        }
        currPage = c;
      },
      writeable: true,
      enumerable: true,
    });

    // TODO: add an index parameter
    this.add = function (page, { select = false, closable = false } = {}) {
      items.push(page);

      tabs.add(page.name, () => {
        carousel.currPage = index(page);
        carousel.move();
      });

      carousel.pages.push(screen => {
        screen.append(menu);
        tabs.select(index(page));

        if (typeof page.render === 'function') {
          page.render(screen);
        }
        if (page.listener) {
          page.listener.emit(NavBar.SelectEvent, { navbar, page, screen });
        }

        if (closable) {
          closableHandler = () => this.remove(page);
          screen.key(CloseKey, closableHandler);
        }
      });

      if (page.listener) {
        page.listener.emit(NavBar.AddEvent, { navbar, page, screen });
      }

      if (select) {
        const i = items.length - 1;
        tabs.select(i);
        carousel.currPage = i;
        carousel.move();
      }
    };

    this.select = function (selector) {
      const i = index(selector);
      if (i < 0) return false;

      tabs.select(i);
      carousel.currPage = i;
      carousel.move();
      return true;
    };

    this.remove = function (selector) {
      const i = index(selector);
      if (i < 0) return false;

      const [page] = items.splice(i, 1);
      if (page.listener) {
        page.listener.emit(NavBar.RemoveEvent, { navbar, page, screen });
      }

      carousel.pages.splice(i, 1);
      tabs.removeItem(i);
      // fix for listBar#removeItem
      tabs.commands.forEach((command, index) => {
        command.prefix = index + 1;
        command.element.content = `${command.prefix}:${command.text}`;
      });
      tabs.render();
      // TODO: we may want to maintain a navigation history
      carousel.home();
      return true;
    };

    carousel.start();
  }
}

module.exports = NavBar;
