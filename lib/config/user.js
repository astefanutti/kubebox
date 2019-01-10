'use strict';

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
 *          client-id: xxx
 *          client-secret: xxx
 *          id-token: ...idtoken...
 *          idp-issuer-url: https://myoidcprovider.com
 *          refresh-token: ...refreshtoken...
 */
class User {

  constructor({ name, token, username, password, 'client-certificate': certificatePath,
      'client-certificate-data': certificateBase64, 'client-key': keyPath,
      'client-key-data': keyBase64, 'auth-provider': auth_provider }) {
    if (typeof name === 'undefined') {
      throw Error('User name must be defined!');
    }
    if (typeof auth_provider !== 'undefined') {
      this.auth_provider = new AuthProvider(auth_provider.name, auth_provider.config);
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

  constructor(name, { 'idp-issuer-url': url, 'id-token': token, 'refresh-token': refresh_token,
      'client-id': client_id, 'client-secret': client_secret, 'idp-certificate-authority' : ca }) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.name = name;
    this.token = token;
    this.refresh_token = refresh_token;
    if (url && url.endsWith('/')) {
      this.url = url.slice(0, -1);
    } else {
      this.url = url;
    }
    this.idp_certificate_authority = ca;
  }
}

module.exports.AuthProvider = AuthProvider;
module.exports.User = User;
