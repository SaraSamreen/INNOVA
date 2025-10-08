const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production',
    { expiresIn: '1h' }
  );
};

// ---------------------- SIGNUP ----------------------
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, age, hobbies } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      age: age || undefined,
      hobbies: hobbies || []
    });

    await user.save();

    const token = generateToken(user._id);

    console.log('✅ User created:', { id: user._id, email: user.email });

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error during signup', error: err.message });
  }
});

// ---------------------- LOGIN ----------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid email' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid password' });

    const token = generateToken(user._id);

    console.log('✅ User logged in:', { id: user._id, email: user.email });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// ---------------------- AUTH MIDDLEWARE ----------------------
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production'
    );
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ---------------------- PROFILE ----------------------
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- DRAFTS ----------------------
router.post('/save-draft', authMiddleware, async (req, res) => {
  try {
    const { type, title, url } = req.body;
    if (!type || !url) return res.status(400).json({ message: 'type and url are required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.drafts.push({ type, title, url });
    await user.save();

    res.status(201).json({ message: 'Draft saved successfully', drafts: user.drafts });
  } catch (err) {
    console.error('Save draft error:', err);
    res.status(500).json({ message: 'Server error while saving draft' });
  }
});

router.get('/get-drafts', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('drafts');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ drafts: user.drafts });
  } catch (err) {
    console.error('Get drafts error:', err);
    res.status(500).json({ message: 'Server error while fetching drafts' });
  }
});


// ---------------------- UPDATE PROFILE ----------------------
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
});

// ---------------------- DELETE ACCOUNT ----------------------
router.delete("/delete-account", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ message: "Server error while deleting account" });
  }
});
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// ---------------------- FORGOT PASSWORD ----------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with that email." });
    }

    // Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before saving to DB for security
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set token and expiry (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Configure mail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"INNOVA Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Reset Your Password</h2>
        <p>Hello ${user.name || "User"},</p>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${resetLink}" 
           style="background-color:#007bff;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;"
           >Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error while sending reset email." });
  }
});

// ---------------------- RESET PASSWORD ----------------------
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    // Hash the token again for lookup
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Hash the new password
    const bcrypt = require("bcrypt");
    user.password = await bcrypt.hash(password, 10);

    // Clear token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful. You can now log in with your new password." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error while resetting password." });
  }
});


module.exports = router;
