'use strict';

// TODO: display uncaught exception in a popup
// TODO: handle current namespace deletion nicely

const blessed = require('blessed'),
      Client  = require('./client'),
      contrib = require('blessed-contrib'),
      get     = require('./http-then').get,
      os      = require('os'),
      task    = require('./task'),
      URI     = require('urijs');

const KubeConfig = require('./config/manager');

const Dashboard  = require('./ui/dashboard'),
      login      = require('./ui/login'),
      namespaces = require('./ui/namespaces');

const { isNotEmpty } = require('./util');

const { call, wait } = require('./promise');

class Kubebox {

  constructor(screen) {
    const session = {
      cancellations : new task.Cancellations(),
      namespace     : null,
      // TODO: move to Client
      apis          : [],
      get openshift() {
        return this.apis.some(path => path === '/oapi' || path === '/oapi/v1');
      }
    };

    // TODO: enable user scrolling and add timestamps
    const debug = contrib.log({
      label  : 'Debug',
      height : '100%',
      width  : '100%',
      border : 'line',
      style  : {
        fg     : 'white',
        border : { fg: 'white' }
      },
      bufferLength : 100
    });
    const log = message => new Promise(resolve => {
      debug.log(message);
      resolve();
    });

    const kube_config = new KubeConfig({ debug });
    const client = new Client();
    client.master_api = kube_config.current_context.getMasterApi();
    session.namespace = kube_config.current_context.namespace.name;

    const dashboard = new Dashboard(screen, session, client, debug);

    // FIXME: the namespace selection handle should only be active
    // when the connection is established to the cluster
    screen.key(['n'], () => {
      namespaces.prompt(screen, session, client)
        .then(namespace => {
          if (namespace === session.namespace) return;
          dashboard.reset();
          // switch dashboard to new namespace
          session.namespace = namespace;
          debug.log(`Switching to namespace ${session.namespace}`);
          screen.render();
          return dashboard.run();
        })
        .catch(error => console.error(error.stack));
    });

    screen.key(['l', 'C-l'], (ch, key) =>
      logging().catch(error => console.error(error.stack))
    );

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
        controlKeys : true
      }
    );
    carousel.start();

    // TODO: display login prompt with message on error
    if (client.master_api) {
      connect().catch(error => console.error(error.stack));
    } else {
      logging().catch(error => console.error(error.stack));
    }

    function connect(login) {
      // TODO: log more about client access workflow and info
      return get(client.get_apis())
        .then(response => session.apis = JSON.parse(response.body.toString('utf8')).paths)
        .catch(error => debug.log(`Unable to retrieve available APIs: ${error.message}`))
        .then(_ => session.namespace
          ? Promise.resolve(session.namespace)
          : namespaces.prompt(screen, session, client, { promptAfterRequest : true })
            .then(namespace => session.namespace = namespace))
        .then(dashboard.run)
        .catch(error => error.response && [401, 403].includes(error.response.statusCode)
          ? log(`Authentication required for ${client.url} (openshift)`)
            .then(_ => login ? authenticate(login).then(_ => connect()) : logging())
          : Promise.reject(error));
    }

    function logging() {
      return login.prompt(screen, kube_config)
        // it may be better to reset the dashboard when authentication has succeeded
        .then(call(dashboard.reset))
        .then(updateSessionAfterLogin)
        .then(connect);
    }

    function authenticate(login) {
      if (!session.openshift)
        return Promise.reject(Error(`No authentication available for: ${client.url}`));

      return (isNotEmpty(login.token) ? Promise.resolve(login.token)
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
          .then(response => JSON.parse(response.body.toString('utf8'))))
        // else reauthenticate
        .catch(error => error.response && error.response.statusCode === 401
            ? log(`Authentication failed for ${client.url} (openshift)!`)
                // throttle reauthentication
                .then(wait(1000))
                .then(logging)
            : Promise.reject(error));
    }

    function updateSessionAfterLogin(login) {
      kube_config.updateOrInsertContext(login);
      client.master_api = kube_config.current_context.getMasterApi();
      session.namespace = kube_config.current_context.namespace.name;
      return login;
    }
  }
}

module.exports = Kubebox;
