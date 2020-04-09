'use strict';

const blessed = require('blessed');
const { setLabel, spinner: { until } } = require('./ui');

function namespaces_ui(screen) {
  // TODO: display a list table with some high level info about the namespaces
  const box = blessed.box({
    top    : 'center',
    left   : 'center',
    width  : '50%',
    height : '50%',
    label  : 'Namespaces',
    border : { type: 'line' },
  });

  const list = blessed.list({
    parent : box,
    height : 'shrink',
    bottom :  0,
    align  : 'left',
    top    : 3,
    width  : '100%-2',
    keys   : true,
    tags   : true,
    mouse  : true,
    border : 'line',
    invertSelected : false,
    scrollbar : {
      ch      : ' ',
      style   : { bg: 'white' },
      track   : {
        style : { bg: 'grey' },
      }
    },
    style : {
      label    : { bold: true },
      selected : { bold: true, fg: 'black', bg: 'white' },
    }
  });

  blessed.text({
    parent  : box,
    left    : 1,
    top     : 1,
    align   : 'left',
    content : 'Filter:',
  });

  const search = blessed.textbox({
    parent       : box,
    border       : 'line',
    width        : '100%-11',
    height       : 3,
    top          : 0,
    right        : 0,
    inputOnFocus : true,
  });

  search.filter = function () {
    let i = 0;
    list.items.forEach((element, pos) => {
      if (!element.getContent().includes(search.value)) {
        element.hidden = true;
      } else {
        element.position.top = i;
        element.hidden = false;
        if (i === 0) {
          list.selected = pos;
        }
        i++;
      }
    });
    list.scrollTo(0);
    screen.render();
  };

  // Canonical way of extending components in Blessed
  search.__oolistener = search._listener;
  search._listener = function (ch, key) {
    const word = ['up', 'down', 'enter'];
    if (word.includes(key.name)) {
      return list.emit('keypress', ch, key);
    }
    const ret = this.__oolistener(ch, key);
    this.filter();
    return ret;
  };

  box.on('keypress', (ch, key) => {
    const keys = ['escape', 'up', 'down', 'enter', 'q', 'left', 'right'];
    if (keys.includes(key.name)) {
      list.emit('keypress', ch, key);
    } else {
      screen.saveFocus();
      search.focus();
      search.readInput();
      search._listener(ch, key);
      screen.render();
    }
  });

  list.up = function (offset) {
    return move(offset, offset => (offset || 1) * -1, (i, len) => mod(i - 1, len));
  };

  list.down = function (offset) {
    return move(offset, offset => (offset || 1), (i, len) => mod(i + 1, len));
  };

  function move(offset, start, inc) {
    if (list.items[list.selected].hidden) {
      return;
    }
    let i = list.selected + start(offset);
    const len = list.items.length;
    for (i = mod(i, len); i < len && i >= 0; i = inc(i, len)) {
      if (!list.items[i].hidden) {
        list.selected = i;
        list.scrollTo(list.items[i].position.top);
        screen.render();
        return;
      }
    }
  }

  function mod(a, b) {
    return (((a) % b) + b) % b;
  }

  return { search, box, list };
}

function prompt(screen, client, { current_namespace, promptAfterRequest } = { promptAfterRequest: false }) {
  return new Promise(function (fulfill, reject) {
    const { search, box, list } = namespaces_ui(screen);
    let namespaces = [], message;

    // TODO: watch for namespaces changes when the selection list is open
    function request_namespaces() {
      return (client.openshift ? client.projects().get() : client.namespaces().get())
        .then(response => {
          namespaces = JSON.parse(response.body.toString('utf8'));
          if (namespaces.items.length === 0) {
            list_message('No available namespaces');
          } else {
            let selected;
            list.setItems(namespaces.items.reduce((data, namespace, index) => {
              if (namespace.metadata.name === current_namespace) {
                selected = index;
                data.push(`{blue-fg}${namespace.metadata.name}{/blue-fg}`);
              } else {
                data.push(namespace.metadata.name);
              }
              return data;
            }, []));
            if (search.value) {
              search.filter();
            } else if (selected) {
              list.select(selected);
              if (selected > list.height / 2 - 1) {
                // Scroll to center the selected item
                list.childOffset += list.height / 2 - 1 | 0;
                list.scrollTo(selected);
              }
            }
          }
          screen.render();
        });
    }

    function prompt_namespaces_ui() {
      screen.saveFocus();
      screen.grabKeys = true;
      screen.grabMouse = true;
      screen.append(box);
      search.focus();
      list.grabMouse = true;
      screen.render();
    }

    function close_namespaces_ui() {
      box.detach();
      screen.restoreFocus();
      screen.grabKeys = false;
      screen.grabMouse = false;
      screen.render();
    }

    function list_message(text, options = {}) {
      if (message) message.destroy();
      message = blessed.text(Object.assign({
        parent  : list,
        tags    : true,
        top     : '50%-1',
        left    : 'center',
        width   : 'shrink',
        height  : 'shrink',
        align   : 'center',
        valign  : 'middle',
        content : text,
      }, options));
    }

    if (promptAfterRequest) {
      request_namespaces()
        .then(prompt_namespaces_ui)
        .catch(error => reject(error));
    } else {
      prompt_namespaces_ui();
      until(request_namespaces())
        .do(box, setLabel).spin(s => `${s} Namespaces`).done(_ => 'Namespaces')
        .catch(error => {
          close_namespaces_ui();
          reject(error);
        });
    }

    box.on('key q', () => {
      close_namespaces_ui();
      fulfill(current_namespace);
    });

    search.on('key escape', () => {
      close_namespaces_ui();
      fulfill(current_namespace);
    });

    list.on('select', (item, i) => {
      close_namespaces_ui();
      if (item && !item.hidden) {
        const namespace = namespaces.items[i].metadata.name;
        fulfill(namespace);
      } else {
        // no namespaces
        fulfill(current_namespace);
      }
    });
  });
}

module.exports.prompt = prompt;
