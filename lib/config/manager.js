'use strict';

const EventEmitter = require('events'),
      fs           = require('fs'),
      os           = require('os'),
      path         = require('path'),
      URI          = require('urijs'),
      yaml         = require('js-yaml');

const User      = require('./user'),
      Namespace = require('./namespace'),
      Context   = require('./context'),
      Cluster   = require('./cluster');

const { isNotEmpty, isLocalStorageAvailable } = require('../util');

class KubeConfigManager extends EventEmitter {

  constructor({ debug, server }) {
    super();
    if (os.platform() === 'browser') {
      const kube_config = readKubeConfigFromLocalStore({ debug });
      this.contexts = kube_config.contexts;
      this.current_context = kube_config.current_context;
      if (server) {
        this.server = server;
        this.server_contexts = findContextsByClusterUrl(this.contexts, this.server);
        this.current_context = this.server_contexts.find(c => c.name === this.current_context.name) || Context.default;
      }
    } else {
      const kube_config = readKubeConfigFromFiles({ debug });
      this.contexts = loadContexts(kube_config);
      // TODO: support client access information provided as CLI options
      //       CLI option -> Kube config context -> prompt user
      // see:
      // - http://kubernetes.io/docs/user-guide/accessing-the-cluster/
      // - http://kubernetes.io/docs/user-guide/kubeconfig-file/
      const url = process.argv[2] || process.env.KUBERNETES_MASTER;
      if (url) {
        this.current_context = findOrCreateContext(this.contexts, { url });
      } else {
        this.current_context = this.contexts.find(context => context.name === kube_config['current-context']) || Context.default;
      }
    }
  }

  loadFromConfig(config) {
    const kube_config = yaml.safeLoad(config);
    this.contexts = loadContexts(kube_config);
    this.current_context = this.contexts.find(context => context.name === kube_config['current-context']) || Context.default;
    if (this.server) {
      this.server_contexts = findContextsByClusterUrl(this.contexts, this.server);
      this.current_context = this.server_contexts.find(c => c.name === this.current_context.name) || Context.default;
    }
    if (os.platform() === 'browser') {
      writeKubeConfigInLocalStore(this);
    }
    this.emit('kubeConfigChange');
  }

  /**
   * Switches the current_context to the next one in the array of contexts
   */
  nextContext() {
    const contexts = Array.isArray(this.server_contexts) ? this.server_contexts : this.contexts;
    const pos = contexts.indexOf(this.current_context);
    const next = (pos + 1) % contexts.length;
    this.current_context = contexts[next];
  }

  /**
   * Switches the current_context to the previous one in the array of contexts
   */
  previousContext() {
    const contexts = Array.isArray(this.server_contexts) ? this.server_contexts : this.contexts;
    const pos = contexts.indexOf(this.current_context);
    const prev = pos === 0 ? contexts.length - 1 : pos - 1;
    this.current_context = contexts[prev];
  }

  /**
   * This will create a new Context from the login form and set it as the current context.
   * If the created context already exists it will be updated instead of creating a new one.
   * @param {*} login the login form
   */
  updateOrInsertContext(login) {
    const context = findOrCreateContext(this.contexts, login);
    // add context if newly created
    if (!this.contexts.find(c => c.name === context.name)) {
      this.contexts.push(context);
      if (Array.isArray(this.server_contexts)) {
        this.server_contexts.push(context);
      }
    }
    // update context with login form information
    if (isNotEmpty(login.token)) {
      context.user.token = login.token;
    } else {
      context.user.username = login.username;
      context.user.password = login.password;
    }
    this.current_context = context;

    if (os.platform() === 'browser') {
      writeKubeConfigInLocalStore(this);
    }
  }
}

function readKubeConfigFromFiles({ debug }) {
  let files;
  if (process.env.KUBECONFIG) {
    files = process.env.KUBECONFIG.split(path.delimiter);
  } else {
    files = [path.join(os.homedir(), '.kube/config')];
  }

  return files.reduce((merged, file) => {
    try {
      fs.accessSync(file, fs.constants.F_OK | fs.constants.R_OK);
    } catch (error) {
      debug.log(`{red-fg}Unable to read Kube config file from '${file}'{/red-fg}`);
      return merged;
    }
    let config;
    try {
      config = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
    } catch (error) {
      debug.log(`{red-fg}Unable to deserialize Kube config file from '${file}': ${error.message}{/red-fg}`);
      return merged;
    }
    // Resolve pathes relative to the location of the kubeconfig file
    // See: https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/#file-references
    config.clusters.forEach(cluster => {
      const ca = cluster.cluster['certificate-authority'];
      if (ca && !path.isAbsolute(ca)) {
        cluster.cluster['certificate-authority'] = path.resolve(path.dirname(file), ca);
      }
    });
    config.users.forEach(user => {
      const cert = user.user['client-certificate'];
      if (cert && !path.isAbsolute(cert)) {
        user.user['client-certificate'] = path.resolve(path.dirname(file), cert);
      }
      const key = user.user['client-key'];
      if (key && !path.isAbsolute(key)) {
        user.user['client-key'] = path.resolve(path.dirname(file), key);
      }
    });
    // Merge kubeconfig file
    // See: https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/#merging-kubeconfig-files
    merged.clusters.push(...config.clusters.filter(cluster => !merged.clusters.find(c => c.name === cluster.name)));
    merged.contexts.push(...config.contexts.filter(context => !merged.contexts.find(c => c.name === context.name)));
    merged.users.push(...config.users.filter(user => !merged.users.find(u => u.name === user.name)));
    if (!merged['current-context']) {
      merged['current-context'] = config['current-context'];
    }
    return merged;
  }, {
    clusters : [],
    contexts : [],
    users    : [],
  });
}

function readKubeConfigFromLocalStore({ debug }) {
  const kube_config = isLocalStorageAvailable() && localStorage.getItem('.kube-config');
  if (kube_config) {
    try {
      return JSON.parse(kube_config, (key, value) => {
        switch (key) {
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
            return value.map(i => new Context(i));
          default:
            return value;
        }
      });
    } catch (error) {
      localStorage.removeItem('.kube-config');
      debug.log(`Unable to load '.kube-config' from local storage: ${error}`);
    }
  }
  return { contexts: [], current_context: Context.default };
}

function writeKubeConfigInLocalStore(kube_config) {
  if (isLocalStorageAvailable()) {
    // TODO: should be serialized as the original YAML Kube config file instead of custom JSON
    localStorage.setItem('.kube-config', JSON.stringify(kube_config,
      (name, value) => {
        switch (name) {
          case 'server_contexts':
            return undefined;
          case 'password':
            return '';
          default:
            return value;
        }
      }
    ));
  }
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
      name      : context.name,
    })));
  }
  return contexts;
}

// TODO: use rest/spread properties when its browsers and Node support becomes mainstream
function findOrCreateContext(contexts, { url, username, namespace/*, ...login*/ }) {
  const byUrl = findContextsByClusterUrl(contexts, url);
  if (byUrl.length === 1 && !username && !namespace) return byUrl[0];

  const byUser = byUrl.filter(context => context.user.username === username);
  if (byUser.length === 1 && !namespace) return byUser[0];

  const byNamespace = byUser.filter(context => context.namespace.name === namespace);
  if (byNamespace.length === 1) return byNamespace[0];

  let cluster, user;
  if (byUser.length > 0) {
    cluster = byUser[0].cluster;
    user = byUser[0].user;
  } else if (byUrl.length > 0) {
    cluster = byUrl[0].cluster;
  } else {
    cluster = new Cluster({
      server: url,
      // ...login,
    });
  }
  if (!user && username) {
    user = new User({
      name     : `${username}/${cluster.name}`,
      username : username,
      // ...login,
    });
  }
  return new Context({
    cluster,
    user      : user || User.default,
    namespace : namespace ? new Namespace(namespace) : Namespace.default,
  })
}

function findContextsByClusterUrl(contexts, url) {
  let uri = URI(url);
  if (!uri.protocol()) {
    uri = URI(`https://${url}`);
  }
  const port = uri.protocol() === 'https' ? '443' : '80';
  return contexts.filter(context => {
    const u = URI(context.cluster.server);
    return u.hostname() === uri.hostname() && u.protocol() === uri.protocol() && u.port() === (uri.port() || port);
  });
}

module.exports = KubeConfigManager;