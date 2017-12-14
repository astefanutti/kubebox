'use strict';

const fs        = require('fs'),
      URI       = require('urijs'),
      Cluster   = require('./cluster'),
      Namespace = require('./namespace'),
      User      = require('./user');

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

    const api = getBaseMasterApi(this.cluster.server);
    // TODO: handle browser support for loading file certs
    if (this.user.certificatePath) {
      api.cert = fs.readFileSync(this.user.certificatePath);
    }
    if (this.user.certificateBase64) {
      api.cert = Buffer.from(this.user.certificateBase64, 'base64');
    }
    if (this.user.keyPath) {
      api.key = fs.readFileSync(this.user.keyPath);
    }
    if (this.user.keyBase64) {
      api.key = Buffer.from(this.user.keyBase64, 'base64');
    }
    if (this.user.token) {
      api.headers['Authorization'] = `Bearer ${this.user.token}`;
    }
    if (this.cluster.rejectUnauthorized) {
      api.rejectUnauthorized = false;
    }
    if (this.cluster.ca) {
      api.ca = fs.readFileSync(this.cluster.ca);
    }
    if (this.cluster.certData) {
      api.ca = Buffer.from(this.cluster.certData, 'base64');
    }
    return api;
  }
}

function getBaseMasterApi(url) {
  const { protocol, hostname, port } = URI.parse(url);
  const api = {
    protocol : protocol + ':', hostname, port,
    headers  : {
      'Accept' : 'application/json, text/plain, */*',
    },
    get url() {
      // Do not report default ports as it can cause non matching redirection URLs
      // during OAuth authentication
      const skipPort = !this.port || this.protocol === 'http:' && this.port === '80' || this.protocol === 'https:' && this.port === '443';
      return `${this.protocol}//${this.hostname}${skipPort ? '' : `:${this.port}`}`;
    },
    set url(url) {
      const { protocol, hostname, port } = URI.parse(url);
      this.protocol = protocol + ':';
      this.hostname = hostname;
      this.port     = port;
    }
  }
  return api;
}

Context.default = new Context({
  cluster   : Cluster.default,
  namespace : Namespace.default,
  user      : User.default,
  name      : ''
});

module.exports = Context;