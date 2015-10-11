var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var boardSchema = new Schema({
  title: String,
  link: String,
  createdAt: {type: Date, default: Date.now},
  widgets: [{wType: String, content: String, size: String, x: Number, y: Number}],
});

mongoose.model("Board", boardSchema);
