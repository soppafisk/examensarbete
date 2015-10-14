var express = require('express');
//var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();
var shortid = require('shortid');
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// models
var mongoose = require('mongoose');
require('./models/Boards');
mongoose.connect("mongodb://localhost/ponk");
var Board = mongoose.model("Board");


app.use(express.static(__dirname + "/public"));

app.use('/vendor', express.static(__dirname + '/node_modules'));

app.get('/board/:url', function(req, res) {
  Board.findOne({slug: req.params.url}, function(err, data) {
    if (data)
      res.json(data);
    else {
      var emptyBoard = {title: "Ny board", slug: "", widgets: []};
      res.json(emptyBoard);
    }

  });
});

// Save board
app.put('/board/:url', function(req, res) {

  if (req.params.url === "") {
    console.log("ingen url");
  }
  var board = req.body;
  console.log(req.body);
  delete board._id;
  delete board.slug;

  Board.findOneAndUpdate({slug: req.params.url}, board, {upsert: true, new: true}, function(err, response) {
    console.log("save");
    res.json(response);
    if(err){
      console.log(err);
    }
  });
});

app.post('/board', function(req, res) {
  var data = req.body;
  var board = new Board(data);
  board.save(function(err, newBoard) {
    console.log(newBoard);
    res.json(newBoard);
  });
});

app.get('/b/(:url)?', function (req, res) {
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
