// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Add role field
  role: { 
    type: String, 
    enum: ['user', 'admin'], // Define allowed roles
    default: 'user' 
  },
  
  // Optional: Admin-specific permissions (if admin role)
  permissions: {
    manageUsers: { type: Boolean, default: false },
    manageContent: { type: Boolean, default: false },
    accessDashboard: { type: Boolean, default: false },
  },
  
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