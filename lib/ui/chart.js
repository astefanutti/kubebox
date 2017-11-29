'use strict';

const blessed = require('blessed'),
      line    = require('./contrib/line'),
      util    = require('../util');

const { humanBytes } = util;

class Chart {

  constructor(parent, client, debug) {
    let data, message;

    const graph = line({
      parent : parent,
      top    : 3,
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
      abbreviate    : humanBytes,
      numYLabels    : 5,
    });

    graph.on('prerender', () => {
      if (data) {
        graph.setData(data);
      }
    });

    this.message = function (msg) {
      message = blessed.text({
        parent  : graph,
        tags    : true,
        top     : 'center',
        left    : 'center',
        width   : 'shrink',
        height  : 'shrink',
        align   : 'center',
        valign  : 'middle',
        bg      : 'red',
        content : msg,
      });
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
