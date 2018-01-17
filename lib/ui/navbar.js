const blessed  = require('blessed'),
      Carousel = require('./contrib/carousel');

class NavBar {

  constructor(screen) {

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
      autoCommandKeys : true,
      style : {
        bg     : 'white',
        prefix : {
          fg : '#888',
        },
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
          bg : 'grey',
        }
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

    // TODO: add an index parameter
    this.add = function (page, { select = false } = {}) {
      items.push(page);

      tabs.add(page.name, () => {
        carousel.currPage = index(page);
        carousel.move();
      });

      carousel.pages.push(screen => {
        screen.append(menu);
        tabs.select(index(page));
        page.render(screen);
      });

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

      items.splice(i, 1);
      carousel.pages.splice(i, 1);
      tabs.removeItem(i);
      // fix for listBar#removeItem
      tabs.commands.forEach((command, index) => {
        command.prefix = index + 1;
        command.element.content = `{#888-fg}${command.prefix}{/#888-fg}:${command.text}`;
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
