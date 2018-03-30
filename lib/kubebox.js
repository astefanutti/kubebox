'use strict';

// TODO: display uncaught exception in a popup
// TODO: handle current namespace deletion nicely

const Client       = require('./client'),
      blessed      = require('blessed'),
      EventEmitter = require('events'),
      get          = require('./http-then').get,
      os           = require('os'),
      task         = require('./task'),
      URI          = require('urijs');

const { Cluster, Context, KubeConfig, Namespace, User } = require('./config/config');
const { Dashboard, login, namespaces, NavBar, spinner } = require('./ui/ui');
const { isNotEmpty, isEmpty } = require('./util');
const { call, wait } = require('./promise');

// runtime fixes for Blessed
require('./ui/blessed/patches');

class Kubebox extends EventEmitter {

  constructor(screen, server) {
    super();
    const kubebox = this;
    const cancellations = new task.Cancellations();
    const { debug, log } = require('./ui/debug')(screen);
    const { until } = spinner(screen);
    const CORS = os.platform() === 'browser' && !server;

    let kube_config, current_namespace;
    const client = new Client();
    if (server) {
      client.master_api = server;
    } else {
      kube_config = new KubeConfig({ debug });
      this.loadKubeConfig = config => kube_config.loadFromConfig(config);
      client.master_api = kube_config.current_context.getMasterApi();
      current_namespace = kube_config.current_context.namespace.name;
    }

    const navbar = new NavBar(screen);

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

    const dashboard = new Dashboard({ screen, navbar, status, client, debug });

    navbar.add({
      name   : 'Namespace',
      render : screen => {
        dashboard.render();
        screen.append(status);
      }
    }, { select: true });
    navbar.add({
      name   : 'Debug',
      render : screen => {
        screen.append(debug);
        debug.focus();
        debug.setScrollPerc(100);
        screen.append(status);
      }
    });

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

    function error(message) {
      const err = Error(message);
      err.name = 'Kubebox';
      return err;
    }

    function fail(options = {}) {
      return error => {
        debug.log(`{red-fg}${error.name === 'Kubebox' ? error.message : error.stack}{/red-fg}`);
        return logging(Object.assign({}, options, { message: `{red-fg}${error.message}{/red-fg}` }))
          .catch(fail(options));
      }
    }

    screen.key(['l', 'C-l'], (ch, key) => logging({ closable: true })
      .catch(fail({ closable: true })));

    if (typeof client.master_api !== 'undefined') {
      connect(kube_config ? kube_config.current_context.user : null).catch(fail());
    } else {
      logging().catch(fail());
    }

    function connect(login, options = {}) {
      if (login) debug.log(`Connecting to ${client.url} ...`);
      const { promise, cancellation } = get(client.get_api(), { cancellable: true });
      cancellations.add('connect', () => {
        if (cancellation()) debug.log(`{grey-fg}Cancelled connection to ${client.url}{/grey-fg}`);
      });
      return until(promise
        // We may want to update the master URL based on federation information
        // by selecting the server whose client CIDR matches the client IP (serverAddressByClientCIDRs)
        .then(() => login ? log(`{green-fg}Connected to {bold}${client.url}{/bold}{/green-fg}`) : '')
        // Work-around CORS issue where authorization header triggers a pre-flight check that returns 302 which is not allowed
        .then(() => get(client.get_apis({ authorization: !CORS })))
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
        return Promise.reject(error(`Authentication failed for ${client.url}`));
      // password takes precedence over token
      return (isNotEmpty(login.token) && isEmpty(login.password) ? Promise.resolve(login.token)
        // try retrieving an OAuth access token from the OpenShift OAuth server
        : CORS
          ? get(client.oauth_authorize_web(login))
            .then(response => {
              const path = URI.parse(response.url).path;
              if (response.statusCode === 200 && path === '/oauth/token/display') {
                return response.body.toString('utf8').match(/<code>(.*)<\/code>/)[1];
              } else if (path === '/login') {
                const error = error('Authentication failed!');
                // fake authentication error to emulate the implicit grant flow
                response.statusCode = 401;
                error.response = response;
                throw error;
              } else {
                throw error('Unsupported authentication!');
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

    function updateSessionAfterLogin(login) {
      if (kube_config) {
        // TODO: we may want to store / update the retrieved tokens
        // (in memory / into the Web browser local store)
        kube_config.updateOrInsertContext(login);
        client.master_api = kube_config.current_context.getMasterApi();
        current_namespace = kube_config.current_context.namespace.name;
      } else {
        current_namespace = null;
      }
      delete client.headers['Authorization'];
      return login;
    }
  }
}

module.exports = Kubebox;
