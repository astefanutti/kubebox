module.exports.focusIndicator = function (element) {
  let _label = element._label.content;

  const setLabel = element.setLabel;
  element.setLabel = label => {
    _label = label;
    setLabel.call(element, element.focused ? ' ● ' + label : label);
  }

  element.on('focus', () => {
    setLabel.call(element, ' ● ' + _label);
    element.screen.render();
  });

  element.on('blur', () => {
    setLabel.call(element, _label);
    element.screen.render();
  });

  return element;
};
