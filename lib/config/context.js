'use strict';

const fs        = require('fs'),
      Cluster   = require('./cluster'),
      Namespace = require('./namespace'),
      os        = require('os'),
      URI       = require('urijs'),
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

    const api = Context.getBaseMasterApi(this.cluster.server);
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
      api.headers.Authorization = `Bearer ${auth_provider.token}`;
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

  static getBaseMasterApi(url) {
    const api = {
      headers : {
        'Accept' : 'application/json, text/plain, */*',
      },
      get url() {
        // Do not report default ports as it can cause non matching redirection URLs
        // during OAuth authentication
        const skipPort = !this.port || this.protocol === 'http:' && this.port === '80' || this.protocol === 'https:' && this.port === '443';
        let url = `${this.protocol}//${this.hostname}`;
        if (!skipPort) url += `:${this.port}`;
        if (this.path) url += this.path;
        return url;
      },
      set url(url) {
        const uri = URI.parse(url);
        let parts = {};
        if (uri.protocol) {
          parts = uri;
        } else {
          URI.parseHost(url, parts);
        }
        const { protocol = 'https', hostname, port, path } = parts;
        this.protocol = protocol + ':';
        this.hostname = hostname;
        this.port = port;
        this.path = path;
      }
    }
    api.url = url;
    return api;
  }
}

module.exports = Context;