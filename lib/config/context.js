'use strict';

const fs  = require('fs'),
      os  = require('os'),
      tls = require('tls'),
      URI = require('urijs');

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
      this.name = cluster.name;
      if (namespace) {
        this.name = `${namespace.name}/${this.name}`;
      }
      if (user) {
        this.name = `${this.name}/${user.username}`;
      }
    } else {
      this.name = name;
    }
    this.cluster = cluster;
    this.namespace = namespace;
    this.user = user;
  }

  // TODO: handle browser support for loading local files (client certificate and key)
  // FIXME: do not pollute API options with extra properties, like auth provider or secure
  // context, and pass the current context to the client instead
  getMasterApi() {
    const cluster = this.cluster;
    if (typeof cluster.server === 'undefined') {
      return undefined;
    }
    const api = Context.getBaseMasterApi(this.cluster.server);
    const user = this.user || {};
    if (user.certificatePath) {
      if (os.platform() !== 'browser') {
        api.cert = fs.readFileSync(user.certificatePath);
      } else {
        console.error('Reading user client certificate file \'%s\' is not supported!', user.certificatePath);
      }
    }
    if (user.certificateBase64) {
      api.cert = Buffer.from(user.certificateBase64, 'base64');
    }
    if (user.keyPath) {
      if (os.platform() !== 'browser') {
        api.key = fs.readFileSync(user.keyPath);
      } else {
        console.error('Reading user client key file \'%s\' is not supported!', user.keyPath);
      }
    }
    if (user.keyBase64) {
      api.key = Buffer.from(user.keyBase64, 'base64');
    }
    if (user.token) {
      api.headers.Authorization = `Bearer ${user.token}`;
    }
    if (user.auth_provider && user.auth_provider.token) {
      const auth_provider = user.auth_provider;
      api.headers.Authorization = `Bearer ${auth_provider.token}`;
      if (auth_provider.refresh_token && auth_provider.url && auth_provider.client_id && auth_provider.client_secret) {
        api.auth_provider = auth_provider;
      }
    }
    if (cluster.rejectUnauthorized) {
      api.rejectUnauthorized = false;
    }
    let ca;
    if (cluster.ca) {
      if (os.platform() !== 'browser') {
        ca = fs.readFileSync(cluster.ca);
      } else {
        console.error('Reading cluster certificate authority file \'%s\' is not supported! You can use your browser or operating system certificates management tool.', cluster.ca);
      }
    }
    if (cluster.certData) {
      if (os.platform() !== 'browser') {
        ca = Buffer.from(cluster.certData, 'base64');
      } else {
        console.error('Using cluster certificate authority data is not supported! You can use your browser or operating system certificates management tool.');
      }
    }
    if (ca) {
      const defaults = {
        rejectUnauthorized  : '0' !== process.env.NODE_TLS_REJECT_UNAUTHORIZED,
        ciphers             : tls.DEFAULT_CIPHERS,
        checkServerIdentity : tls.checkServerIdentity,
        minDHSize           : 1024,
      };
      // if (!options.keepAlive) options.singleUse = true;
      const sc = tls.createSecureContext(defaults);
      sc.context.addCACert(ca);
      api.secureContext = sc;
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