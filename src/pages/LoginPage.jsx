// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiBaseUrl } from '../utils/apiConfig';

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
      const response = await fetch(`${getApiBaseUrl()}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include', // Required for cookies across ports
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
    <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#12161D] rounded-lg shadow-2xl overflow-hidden border-t-4 border-[#8C7A3E] animate-slide-up">
        {/* Header Branding */}
        <div className="bg-[#1a1d21] p-6 text-center border-b border-[#8C7A3E]/20">
          <div className="inline-flex items-center gap-2 text-[#E6E6E3] font-bold text-xl tracking-wide">
            <img src="/CMS.png" alt="NephilimMS Logo" className="h-8 w-8" />
            <div className="flex flex-col leading-tight text-left">
              <span style={{ fontFamily: 'Cinzel, serif' }} className="text-2xl">NephilimMS</span>
              <span className="text-[10px] uppercase font-normal text-[#8C7A3E] tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>Born from Knowledge</span>
            </div>
          </div>
          <p className="text-[#a0a4ab] text-sm mt-3">Administrator Access</p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <h2 className="text-xl text-[#E6E6E3] font-light mb-6 text-center">Please Login</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#a0a4ab] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a0a4ab]">
                  <IconLock />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#1a1d21] border border-[#8C7A3E]/30 rounded text-[#E6E6E3] focus:outline-none focus:ring-1 focus:ring-[#8C7A3E] focus:border-[#8C7A3E] transition-colors placeholder-[#a0a4ab]/50"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 p-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2 px-4 bg-[#8C7A3E] hover:bg-[#a89150] text-[#0B0B0C] font-semibold rounded transition-colors disabled:opacity-70"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>

        {/* Simple Footer */}
        <div className="bg-[#0B0B0C] p-4 text-center border-t border-[#8C7A3E]/20">
          <a href="/" className="text-xs text-[#a0a4ab] hover:text-[#8C7A3E] transition-colors">
            &larr; Return to Site Home
          </a>
        </div>
      </div>
    </div>
  );
}