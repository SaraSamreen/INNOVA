import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';

const Forgotpass = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to process password reset request');
      }

      setMessage('Password reset link sent to your email');
    } catch (err) {
      setIsError(true);
      setMessage(err.message || 'Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#c3d5ef] overflow-hidden">
      <div className="h-full w-full">
        <div className="grid md:grid-cols-2 h-full">
          {/* Image Side */}
          <div className="relative bg-gradient-to-br from-[#2E7BC8] to-[#1E6BB0] overflow-hidden">
            <div className="absolute inset-0 bg-black/40">
              <img
                src="/luxury.jpg"
                alt="Luxury fashion"
                className="w-full h-full object-cover mix-blend-overlay"
              />
            </div>
            
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-white">
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

          {/* Form Side */}
          <div className="relative overflow-hidden bg-[#f9fafb]">
            <div className="h-full overflow-y-auto">
              <div className="min-h-full flex flex-col justify-center p-8 lg:p-12">
                <div className="max-w-md mx-auto w-full">
                  {/* Back Button */}
                  <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-[#374151] hover:text-[#3E8EDE] transition-colors mb-8"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="font-medium">Back to Login</span>
                  </button>

                  <h2 className="text-4xl font-bold text-[#3E8EDE] mb-2">Forgot Password?</h2>
                  <p className="text-[#374151] mb-8">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>

                  {message && (
                    <div className={`px-4 py-3 rounded-[14px] mb-6 ${
                      isError 
                        ? 'bg-red-50 border-l-4 border-red-500 text-red-700' 
                        : 'bg-green-50 border-l-4 border-green-500 text-green-700'
                    }`}>
                      <p className="text-sm font-medium">{message}</p>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#111827]">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-[#374151]" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-3 border-2 border-[#d1d5db] rounded-[14px] focus:border-[#3E8EDE] focus:ring-2 focus:ring-[#3E8EDE]/20 outline-none transition-all bg-[#f1f3f5]"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[#3E8EDE] to-[#2E7BC8] text-white py-3.5 rounded-[14px] font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Send Reset Link</span>
                      )}
                    </button>

                    {/* Additional Help */}
                    <div className="text-center pt-4">
                      <p className="text-sm text-[#374151]">
                        Remember your password?{' '}
                        <button
                          onClick={() => window.location.href = '/login'}
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
  );
};

export default Forgotpass;