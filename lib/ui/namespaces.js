'use strict';

const blessed = require('blessed'),
      get     = require('../http-then').get,
      os      = require('os');

function namespaces_list() {
  // TODO: display a list table with some high level info about the namespaces
  const namespaces_list = blessed.list({
    top       : 'center',
    left      : 'center',
    width     : '50%',
    height    : '50%',
    label     : 'Namespaces',
    keys      : true,
    tags      : true,
    border    : { type: 'line' },
    scrollbar : {
      ch      : ' ',
      style   : { bg: 'white' },
      track   : {
        style : { bg: 'black' }
      }
    },
    style : {
      fg       : 'white',
      border   : { fg: 'white' },
      selected : { bg: 'blue' }
    }
  });

  return namespaces_list;
}

function prompt(screen, session, client) {
  return new Promise(function(fulfill, reject) {
    screen.saveFocus();
    screen.grabKeys = true;
    const list = namespaces_list();
    screen.append(list);
    list.focus();
    screen.render();

    let namespaces = [];
    // TODO: watch for namespace changes when the selection list is open
    get(session.openshift ? client.get_projects() : client.get_namespaces())
      .then(response => JSON.parse(response.body.toString('utf8')))
      // TODO: display a message in case the user has access to no namespaces
      .then(response => namespaces = response)
      .then(namespaces => list.setItems(namespaces.items.reduce((data, namespace) => {
        data.push(namespace.metadata.name === session.namespace
          ? `{blue-fg}${namespace.metadata.name}{/blue-fg}`
          : namespace.metadata.name);
        return data;
        }, [])))
      .then(() => screen.render())
      .catch(error => {
        list.detach();
        screen.render();
        reject(error);
      });

    list.on('action', (item) => {
      // Force the user to select a namespace
      if (!item && !session.namespace) {
        return;
      }
      list.detach();
      screen.restoreFocus();
      screen.grabKeys = false;
      screen.render();
    });

    list.on('cancel', () => {
      if (session.namespace) {
        fulfill(session.namespace);
      }
    });

    list.on('key q', () => {
      if (os.platform() !== 'browser') {
        process.exit(0);
      }
    });

    list.on('select', (item, i) => {
      const namespace = namespaces.items[i].metadata.name;
      fulfill(namespace);
    });
  });
}

module.exports.prompt = prompt;
