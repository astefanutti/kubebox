'use strict';

const blessed = require('blessed'),
      os      = require('os'),
      spinner = require('./spinner');

function namespaces_list(screen) {
  // TODO: display a list table with some high level info about the namespaces
  const namespaces_list = blessed.list({
    screen    : screen,
    top       : 'center',
    left      : 'center',
    width     : '50%',
    height    : '50%',
    label     : 'Namespaces',
    keys      : true,
    tags      : true,
    mouse     : true,
    border    : { type: 'line' },
    scrollbar : {
      ch      : ' ',
      style   : { bg: 'white' },
      track   : {
        style : { bg: 'grey' },
      }
    },
    style : {
      fg       : 'white',
      label    : { bold: true },
      border   : { fg: 'white' },
      selected : { bg: 'blue' },
    }
  });

  return namespaces_list;
}

function prompt(screen, client, { current_namespace, promptAfterRequest } = { promptAfterRequest : false }) {
  return new Promise(function(fulfill, reject) {
    const list = namespaces_list(screen);
    const { until } = spinner(screen);
    let namespaces = [], message;

    // TODO: watch for namespaces changes when the selection list is open
    function request_namespaces() {
      return (client.openshift ? client.projects().get() : client.namespaces().get())
        .then(response => JSON.parse(response.body.toString('utf8')))
        .then(response => namespaces = response)
        .then(namespaces => namespaces.items.length === 0
          ? list_message('No available namespaces')
          : list.setItems(namespaces.items.reduce((data, namespace) => {
            data.push(namespace.metadata.name === current_namespace
              ? `{blue-fg}${namespace.metadata.name}{/blue-fg}`
              : namespace.metadata.name);
            return data;
            }, [])))
        .then(() => screen.render());
    }

    function prompt_namespaces_list() {
      screen.saveFocus();
      screen.grabKeys = true;
      screen.grabMouse = true;
      screen.append(list);
      list.focus();
      list.grabMouse = true;
      screen.render();
    }

    function close_namespaces_list() {
      list.detach();
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
        .then(prompt_namespaces_list)
        .catch(error => reject(error));
    } else {
      prompt_namespaces_list();
      until(request_namespaces())
        .spin(s => list.setLabel(`${s} Namespaces`))
        .then(_ => list.setLabel('Namespaces'))
        .catch(error => {
          close_namespaces_list();
          reject(error);
        });
    }

    list.on('cancel', () => {
      close_namespaces_list();
      fulfill(current_namespace);
    });

    list.on('key q', () => {
      if (os.platform() !== 'browser') {
        process.exit(0);
      }
    });

    list.on('select', (item, i) => {
      close_namespaces_list();
      if (item) {
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
