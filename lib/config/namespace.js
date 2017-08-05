'use strict';

class Namespace {

  constructor(name) {
    this.name = name;
  }
}

Namespace.default = new Namespace();

module.exports = Namespace;