var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UsersSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: [/\S+@\S+\.\S+/, 'is invalid'], index: true },
    username: { type: String, required: true, index: true },
    password: { type: String, required: true },
    reputation: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
    memberSince: { type: Date, default: Date.now },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Questions' }],
    createdTags: [{ type: Schema.Types.ObjectId, ref: 'Tags' }],
    postedAnswers: [{ type: Schema.Types.ObjectId, ref: 'Answers' }]
  });

UsersSchema
  .virtual('url')
  .get(function () {
    return '/users/' + this._id;
  });

module.exports = mongoose.model('Users', UsersSchema);
