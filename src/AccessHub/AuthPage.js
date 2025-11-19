import React, { useState } from 'react';
import { User, Eye, EyeOff, Mail, Lock } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateEmail = (email) => {
    if (/^\d/.test(email)) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
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

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateEmail(signupEmail)) {
      setError('Please enter a valid email address (cannot start with a number).');
      setLoading(false);
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: signupEmail, password: signupPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Store user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      alert('Signup successful');
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
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
      
      // Store user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      alert('Google authentication successful!');
      window.location.href = data.user.role === 'admin' ? '/admin' : '/dashboard';
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#c3d5ef] overflow-hidden">
      <div className="h-full w-full">
        <div className="grid md:grid-cols-2 h-full">
          {/* Image Side */}
          <div className={`relative bg-gradient-to-br from-[#2E7BC8] to-[#1E6BB0] overflow-hidden ${
            isLogin ? 'order-1' : 'order-2'
          }`}>
            <div className="absolute inset-0">
              <img
                src="/luxury.jpg"
                alt="Luxury fashion"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="relative z-10 h-full flex flex-col items-center justify-center -mt-16 p-8 text-white">
              <div className="max-w-lg text-center">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  INNOVA
                </h1>
                <p className="text-lg md:text-xl text-blue-100 drop-shadow-md">
                  Empowering innovation through elegant design and cutting-edge technology
                </p>
              </div>
            </div>
          </div>

          {/* Forms Side */}
          <div className={`relative overflow-hidden bg-[#f9fafb] ${
            isLogin ? 'order-2' : 'order-1'
          }`}>
            <div className="relative w-full h-full">
              {/* Login Form */}
              <div className={`absolute inset-0 transition-all duration-700 ${
                isLogin ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
              }`}>
                <div className="h-full overflow-y-auto">
                  <div className="min-h-full flex flex-col justify-center p-8 lg:p-12">
                    <div className="max-w-md mx-auto w-full">
                      <h2 className="text-4xl font-bold text-[#3E8EDE] mb-2">Login</h2>
                      <p className="text-[#374151] mb-8">Welcome back! Please login to continue</p>

                      {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-[14px] mb-6">
                          <p className="text-sm font-medium">{error}</p>
                        </div>
                      )}

                      <div className="space-y-6">
                        {/* Google Button */}
                        <button
                          onClick={handleGoogleAuth}
                          type="button"
                          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#d1d5db] rounded-[14px] py-3 px-4 hover:bg-[#f1f3f5] transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                        >
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
                            alt="Google"
                            className="w-5 h-5"
                          />
                          <span className="font-semibold text-[#111827]">Login with Google</span>
                        </button>

                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-px bg-[#d1d5db]"></div>
                          <span className="text-[#374151] text-sm">or</span>
                          <div className="flex-1 h-px bg-[#d1d5db]"></div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[#111827]">Email Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-[#374151]" />
                            </div>
                            <input
                              type="email"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              required
                              className="w-full pl-12 pr-4 py-3 border-2 border-[#d1d5db] rounded-[14px] focus:border-[#3E8EDE] focus:ring-2 focus:ring-[#3E8EDE]/20 outline-none transition-all bg-[#f1f3f5]"
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[#111827]">Password</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-[#374151]" />
                            </div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              required
                              className="w-full pl-12 pr-12 py-3 border-2 border-[#d1d5db] rounded-[14px] focus:border-[#3E8EDE] focus:ring-2 focus:ring-[#3E8EDE]/20 outline-none transition-all bg-[#f1f3f5]"
                              placeholder="Enter your password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#374151] hover:text-[#3E8EDE] transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-end">
                          <button 
                            type="button" 
                            onClick={() => window.location.href = '/forgotpass'}
                            className="text-sm font-medium text-[#3E8EDE] hover:text-[#2E7BC8] transition-colors"
                          >
                            Forgot Password?
                          </button>
                        </div>

                        {/* Login Button */}
                        <button
                          onClick={handleLoginSubmit}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-[#3E8EDE] to-[#2E7BC8] text-white py-3.5 rounded-[14px] font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Logging in...</span>
                            </>
                          ) : (
                            <span>Login</span>
                          )}
                        </button>

                        <div className="text-center pt-4">
                          <p className="text-sm text-[#374151]">
                            Don't have an account?{' '}
                            <button
                              type="button"
                              onClick={() => setIsLogin(false)}
                              className="text-[#3E8EDE] font-semibold hover:text-[#2E7BC8] underline underline-offset-2"
                            >
                              Create an account
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signup Form */}
              <div className={`absolute inset-0 transition-all duration-700 ${
                !isLogin ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
              }`}>
                <div className="h-full overflow-y-auto">
                  <div className="min-h-full flex flex-col justify-center p-8 lg:p-12 py-8">
                    <div className="max-w-md mx-auto w-full">
                      <h2 className="text-4xl font-bold text-[#3E8EDE] mb-2">Sign Up</h2>
                      <p className="text-[#374151] mb-6">Create your account and start your journey</p>

                      {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-[14px] mb-4">
                          <p className="text-sm font-medium">{error}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Google Button */}
                        <button
                          onClick={handleGoogleAuth}
                          type="button"
                          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#d1d5db] rounded-[14px] py-3 px-4 hover:bg-[#f1f3f5] transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                        >
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
                            alt="Google"
                            className="w-5 h-5"
                          />
                          <span className="font-semibold text-[#111827]">Join with Google</span>
                        </button>

                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-px bg-[#d1d5db]"></div>
                          <span className="text-[#374151] text-sm">or</span>
                          <div className="flex-1 h-px bg-[#d1d5db]"></div>
                        </div>

                        {/* Name Field */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[#111827]">Full Name</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-[#374151]" />
                            </div>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              className="w-full pl-12 pr-4 py-3 border-2 border-[#d1d5db] rounded-[14px] focus:border-[#3E8EDE] focus:ring-2 focus:ring-[#3E8EDE]/20 outline-none transition-all bg-[#f1f3f5]"
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[#111827]">Email Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-[#374151]" />
                            </div>
                            <input
                              type="email"
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
                              required
                              className="w-full pl-12 pr-4 py-3 border-2 border-[#d1d5db] rounded-[14px] focus:border-[#3E8EDE] focus:ring-2 focus:ring-[#3E8EDE]/20 outline-none transition-all bg-[#f1f3f5]"
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[#111827]">Password</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-[#374151]" />
                            </div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              required
                              minLength={6}
                              className="w-full pl-12 pr-12 py-3 border-2 border-[#d1d5db] rounded-[14px] focus:border-[#3E8EDE] focus:ring-2 focus:ring-[#3E8EDE]/20 outline-none transition-all bg-[#f1f3f5]"
                              placeholder="Min 6 characters"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#374151] hover:text-[#3E8EDE] transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[#111827]">Confirm Password</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-[#374151]" />
                            </div>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              minLength={6}
                              className="w-full pl-12 pr-12 py-3 border-2 border-[#d1d5db] rounded-[14px] focus:border-[#3E8EDE] focus:ring-2 focus:ring-[#3E8EDE]/20 outline-none transition-all bg-[#f1f3f5]"
                              placeholder="Confirm your password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#374151] hover:text-[#3E8EDE] transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        {/* Signup Button */}
                        <button
                          onClick={handleSignupSubmit}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-[#3E8EDE] to-[#2E7BC8] text-white py-3.5 rounded-[14px] font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Creating account...</span>
                            </>
                          ) : (
                            <span>Sign Up</span>
                          )}
                        </button>

                        <div className="text-center text-sm text-[#374151] pt-2">
                          By continuing, you agree to our{' '}
                          <span className="text-[#3E8EDE] hover:underline cursor-pointer">Terms & Conditions</span>
                          {' '}and{' '}
                          <span className="text-[#3E8EDE] hover:underline cursor-pointer">Privacy Policy</span>
                        </div>

                        <div className="text-center pt-2">
                          <p className="text-sm text-[#374151]">
                            Already have an account?{' '}
                            <button
                              type="button"
                              onClick={() => setIsLogin(true)}
                              className="text-[#3E8EDE] font-semibold hover:text-[#2E7BC8] underline underline-offset-2"
                            >
                              Login
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;