var express = require('express');
//var routes = require('./routes');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');

mongoose.connect("mongodb://localhost/ponk");
var Schema = mongoose.Schema;

var boardSchema = new Schema({
  title: String,
  link: String,
  createdAt: {type: Date, default: Date.now},
  widgets: [{wType: String, content: String, size: String, x: Number, y: Number}],
});

var Board = mongoose.model("Board", boardSchema);

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

app.use('/vendor', express.static(__dirname + '/node_modules'));

app.get('/', function (req, res) {

});

app.get('/board', function(req, res) {
  Board.find(function(err, data) {
    res.json(data);
  });
});

app.put('/board/:id', function(req, res) {
  console.log(req.body);
  Board.update({_id: req.params.id}, req.body, {}, function(err, response) {
    console.log(response);
  });
  console.log("put");
});

app.post('/board', function(req, res) {
  console.log(req);
  var board1 = new Board({link: "ny länk", createdAt: new Date(),
    widgets: [{wType: "text", content: "content2", size: "2x4", x: 1, y: 2}],
  });
  board1.save(function (err) {
    if (err)
      console.error(err);
  });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});
