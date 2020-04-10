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
    border : 'line',
    style : {
      label : { bold: true },
    },
  });

  const list = blessed.list({
    parent : box,
    height : 'shrink',
    bottom :  0,
    align  : 'left',
    top    : 4,
    width  : '100%',
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
      },
    },
    style : {
      label    : { bold: true },
      selected : { bold: true, fg: 'black', bg: 'white' },
    },
  });

  blessed.text({
    parent  : box,
    left    : 2,
    top     : 2,
    align   : 'left',
    content : 'Filter:',
  });

  const search = blessed.textbox({
    parent : box,
    border : 'line',
    width  : '100%-11',
    height : 3,
    top    : 1,
    right  : 1,
    inputOnFocus : true,
  });

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

  return { search, box, list };
}

function prompt(screen, client, { current_namespace, promptAfterRequest } = { promptAfterRequest: false }) {
  return new Promise(function (fulfill, reject) {
    const { search, box, list } = namespaces_ui(screen);
    let namespaces = [], message;

    // Canonical way of extending components in Blessed
    search.__oolistener = search._listener;
    search._listener = function (ch, key) {
      if (['up', 'down', 'enter'].includes(key.name)) {
        return list.emit('keypress', ch, key);
      }
      const ret = this.__oolistener(ch, key);
      updateList();
      screen.render();
      return ret;
    };

    function updateList() {
      const items = (namespaces.items || [])
        .filter(n => n.metadata.name.includes(search.value))
        .map(n => {
          const item = n.metadata.name;
          if (search.value.length === 0) {
            if (n.metadata.name === current_namespace) {
              return `{blue-fg}${item}{/blue-fg}`;
            }
            return item;
          }
          const regex = new RegExp(search.value, 'g');
          let match, lastIndex = 0, res = '';
          while ((match = regex.exec(item)) !== null) {
            res += item.substring(lastIndex, match.index) + '{yellow-fg}' + search.value + '{/yellow-fg}';
            lastIndex = regex.lastIndex;
          }
          res += item.substring(lastIndex);
          if (item === current_namespace) {
            res = `{blue-fg}${res}{/blue-fg}`;
          }
          return res;
        });
      list.setItems(items);
    }

    // TODO: watch for namespaces changes when the selection list is open
    function request_namespaces() {
      return (client.openshift ? client.projects().get() : client.namespaces().get())
        .then(response => {
          namespaces = JSON.parse(response.body.toString('utf8'));
          if (namespaces.items.length === 0) {
            list_message('No available namespaces');
          } else {
            updateList();
            if (current_namespace) {
              const selected = namespaces.items
                .filter(n => n.metadata.name.includes(search.value))
                .findIndex(n => n.metadata.name === current_namespace);
              list.select(selected);
              if (selected > list.height / 2 - 1) {
                // Scroll to center the selected item
                list.childOffset += list.height / 2 - 1 | 0;
                list.scrollTo(selected);
              }
            }
            screen.render();
          }
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

    list.on('select', item => {
      if (item) {
        close_namespaces_ui();
        fulfill(blessed.helpers.cleanTags(item.getContent()));
      }
    });
  });
}

module.exports.prompt = prompt;
