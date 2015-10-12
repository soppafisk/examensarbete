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
  Board.findOne({slug: req.params.url}, function(err, data) {
    res.json(data);
  });
});

// Save board
app.put('/board/:url', function(req, res) {
  var board = req.body;
  console.log(req.body);
  delete board._id;
  delete board.slug;

  Board.findOneAndUpdate({slug: req.params.url}, board, {upsert: true}, function(err, response) {
    console.log(response);
    res.json(response);
    if(err){
      console.log(err);
    }
  });
//console.log(req.body);
});

app.post('/board', function(req, res) {

});

app.all('/board', function(req, res) {

});

app.get('/b/:url', function (req, res) {
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
