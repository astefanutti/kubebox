module.exports.error = function (message) {
  const err = Error(message);
  err.name = 'Kubebox';
  return err;
}
