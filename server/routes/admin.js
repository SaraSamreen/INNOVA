// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Middleware to check if user is admin (add proper auth later)
const isAdmin = async (req, res, next) => {
  try {
    // TODO: Get user ID from JWT token
    // For now, just checking role exists
    next();
  } catch (err) {
    res.status(403).json({ message: "Access denied" });
  }
};

// GET all users (excluding admins)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select("-password -resetPasswordToken -resetPasswordExpires");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// GET all admins
router.get("/admins", async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select("-password -resetPasswordToken -resetPasswordExpires");
    res.json(admins);
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ message: "Failed to fetch admins" });
  }
});

// GET all users (both regular users and admins)
router.get("/all-users", async (req, res) => {
  try {
    const allUsers = await User.find()
      .select("-password -resetPasswordToken -resetPasswordExpires");
    
    // Separate by role for easier frontend handling
    const users = allUsers.filter(u => u.role === 'user');
    const admins = allUsers.filter(u => u.role === 'admin');
    
    res.json({
      users,
      admins,
      total: allUsers.length
    });
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ message: "Failed to fetch all users" });
  }
});

// ONE-TIME FIX: Add role field to all existing users
router.post("/fix-existing-users", async (req, res) => {
  try {
    // Update all users without a role field to 'user'
    const result = await User.updateMany(
      { role: { $exists: false } },
      { 
        $set: { 
          role: 'user',
          permissions: {
            manageUsers: false,
            manageContent: false,
            accessDashboard: false
          }
        } 
      }
    );

    // Specifically set admin@gmail.com as admin
    await User.updateOne(
      { email: 'admin@gmail.com' },
      { 
        $set: { 
          role: 'admin',
          permissions: {
            manageUsers: true,
            manageContent: true,
            accessDashboard: true
          }
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with role field`);
    
    res.json({ 
      message: "✅ All existing users updated successfully",
      regularUsersUpdated: result.modifiedCount,
      adminSet: true
    });
  } catch (err) {
    console.error("Error fixing users:", err);
    res.status(500).json({ message: "Failed to update users" });
  }
});

// POST: Promote user to admin
router.post("/promote/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.role = 'admin';
    user.permissions = {
      manageUsers: true,
      manageContent: true,
      accessDashboard: true
    };
    await user.save();
    
    res.json({ 
      message: "User promoted to admin", 
      user: { email: user.email, role: user.role } 
    });
  } catch (err) {
    console.error("Error promoting user:", err);
    res.status(500).json({ message: "Failed to promote user" });
  }
});

// POST: Demote admin to user
router.post("/demote/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.role = 'user';
    user.permissions = {
      manageUsers: false,
      manageContent: false,
      accessDashboard: false
    };
    await user.save();
    
    res.json({ 
      message: "Admin demoted to user", 
      user: { email: user.email, role: user.role } 
    });
  } catch (err) {
    console.error("Error demoting user:", err);
    res.status(500).json({ message: "Failed to demote user" });
  }
});

module.exports = router;