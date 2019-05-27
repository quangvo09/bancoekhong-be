var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

const port = process.env.PORT || 3000

app.set('port', port);
app.use(bodyParser.json());
app.use(cors());

app.get('/', function(req, res) {
  res.json('Server is running...');
})

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});

require('./predict')(app);
