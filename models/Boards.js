var mongoose = require('mongoose');
var shortid = require('shortid');
var Schema = mongoose.Schema;

var boardSchema = new Schema({
  title: { type: String, 'default': "Ny ponk" },
  slug: {type: String, unique: true, 'default': shortid.generate},
  createdAt: {type: Date, default: Date.now},
  widgets: [{
    wType: String,
    content: String,
    youtubeURL: {
      type: String,
    },
    imageURL: {
      type: String,
    },
    sizeX: Number,
    sizeY: Number,
    col: Number,
    row: Number}],
  settings: {
    background: {
      type: String,
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Inte en giltig färg"
      }
    }
  }
});

mongoose.model("Board", boardSchema);
