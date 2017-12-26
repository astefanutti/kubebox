/**
 * Fit terminal columns and rows to the dimensions of its DOM element.
 *
 * ## Approach
 * - Rows: Truncate the division of the terminal parent element height by the terminal row height.
 *
 * - Columns: Truncate the division of the terminal parent element width by the terminal character
 * width (apply display: inline at the terminal row and truncate its width with the current
 * number of columns).
 * @module xterm/addons/fit/fit
 * @license MIT
 */

(function (fit) {
  if (typeof exports === 'object' && typeof module === 'object') {
    /*
     * CommonJS environment
     */
    module.exports = fit(require('../../xterm'));
  } else if (typeof define == 'function') {
    /*
     * Require.js is available
     */
    define(['../../xterm'], fit);
  } else {
    /*
     * Plain browser environment
     */
    fit(window.Terminal);
  }
})(function (Xterm) {
  var exports = {};

  function proposeGeometry(term) {
    if (!term.element.parentElement) {
      return null;
    }
    var parentElementStyle = window.getComputedStyle(term.element.parentElement);
    var parentElementHeight = parseInt(parentElementStyle.getPropertyValue('height'));
    var parentElementWidth = Math.max(0, parseInt(parentElementStyle.getPropertyValue('width')));
    var elementStyle = window.getComputedStyle(term.element);
    var elementPaddingVer = parseInt(elementStyle.getPropertyValue('padding-top')) + parseInt(elementStyle.getPropertyValue('padding-bottom'));
    var elementPaddingHor = parseInt(elementStyle.getPropertyValue('padding-right')) + parseInt(elementStyle.getPropertyValue('padding-left'));
    var availableHeight = parentElementHeight - elementPaddingVer;
    var availableWidth = parentElementWidth - elementPaddingHor;
    var geometry = {
      cols: Math.floor(availableWidth / term.renderer.dimensions.actualCellWidth),
      rows: Math.floor(availableHeight / term.renderer.dimensions.actualCellHeight)
    };
    return geometry;
  }
  exports.proposeGeometry = proposeGeometry;

  function fit(term) {
    var geometry = exports.proposeGeometry(term);
    if (geometry) {
      if (term.rows !== geometry.rows || term.cols !== geometry.cols) {
        term.renderer.clear();
      term.resize(geometry.cols, geometry.rows);
    }
    }
  }
  exports.fit = fit;

  Xterm.prototype.proposeGeometry = function () {
    return exports.proposeGeometry(this);
  };

  Xterm.prototype.fit = function () {
    return exports.fit(this);
  };

  return exports;
});
