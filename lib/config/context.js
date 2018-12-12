'use strict';

const fs          = require('fs'),
      Cluster     = require('./cluster'),
      HttpOptions = require('../http-options'),
      Namespace   = require('./namespace'),
      os          = require('os'),
      User        = require('./user');

/**
 * contexts:
 * - context:
 *     cluster: horse-cluster
 *     namespace: chisel-ns
 *     user: green-user
 *   name: federal-context
 * - context:
 *     cluster: pig-cluster
 *     namespace: saw-ns
 *     user: black-user
 *   name: queen-anne-context
 */
class Context {

  constructor({ cluster, namespace, user, name }) {
    if (typeof name === 'undefined') {
      if (typeof namespace.name === 'undefined') {
        this.name = cluster.name + '/' + user.username;
      } else {
        this.name = namespace.name + '/' + cluster.name + '/' + user.username;
      }
    } else {
      this.name = name;
    }
    this.cluster = cluster;
    this.namespace = namespace;
    this.user = user;
  }

  getMasterApi() {
    if (typeof this.cluster.server === 'undefined') {
      return undefined;
    }

    const api = new HttpOptions(this.cluster.server);
    // TODO: handle browser support for loading file certs
    if (this.user.certificatePath && os.platform() !== 'browser') {
      api.cert = fs.readFileSync(this.user.certificatePath);
    }
    if (this.user.certificateBase64) {
      api.cert = Buffer.from(this.user.certificateBase64, 'base64');
    }
    if (this.user.keyPath && os.platform() !== 'browser') {
      api.key = fs.readFileSync(this.user.keyPath);
    }
    if (this.user.keyBase64) {
      api.key = Buffer.from(this.user.keyBase64, 'base64');
    }
    if (this.user.token) {
      api.headers.Authorization = `Bearer ${this.user.token}`;
    }
    if (this.user.auth_provider && this.user.auth_provider.token) {
      const auth_provider = this.user.auth_provider;
      api.headers['Authorization'] = `Bearer ${auth_provider.token}`;
      if (auth_provider.refresh_token && auth_provider.url && auth_provider.client_id && auth_provider.client_secret) {
        api.auth_provider = auth_provider;
      }
    }
    if (this.cluster.rejectUnauthorized) {
      api.rejectUnauthorized = false;
    }
    if (this.cluster.ca && os.platform() !== 'browser') {
      api.ca = fs.readFileSync(this.cluster.ca);
    }
    if (this.cluster.certData) {
      api.ca = Buffer.from(this.cluster.certData, 'base64');
    }
    return api;
  }
}

Context.default = new Context({
  cluster   : Cluster.default,
  namespace : Namespace.default,
  user      : User.default,
  name      : '',
});

module.exports = Context;