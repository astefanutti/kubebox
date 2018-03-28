function authorization(req, res) {
  var use_sa_token = $KUBEBOX_USE_SA_TOKEN;
  if (use_sa_token && !req.headers.authorization && !req.args['access_token']) {
    return 'Bearer $KUBEBOX_SA_TOKEN';
  } else {
    return req.headers.authorization;
  }
}
