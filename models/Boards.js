var mongoose = require('mongoose');
var shortid = require('shortid');
var Schema = mongoose.Schema;

var boardSchema = new Schema({
  title: String,
  slug: {type: String, unique: true, 'default': shortid.generate},
  createdAt: {type: Date, default: Date.now},
  widgets: [{wType: String, content: String, size: String, x: Number, y: Number}],
});

mongoose.model("Board", boardSchema);
