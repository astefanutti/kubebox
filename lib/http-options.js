'use strict';

const URI    = require('urijs');

class HttpOptions {

  constructor(url, headers = { 'Accept' : 'application/json, text/plain, */*',}, method = 'GET', postData) {
    this.url      = url;
    this.headers  = headers;
    this.method   = method;
    this.postData = postData;
  }

  get url() {
    // Do not report default ports as it can cause non matching redirection URLs
    // during OAuth authentication
    const skipPort = !this.port || this.protocol === 'http:' && this.port === '80' || this.protocol === 'https:' && this.port === '443';
    let url = `${this.protocol}//${this.hostname}`;
    if (!skipPort) url += `:${this.port}`;
    if (this.path) url += this.path;
    return url;
  }

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

module.exports = HttpOptions;
