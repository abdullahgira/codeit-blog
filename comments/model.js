const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    maxlength: 30,
    lowercase: true
  },
  body: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 10000
  },
  upvotes: { type: String, default: '0' },
  date: { type: Date, default: Date.now }
});

function validateComment(comment) {
  const schema = {
    username: Joi.string()
      .alphanum()
      .min(6)
      .max(30)
      .required(),
    body: Joi.string()
      .max(150)
      .required(),
    img: Joi.string()
  };
  return Joi.validate(comment, schema);
}

exports.Comment = mongoose.model('comments', commentSchema);
exports.commentSchema = commentSchema;
exports.validate = validateComment;
