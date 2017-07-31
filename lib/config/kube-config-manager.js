'use strict';

const fs         = require('fs'),
      os         = require('os'),
      path       = require('path'),
      URI        = require('urijs'),
      util       = require('../util'),
      yaml       = require('js-yaml');

const User      = require('./user'),
      Namespace = require('./namespace'),
      Context   = require('./context'),
      Cluster   = require('./cluster');

const { isNotEmpty } = util;


class KubeConfigManager {

  constructor() {
    this.isBrowser       = os.platform() === 'browser';
    this.kube            = this.loadKubeConfig();
    this.contexts        = this.loadContexts();
    const contextName    = process.argv[2] || process.env.KUBERNETES_MASTER || this.kube['current-context'];
    this.current_context = this.contexts.find(context => context.name === contextName) || Context.default;
  }

  get current_context() {
    return this.currentContext ? this.currentContext : Context.default;
  }

  set current_context(current_context) {
    this.currentContext = current_context;
  }

  loadKubeConfig() {
    if(this.isBrowser) 
      return [];

    const kube_config_path = path.join(os.homedir(), '.kube/config');
    try {
      fs.accessSync(kube_config_path, fs.constants.F_OK | fs.constants.R_OK);
    } catch (e) {
      console.error('Error reading kubernetes config file from:%s\n%s', kube_config_path, e);
      return [];
    }
    return yaml.safeLoad(fs.readFileSync(kube_config_path, 'utf8'));
  }

  loadContexts() {
    const users    = [];
    const clusters = [];
    const contexts = [];
    if(this.kube.users) {
      this.kube.users.forEach(function(data) {
        const user = new User(data.name, data.user['token'], data.user['username'], data.user['password'], data.user['client-certificate'], data.user['client-certificate-data'], data.user['client-key'], data.user['client-key-data']);
        users.push(user);
      });
    }
    if(this.kube.clusters) {
      this.kube.clusters.forEach(function(data){
        const cluster = new Cluster(data.cluster.server, data.name, data.cluster['insecure-skip-tls-verify'], data.cluster['certificate-authority'], data.cluster['certificate-authority-data'] );
        clusters.push(cluster);
      });
    }
    if(this.kube.contexts) {
      this.kube.contexts.forEach(function(data){
        const namespace = new Namespace(data.context.namespace);
        const user      = users.find(user => user.name === data.context.user);
        const cluster   = clusters.find(cluster => cluster.name === data.context.cluster);
        const context   = new Context(cluster, namespace, user, data.name);
        contexts.push(context);
      });
    }
    return contexts; 
  }

  /**
   * This will create a new Context from the login from and set it as the current context.
   * If the created context already exists it will be updated instead of creating a new one.
   * @param {*} login the login form
   */
  updateOrInsertContext(login) {
     var context = this.findContextByClusterUrl(login.cluster);
     if (!context) {
        // create a new context
        const cluster = new Cluster(login.cluster);
        const user    = new User(cluster.name, login.token, login.username, login.password);
        context       = new Context(cluster, Namespace.default, user);
        this.contexts.push(context);
     } else {
        // update context with login form information
        if (isNotEmpty(login.token)) {
          context.user.token    = login.token;
        } else {
          context.user.name     = login.username + '/' + context.cluster.name;
          context.user.username = login.username;
          context.user.password = login.password;
        }
        context.cluster.server  = login.cluster;
     }
     this.current_context = context;
  }

  findContextByClusterUrl(url) {
    const uri = URI(url);
    let matches = this.contexts.filter(context => URI(context.cluster.server).hostname() === uri.hostname());
    if (matches.length > 1) {
      matches = matches.filter(item => {
        const server = URI(item.cluster.server);
        return server.protocol() === uri.protocol() && server.port() === uri.port();
      });
    }
    if (matches.length > 1)
      throw Error(`Multiple clusters found for server: ${url}!`);

    return matches.length === 1 ? matches[0] : null;
  }

}

module.exports = KubeConfigManager;