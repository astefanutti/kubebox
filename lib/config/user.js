'use strict';
const util = require('../util');

const { isNotEmpty } = util;

/**
 * users:
 * - name: blue-user
 *   user:
 *     token: blue-token
 * - name: green-user
 *   user:
 *     client-certificate: path/to/my/client/cert
 *     client-key: path/to/my/client/key
 */
class User {

  constructor(name, token, username, password, certificatePath, certificateBase64, keyPath, keyBase64) {
    if(typeof name === 'undefined') 
      throw new Error("User name must be defined!");
    
    if(isNotEmpty(token) && isNotEmpty(username) && isNotEmpty(password)) 
      throw new Error("Username/password and token are mutually exclusive!");
    
    this.name              = name;
    this.token             = token;
    this.password          = password;
    this.certificatePath   = certificatePath;
    this.certificateBase64 = certificateBase64;
    this.keyPath           = keyPath;
    this.keyBase64         = keyBase64;
    if(typeof username === 'undefined'){
      this.username        = name.split('/')[0];
    } else {
      this.username        = username;
    }
  }
}

User.default = new User('', '');

module.exports = User;