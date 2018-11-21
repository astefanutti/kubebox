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
      'client-key-data': keyBase64, 'auth-provider': authProvider }) {
    if (typeof name === 'undefined') {
      throw Error('User name must be defined!');
    }

    this.name = name;
    this.token = token;
    this.password = password;
    if (typeof password == 'undefined' && typeof token === 'undefined') {
      if (typeof authProvider !== 'undefined' && authProvider.name === 'oidc') {
        this.token = authProvider.config['id-token'];
      }      
    }
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

User.default = new User({ name: '', token: '' });

module.exports = User;
