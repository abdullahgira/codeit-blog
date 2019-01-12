const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { commentSchema } = require('../comments/model');

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 120
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 10000
  },
  img: String,
  imgFile: String,
  comments: [commentSchema],
  likes: {
    number: { type: String, default: '0' },
    users: [
      {
        _id: mongoose.SchemaTypes.ObjectId,
        name: String,
        username: String,
        img: String
      }
    ]
  },
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: new mongoose.Schema({
      name: String,
      username: String,
      img: String
    })
  }
});

function validatePost(post) {
  const schema = {
    title: Joi.string()
      .min(10)
      .max(100)
      .required(),
    content: Joi.string()
      .min(50)
      .max(1500)
      .required(),
    imgFile: Joi.string(),
    img: Joi.string()
  };
  return Joi.validate(post, schema);
}

exports.Post = mongoose.model('posts', postSchema);
exports.validate = validatePost;
