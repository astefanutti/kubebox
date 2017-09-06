'use strict';

const URI       = require('urijs');

const User      = require('./user'),
      Namespace = require('./namespace'),
      Context   = require('./context'),
      Cluster   = require('./cluster');

const { isNotEmpty, isLocalStorageAvailable } = require('../util');

class KubeConfigManager {

  constructor({ contexts, current_context }) {
    this.contexts        = contexts;
    this.current_context = current_context;
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
    }
    // update context with login form information
    if (isNotEmpty(login.token)) {
      context.user.token = login.token;
    } else {
      context.user.username = login.username;
      context.user.password = login.password;
    }
    this.current_context = context;
  }
}

// TODO: use rest/spread properties when its browsers and Node support becomes mainstream
function findOrCreateContext(contexts, { url, username, namespace/*, ...login*/ }) {
  const byUrl = findContextsByClusterUrl(contexts, url);
  if (byUrl.length === 1) return byUrl[0];

  const byUser = byUrl.filter(context => context.user.username === username);
  if (byUser.length === 1) return byUser[0];

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
      server: url
      // ...login
    });
  }
  if (!user && username) {
    user = new User({
      name: `${username}/${cluster.name}`,
      username: username
      // ...login
    });
  }
  return new Context({
    cluster,
    user: user || User.default,
    namespace: namespace ? new Namespace(namespace) : Namespace.default
  })
}

function findContextsByClusterUrl(contexts, url) {
  const uri = URI(url);
  let matches = contexts.filter(context => URI(context.cluster.server).hostname() === uri.hostname());
  if (matches.length > 1) {
    matches = matches.filter(item => {
      const server = URI(item.cluster.server);
      return server.protocol() === uri.protocol() && server.port() === uri.port();
    });
  }
  return matches;
}

module.exports.KubeConfig          = KubeConfigManager;
module.exports.findOrCreateContext = findOrCreateContext;