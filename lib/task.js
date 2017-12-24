'use strict';

class Cancellations {

  constructor() {
    this.cancellations = {};
  }

  add(key, cancellation) {
    const leaf = key.split('.').reduce((node, k) => {
      if (!(k in node))
        node[k] = [];
      return node[k];
    }, this.cancellations);
    leaf.push(cancellation);
  }

  // TODO: we may want to support promises as return type for the cancellations
  // and return a promise that resolves when all cancellations resolve
  run(key) {
    const node = key.split('.').reduce((node, k) => node[k] || {}, this.cancellations);
    if (!Array.isArray(node)) return;
    // we may want to run the cancellations in reverse order
    node.forEach(cancellation => cancellation());
    node.length = 0;
    for (const child in node) {
      if (Array.isArray(node[child])) {
        this.run(key + '.' + child);
      }
    }
  }

  set(key, cancellation) {
    this.run(key);
    this.add(key, cancellation);
  }

  // TODO: use a dedicated widget to dump current tasks
  toString(node = this.cancellations, key = 'cancellations') {
    // debug.log(`key: ${key}, isArray: ${Array.isArray(node)}`);
    for (const child in node) {
      this.toString(node[child], key + '.' + child);
    }
  }
}

exports.Cancellations = Cancellations;
