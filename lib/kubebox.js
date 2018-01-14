'use strict';

// TODO: display uncaught exception in a popup
// TODO: handle current namespace deletion nicely

const Client       = require('./client'),
      blessed      = require('blessed'),
      contrib      = require('blessed-contrib'),
      EventEmitter = require('events'),
      get          = require('./http-then').get,
      os           = require('os'),
      spinner      = require('./ui/spinner'),
      task         = require('./task'),
      Exec         = require('./ui/exec'),
      URI          = require('urijs');      
const { Cluster, Context, KubeConfig, Namespace, User } = require('./config/config');
const { Dashboard, login, namespaces } = require('./ui/ui');
const { isNotEmpty, isEmpty } = require('./util');
const { call, wait } = require('./promise');

// runtime fixes for Blessed
require('./ui/blessed/patches');

class Kubebox extends EventEmitter {

  constructor(screen, server) {
    super();
    const kubebox = this;
    const cancellations = new task.Cancellations();
    const { debug, log } = require('./ui/debug');
    const { until } = spinner(screen);
    const kube_config = new KubeConfig({ debug, server });
    this.loadKubeConfig = config => kube_config.loadFromConfig(config);

    const client = new Client();
    client.master_api = kube_config.current_context.getMasterApi();
    let current_namespace = kube_config.current_context.namespace.name;

    const dashboard = new Dashboard(screen, client, debug);

    // FIXME: the namespace selection handle should only be active
    // when the connection is established to the cluster
    screen.key(['n'], () => {
      namespaces.prompt(screen, client, { current_namespace })
        .then(namespace => {
          if (namespace === current_namespace) return;
          dashboard.reset();
          // switch dashboard to new namespace
          current_namespace = namespace;
          debug.log(`Switching to namespace ${current_namespace}`);
          screen.render();
          return dashboard.run(current_namespace);
        })
        .catch(error => console.error(error.stack));
    });

    screen.key(['l', 'C-l'], (ch, key) => logging({ closable: true, server })
      .catch(error => console.error(error.stack)));

    const menu = blessed.text({
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

    const status = blessed.text({
      tags    : true,
      width   : '100%',
      height  : 1,
      bottom  : 0,
      padding : {
        left  : 1,
        right : 1,
      },
      style : {
        fg : 'grey',
        bg : 'white',
      }
    });

    const carousel = new contrib.carousel(
      [
        screen => {
          screen.append(menu);
          tabs.select(0);
          dashboard.render();
          screen.append(status);
        },
        screen => {
          screen.append(menu);
          tabs.select(1);
          screen.append(debug);
          debug.focus();
          debug.setScrollPerc(100);
          screen.append(status);
        }
      ],
      {
        screen      : screen,
        interval    : 0,
        controlKeys : true,
      }
    );
    carousel.start();

    tabs.add('Namespace', () => {
      carousel.currPage = 0;
      carousel.move();
    });
    tabs.add('Debug', () => {
      carousel.currPage = 1;
      carousel.move();
    });

    dashboard.on('exec', (namespace, pod, container) => {
      // check if connection already exists
      const user = kube_config.current_context.user.username;
      const id = namespace + pod + container;
      function wsexecExists (_function) {
        if (!_function.id)
          return false;
        return _function.id === id;
      }
      const index = carousel.pages.findIndex((wsexecExists));
      if (index >= 0) {
        carousel.currPage = index;
        carousel.move();
        return;
      }
      
      // connect
      const exec = new Exec(screen, namespace, pod, container, user);
      const { promise, cancellation, sendData, getSocket} = get(client.exec(namespace, pod, { container, command: ['/bin/sh', '-c', `TERM=${exec.termName()} sh`] }), { stream: () => exec.print() });
      promise
        .then(() => debug.log(`{grey-fg}Remote shell in container: '${container}', pod: '${pod}' and namespace: '${namespace}' with user '${user}'{/grey-fg}...`))
        .then(() => {
          exec.sendData = sendData;
          const exit = () => {
            const index = carousel.pages.findIndex((wsexecExists));
            if (index >= 0)
              carousel.pages.splice(index, 1);
            cancellation();
            exec.kill();
            tabs.removeItem(index);
            // fix for listBar#removeItem
            tabs.commands.forEach( (command, index) =>{
              command.prefix = index + 1;
              command.element.content = `{#888-fg}${command.prefix}{/#888-fg}:${command.text}`
            });
            tabs.render();
            carousel.home();
          };
          if (os.platform() === 'browser') {
            getSocket().addEventListener('close', () => {
              exit();
            });
            getSocket().addEventListener('error', () => {
              exit();
            });
            // TODO: implement timeout for browser
          } else {
            getSocket().on('close', () => {
              exit();
            });
            getSocket().on('end', () => {
              exit();
            });
            getSocket().on('error', () => {
              exit();
            });
            getSocket().on('timeout', () => {
              sendData(Buffer.alloc(1));
            });
          }
          tabs.add(container, () => {
            // search index again as tabs may have changed
            const index = carousel.pages.findIndex((wsexecExists));
            carousel.currPage = index;
            carousel.move();
          });  
          const showExec = () => {
            screen.append(menu);
            const index = carousel.pages.findIndex((wsexecExists));
            tabs.select(index);
            exec.render();
          }
          showExec.id = id;
          carousel.pages.push(showExec);
          carousel.end();
        })
        .catch(error => console.error(error.stack));
    });

    // TODO: display login prompt with message on error
    if (typeof client.master_api !== 'undefined') {
      connect(kube_config.current_context.user, { server })
        .catch(error => console.error(error.stack));
    } else {
      if (server) {
        status.setContent(`{blue-fg}ℹ{/blue-fg} Log in to {bold}${server}{/bold}...`);
      }
      logging({ closable: false, server })
        .catch(error => console.error(error.stack));
    }

    function connect(login, options = {}) {
      if (login) debug.log(`Connecting to ${client.url} ...`);
      const { promise, cancellation } = get(client.get_api(), { cancellable: true });
      cancellations.add('connect', () => {
        if (cancellation()) debug.log(`{grey-fg}Cancelled connection to ${client.url}{/grey-fg}`);
      });
      return until(promise
        // update the master URL based on federation information
        // TODO: select the server whose client CIDR matches the client IP
        .then(response => client.url = `${client.master_api.protocol}//${JSON.parse(response.body.toString('utf8')).serverAddressByClientCIDRs[0].serverAddress}`)
        .then(() => login ? log(`{green-fg}Connected to {bold}${client.url}{/bold}{/green-fg}`) : '')
        .then(() => get(client.get_apis()))
        .then(response => client.apis = JSON.parse(response.body.toString('utf8')).paths)
        .then(() => current_namespace
          ? Promise.resolve(current_namespace)
          : namespaces.prompt(screen, client, { promptAfterRequest : true })
            .then(namespace => current_namespace = namespace))
        .then(dashboard.run))
        .spin(s => status.setContent(`${s} Connecting to {bold}${client.url}{/bold}${options.user ? ` as {bold}${options.user.metadata.name}{/bold}` : ''}...`))
          .cancel(c => cancellations.add('connect', c))
          .succeed(s => status.setContent(`${s} Connected to {bold}${client.url}{/bold}${options.user ? ` as {bold}${options.user.metadata.name}{/bold}` : ''}`))
          .fail(s => status.setContent(`${s} Connecting to {bold}${client.url}{/bold}${options.user ? ` as {bold}${options.user.metadata.name}{/bold}` : ''}`))
        .catch(error => error.response && [401, 403].includes(error.response.statusCode)
          ? log(`Authentication required for ${client.url}`)
            .then(() => login
              ? until(authenticate(login))
                  .spin(s => status.setContent(`${s} Authenticating to {bold}${client.url}{/bold}...`))
                    .cancel(c => cancellations.add('connect', c))
                    .succeed(s => status.setContent(`${s} Authenticated to {bold}${client.url}{/bold}`))
                    .fail(s => status.setContent(`${s} Authenticating to {bold}${client.url}{/bold}`))
                  .then(user => log(`{green-fg}Authenticated as {bold}${user.metadata.name}{/bold}{/green-fg}`)
                    .then(() => connect(null, Object.assign({}, options, { user: user }))))
                  .catch(error => error.response && error.response.statusCode === 401
                    ? log(`{red-fg}Authentication failed for ${client.url}{/red-fg}`)
                        // throttle reauthentication
                        .then(wait(100))
                        .then(() => logging(Object.assign({}, options, { message: `{red-fg}Authentication failed for ${client.url}{/red-fg}` })))
                    : Promise.reject(error))
              : logging(options))
          : error.message
            ? log(`{red-fg}Connection failed to ${client.url}{/red-fg}`)
                // throttle reconnection
                .then(wait(100))
                .then(() => logging(Object.assign({}, options, { message: os.platform() === 'browser'
                  // Fetch and XHR API do not expose connection network error details :(
                  ? `{red-fg}Connection failed to ${client.url}{/red-fg}`
                  : `{red-fg}${error.message}{/red-fg}` })))
            : Promise.reject(error));
    }

    function logging(options = { closable: false }) {
      cancellations.run('logging');
      const { promise, cancellation } = login.prompt(screen, kube_config, kubebox, options);
      cancellations.add('logging', cancellation);
      return promise
        .then(call(_ => {
          cancellations.run('connect');
          // it may be better to reset the dashboard when authentication has succeeded
          dashboard.reset();
        }))
        .then(updateSessionAfterLogin)
        .then(login => connect(login, Object.assign({}, options, { closable: false })));
    }

    function authenticate(login) {
      if (!client.openshift)
        return Promise.reject(Error(`No authentication available for: ${client.url}`));
      // password takes precedence over token
      return (isNotEmpty(login.token) && isEmpty(login.password) ? Promise.resolve(login.token)
        // try retrieving an OAuth access token from the OpenShift OAuth server
        : os.platform() === 'browser'
          ? get(client.oauth_authorize_web(login))
            .then(response => {
              const path = URI.parse(response.url).path;
              if (response.statusCode === 200 && path === '/oauth/token/display') {
                return response.body.toString('utf8').match(/<code>(.*)<\/code>/)[1];
              } else if (path === '/login') {
                const error = Error('Authentication failed!');
                // fake authentication error to emulate the implicit grant flow
                response.statusCode = 401;
                error.response = response;
                throw error;
              } else {
                throw Error('Unsupported authentication!');
              }
            })
          : get(client.oauth_authorize(login))
            .then(response => response.headers.location.match(/access_token=([^&]+)/)[1]))
        // test it authenticates ok
        .then(token => get(client.get_user(token))
          // then set the authorization header
          .then(call(_ => client.headers['Authorization'] = `Bearer ${token}`))
          // and return user details
          .then(response => JSON.parse(response.body.toString('utf8'))));
    }

    // TODO: we may want to store / update the retrieved tokens into the Web browser local store
    function updateSessionAfterLogin(login) {
      kube_config.updateOrInsertContext(login);
      client.master_api = kube_config.current_context.getMasterApi();
      current_namespace = kube_config.current_context.namespace.name;
      return login;
    }
  }
}

module.exports = Kubebox;
