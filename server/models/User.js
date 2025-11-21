// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Make optional for Google users
  
  // Firebase fields
  firebaseUid: { type: String, sparse: true, unique: true },
  provider: { type: String, default: 'email' }, // 'email' or 'google'
  
  // Role field
  role: { 
    type: String, 
    enum: ['user', 'admin'],
    default: 'user' 
  },
  
  // Admin permissions
  permissions: {
    manageUsers: { type: Boolean, default: false },
    manageContent: { type: Boolean, default: false },
    accessDashboard: { type: Boolean, default: false },
  },
  
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
}, {
  timestamps: true
});

// Method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

module.exports = mongoose.model("User", userSchema);