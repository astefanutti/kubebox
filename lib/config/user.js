'use strict';

const {isNotEmpty} = require('../util');

/**
 * users:
 * - name: blue-user
 *   user:
 *     token: blue-token
 * - name: green-user
 *   user:
 *     client-certificate: path/to/my/client/cert
 *     client-key: path/to/my/client/key
 * - name: orange-user
 *   user:
 *     auth-provider:
 *       name: oidc
 *       config:
 *         client-id: xxx
 *         client-secret: xxx
 *         id-token: ...idtoken...
 *         idp-issuer-url: https://myoidcprovider.com
 *         refresh-token: ...refreshtoken...
 */
class User {

  constructor({ name, token, username, password, 'client-certificate': certificatePath,
      'client-certificate-data': certificateBase64, 'client-key': keyPath,
      'client-key-data': keyBase64, 'auth-provider': auth_provider, 'exec': exec }) {
    if (typeof name === 'undefined') {
      throw Error('User name must be defined!');
    }
    if (typeof auth_provider !== 'undefined') {
      this.auth_provider = new AuthProvider(Object.assign({ name: auth_provider.name, config: auth_provider.config }));
    }
    if (typeof exec !== 'undefined') {
      //for now let's treat exec like an Auth Provider
      this.auth_provider = new AuthProvider(Object.assign({ name: 'exec', config: exec }));
    }
    this.name = name;
    this.token = token;
    this.password = password;
    this.certificatePath = certificatePath;
    this.certificateBase64 = certificateBase64;
    this.keyPath = keyPath;
    this.keyBase64 = keyBase64;
    if (typeof username === 'undefined') {
      this.username = name.split('/')[0];
    } else {
      this.username = username;
    }
  }
}

class AuthProvider {

  constructor({ name, config}) {
    this.name = name;
    // TODO: add support for others e.g azure, openstack
    if (name === 'oidc') {
      this.provider = new OpenIdConnectAuthProvider(config);
    } else if ( name === 'gcp') {
      this.provider = new GoogleCloudPlatformAuthProvider(config);
    } else if (name == 'exec') {
      this.provider = new ExecAuthProvider(config);
    }
  }

  get token() {
    return this.provider.auth_token;
  }
}

/**
 * auth-provider:
 * name: oidc
 * config:
 *   client-id: xxx
 *   client-secret: xxx
 *   id-token: ...idtoken...
 *   idp-issuer-url: https://myoidcprovider.com
 *   refresh-token: ...refreshtoken...
 */
class OpenIdConnectAuthProvider {
  constructor({ 'idp-issuer-url': url, 'id-token': token, 'refresh-token': refresh_token,
      'client-id': client_id, 'client-secret': client_secret, 'idp-certificate-authority': ca }) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.token = token;
    this.refresh_token = refresh_token;
    if (url && url.endsWith('/')) {
      this.url = url.slice(0, -1);
    } else {
      this.url = url;
    }
    this.idp_certificate_authority = ca;
  }
  
  get auth_token() {
    return this.token;
  }
}

 // TODO: support scopes and different time formats
class GoogleCloudPlatformAuthProvider {
  constructor({ 'scopes': scopes, 'access-token': access_token, 'expiry': expiry,
      'cmd-path': cmd_path, 'cmd-args': cmd_args, 'token-key': token_key, 'expiry-key': expiry_key, 'time-fmt': time_fmt}) {
    this.scopes = scopes;
    this.access_token = access_token;
    this.expiry = expiry === 'undefined' ? Date.now() : Date.parse(expiry);
    this.cmd_path = cmd_path;
    this.cmd_args = isNotEmpty(cmd_args) ? cmd_args.split(' ') : cmd_args;
    if (isNotEmpty(token_key)) {
      // let's convert Golang's JSONPath to NodeJS's jsonpath-plus
      if (token_key.charAt(0) === '{' && token_key.charAt(token_key.length -1) === '}') {
        this.token_key = '$' + token_key.substring(1, token_key.length - 1)
      } else {
        this.token_key = token_key;
      }
    }
    if (isNotEmpty(expiry_key)) {
      // let's convert Golang's JSONPath to NodeJS's jsonpath-plus
      if (expiry_key.charAt(0) === '{' && expiry_key.charAt(expiry_key.length -1) === '}') {
        this.expiry_key = '$' + expiry_key.substring(1, expiry_key.length - 1)
      } else {
        this.expiry_key = expiry_key;
      }
    }
    this.time_fmt = time_fmt; // defaults to Golang's RFC3339Nano https://golang.org/pkg/time/
  }

  get auth_token() {
    return this.access_token;
  }
}

class ExecAuthProvider {
  constructor({ 'apiVersion': api_version, 'args': args, 'command': command,
      'env': env}) {
    this.api_version = api_version;
    this.args = args;
    this.command = command;
    this.env = env;
    this.expiry = Date.now()
  }

  get auth_token() {
    return this.token;
  }
}

module.exports.AuthProvider = AuthProvider;
module.exports.User = User;
