'use strict';
/**
 * auth-provider:
 *   name: oidc
 *   config:
 *     client-id: xxx
 *     client-secret: xxx
 *     id-token: ...idtoken...
 *     idp-issuer-url: https://myoidcprovider.com
 *     refresh-token: ...refreshtoken...
 */
class AuthProvider {

  constructor(name, {'idp-issuer-url': url, 'id-token': token, 'refresh-token': refresh_token,
      'client-id': client_id, 'client-secret': client_secret}) {
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
  }
}

module.exports = AuthProvider;