'use strict';

// TODO: display uncaught exception in a popup
// TODO: handle current namespace deletion nicely

const Client  = require('./client'),
      contrib = require('blessed-contrib'),
      get     = require('./http-then').get,
      fs      = require('fs'),
      os      = require('os'),
      path    = require('path'),
      URI     = require('urijs'),
      yaml    = require('js-yaml');

const { KubeConfig, findOrCreateContext } = require('./config/manager');

const User       = require('./config/user'),
      Namespace  = require('./config/namespace'),
      Context    = require('./config/context'),
      Cluster    = require('./config/cluster');

const Dashboard  = require('./ui/dashboard'),
      login      = require('./ui/login'),
      namespaces = require('./ui/namespaces');

const { isNotEmpty, isLocalStorageAvailable } = require('./util');

const { call, wait } = require('./promise');

class Kubebox {

  constructor(screen) {
    let current_namespace;
    const { debug, log } = require('./ui/debug');
    const kube_config    = getKubeConfig(debug);
    const client         = new Client();
    client.master_api    = kube_config.current_context.getMasterApi();
    current_namespace    = kube_config.current_context.namespace.name;

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
    if (typeof client.master_api !== 'undefined') {
      connect(kube_config.current_context.user);
    } else {
      logging().catch(error => console.error(error.stack));
    }

    function connect(login) {
      // TODO: log more about client access workflow and info
      return get(client.get_apis())
        .then(response => client.apis = JSON.parse(response.body.toString('utf8')).paths)
        .catch(error => debug.log(`Unable to retrieve available APIs: ${error.message}`))
        .then(_ => current_namespace
          ? Promise.resolve(current_namespace)
          : namespaces.prompt(screen, client, { promptAfterRequest : true })
            .then(namespace => current_namespace = namespace))
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

    function getKubeConfig(debug) {
      const local_storage   = isLocalStorageAvailable() && localStorage.getItem('.kube-config');
      if (local_storage) {
        try {
          return new KubeConfig(JSON.parse(localStorage.getItem('.kube-config'), (key, value) => {
            switch(key) {
              case 'cluster':
                return new Cluster(value);
              case 'user':
                return new User(value);
              case 'namespace':
                return new Namespace(value.name);
              case 'context':
              case 'current_context':
                return new Context(value);
              case 'contexts':
                const contexts = [];
                value.forEach(function(element){
                  contexts.push(new Context(element));
                });
                return contexts;
              case '':
                return new KubeConfig(value);  
              default:
                return value;
            }
          }
          ));
        } catch( error ) { 
          localStorage.removeItem('.kube-config');
          debug.log(`Unable to load '.kube-config' from local storage: ${error}`);  
        }
      }

      const kube_config     = loadKubeConfig({ debug });
      const contexts        = loadContexts(kube_config);
      // TODO: support client access information provided as CLI options
      //       CLI option -> Kube config context -> prompt user
      // see:
      // - http://kubernetes.io/docs/user-guide/accessing-the-cluster/
      // - http://kubernetes.io/docs/user-guide/kubeconfig-file/
      const url             = process.argv[2] || process.env.KUBERNETES_MASTER;
      const current_context = url ? findOrCreateContext(contexts, { url }) : contexts.find(context => context.name === kube_config['current-context']) || Context.default;
      return new KubeConfig({ contexts, current_context });
    }

    function loadKubeConfig({ debug }) {
      if (os.platform() === 'browser') {
        return [];    
      }
      const config_path = path.join(os.homedir(), '.kube/config');
      try {
        fs.accessSync(config_path, fs.constants.F_OK | fs.constants.R_OK);
      } catch (error) {
        debug.log(`Unable to read Kube config file from: ${config_path}`);
        return [];
      }
      return yaml.safeLoad(fs.readFileSync(config_path, 'utf8'));
    }

    function loadContexts(kube_config) {
      const users    = [];
      const clusters = [];
      const contexts = [];
      if (kube_config.users) {
        // TODO: use spread properties when its browsers and Node support becomes mainstream
        kube_config.users.forEach(user => users.push(new User(Object.assign({ name: user.name }, user.user))));
      }
      if (kube_config.clusters) {
        // TODO: use spread properties when its browsers and Node support becomes mainstream
        kube_config.clusters.forEach(cluster => clusters.push(
          new Cluster(Object.assign({ server: cluster.cluster.server, name: cluster.name }, cluster.cluster))
        ));
      }
      if (kube_config.contexts) {
        kube_config.contexts.forEach(context => contexts.push(new Context({
          cluster   : clusters.find(cluster => cluster.name === context.context.cluster),
          namespace : new Namespace(context.context.namespace),
          user      : users.find(user => user.name === context.context.user),
          name      : context.name
        })));
      }
      return contexts;
    }    

    function authenticate(login) {
      if (!client.openshift)
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
      if (isLocalStorageAvailable()) {
        localStorage.setItem('.kube-config', JSON.stringify(kube_config));
      }
      client.master_api = kube_config.current_context.getMasterApi();
      current_namespace = kube_config.current_context.namespace.name;
      return login;
    }
  }
}

module.exports = Kubebox;
