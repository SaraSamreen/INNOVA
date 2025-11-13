const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['image', 'video'], required: true },
  filename: { type: String, required: true },
  firebase_url: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Media', MediaSchema);
