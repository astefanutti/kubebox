'use strict';

const get = require('./http-then').get,
      URI = require('urijs');

class OpenIdConnect {

  constructor(/* User.AuthProvider */ auth_provider) {
    this.auth_provider = auth_provider;
    this.jwt = this.auth_provider.token;
  }

  refresh_token() {
    let promise, cancellations = [];
    // only fetch the token URL once
    if (this.token_url) {
      promise = Promise.resolve(this.token_url);
    } else {
      const { promise: p, cancellation } = get(this.provider_configuration_options(), { cancellable: true });
      cancellations.push(cancellation);
      promise = p.then(response => JSON.parse(response.body.toString('utf8')).token_endpoint)
        .then(token_url => this.token_url = token_url);
    }

    const { promise: p, cancellation } = get(this.refresh_token_options(), { cancellable: true });
    cancellations.push(cancellation);
    promise = promise.then(_ => p)
      .then(response => {
        const token = JSON.parse(response.body.toString('utf8')).id_token;
        this.jwt = token;
        return token;
      });

    return { promise, cancellation : () => cancellations.forEach(c => c()) };
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
    options.path = URI.joinPaths(options.path, '.well-known/openid-configuration');
    options.protocol += ':';
    return options;
  }

  refresh_token_options() {
    const options = URI.parse(this.token_url);
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
