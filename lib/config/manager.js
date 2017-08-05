'use strict';

const fs        = require('fs'),
      os        = require('os'),
      path      = require('path'),
      URI       = require('urijs'),
      yaml      = require('js-yaml');

const User      = require('./user'),
      Namespace = require('./namespace'),
      Context   = require('./context'),
      Cluster   = require('./cluster');

const { isNotEmpty } = require('../util');

// TODO: support client access information provided as CLI options
//       CLI option -> Kube config context -> prompt user
// TODO: better context disambiguation workflow
// see:
// - http://kubernetes.io/docs/user-guide/accessing-the-cluster/
// - http://kubernetes.io/docs/user-guide/kubeconfig-file/

class KubeConfigManager {

  constructor({ debug }) {
    this.debug = debug;
    const kube_config = loadKubeConfig({ debug });
    this.contexts = loadContexts(kube_config);
    this.current_context = findContextByClusterUrl(this.contexts, process.argv[2] || process.env.KUBERNETES_MASTER)
      || this.contexts.find(context => context.name === kube_config['current-context'])
      || Context.default;
  }

  /**
   * This will create a new Context from the login form and set it as the current context.
   * If the created context already exists it will be updated instead of creating a new one.
   * @param {*} login the login form
   */
  updateOrInsertContext(login) {
    // FIXME: there can be multiple contexts for the same cluster
    // that could be disambiguated with the login info like username
    // or when the URL matches that of the current context server
    let context = findContextByClusterUrl(this.contexts, login.cluster);
    if (!context) {
      // create a new context
      const cluster = new Cluster({ server: login.cluster });
      // TODO: use spread properties when its browsers and Node support becomes mainstream
      const user = new User(Object.assign({ name: cluster.name }, login));
      context = new Context({ cluster, namespace: Namespace.default, user });
      this.contexts.push(context);
    } else {
      // update context with login form information
      if (isNotEmpty(login.token)) {
        context.user.token = login.token;
      } else {
        context.user.name = login.username + '/' + context.cluster.name;
        context.user.username = login.username;
        context.user.password = login.password;
      }
      context.cluster.server = login.cluster;
    }
    this.current_context = context;
  }
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
  const users = [];
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

function findContextByClusterUrl(contexts, url) {
  if (!url) return null;
  const uri = URI(url);
  let matches = contexts.filter(context => URI(context.cluster.server).hostname() === uri.hostname());
  if (matches.length > 1) {
    matches = matches.filter(item => {
      const server = URI(item.cluster.server);
      return server.protocol() === uri.protocol() && server.port() === uri.port();
    });
  }
  if (matches.length > 1) {
    throw Error(`Multiple clusters found for server: ${url}!`);
  }
  return matches.length === 1 ? matches[0] : null;
}

module.exports = KubeConfigManager;