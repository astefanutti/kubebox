'use strict';

const crypto              = require('crypto'),
      get                 = require('./http-then').get,
      ExecAuth            = require('./auth/exec'),
      OpenIdConnect       = require('./auth/oidc'),
      GoogleCloudPlatform = require('./auth/gcp'),
      URI                 = require('urijs');

const { error } = require('./error');

class ChainRequest {

  constructor(...requests) {
    this.requests = requests;
  }

  get({ generator, readable, async = true, cancellable = false } = {}) {
    const cancellations = [];
    let promise = this.requests.slice(0, -1)
      .reduce((promise, request) => {
        if (typeof request === 'object') {
          return promise.then(request.onFulfilled || (response => response), request.onRejected);
        } else {
          return promise.then(response => {
            const { promise, cancellation } = request(response).get({ cancellable: true });
            cancellations.push(cancellation);
            return promise;
          });
        }
      }, Promise.resolve());

    const request = this.requests[this.requests.length - 1];
    promise = promise.then(response => request(response)
      .get({ generator, readable, async, cancellable }));

    return cancellable || generator
      ? { promise, cancellation: () => cancellations.forEach(c => c()) }
      : promise;
  }
}

class ExternalRequest {

  constructor(options) {
    this.options = options;
  }

  get({ generator, readable, async = true, cancellable = false } = {}) {
    return get(merge({ headers: { 'Accept' : 'application/json, text/plain, */*' }}, this.options), { generator, readable, async, cancellable });
  }
}

class ApiRequest {

  constructor(options, context) {
    this.options = options;
    this.context = context;
  }

  get({ generator, readable, async = true, cancellable = false } = {}) {
    return execute(this, { generator, readable, async, cancellable });
  }
}

function execute(request, { generator, readable, async, cancellable }) {
  const { client, client: { auth_provider }, authorization = true, token } = request.context;
  const options = merge({}, client.master_api, request.options);

  if (!authorization) {
    delete options.headers['Authorization'];
  } else if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  let promise = Promise.resolve();
  const cancellations = [];
  if (auth_provider && authorization && !token) {
    promise = auth_provider.provideAuth(options, cancellations);
  }

  promise = promise.then(() => {
    const { promise: p, cancellation } = get(options, { generator, readable, async, cancellable: true });
    cancellations.push(cancellation);
    return p;
  });

  return cancellable || generator
    ? { promise, cancellation: () => cancellations.forEach(c => c()) }
    : promise;
}

class WatchableRequest extends ApiRequest {

  watch(resourceVersion, { fieldSelector } = {}) {
    const uri = URI('')
      .addQuery('watch', true)
      .addQuery('resourceVersion', resourceVersion);
    if (fieldSelector) uri.addQuery('fieldSelector', fieldSelector);
    return new ApiRequest(merge({}, this.options, {
      path    : uri.toString(),
      headers : {
        // https://tools.ietf.org/html/rfc6455
        Origin                 : this.context.client.master_api.url,
        Connection             : 'Upgrade',
        Upgrade                : 'websocket',
        'Sec-WebSocket-Key'    : crypto.createHash('SHA1').digest('base64'),
        'Sec-WebSocket-Version': 13,
      }
    }), this.context);
  }
}

class PodRequest extends ApiRequest {

  exec({ command = [], container } = {}) {
    const uri = URI('')
      .segment('exec')
      .addQuery('stdout', 1)
      .addQuery('stdin', 1)
      .addQuery('stderr', 1)
      .addQuery('tty', 1);
    if (container) uri.addQuery('container', container);
    command.forEach(c => uri.addQuery('command', c));
    return new ApiRequest(merge({}, this.options, {
      path    : uri.toString(),
      headers : {
        // https://tools.ietf.org/html/rfc6455
        Connection               : 'Upgrade',
        Upgrade                  : 'WebSocket',
        'Sec-WebSocket-Protocol' : 'channel.k8s.io',
        'Sec-WebSocket-Key'      : crypto.createHash('SHA1').digest('base64'),
        'Sec-WebSocket-Version'  : 13,
      }
    }), this.context);
  }

  log({ sinceTime, container } = {}) {
    const uri = URI('')
      .segment('log')
      .addQuery('follow', true)
      .addQuery('tailLines', 10000)
      .addQuery('timestamps', true);
    if (container) uri.addQuery('container', container);
    if (sinceTime) uri.addQuery('sinceTime', sinceTime);
    // TODO: limit the amount of data with the limitBytes parameter
    return new ApiRequest(merge({}, this.options, {
      path    : uri.toString(),
      headers : {
        // https://tools.ietf.org/html/rfc6455
        Connection               : 'Upgrade',
        Upgrade                  : 'WebSocket',
        'Sec-WebSocket-Protocol' : 'binary.k8s.io',
        'Sec-WebSocket-Key'      : crypto.createHash('SHA1').digest('base64'),
        'Sec-WebSocket-Version'  : 13,
      }
    }), this.context);
  }
}

class Client {

  get master_api() {
    return this._master_api;
  }

  set master_api(master_api) {
    this._paths = [];
    this._master_api = master_api;
    if (this.master_api.auth_provider) {
      if (this.master_api.auth_provider.name === 'oidc') {
        this.auth_provider = new OpenIdConnect(this.master_api.auth_provider.provider);
      } else if (this.master_api.auth_provider.name === 'gcp') {
        this.auth_provider = new GoogleCloudPlatform(this.master_api.auth_provider.provider);
      } else if (this.master_api.auth_provider.name === 'exec') {
        this.auth_provider = new ExecAuth(this.master_api.auth_provider.provider);
      }
    } else {
      delete this.auth_provider;
    }
  }

  get headers() {
    return this.master_api.headers;
  }

  get url() {
    return this.master_api.url;
  }

  get openshift() {
    return this._paths.some(path => path === '/apis/apps.openshift.io');
  }

  api() {
    return new ApiRequest({ path: '/api' }, { client: this });
  }

  paths({ authorization } = { authorization: true }) {
    return new ApiRequest({ path: '/' }, { client: this, authorization });
  }

  oauth_server_metadata() {
    return new ApiRequest({ path: '.well-known/oauth-authorization-server' }, { client: this, authorization: false });
  }

  // https://docs.openshift.org/latest/architecture/additional_concepts/authentication.html
  // https://github.com/openshift/openshift-docs/issues/707
  oauth_authorize({ username, password }) {
    return new ChainRequest(
      () => this.oauth_server_metadata(),
      {
        onRejected: err => {
          return Promise.reject(err.response && [401, 403, 404].includes(err.response.statusCode)
          ? error(`Authentication failed for ${this.url}, OAuth method unavailable!`)
          : err)
      }},
      response => {
        const metadata = JSON.parse(response.body.toString('utf8'));
        const { protocol, hostname, port, path } = URI.parse(metadata.authorization_endpoint);
        return new ExternalRequest({
          protocol: protocol + ':',
          hostname,
          port,
          path : `${path}?client_id=openshift-challenging-client&response_type=token`,
          auth : `${username}:${password}`,
          headers: {
            'X-Csrf-Token': '1',
          },
          // Re-use master API client TLS options even if it may be different hosts.
          // It may be necessary to check for sub-domains.
          rejectUnauthorized : this.master_api.rejectUnauthorized,
          secureContext      : this.master_api.secureContext,
        });
      }
    );
  }

  oauth_authorize_web({ username, password }) {
    return new ChainRequest(
      () => this.oauth_server_metadata(),
      {
        onRejected: err => {
          return Promise.reject(err.response && [401, 403, 404].includes(err.response.statusCode)
          ? error(`Authentication failed for ${this.url}, OAuth method unavailable!`)
          : err)
      }},
      response => {
        const metadata = JSON.parse(response.body.toString('utf8'));
        const { protocol, hostname, port, path } = URI.parse(metadata.authorization_endpoint);
        return new ExternalRequest({
          protocol: protocol + ':',
          hostname,
          port,
          path : `${path}?client_id=openshift-browser-client&redirect_uri=${new URI(metadata.token_endpoint).segment('display')}&response_type=code`,
          auth : `${username}:${password}`,
          headers: {
            'X-Csrf-Token': '1',
          },
          // Re-use master API client TLS options even if it may be different hosts.
          // It may be necessary to check for sub-domains.
          rejectUnauthorized : this.master_api.rejectUnauthorized,
          secureContext      : this.master_api.secureContext,
        });
      }
    );
  }

  // token can be passed to test authentication
  user(token) {
    return new ApiRequest({ path: '/apis/user.openshift.io/v1/users/~' }, { client: this, token });
  }

  namespaces() {
    return new ApiRequest({ path: '/api/v1/namespaces' }, { client: this });
 }

  projects() {
    return new ApiRequest({ path: '/apis/project.openshift.io/v1/projects' }, { client: this });
  }

  pods(namespace) {
    return new WatchableRequest({ path: `/api/v1/namespaces/${namespace}/pods` }, { client: this });
  }

  pod(namespace, name) {
    return new PodRequest({ path: `/api/v1/namespaces/${namespace}/pods/${name}` }, { client: this });
  }

  // Endpoints to resources usage metrics.
  //
  // The target is to rely on the Metrics API that is served by the Metrics server and accessed
  // from the the Master API.
  // See https://kubernetes.io/docs/tasks/debug-application-cluster/core-metrics-pipeline/
  //
  // However, the Metrics API is still limited and requires the Metrics server to be deployed
  // (default for clusters created by the kube-up.sh script).
  //
  // Design documentation can be found at the following location:
  // https://github.com/kubernetes/community/tree/master/contributors/design-proposals/instrumentation
  //
  // In the meantime, metrics are retrieved from the Kubelet /stats endpoint.

  // Gets the stats from the Summary API exposed by Kubelet on the specified node
  summary_stats(node) {
    return new ApiRequest({ path: `/api/v1/nodes/${node}/proxy/stats/summary` }, { client: this });
  }

  // Gets the cAdvisor data collected by Kubelet and exposed on the /stats endpoint.
  // It may be broken in previous k8s versions, see:
  // https://github.com/kubernetes/kubernetes/issues/56297
  // This cAdvisor endpoint will eventually be removed, see:
  // https://github.com/kubernetes/kubernetes/issues/68522
  container_stats(node, namespace, pod, uid, container) {
    return new ApiRequest({ path: `/api/v1/nodes/${node}/proxy/stats/${namespace}/${pod}/${uid}/${container}` }, { client: this });
  }
}

function merge(target, ...sources) {
  return sources.reduce((target, source) => mergeSingle(target, source), target);
}

function mergeSingle(target, source) {
  return Object.keys(source).reduce((target, key) => {
    const prop = source[key];
    if (typeof prop === 'object' && Object.prototype.toString.call(prop) === '[object Object]') {
      // Only deep copy Object
      if (!target[key]) target[key] = {};
      merge(target[key], prop);
    } else if (key === 'path') {
      target.path = URI.joinPaths(target.path || '', source.path || '')
        .setQuery(URI.parseQuery(URI.parse(target.path || '').query || ''))
        .setQuery(URI.parseQuery(URI.parse(source.path || '').query || ''))
        .resource();
    } else {
      target[key] = prop;
    }
    return target;
  }, target);
}

module.exports = Client;
