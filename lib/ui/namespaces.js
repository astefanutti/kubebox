'use strict';

const blessed = require('blessed');
const { setLabel, spinner: { until } } = require('./ui');
const { scroll, throttle } = require('./blessed/scroll');

function namespaces_ui() {
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

  const list = blessed.with(scroll, throttle).list({
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

  // This is a hack to not 'rewind' the focus stack on 'blur'
  search.options.inputOnFocus = false;

  return { search, box, list };
}

function prompt(screen, client, { current_namespace, promptAfterRequest } = { promptAfterRequest: false }) {
  return new Promise(function (fulfill, reject) {
    const { search, box, list } = namespaces_ui();
    let namespaces = [], message;

    function updateList() {
      const tokens = search.value.split(/\s+/).filter(w => w);
      const items = (namespaces.items || [])
        // Token matching
        .filter(n => tokens.every(token => n.metadata.name.includes(token)))
        // Color highlighting
        .map(n => {
          const item = n.metadata.name;
          if (search.value.length === 0) {
            if (n.metadata.name === current_namespace) {
              return `{blue-fg}${item}{/blue-fg}`;
            }
            return item;
          }
          // Highlight tokens (a bitset would probably be more efficient)
          const matches = Buffer.alloc(item.length);
          // Build the matching intervals
          tokens.forEach(token => {
            const regex = new RegExp(token, 'g');
            let match;
            while ((match = regex.exec(item)) !== null) {
              matches.fill(1, match.index, match.index + token.length);
            }
          });
          // Re-assemble the final string with the tags
          let res = '', index = 0, match = false;
          for (let i = 0; i < matches.length; i++) {
            const m = matches.readUInt8(i) > 0;
            if (match == m) continue;
            res += item.substring(index, i);
            res += m ? '{yellow-fg}' : '{/yellow-fg}';
            index = i;
            match = m;
          }
          res += item.substring(index);
          // Highlight current namespace
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
      list.grabMouse = true;
      screen.render();
      search.focus();
    }

    function close_namespaces_ui() {
      box.destroy();
      screen.restoreFocus();
      screen.grabKeys = false;
      screen.grabMouse = false;
      screen.render();
    }

    function list_message(text, options = {}) {
      if (message) message.destroy();
      message = blessed.text(Object.assign({
        parent  : box,
        tags    : true,
        top     : 'center',
        left    : 'center',
        content : text,
      }, options));
    }

    // Canonical way of extending components in Blessed
    search.__oolistener = search._listener;
    search._listener = function (ch, key) {
      if (['up', 'down', 'pageup', 'pagedown', 'enter'].includes(key.name)) {
        return list.emit('keypress', ch, key);
      }
      const ret = this.__oolistener(ch, key);
      if ('escape' === key.name) {
        close_namespaces_ui();
        fulfill(current_namespace);
        return ret;
      }
      updateList();
      screen.render();
      return ret;
    };

    list.on('select', item => {
      if (item) {
        close_namespaces_ui();
        fulfill(blessed.helpers.cleanTags(item.getContent()));
      }
    });

    if (promptAfterRequest) {
      request_namespaces()
        .then(prompt_namespaces_ui)
        .catch(error => reject(error));
    } else {
      prompt_namespaces_ui();
      until(request_namespaces())
        .do(box, setLabel).spin(s => `${s} Namespaces`).done(_ => 'Namespaces')
        .catch(error => {
          list_message(`{red-fg}Error: ${error.message}{/red-fg}`);
          console.error(error.stack);
          screen.render();
        });
    }
  });
}

module.exports.prompt = prompt;
