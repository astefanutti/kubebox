'use strict';

const { execFile } = require('child_process'),
      os           = require('os');

class ExecAuth {

  constructor(/* User.ExecAuthProvider */ auth_provider) {
    this.auth_provider = auth_provider;
  }

  provideAuth(options, cancellations) {
    let promise = Promise.resolve(this.auth_provider);
    if (this.has_token_expired()) {
      const { promise: p, cancellation } = this.refresh_token();
      promise = p;
      cancellations.push(cancellation);
    }
    return promise.then(auth_provider => {
      if (auth_provider.token) {
        options.headers['Authorization'] = `Bearer ${auth_provider.token}`;
      }
      if (auth_provider.clientCertificateData && auth_provider.clientKeyData && options.secureContext) {
        options.secureContext.context.setCert(auth_provider.clientCertificateData);
        options.secureContext.context.setKey(auth_provider.clientKeyData);
      }
    });
  }

  refresh_token() {
    let promise, cancel = function () {};
    if (os.platform() === 'browser') {
      console.error('Refreshing Exec token in the browser is not supported! Please refresh token manually via the \'%s\' command', this.auth_provider.command);
      promise = Promise.resolve(this.auth_provider);
    } else {
      promise = new Promise((resolve, reject) => {
        const env = Object.assign({}, process.env);
        if (this.auth_provider.env) {
          this.auth_provider.env.forEach(kvp => env[kvp.name] = kvp.value);
        }
        const exec = execFile(this.auth_provider.command, this.auth_provider.args, { env }, (error, stdout, stderr) => {
          cancel = function () {};
          if (error) {
            reject(error);
          }
          resolve(stdout);
        });
        cancel = function () { exec.kill() };
      });
      promise = promise.then(response => {
        const json = JSON.parse(response);
        this.auth_provider.expiry = Date.parse(json.status.expirationTimestamp);
        this.auth_provider.token = json.status.token;
        this.auth_provider.clientCertificateData = json.status.clientCertificateData;
        this.auth_provider.clientKeyData = json.status.clientKeyData;
        return this.auth_provider;
      });
    }

    return { promise, cancellation: () => cancel() };
  }

  has_token_expired() {
    return (this.auth_provider.expiry - Date.now()) < 5000;
  }
}

module.exports = ExecAuth;