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
    if (err) {
      return res.status(400).send({
        message: "Något gick fel"
      });
    } else {
      if(!data) {
        return res.status(404).send();
      }
      return res.json(data);

    }
  });
});

// Save board
app.put('/board/:url', function(req, res) {

  var board = req.body;

  if (board._id)
    delete board._id;
  if (board.slug)
    delete board.slug;

  Board.findOneAndUpdate({slug: req.params.url}, board, {runValidators: true, new: true}, function(err, response) {
    if(err){
      return res.status(404).send({
        message: "Något gick fel"
      });
    }
    console.log("put " + req.params.url);
    return res.json(response);
  });
});

app.post('/board', function(req, res) {
  var data = req.body;
  var board = new Board(data);
  board.save(function(err, newBoard) {
    if(err) {
      console.log(err);
      return res.status(404).send({
        message: "Något gick fel"
      });
    }
    console.log("post " + newBoard.slug);
    return res.json(newBoard);
  });
});

app.get('/b/(:url)?', function (req, res) {
  var options = {
    root: __dirname + '/public/',
    dotfiles: 'deny',
    headers: {
    }
  };
  res.sendFile('index.html', options);
});

var server = app.listen(80, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});
