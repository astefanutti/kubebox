'use strict';

const fs         = require('fs'),
      URI        = require('urijs'),
      Cluster    = require('./cluster'),
      Namespace  = require('./namespace'),
      User       = require('./user');

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

  constructor(cluster, namespace, user, name) {
      if (typeof name === 'undefined') {
        if (namespace === Namespace.default) {
          this.name = cluster.name + '/' + user.username;
        } else {
          this.name = namespace.name + '/' + cluster.name + '/' + user.username;
        }
      }
      this.name      = name;
      this.cluster   = cluster;
      this.namespace = namespace;
      this.user      = user;
  }

  getMasterApi() {
    if (typeof this.cluster.server === 'undefined') {
      return undefined;
    }

    const api = this.getBaseMasterApi(this.cluster.server);
    //TODO handle browser support for loading file certs
    if (this.user.certificatePath) {
      api.cert = fs.readFileSync(this.user['client-certificate']);
    }
    if (this.user.certificateBase64) {
      api.cert = Buffer.from(this.user['client-certificate-data'], 'base64');
    }
    if (this.user.keyPath) {
      api.key = fs.readFileSync(this.user['client-key']);
    }
    if (this.user.keyBase64) {
      api.key = Buffer.from(this.user['client-key-data'], 'base64');
    }
    if (this.user.token) {
      api.headers['Authorization'] = `Bearer ${this.user.token}`;
    }
    if (this.cluster.rejectUnauthorized) {
      api.rejectUnauthorized = false;
    }
    if (this.cluster.ca) {
      api.ca = fs.readFileSync(this.cluster['certificate-authority']);
    }
    if (this.cluster.certData) {
      api.ca = Buffer.from(this.cluster['certificate-authority-data'], 'base64');
    }
    return api;
  }

  getBaseMasterApi(url) {
    const { protocol, hostname, port } = URI.parse(url);
    const api = {
      protocol : protocol + ':', hostname, port,
      headers  : {
        'Accept' : 'application/json, text/plain, */*'
      },
      get url() {
        return this.protocol + '//' + this.hostname + (this.port ? ':' + this.port : '');
      }
    }
    return api;
  }

}

Context.default = new Context(Cluster.default, Namespace.default, User.default, '');

module.exports = Context;