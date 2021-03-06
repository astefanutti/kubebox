'use strict';

const fs  = require('fs'),
      get = require('../http-then').get,
      os  = require('os'),
      URI = require('urijs');

class OpenIdConnect {

  constructor(/* User.OpenIdConnectAuthProvider */ auth_provider) {
    this.auth_provider = auth_provider;
    this.jwt = this.auth_provider.token;

    if (this.auth_provider.idp_certificate_authority) {
      if (os.platform() !== 'browser') {
        this.auth_provider.ca = fs.readFileSync(this.auth_provider.idp_certificate_authority);
      } else {
        console.error('Reading IDP certificate authority file \'%s\' is not supported!', this.auth_provider.idp_certificate_authority);
      }
    }
  }

  provideAuth(options) {
    let promise = Promise.resolve(this.jwt);
    let cancellation = Function.prototype;
    if (this.has_token_expired()) {
      const { promise: p, cancellation: c } = this.refresh_token();
      promise = p;
      cancellation = c;
    }
    promise = promise.then(token => options.headers['Authorization'] = `Bearer ${token}`);
    return { promise, cancellation: () => cancellation() };
  }

  refresh_token() {
    let promise, cancellation = Function.prototype;
    // only fetch the token URL once
    if (this.token_url) {
      promise = Promise.resolve(this.token_url);
    } else {
      const { promise: p, cancellation: c } = get(this.provider_configuration_options(), { cancellable: true });
      cancellation = c;
      promise = p
        .then(response => JSON.parse(response.body.toString('utf8')).token_endpoint)
        .then(token_url => this.token_url = token_url);
    }

    promise = promise
      .then(_ => {
        const { promise: p, cancellation: c } = get(this.refresh_token_options(), { cancellable: true });
        cancellation = c;
        return p;
      })
      .then(response => {
        const token = JSON.parse(response.body.toString('utf8')).id_token;
        this.jwt = token;
        return token;
      });

    return { promise, cancellation: () => cancellation() };
  }

  set jwt(jwt) {
    this.auth_provider.token = jwt;
    const part = jwt.split('.')[1];
    const payload = Buffer.from(part, 'base64');
    this.token_expiry_time = JSON.parse(payload).exp;
  }

  get jwt() {
    return this.auth_provider.token;
  }

  has_token_expired() {
    return (this.token_expiry_time - Date.now() / 1000) < 10;
  }

  provider_configuration_options() {
    // https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig
    const options = URI.parse(this.auth_provider.url);
    if (this.auth_provider.ca) options.ca = this.auth_provider.ca;
    options.path = URI.joinPaths(options.path, '.well-known/openid-configuration');
    options.protocol += ':';
    return options;
  }

  refresh_token_options() {
    const options = URI.parse(this.token_url);
    if (this.auth_provider.ca) options.ca = this.auth_provider.ca;
    options.protocol += ':';
    options.method = 'POST';
    options.postData = {
      grant_type    : 'refresh_token',
      client_id     : this.auth_provider.client_id,
      client_secret : this.auth_provider.client_secret,
      refresh_token : this.auth_provider.refresh_token,
    };
    return options;
  }
}

module.exports = OpenIdConnect;
