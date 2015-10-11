var express = require('express');
//var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();
var bodyParser = require('body-parser');
var shortid = require('shortid');

// models
var mongoose = require('mongoose');
require('./models/Boards');
mongoose.connect("mongodb://localhost/ponk");
var Board = mongoose.model("Board");


app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

app.use('/vendor', express.static(__dirname + '/node_modules'));

app.get('/board/:url', function(req, res) {
  Board.findOne({link: req.params.url}, function(err, data) {
    res.json(data);
  });
});

// Save board
app.put('/board/:url', function(req, res) {
  Board.update({link: req.params.url}, req.body, {}, function(err, response) {
    res.json(response);
  });
  console.log("save");
});

app.post('/board', function(req, res) {

});

app.get('/*', function (req, res) {
  var options = {
    root: __dirname + '/public/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };
  res.sendFile('index.html', options);
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});
