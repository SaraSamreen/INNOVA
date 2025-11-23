const mongoose = require('mongoose');

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
  
  // Plan field (for premium/freemium)
  plan: {
    type: String,
    enum: ['freemium', 'premium'],
    default: 'freemium'
  },
  
  // Admin permissions
  permissions: {
    manageUsers: { type: Boolean, default: false },
    manageContent: { type: Boolean, default: false },
    accessDashboard: { type: Boolean, default: false },
  },
  
  // Suspension fields
  suspended: {
    type: Boolean,
    default: false
  },
  suspendedAt: {
    type: Date,
    default: null
  },
  suspensionReason: {
    type: String,
    default: null
  },
  
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
}, {
  timestamps: true
});

// Method to check if user is suspended
userSchema.methods.isSuspended = function() {
  return this.suspended === true;
};

// Method to suspend user
userSchema.methods.suspend = function(reason = null) {
  this.suspended = true;
  this.suspendedAt = new Date();
  this.suspensionReason = reason;
  return this.save();
};

// Method to activate user
userSchema.methods.activate = function() {
  this.suspended = false;
  this.suspendedAt = null;
  this.suspensionReason = null;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);