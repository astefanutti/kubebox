'use strict';

const URI = require('urijs');

/**
 * clusters:
 * - cluster:
 *     certificate-authority: path/to/my/cafile
 *     server: https://horse.org:4443
 *   name: horse-cluster
 * - cluster:
 *     insecure-skip-tls-verify: true
 *     server: https://pig.org:443
 *   name: pig-cluster
 */
class Cluster {

  constructor({ server, name, 'insecure-skip-tls-verify': rejectUnauthorized,
      'certificate-authority': cert , 'certificate-authority-data': certData }) {
    if (typeof name !== 'undefined') {
      this.name = name;
    } else {
      const { hostname, port } = Cluster.getUrlParts(server);
      if (port) {
        this.name = `${hostname}:${port}`;
      } else {
        this.name = hostname;
      }
    }
    this.server = server;
    this.rejectUnauthorized = rejectUnauthorized;
    this.ca = cert;
    this.certData = certData;
  }

  static getUrlParts(url) {
    const uri = URI.parse(url);
    let parts = {};
    if (uri.protocol) {
      parts = uri;
    } else {
      URI.parseHost(url, parts);
    }
    return parts;
  }
}

module.exports = Cluster;