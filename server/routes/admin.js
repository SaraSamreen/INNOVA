// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const mongoose = require("mongoose");

// Import Purchase model from payment routes
// If Purchase is defined in payment.js, you need to either:
// 1. Export it from payment.js, or
// 2. Define it here as well (recommended if it's a shared model)

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  templateId: { type: Number, required: true },
  templateTitle: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  paymentIntentId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
  purchaseDate: { type: Date, default: Date.now },
  metadata: { type: Object }
});

const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);

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

// ==================== USER MANAGEMENT ROUTES ====================

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

// ==================== PAYMENT TRACKING ROUTES ====================

// GET all transactions with user details
router.get("/transactions", async (req, res) => {
  try {
    // Fetch all purchases and populate user details
    const purchases = await Purchase.find()
      .populate('userId', 'name email plan')
      .sort({ purchaseDate: -1 });

    // Format the response for frontend
    const formattedTransactions = purchases.map(p => ({
      _id: p._id,
      transactionId: p.paymentIntentId,
      userName: p.userId?.name || 'Unknown User',
      userEmail: p.userId?.email || 'N/A',
      amount: p.amount,
      currency: p.currency,
      plan: p.userId?.plan || 'freemium',
      status: p.status === 'succeeded' ? 'completed' : p.status,
      date: p.purchaseDate,
      templateId: p.templateId,
      templateTitle: p.templateTitle,
      user: {
        id: p.userId?._id,
        name: p.userId?.name,
        email: p.userId?.email,
        plan: p.userId?.plan
      }
    }));

    res.json({ 
      success: true,
      transactions: formattedTransactions,
      count: formattedTransactions.length
    });

  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transactions',
      message: error.message 
    });
  }
});

// GET transaction statistics
router.get("/stats", async (req, res) => {
  try {
    // Calculate total revenue (succeeded payments only)
    const totalRevenue = await Purchase.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Calculate pending revenue
    const pendingRevenue = await Purchase.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Count transactions by status
    const totalTransactions = await Purchase.countDocuments();
    const successfulTransactions = await Purchase.countDocuments({ status: 'succeeded' });
    const failedTransactions = await Purchase.countDocuments({ status: 'failed' });
    const pendingTransactions = await Purchase.countDocuments({ status: 'pending' });

    // Get premium vs freemium user counts
    const premiumUsers = await User.countDocuments({ plan: 'premium' });
    const freemiumUsers = await User.countDocuments({ plan: { $ne: 'premium' } });

    res.json({
      success: true,
      stats: {
        revenue: {
          total: totalRevenue[0]?.total || 0,
          pending: pendingRevenue[0]?.total || 0
        },
        transactions: {
          total: totalTransactions,
          successful: successfulTransactions,
          failed: failedTransactions,
          pending: pendingTransactions
        },
        users: {
          premium: premiumUsers,
          freemium: freemiumUsers,
          total: premiumUsers + freemiumUsers
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      message: error.message 
    });
  }
});

// GET single transaction details
router.get("/transactions/:transactionId", async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.transactionId)
      .populate('userId', 'name email plan');

    if (!purchase) {
      return res.status(404).json({ 
        error: 'Transaction not found' 
      });
    }

    res.json({
      success: true,
      transaction: {
        _id: purchase._id,
        transactionId: purchase.paymentIntentId,
        userName: purchase.userId?.name,
        userEmail: purchase.userId?.email,
        amount: purchase.amount,
        currency: purchase.currency,
        plan: purchase.userId?.plan,
        status: purchase.status,
        date: purchase.purchaseDate,
        templateId: purchase.templateId,
        templateTitle: purchase.templateTitle,
        metadata: purchase.metadata
      }
    });

  } catch (error) {
    console.error('❌ Error fetching transaction:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transaction',
      message: error.message 
    });
  }
});

// Add these routes to your existing routes/admin.js file

// ==================== USER SUSPENSION & DELETION ROUTES ====================

// POST: Suspend user account
router.post("/suspend/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't allow suspending admin accounts
    if (user.role === 'admin') {
      return res.status(403).json({ message: "Cannot suspend admin accounts" });
    }

    user.suspended = true;
    user.suspendedAt = new Date();
    await user.save();

    console.log(`🚫 User suspended: ${user.email}`);
    
    res.json({ 
      success: true,
      message: "User suspended successfully", 
      user: { 
        id: user._id,
        email: user.email, 
        suspended: user.suspended 
      } 
    });
  } catch (err) {
    console.error("Error suspending user:", err);
    res.status(500).json({ message: "Failed to suspend user" });
  }
});

// POST: Activate suspended user account
router.post("/activate/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.suspended = false;
    user.suspendedAt = null;
    await user.save();

    console.log(`✅ User activated: ${user.email}`);
    
    res.json({ 
      success: true,
      message: "User activated successfully", 
      user: { 
        id: user._id,
        email: user.email, 
        suspended: user.suspended 
      } 
    });
  } catch (err) {
    console.error("Error activating user:", err);
    res.status(500).json({ message: "Failed to activate user" });
  }
});

// DELETE: Permanently delete user account
router.delete("/delete/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't allow deleting admin accounts
    if (user.role === 'admin') {
      return res.status(403).json({ message: "Cannot delete admin accounts" });
    }

    // Delete all user's purchases
    await Purchase.deleteMany({ userId: user._id });

    // Delete the user
    await User.findByIdAndDelete(req.params.userId);

    console.log(`🗑️ User deleted: ${user.email}`);
    
    res.json({ 
      success: true,
      message: "User and all associated data deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});
// GET transactions by user
router.get("/transactions/user/:userId", async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.params.userId })
      .populate('userId', 'name email plan')
      .sort({ purchaseDate: -1 });

    const formattedTransactions = purchases.map(p => ({
      _id: p._id,
      transactionId: p.paymentIntentId,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      date: p.purchaseDate,
      templateId: p.templateId,
      templateTitle: p.templateTitle
    }));

    res.json({
      success: true,
      transactions: formattedTransactions,
      count: formattedTransactions.length
    });

  } catch (error) {
    console.error('❌ Error fetching user transactions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user transactions',
      message: error.message 
    });
  }
});

module.exports = router;