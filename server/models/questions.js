var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var QuestionsSchema = new Schema(
  {
    title: {type: String, required: true},
    summary: {type: String, required: true},
    text: {type: String, required: true},
    tags: [{type: Schema.Types.ObjectId, ref: 'Tag', required: true}],
    answers: [{type: Schema.Types.ObjectId, ref: 'Answer',}],
    asked_by: {type: String, default: 'Anonymous'},
    ask_date_time: {type: Date, default: Date.now},
    views: {type: Number, default: 0},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
    votes: {type: Number, default: 0},
    upvoters: [{type: String}],
    downvoters: [{type: String}],
  }
);

QuestionsSchema
.virtual('url')
.get(function () {
  return '/posts/questions/' + this._id;
});

//Export model
module.exports = mongoose.model('Questions', QuestionsSchema);