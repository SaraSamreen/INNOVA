const mongoose = require('mongoose');

const instagramPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imagePath: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  scheduleTime: {
    type: Date,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'pending', 'posted', 'failed'],
    default: 'scheduled'
  },
  postedAt: {
    type: Date
  },
  instagramPostId: {
    type: String
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InstagramPost', instagramPostSchema);