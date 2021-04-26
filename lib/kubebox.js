'use strict';

// TODO: display uncaught exception in a popup
// TODO: handle current namespace deletion nicely

// runtime fixes for Blessed
require('./ui/blessed/patches');

const Client       = require('./client'),
      blessed      = require('blessed'),
      EventEmitter = require('events'),
      os           = require('os'),
      task         = require('./task'),
      URI          = require('urijs');

const { KubeConfig } = require('./config/config');
const { Dashboard, login, namespaces, NavBar, spinner: { until }, setContent } = require('./ui/ui');
const { SelectEvent } = require('./ui/navbar');
const { isNotEmpty, isEmpty, safeGet } = require('./util');
const { call, log, pause, wait } = require('./promise');
const { error } = require('./error');

const isWebBrowser = os.platform() === 'browser';

class Kubebox extends EventEmitter {

  constructor(screen, server) {
    super();
    const kubebox = this;
    const cancellations = new task.Cancellations();
    const CORS = isWebBrowser && !server;

    let kube_config, current_namespace;
    const client = new Client();
    if (server) {
      client.master_api = server;
    } else {
      kube_config = new KubeConfig();
      this.loadKubeConfig = config => kube_config.loadFromConfig(config);
      if (kube_config.current_context) {
        client.master_api = kube_config.current_context.getMasterApi();
        current_namespace = safeGet(kube_config.current_context, 'namespace.name');
      }
    }

    // Redirect console logging
    const logs = require('./ui/console');

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
      },
    });

    const navbar = new NavBar(screen);
    const dashboard = new Dashboard({ screen, navbar, status, client });

    const page = navbar.add({ title: 'Pods', listener: dashboard }, { select: true });

    navbar.add({
      id       : 'console',
      title    : 'Console',
      listener : new EventEmitter()
        .on(SelectEvent, ({ screen }) => {
          screen.append(logs);
          screen.append(status);
          logs.focus();
          screen.render();
        }),
    });

    // Focus management
    screen.key(['tab', 'S-tab'], function (_, key) {
      if (key.shift) {
        screen.focusPrevious();
      } else {
        screen.focusNext();
      }
    });

    // FIXME: the namespace selection handle should only be active
    // when the connection is established to the cluster
    screen.key(['n'], () => {
      namespaces.prompt(screen, client, { current_namespace })
        .then(namespace => {
          if (!namespace || namespace === current_namespace) return;
          dashboard.reset(page);
          // switch dashboard to new namespace
          current_namespace = namespace;
          console.log(`Switching to namespace ${current_namespace}`);
          screen.render();
          return dashboard.run(current_namespace);
        })
        .catch(error => console.error(error.stack));
    });

    function fail(options = {}) {
      return error => {
        console.error(`${error.name === 'Kubebox' ? error.message : error.stack}`);
        if (error.name !== 'Kubebox' && isWebBrowser) {
          console.error(error);
        }
        return logging(Object.assign({}, options, { message: `{red-fg}${error.message}{/red-fg}` }))
          .catch(error => pause(1000, error).then(fail(options)));
      }
    }

    screen.key(['l', 'C-l'], (ch, key) => logging({ closable: true })
      .catch(fail({ closable: true })));

    if (typeof client.master_api !== 'undefined') {
      connect(safeGet(kube_config, 'current_context', 'user')).catch(fail());
    } else {
      logging().catch(fail());
    }

    function connect(login, options = {}) {
      if (login) console.log(`Connecting to ${client.url} ...`);
      const { promise, cancellation } = client.api().get({ cancellable: true });
      cancellations.add('connect', () => {
        if (cancellation()) console.debug(`Cancelled connection to ${client.url}`);
      });
      return until(promise
        // we may want to update the master URL based on federation information by selecting the server whose client CIDR matches the client IP (serverAddressByClientCIDRs)
        .then(() => login ? log(`{green-fg}Connected to {bold}${client.url}{/bold}{/green-fg}`) : '')
        // work-around CORS issue where authorization header triggers a pre-flight check that returns 302 which is not allowed
        .then(() => client.paths({ authorization: !CORS }).get()
          // try getting master API paths
          .then(response => client._paths = JSON.parse(response.body.toString('utf8')).paths)
          .catch(error => error.response && [401, 403].includes(error.response.statusCode)
            ? Promise.resolve()
            : Promise.reject(error)))
        .then(() => current_namespace || namespaces
          .prompt(screen, client, { promptAfterRequest: true })
          .then(namespace => namespace
            ? current_namespace = namespace
            : Promise.reject()))
        .then(dashboard.run))
        .do(status, setContent)
        .spin(s => `${s} Connecting to {bold}${client.url}{/bold}${options.user ? ` as {bold}${options.user.metadata.name}{/bold}` : ''}...`)
        .succeed(s => `${s} Connected to {bold}${client.url}{/bold}${options.user ? ` as {bold}${options.user.metadata.name}{/bold}` : ''}`)
        .fail(s => `${s} Connecting to {bold}${client.url}{/bold}${options.user ? ` as {bold}${options.user.metadata.name}{/bold}` : ''}`)
        .cancel(c => cancellations.add('connect', c))
        .catch(error => {
          if (!error) {
            return logging(Object.assign({}, options, { message: '' }));
          }

          if (error.response && [401, 403].includes(error.response.statusCode)) {
            return log(`Authentication required for ${client.url}`)
              .then(() => login
                ? until(authenticate(login))
                  .do(status, setContent)
                  .spin(s => `${s} Authenticating to {bold}${client.url}{/bold}...`)
                  .succeed(s => `${s} Authenticated to {bold}${client.url}{/bold}`)
                  .fail(s => `${s} Authenticating to {bold}${client.url}{/bold}`)
                  .cancel(c => cancellations.add('connect', c))
                  .then(user => log(`{green-fg}Authenticated as {bold}${user.metadata.name}{/bold}{/green-fg}`)
                    .then(() => connect(null, Object.assign({}, options, { user: user }))))
                  .catch(error => error.response && [401, 403, 404].includes(error.response.statusCode)
                    ? log(`{red-fg}Authentication failed for ${client.url}{/red-fg}`)
                      // throttle reauthentication
                      .then(wait(100))
                      .then(() => logging(Object.assign({}, options, { message: `{red-fg}Authentication failed for ${client.url}{/red-fg}` })))
                    : Promise.reject(error))
                : logging(options))
          }

          if (error.message) {
            return log(`{red-fg}Connection failed to ${client.url}{/red-fg}`)
              // throttle reconnection
              .then(wait(100))
              .then(() => logging(Object.assign({}, options, {
                message: isWebBrowser
                  // fetch and XHR API do not expose connection network error details :(
                  ? `{red-fg}Connection failed to ${client.url}{/red-fg}`
                  : `{red-fg}${error.message}{/red-fg}`
              })))
          }
        });
    }

    function logging(options = { closable: false }) {
      cancellations.run('logging');
      const { promise, cancellation } = login.prompt(screen, kube_config, kubebox, options);
      cancellations.add('logging', cancellation);
      return promise
        .then(call(_ => {
          cancellations.run('connect');
          dashboard.reset(page);
        }))
        .then(updateSessionAfterLogin)
        .then(login => connect(login, Object.assign({}, options, { closable: false })));
    }

    function authenticate(login) {
      delete client.headers['Authorization'];
      let promise;
      if (isNotEmpty(login.token) && isEmpty(login.password)) {
        // password takes precedence over token
        promise = Promise.resolve(login.token);
      } else if (CORS) {
        // try retrieving an OAuth access token from the OAuth server
        promise = client.oauth_authorize_web(login).get()
        .then(response => {
          const path = URI.parse(response.url).path;
          if (response.statusCode === 200 && path === '/oauth/token/display') {
            return response.body.toString('utf8').match(/<code>(.*)<\/code>/)[1];
          } else if (path === '/login') {
            const err = error('Authentication failed!');
            // fake authentication error to emulate the implicit grant flow
            response.statusCode = 401;
            err.response = response;
            throw err;
          } else {
            throw error('Unsupported authentication!');
          }
        });
      } else {
        promise = client.oauth_authorize(login).get()
          .then(response => response.headers.location.match(/access_token=([^&]+)/)[1]);
      }

      // test it authenticates ok
      return promise.then(token => client.user(token).get()
        // then set the authorization header
        .then(call(_ => client.headers['Authorization'] = `Bearer ${token}`))
        // and return user details
        .then(response => JSON.parse(response.body.toString('utf8'))));
    }

    function updateSessionAfterLogin(login) {
      if (kube_config) {
        // TODO: we may want to store / update the retrieved tokens (in memory / into the Web browser local store)
        kube_config.updateOrInsertContext(login);
        client.master_api = kube_config.current_context.getMasterApi();
        current_namespace = safeGet(kube_config.current_context, 'namespace', 'name');
      } else {
        current_namespace = null;
      }
      if (isNotEmpty(login.token) && isEmpty(login.password)) {
        client.headers['Authorization'] = `Bearer ${login.token}`;
      } else if (isNotEmpty(login.username) && isNotEmpty(login.password)) {
        client.headers['Authorization'] = `Basic ${Buffer.from(`${login.username}:${login.password}`).toString('base64')}`;
      } else {
        delete client.headers['Authorization'];
      }
      return login;
    }
  }
}

module.exports = Kubebox;
