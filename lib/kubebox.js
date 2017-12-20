'use strict';

// TODO: display uncaught exception in a popup
// TODO: handle current namespace deletion nicely

const Client       = require('./client'),
      contrib      = require('blessed-contrib'),
      EventEmitter = require('events'),
      get          = require('./http-then').get,
      os           = require('os'),
      task         = require('./task'),
      URI          = require('urijs');

const { Cluster, Context, KubeConfig, Namespace, User } = require('./config/config');
const { Dashboard, login, namespaces } = require('./ui/ui');
const { isNotEmpty, isEmpty } = require('./util');
const { call, wait } = require('./promise');

class Kubebox extends EventEmitter {

  constructor(screen, server) {
    super();
    const kubebox = this;
    const cancellations = new task.Cancellations();
    const { debug, log } = require('./ui/debug');
    const kube_config = new KubeConfig({ debug });
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

    const carousel = new contrib.carousel(
      [
        screen => {
          dashboard.render();
        },
        screen => {
          screen.append(debug);
          debug.setScrollPerc(100);
        }
      ],
      {
        screen      : screen,
        interval    : 0,
        controlKeys : true,
      }
    );
    carousel.start();

    // TODO: display login prompt with message on error
    if (typeof client.master_api !== 'undefined') {
      connect(kube_config.current_context.user, { server })
        .catch(error => console.error(error.stack));
    } else {
      logging({ closable: false, server })
        .catch(error => console.error(error.stack));
    }

    function connect(login, options = {}) {
      if (login) debug.log(`Connecting to ${client.url} ...`);
      const { promise, cancellation } = get(client.get_api(), { cancellable: true });
      cancellations.add('connect', () => {
        if (cancellation()) debug.log(`{grey-fg}Cancelled connection to ${client.url}{/grey-fg}`);
      });
      return promise
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
        .then(dashboard.run)
        .catch(error => error.response && [401, 403].includes(error.response.statusCode)
          ? log(`Authentication required for ${client.url}`)
            .then(() => login
              ? authenticate(login)
                  .then(user => log(`{green-fg}Authenticated as {bold}${user.metadata.name}{/bold}{/green-fg}`))
                  .then(() => connect(null, options))
                  .catch(error => error.response && error.response.statusCode === 401
                    ? log(`{red-fg}Authentication failed for ${client.url}{/red-fg}`)
                        // throttle reauthentication
                        .then(wait(1000))
                        .then(() => logging(Object.assign({}, options, { message: `{red-fg}Authentication failed for ${client.url}{/red-fg}` })))
                    : Promise.reject(error))
              : logging(options))
          : error.message
            ? log(`{red-fg}Connection failed to ${client.url}{/red-fg}`)
                // throttle reconnection
                .then(wait(1000))
                .then(() => logging(Object.assign({}, options, { message: os.platform() === 'browser'
                  // Fetch and XHR API do not expose connection network error details :(
                  ? `{red-fg}Connection failed to ${client.url}{/red-fg}`
                  : `{red-fg}${error.message}{/red-fg}` })))
            : Promise.reject(error));
    }

    function logging(options = { closable: false }) {
      return login.prompt(screen, kube_config, kubebox, options)
        .then(call(_ => {
          cancellations.run('connect');
          // it may be better to reset the dashboard when authentication has succeeded
          dashboard.reset();
        }))
        .then(updateSessionAfterLogin)
        // TODO: add a modal that displays the connection status
        .then(login => connect(login, Object.assign(options, { closable: false })));
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

    function updateSessionAfterLogin(login) {
      kube_config.updateOrInsertContext(login);
      client.master_api = kube_config.current_context.getMasterApi();
      current_namespace = kube_config.current_context.namespace.name;
      return login;
    }
  }
}

module.exports = Kubebox;
