var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AnswersSchema = new Schema(
    {
      text: {type: String, required: true},
      ans_by: {type: String, required: true},
      ans_date_time: {type: Date, default: Date.now},
      comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
      votes: {type: Number, default: 0},
      upvoters: [{type: String}],
      downvoters: [{type: String}],
    }
  );
  
AnswersSchema
.virtual('url')
.get(function () {
  return '/posts/answer/' + this._id;
});

//Export model
module.exports = mongoose.model('Answer', AnswersSchema);