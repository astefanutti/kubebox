'use strict';

const crypto   = require('crypto'),
      get      = require('./http-then').get,
      ExecAuth = require('./auth/exec'),
      GCPAuth  = require('./auth/gcp'),
      OIDCAuth = require('./auth/oidc'),
      URI      = require('urijs');

const { error } = require('./error');
const { mix } = require('./mixin');

class ChainRequest {

  constructor(...requests) {
    this.requests = requests;
  }

  get({ generator, readable, async = true, cancellable = false, rejectOnAbort = false } = {}) {
    let cancellation = Function.prototype;
    let promise = this.requests.slice(0, -1)
      .reduce((promise, request) => {
        if (typeof request === 'object') {
          return promise.then(request.onFulfilled || (response => response), request.onRejected);
        } else {
          return promise.then(response => {
            const { promise, cancellation: c } = request(response).get({ cancellable: true, rejectOnAbort });
            cancellation = c;
            return promise;
          });
        }
      }, Promise.resolve());

    const request = this.requests[this.requests.length - 1];
    promise = promise.then(response => {
      const { promise, cancellation: c } = request(response).get({ generator, readable, async, cancellable: true, rejectOnAbort });
      cancellation = c;
      return promise;
    });

    return (cancellable || generator)
      ? { promise, cancellation: () => cancellation() }
      : promise;
  }
}

class ExternalRequest {

  constructor(options) {
    this.options = options;
  }

  get({ generator, readable, async = true, cancellable = false, rejectOnAbort = false } = {}) {
    return get(merge({ headers: { 'Accept' : 'application/json, text/plain, */*' }}, this.options), { generator, readable, async, cancellable, rejectOnAbort });
  }
}

class ApiRequest {

  constructor(options, context) {
    this.options = merge({ headers: {} }, options);
    this.context = context;
  }

  asJson() {
    this.options.headers['Accept'] = 'application/json';
    return this;
  }

  asYaml() {
    this.options.headers['Accept'] = 'application/yaml';
    return this;
  }

  asTable() {
    this.options.headers['Accept'] = 'application/json;as=Table;v=v1beta1;g=meta.k8s.io, application/json';
    return this;
  }

  get({ generator, readable, async = true, cancellable = false, rejectOnAbort = false } = {}) {
    return execute(this, { generator, readable, async, cancellable, rejectOnAbort });
  }
}

function execute(request, { generator, readable, async, cancellable, rejectOnAbort }) {
  const { client, client: { auth_provider }, authorization = true, token } = request.context;
  const options = merge({}, client.master_api, request.options);

  if (!authorization) {
    delete options.headers['Authorization'];
  } else if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  let promise = Promise.resolve();
  let cancellation = Function.prototype;
  if (auth_provider && authorization && !token) {
    const { promise: p, cancellation: c } = auth_provider.provideAuth(options);
    promise = p;
    cancellation = c;
  }

  promise = promise.then(() => {
    const { promise: p, cancellation: c } = get(options, { generator, readable, async, cancellable: true, rejectOnAbort });
    cancellation = c;
    return p;
  });

  return (cancellable || generator)
    ? { promise, cancellation: () => cancellation() }
    : promise;
}

const Selector = T => class extends T {

  fieldSelector(selector) {
    const uri = URI('').addQuery('fieldSelector', selector);
    merge(this.options, { path: uri.toString() });
    return this;
  }

  labelSelector(selector) {
    const uri = URI('').addQuery('labelSelector', selector);
    merge(this.options, { path: uri.toString() });
    return this;
  }
};

const Limit = T => class extends T {

  // we may want to add a continue method to handle continued request if needed
  limit(limit) {
    const uri = URI('').addQuery('limit', limit);
    return new LimitListRequest(merge({}, this.options, { path: uri.toString() }), this.context);
  }
};

const Watch = T => class extends T {

  watch(resourceVersion, { websocket = true } = {}) {
    const uri = URI('')
      .addQuery('watch', true)
      .addQuery('resourceVersion', resourceVersion);
    return new WatchListRequest(merge({}, this.options, {
      path    : uri.toString(),
      headers : websocket ? {
        // https://tools.ietf.org/html/rfc6455
        Origin                 : this.context.client.master_api.url,
        Connection             : 'upgrade',
        Upgrade                : 'websocket',
        'Sec-WebSocket-Key'    : crypto.createHash('SHA1').digest('base64'),
        'Sec-WebSocket-Version': 13,
      } : {},
    }), this.context);
  }
};

class ListRequest extends mix(ApiRequest).with(Selector, Limit, Watch) {
}

class LimitListRequest extends mix(ApiRequest).with(Selector, Limit) {
}

class WatchListRequest extends mix(ApiRequest).with(Selector, Watch) {
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
        Connection               : 'upgrade',
        Upgrade                  : 'websocket',
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
        Connection               : 'upgrade',
        Upgrade                  : 'websocket',
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
        this.auth_provider = new OIDCAuth(this.master_api.auth_provider.provider);
      } else if (this.master_api.auth_provider.name === 'gcp') {
        this.auth_provider = new GCPAuth(this.master_api.auth_provider.provider);
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

  events(namespace) {
    return new ListRequest({ path: namespaced`/api/v1/events${namespace}` }, { client: this });
  }

  event(namespace, name) {
    return new ApiRequest({ path: `/api/v1/namespaces/${namespace}/events/${name}` }, { client: this });
  }

  api() {
    return new ApiRequest({ path: '/api' }, { client: this });
  }

  paths() {
    // Set the user agent as OpenShift redirects to the Web console based on Web browser agents
    return new ApiRequest({ path: '/', headers: { 'user-agent': 'kubebox' } }, { client: this });
  }

  oauth_server_metadata() {
    return new ApiRequest({ path: '.well-known/oauth-authorization-server' }, { client: this, authorization: false });
  }

  // https://docs.openshift.org/latest/architecture/additional_concepts/authentication.html
  // https://github.com/openshift/openshift-docs/issues/707
  oauth_authorize({ username, password }) {
    return new ChainRequest(
      () => this.oauth_server_metadata(),
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
    return new ListRequest({ path: `/api/v1/namespaces/${namespace}/pods` }, { client: this });
  }

  pod(namespace, name) {
    return new PodRequest({ path: `/api/v1/namespaces/${namespace}/pods/${name}` }, { client: this });
  }

  cadvisor_spec(pod) {
    return new ChainRequest(
      () => this.pods('cadvisor').fieldSelector(`spec.nodeName=${pod.spec.nodeName}`).labelSelector(`app=cadvisor`),
      response => {
        const list = JSON.parse(response.body.toString('utf8'));
        if (list.items.length === 0) {
          throw error(`Unable to locate cAdvisor pod on node ${pod.spec.nodeName}`);
        }
        const cadvisor = list.items[0];
        return new ApiRequest({ path: `/api/v1/namespaces/${cadvisor.metadata.namespace}/pods/${cadvisor.metadata.name}/proxy/api/v2.0/spec?recursive=true` }, { client: this });
      }
    );
  }

  cadvisor_stats(pod, cgroup) {
    return new ChainRequest(
      () => this.pods('cadvisor').fieldSelector(`spec.nodeName=${pod.spec.nodeName}`).labelSelector(`app=cadvisor`),
      response => {
        const list = JSON.parse(response.body.toString('utf8'));
        if (list.items.length === 0) {
          throw error(`Unable to locate cAdvisor pod on node ${pod.spec.nodeName}`);
        }
        const cadvisor = list.items[0];
        return new ApiRequest({ path: `/api/v1/namespaces/${cadvisor.metadata.namespace}/pods/${cadvisor.metadata.name}/proxy/api/v2.0/stats${cgroup}?recursive=true&count=120` }, { client: this });
      }
    );
  }
}

function namespaced(strings, namespace) {
  const path = strings[0];
  if (namespace === undefined) {
    return path;
  }
  const i = path.lastIndexOf('/');
  return path.slice(0, i) + '/namespaces/' + namespace + path.slice(i, path.length);
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
      mergeSingle(target[key], prop);
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
