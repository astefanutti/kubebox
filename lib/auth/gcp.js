'use strict';

const { execFile } = require('child_process'),
      { JSONPath } = require('jsonpath-plus'),
      os           = require('os');
class GoogleCloudPlatform {

  constructor(/* User.GoogleCloudPlatformAuthProvider */ auth_provider) {
    this.auth_provider = auth_provider;
  }

  provideAuth(options, cancellations) {
    let promise = Promise.resolve(this.auth_provider.access_token);
    if (this.has_token_expired()) {
      const { promise: p, cancellation } = this.refresh_token();
      promise = p;
      cancellations.push(cancellation);
    }
    return promise.then(access_token => {
      options.headers['Authorization'] = `Bearer ${access_token}`;
    });
  }

  refresh_token() {
    let promise, cancel = function () {};
    if (os.platform() === 'browser') {
      console.error('Refreshing GCP token in the browser is not supported! Please refresh token manually via \'gcloud container clusters get-credentials\'. ');
      promise = Promise.resolve(this.auth_provider.access_token);
    } else {
      promise = new Promise((resolve, reject) => {
        const process = execFile(this.auth_provider.cmd_path, this.auth_provider.cmd_args, (error, stdout, stderr) => {
          cancel = function () {};
          if (error) {
            reject(error);
          }
          resolve(stdout);
        });
        cancel = function () { process.kill() };
      });
      promise = promise.then(response => {
        const json = JSON.parse(response);
        this.auth_provider.expiry = Date.parse(JSONPath(this.auth_provider.expiry_key, json)[0]);
        this.auth_provider.access_token = JSONPath(this.auth_provider.token_key, json)[0];
        return this.auth_provider.access_token;
      });
    }
    return { promise, cancellation: () => cancel() };
  }

  set access_token(access_token) {
    this.auth_provider.access_token = access_token;
  }

  get access_token() {
    return this.auth_provider.access_token;
  }

  has_token_expired() {
    return (this.auth_provider.expiry - Date.now()) < 5000;
  }
}

module.exports = GoogleCloudPlatform;