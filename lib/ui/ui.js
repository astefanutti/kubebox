const blessed = require('blessed');

module.exports.spinner    = require('./spinner');
module.exports.setContent = blessed.element.prototype.setContent;
module.exports.setLabel   = blessed.element.prototype.setLabel;

module.exports.Dashboard  = require('./dashboard');
module.exports.Exec       = require('./exec');
module.exports.login      = require('./login');
module.exports.namespaces = require('./namespaces');
module.exports.NavBar     = require('./navbar');
