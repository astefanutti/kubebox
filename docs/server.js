const express = require('express');

const app = express();

app.get('/env', function (req, res) {
  const { KUBEBOX_MASTER_API } = process.env;
  res.send({ KUBEBOX_MASTER_API });
});

app.use('/', express.static(__dirname + '/'));

app.listen(8080, () => console.log('Kubebox server listening on port 8080...'));
