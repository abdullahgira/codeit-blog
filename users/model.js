const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const { postSchema } = require('../posts/model');

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 50
  },
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    maxlength: 30,
    lowercase: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 255
  },
  img: String,
  imgFile: String,
  followers: {
    number: {
      type: String,
      default: '0'
    },
    users: [
      {
        name: String,
        username: String,
        img: String,
        isfollowing: { type: Boolean, default: false }
      }
    ]
  },
  following: {
    number: {
      type: String,
      default: '0'
    },
    users: [
      {
        name: String,
        username: String,
        img: String
      }
    ]
  },
  posts: [
    {
      type: new mongoose.Schema({
        title: String,
        img: String
      })
    }
  ],
  notifications: [
    {
      title: String,
      body: String,
      img: String,
      ispost: Boolean,
      isuser: Boolean,
      postID: String,
      username: String,
      name: String,
      date: { type: Date }
    }
  ],
  likes: {
    number: { type: String, default: '0' },
    posts: [
      {
        type: new mongoose.Schema({
          title: String,
          img: String,
          username: String
        })
      }
    ]
  },
  bookmarks: {
    number: { type: String, default: '0' },
    posts: [{ type: Schema.Types.ObjectId, title: String }]
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Joi validations
function validateUser(user) {
  const schema = {
    name: Joi.string()
      .min(4)
      .max(255)
      .required(),
    username: Joi.string()
      .alphanum()
      .min(6)
      .max(30)
      .required(),
    email: Joi.string()
      .email({ minDomainAtoms: 2 })
      .required(),
    password: Joi.string()
      .min(8)
      .max(255)
      .required()
    // img: Joi.string()
  };
  return Joi.validate(user, schema);
}

function validateUserUpdate(user) {
  const schema = {
    name: Joi.string()
      .min(4)
      .max(50),
    username: Joi.string()
      .alphanum()
      .min(6)
      .max(30),
    email: Joi.string().email({ minDomainAtoms: 2 }),
    password: Joi.string()
      .min(8)
      .max(255),
    imgFile: Joi.string()
  };
  return Joi.validate(user, schema);
}

function validateLogin(req) {
  const schema = {
    email: Joi.string()
      .email({ minDomainAtoms: 2 })
      .required(),
    password: Joi.string()
      .min(6)
      .max(255)
      .required()
  };
  return Joi.validate(req, schema);
}

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { username: this.username, isAdmin: this.isAdmin },
    config.get('jwtPrivateKey')
  );
};

exports.User = mongoose.model('users', userSchema);
exports.validate = validateUser;
exports.validateUpdate = validateUserUpdate;
exports.validateLogin = validateLogin;
