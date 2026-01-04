// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Inline Icon for Login
const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/.netlify/functions/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-[#1a3e6e] animate-slide-up">
        {/* Header Branding */}
        <div className="bg-[#1a3e6e] p-6 text-center">
          <div className="inline-flex items-center gap-2 text-white font-bold text-xl tracking-wide">
            <img src="/CMS.png" alt="CMS Logo" className="h-8 w-8" />
            <div className="flex flex-col leading-tight text-left">
              <span>CatMS</span>
              <span className="text-[10px] uppercase font-normal text-blue-200 tracking-wider">Empowering Healthcare</span>
            </div>
          </div>
          <p className="text-blue-100 text-sm mt-2">Administrator Access</p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <h2 className="text-xl text-gray-700 font-light mb-6 text-center">Please Login</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <IconLock />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2 px-4 bg-[#1a3e6e] hover:bg-[#15345d] text-white font-semibold rounded transition-colors disabled:opacity-70"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>

        {/* Simple Footer */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <a href="/" className="text-xs text-gray-500 hover:text-[#1a3e6e] transition-colors">
            &larr; Return to Site Home
          </a>
        </div>
      </div>
    </div>
  );
}