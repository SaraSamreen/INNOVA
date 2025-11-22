const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { authAdmin } = require('../firebaseAdmin');

// ✅ CONSISTENT JWT SECRET
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// ✅ CONSISTENT TOKEN GENERATION - Always use userId field
const generateToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() }, // Convert to string and use userId field
    JWT_SECRET,
    { expiresIn: '7d' } // Increased to 7 days
  );
};

// ---------------------- AUTH MIDDLEWARE ----------------------
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || req.header('x-auth-token');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Handle both "Bearer token" and plain token
    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Set userId consistently
    req.userId = decoded.userId;
    
    console.log('✅ Auth middleware passed - userId:', req.userId);
    
    next();
  } catch (err) {
    console.error('❌ Auth middleware error:', err.message);
    return res.status(401).json({ message: 'Invalid token', details: err.message });
  }
};

// ---------------------- SIGNUP ----------------------
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, age, hobbies } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      age: age || undefined,
      hobbies: hobbies || [],
      role: 'user'
    });

    await user.save();

    const token = generateToken(user._id);

    console.log('✅ User created:', { 
      id: user._id.toString(), 
      email: user.email, 
      role: user.role 
    });

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: { 
        id: user._id.toString(), // Convert to string
        userId: user._id.toString(), // Also include userId for consistency
        email: user.email, 
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ message: 'Server error during signup', error: err.message });
  }
});

// ---------------------- LOGIN ----------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    console.log('✅ User logged in:', { 
      id: user._id.toString(), 
      email: user.email, 
      role: user.role 
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id.toString(),
        userId: user._id.toString(), // Include both for compatibility
        email: user.email, 
        name: user.name,
        role: user.role || 'user',
        permissions: user.permissions
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// ---------------------- DRAFTS ----------------------
router.post('/save-draft', authMiddleware, async (req, res) => {
  try {
    const { type, title, url } = req.body;
    if (!type || !url) {
      return res.status(400).json({ message: 'type and url are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.drafts.push({ type, title, url });
    await user.save();

    res.status(201).json({ message: 'Draft saved successfully', drafts: user.drafts });
  } catch (err) {
    console.error('❌ Save draft error:', err);
    res.status(500).json({ message: 'Server error while saving draft' });
  }
});

router.get('/get-drafts', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('drafts');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ drafts: user.drafts });
  } catch (err) {
    console.error('❌ Get drafts error:', err);
    res.status(500).json({ message: 'Server error while fetching drafts' });
  }
});

// ---------------------- FORGOT PASSWORD ----------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with that email." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

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
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ message: "Server error while sending reset email." });
  }
});

// ---------------------- RESET PASSWORD ----------------------
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful. You can now log in with your new password." });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ message: "Server error while resetting password." });
  }
});
// Add these routes to routes/auth.js

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile (name and email)
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// ---------------------- GOOGLE LOGIN ----------------------
router.post("/google-login", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "ID token is required" });
    }

    const decodedToken = await authAdmin.verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        firebaseUid: uid,
        provider: "google",
        role: 'user'
      });
    } else {
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        user.provider = "google";
        await user.save();
      }
    }

    const token = generateToken(user._id);

    console.log('✅ Google login successful:', { 
      id: user._id.toString(), 
      email: user.email,
      role: user.role 
    });

    res.status(200).json({
      message: 'Google login successful',
      token,
      user: { 
        id: user._id.toString(),
        userId: user._id.toString(),
        email: user.email, 
        name: user.name, 
        provider: user.provider,
        role: user.role
      }
    });
  } catch (err) {
    console.error('❌ Google login error:', err);
    res.status(500).json({ message: 'Server error during Google login', error: err.message });
  }
});

module.exports = router;