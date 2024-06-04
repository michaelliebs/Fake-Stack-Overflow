var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TagsSchema = new Schema(
  {
    name: {type: String, required: true, unique: true},
  }
);

TagsSchema
.virtual('url')
.get(function () {
  return '/posts/tags/' + this._id;
});

//Export model
module.exports = mongoose.model('Tag', TagsSchema);