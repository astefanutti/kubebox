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

  constructor(server, name, rejectUnauthorized, cert ,certData) {
      if (typeof name !== 'undefined') {
        this.name = name;
      } else {
        const { protocol, hostname, port } = URI.parse(server);
        this.name                          = hostname + ':' + port; 
      }
      this.server             = server;
      this.rejectUnauthorized = rejectUnauthorized;
      //TODO: load certData
      this.ca                 = cert;
      this.certData           = certData;
  }

}

Cluster.default = new Cluster(undefined, '');

module.exports = Cluster;