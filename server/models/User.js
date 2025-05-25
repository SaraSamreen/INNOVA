const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false // Making it optional if you want to keep backward compatibility
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  hobbies: {
    type: [String],
    default: []
  },
  age: {
    type: Number
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema, 'Signup');