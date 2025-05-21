import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../Styles/Signup.css";

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert('Signup successful');
      window.location.href = '/dashboard';
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const mockGoogleData = {
        email: 'user@example.com',
        name: 'Google User',
        googleId: '12345google'
      };

      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockGoogleData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem('token', data.token);
      alert('Google signup successful!');
      window.location.href = '/dashboard';
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-container">
      <div className="signup-section">
        <div className="logo-container">
          <h2 className="gradient-text">Welcome to INNOVA</h2>
          <p className="welcome-text">Create your account</p>
        </div>

        <div className="auth-buttons">
          <button className="auth-button google-button" onClick={handleGoogleSignup}>
            <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" className="auth-icon" />
            Join with Google
          </button>
        </div>

        <div className="divider">or</div>

        <form onSubmit={handleEmailSignup}>
          <input
            type="email"
            placeholder="Email"
            className="email-input"
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="email-input"
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="create-account-button">Create Account</button>
        </form>


        <div className="login-prompt">
          Already have an account? <Link to="/login" className="login-link">Login</Link>
        </div>

        <div className="terms">
          By signing up, you agree to our Terms & Conditions and Privacy Policy.
        </div>
      </div>

      <div className="preview-section">
        <div className="video-box">
          <video controls autoPlay muted loop className="video">
            <source src="/videos/Water-bottleAd.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
};

export default Signup;
