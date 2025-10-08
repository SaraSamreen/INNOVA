const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  username: String,
  socialLinks: {
    tiktok: String,
    facebook: String,
    instagram: String,
  },
  privacy: {
    twoFactorAuth: { type: Boolean, default: false },
    dataSharing: { type: Boolean, default: false },
  },
  drafts: [
    {
      type: { type: String },
      title: String,
      url: String,
      date: { type: Date, default: Date.now },
    },
  ],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

});

module.exports = mongoose.model("User", userSchema);
