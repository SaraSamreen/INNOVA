const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Add this package: npm install jsonwebtoken

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, age, hobbies } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with all fields
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,
      age: age || undefined,
      hobbies: hobbies || []
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production', 
      { expiresIn: '1h' }
    );
    
    // Log the newly created user for debugging
    console.log('User created successfully:', { 
      id: user._id, 
      email: user.email 
    });
    
    res.status(201).json({ 
      message: 'Signup successful', 
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error during signup', error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production', 
      { expiresIn: '1h' }
    );
    
    // Log the login for debugging
    console.log('User logged in successfully:', { 
      id: user._id, 
      email: user.email 
    });
    
    res.status(200).json({ 
      message: 'Login successful', 
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// Get user profile route (protected)
router.get('/profile', async (req, res) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production'
    );
    
    // Find user by id
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;