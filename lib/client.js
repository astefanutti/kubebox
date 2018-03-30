'use strict';

const crypto = require('crypto'),
      URI    = require('urijs');

class Client {

  constructor(master_api) {
    // should ideally be a defensive copy
    this.master_api = master_api;
    this.apis = [];
  }

  get master_api() {
    return this._master_api;
  }

  set master_api(master_api) {
    this.apis = [];
    this._master_api = master_api;
  }

  get headers() {
    return this.master_api.headers;
  }

  get url() {
    return this.master_api.url;
  }

  set url(url) {
    this.master_api.url = url;
  }

  get openshift() {
    return this.apis.some(path => path === '/oapi' || path === '/oapi/v1');
  }

  get_api() {
    const apis = merge({
      path   : '/api',
      method : 'GET',
    },
    this.master_api);
    return apis;
  }

  get_apis({ authorization } = { authorization: true }) {
    const apis = merge({
      path   : '/',
      method : 'GET',
    },
    this.master_api);
    if (!authorization) {
      delete apis.headers['Authorization'];
    }
    return apis;
  }

  // https://docs.openshift.org/latest/architecture/additional_concepts/authentication.html
  // https://github.com/openshift/openshift-docs/issues/707
  oauth_authorize({ username, password }) {
    delete this.master_api.headers['Authorization'];
    return merge({
        path    : '/oauth/authorize?client_id=openshift-challenging-client&response_type=token',
        method  : 'GET',
        auth    : `${username}:${password}`,
        headers : {
          'X-Csrf-Token' : '1',
        },
      }, this.master_api);
  }

  oauth_authorize_web({ username, password }) {
    delete this.master_api.headers['Authorization'];
    return merge({
        path    : `/oauth/authorize?client_id=openshift-browser-client&redirect_uri=${new URI(this.master_api.url).segment('/oauth/token/display')}&response_type=code`,
        method  : 'GET',
        auth    : `${username}:${password}`,
        headers : {
          'X-Csrf-Token' : '1',
        },
      }, this.master_api);
  }

  // token can be passed to test authentication
  get_user(token) {
    const request = merge({
      path    : '/oapi/v1/users/~',
      method  : 'GET',
      headers : {},
    }, this.master_api);
    if (token) {
      request.headers['Authorization'] = `Bearer ${token}`;
    }
    return request;
 }

  get_namespaces() {
    return merge({
      path   : '/api/v1/namespaces',
      method : 'GET'
    }, this.master_api);
 }

  get_projects() {
    return merge({
      path   : '/oapi/v1/projects',
      method : 'GET'
    }, this.master_api);
  }

  get_pods(namespace) {
    return merge({
      path   : `/api/v1/namespaces/${namespace}/pods`,
      method : 'GET'
    }, this.master_api);
  }

  get_pod(namespace, name) {
    return merge({
      path   : `/api/v1/namespaces/${namespace}/pods/${name}`,
      method : 'GET'
    }, this.master_api);
  }

  watch_pods(namespace, resourceVersion) {
    return merge({
      path    : `/api/v1/namespaces/${namespace}/pods?watch=true&resourceVersion=${resourceVersion}`,
      method  : 'GET',
      headers : {
        // https://tools.ietf.org/html/rfc6455
        Origin                 : this.master_api.url,
        Connection             : 'Upgrade',
        Upgrade                : 'websocket',
        'Sec-WebSocket-Key'    : crypto.createHash('SHA1').digest('base64'),
        'Sec-WebSocket-Version': 13,
      }
    }, this.master_api);
  }

  follow_log(namespace, name, { sinceTime, container } = {}) {
    // TODO: limit the amount of data with the limitBytes parameter
    const path = URI(`/api/v1/namespaces/${namespace}/pods/${name}/log?follow=true&tailLines=10000&timestamps=true`);
    if (container) path.addQuery('container', container);
    if (sinceTime) path.addQuery('sinceTime', sinceTime);
    return merge({
      path    : path.toString(),
      method  : 'GET',
      headers : {
        // https://tools.ietf.org/html/rfc6455
        Connection               : 'Upgrade',
        Upgrade                  : 'WebSocket',
        'Sec-WebSocket-Protocol' : 'binary.k8s.io',
        'Sec-WebSocket-Key'      : crypto.createHash('SHA1').digest('base64'),
        'Sec-WebSocket-Version'  : 13,
      }
    }, this.master_api);
  }

  exec(namespace, pod, { command = [], container } = {}) {
    const path = URI(`/api/v1/namespaces/${namespace}/pods/${pod}/exec`);
    path.addQuery('stdout', 1);
    path.addQuery('stdin', 1);
    path.addQuery('stderr', 1);
    path.addQuery('tty', 1);
    if (container) path.addQuery('container', container);
    command.forEach(c => path.addQuery('command', c));
    return merge({
      path    : path.toString(),
      method  : 'GET',
      headers : {
        // https://tools.ietf.org/html/rfc6455
        Connection               : 'Upgrade',
        Upgrade                  : 'WebSocket',
        'Sec-WebSocket-Protocol' : 'channel.k8s.io',
        'Sec-WebSocket-Key'      : crypto.createHash('SHA1').digest('base64'),
        'Sec-WebSocket-Version'  : 13,
      }
    }, this.master_api);
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
  // Design documentation can be found at the following locations:
  // https://github.com/kubernetes/community/tree/master/contributors/design-proposals/instrumentation
  //
  // In the meantime, metrics are either retrieved from the Kubelet /stats endpoint
  // or directly from the cAdvisor port. Another source to consider is the
  // /metrics/cadvisor endpoint on the secure handler of the kubelet.

  // Gets the stats from the Summary API exposed by Kubelet on the specified node
  summary_stats(node) {
    return merge({
      path   : `/api/v1/nodes/${node}/proxy/stats/summary`,
      method : 'GET',
    }, this.master_api);
  }

  // Gets the cAdvisor data collected by Kubelet and exposed on the /stats endpoint
  // This does not work on Kubernetes 1.8.0, see https://github.com/kubernetes/kubernetes/issues/56297
  container_stats(node, namespace, pod, uid, container) {
    return merge({
      path   : `/api/v1/nodes/${node}/proxy/stats/${namespace}/${pod}/${uid}/${container}`,
      method : 'GET',
    }, this.master_api);
  }

  // Gets the Docker container data via cAdvisor proxy
  // cAdvisor port is not accessible in OpenShift, see https://github.com/openshift/origin/issues/4143,
  // And may eventually be removed from Kubernetes, see https://github.com/kubernetes/kubernetes/issues/53615.
  cadvisor_container_stats(node, id) {
    return merge({
      path   : `/api/v1/nodes/${node}:4194/proxy/api/v1.2/docker/${id}`,
      method : 'GET',
    }, this.master_api);
  }
}

function merge(target, source) {
  return Object.keys(source).reduce((target, key) => {
    const prop = source[key];
    if (typeof prop === 'object' && Object.prototype.toString.call(prop) === '[object Object]') {
      // Only deep copy Object
      if (!target[key]) target[key] = {};
      merge(target[key], prop);
    } else if (typeof target[key] === 'undefined') {
      target[key] = prop;
    } else if (key === 'path' && source.path) {
      target.path = URI.joinPaths(source.path, target.path)
        .query(URI.parse(target.path).query || '')
        .resource();
    }
    return target;
  }, target);
}

module.exports = Client;
