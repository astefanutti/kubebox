'use strict';

const crypto = require('crypto');

class Client {

  constructor(master_api) {
    // should ideally be a defensive copy
    this.master_api = master_api;
  }

  get headers() {
    return this.master_api.headers;
  }

  get url() {
    return this.master_api.url;
  }

  get_apis() {
    return Object.assign({
      path   : '/',
      method : 'GET'
    },
    this.master_api);
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
          'X-Csrf-Token' : '1'
        }
      }, this.master_api);
  }

  get_namespaces() {
    return Object.assign({
      path   : '/api/v1/namespaces',
      method : 'GET'
    }, this.master_api);
 }

  get_projects() {
    return Object.assign({
      path   : '/oapi/v1/projects',
      method : 'GET'
    }, this.master_api);
  }

  get_pods(namespace) {
    return Object.assign({
      path   : `/api/v1/namespaces/${namespace}/pods`,
      method : 'GET'
    }, this.master_api);
  }

  get_pod(namespace, name) {
    return Object.assign({
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
        'Sec-WebSocket-Version': 13
      }
    }, this.master_api);
  }

  follow_log(namespace, name, sinceTime) {
    return merge({
      // we may want to adapt the amount of lines based on the widget height
      path    : `/api/v1/namespaces/${namespace}/pods/${name}/log?follow=true&tailLines=25&timestamps=true` + (sinceTime ? `&sinceTime=${sinceTime}` : ''),
      method  : 'GET',
      headers : {
        // https://tools.ietf.org/html/rfc6455
        Connection             : 'Upgrade',
        Upgrade                : 'WebSocket',
        'Sec-WebSocket-Key'    : crypto.createHash('SHA1').digest('base64'),
        'Sec-WebSocket-Version': 13
      }
    }, this.master_api);
  }
}

function merge(target, source) {
  return Object.keys(source).reduce((target, key) => {
    const prop = source[key];
    if (typeof target[key] === 'undefined') {
      target[key] = source[key];
    } else if (typeof target[key] === 'object') {
      merge(target[key], prop);
    }
    return target;
  }, target);
}

module.exports = Client;