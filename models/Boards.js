var mongoose = require('mongoose');
var shortid = require('shortid');
var Schema = mongoose.Schema;

var boardSchema = new Schema({
  title: String,
  slug: {type: String, unique: true, 'default': shortid.generate},
  createdAt: {type: Date, default: Date.now},
  widgets: [{wType: String, content: String, sizeX:Number, sizeY: Number, col: Number, row: Number}],
});

mongoose.model("Board", boardSchema);
