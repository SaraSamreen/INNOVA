// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { forgotPassword } = require('../controllers/authController');

router.post('/forgot-password', forgotPassword);

module.exports = router;
// In AuthPage.js - handleLoginSubmit
const handleLoginSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }) // Remove role
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // Store user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    alert('Login successful');
    
    // Redirect based on ACTUAL role from database
    window.location.href = data.user.role === 'admin' ? '/admin' : '/dashboard';
  } catch (err) {
    setError(err.message || 'Login failed. Please check your credentials.');
  } finally {
    setLoading(false);
  }
};