'use strict';

const blessed = require('blessed'),
      line    = require('./contrib/line');

class Chart {

  constructor(parent, options = {}) {
    let data, message;

    const graph = line(Object.assign({
      parent : parent,
      tags   : true,
      legend : { width : 8 },
      style  : {
        border : {
          fg: 'white',
        },
        text     : 'white',
        baseline : [80, 80, 80],
      },
      xLabelPadding : 1,
      xPadding      : 1,
      yPadding      : 1,
      showLegend    : true,
      numYLabels    : 5,
    }, options));

    graph.on('attach', function () {
      if (data) {
        graph.setData(data);
      }
    });

    graph.on('resize', function () {
      graph.resize();
      if (data) {
        graph.setData(data);
      }
    });

    this.toggle = function () {
      graph.toggle();
    };

    Object.defineProperty(this, 'visible', {
      get: function() {
        return graph.visible;
      }
    });

    this.message = function (msg, options = {}) {
      if (message) message.destroy();
      message = blessed.text(Object.assign({
        parent  : graph,
        tags    : true,
        top     : '50%-2',
        left    : 'center',
        width   : 'shrink',
        height  : 'shrink',
        align   : 'center',
        valign  : 'middle',
        bg      : 'red',
        content : msg,
      }, options));
    };

    this.setData = function (d) {
      data = d;
      if (!graph.detached) {
        graph.setData(data);
      }
    };

    this.reset = function () {
      graph.clear();
      data = null;
      if (graph.legend) graph.legend.destroy();
      if (message) message.destroy();
    };
  }
}

module.exports = Chart;
