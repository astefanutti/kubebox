'use strict';

const { execFile } = require('child_process'),
      os           = require('os');

class ExecAuth {

  constructor(/* User.ExecAuthProvider */ auth_provider) {
    this.auth_provider     = auth_provider;
  }

  provideAuth(options, cancellations) {
    let promise = Promise.resolve(this.auth_provider.token);
    if (this.has_token_expired()) {
      const { promise: p, cancellation } = this.refresh_token();
      promise = p;
      cancellations.push(cancellation);
    }
    return promise.then(token => {
      options.headers['Authorization'] = `Bearer ${token}`;
    });
  }

  refresh_token() {
    let promise, cancel;
    if (os.platform() === 'browser') {
      console.error('Refreshing Exec token in the browser is not supported! Please refresh token manually via the \'%s\' command', this.auth_provider.command);
      promise = Promise.resolve(this.auth_provider.token);
    }
    promise = new Promise((resolve, reject) => {
      const process = execFile(this.auth_provider.command, this.auth_provider.args , {'env' : this.auth_provider.env}, (error, stdout, stderr) => {
        cancel = function (){};
        if (error) {
          reject(error);
        }
        resolve(stdout);
      });
      cancel = function () { process.kill()};
    });
    promise = promise.then( response => {
      const json = JSON.parse(response);
      this.auth_provider.expiry = Date.parse(json.status.expirationTimestamp);
      this.auth_provider.token = json.status.token;
      return this.auth_provider.token;
    });

    return { promise, cancellation : () => cancel() };
  }

  has_token_expired() {
    return (this.auth_provider.expiry - Date.now()) < 5000;
  }
}

module.exports = ExecAuth;