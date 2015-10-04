var express = require('express');
//var routes = require('./routes');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var app = express();

app.use(express.static(__dirname + "/public"));

app.use('/vendor', express.static(__dirname + '/node_modules'));

app.get('/', function (req, res) {

});

var Schema = mongoose.Schema;

var boardSchema = new Schema({
  link: String,
  widgets: [{type: String, content: String, size: String, x: Number, y: Number}],
});



var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});
