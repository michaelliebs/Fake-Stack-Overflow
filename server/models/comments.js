var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommentSchema = new Schema(
    {
      text: {type: String, required: true, maxLength: 140},
      ans_by: {type: String, required: true},
      ans_date_time: {type: Date, default: Date.now},
      votes: {type: Number, default: 0},
      voters: [{type: String}],
    }
  );
  
CommentSchema
.virtual('url')
.get(function () {
  return '/posts/comment/' + this._id;
});

//Export model
module.exports = mongoose.model('Comment', CommentSchema);