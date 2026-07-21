import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const data = await login(email, password);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      if (data.role === 'super_admin' || data.role === 'crm_user') {
        navigate('/dashboard');
      } else {
        navigate('/client-dashboard');
      }
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative py-0"
      style={{
        backgroundImage: 'url(/bg.png)',
        backgroundSize: '100%',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#f0f9ff'
      }}>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm relative z-10">

        <div className="flex flex-col items-center mb-0">
          <img src="/logo.png" alt="ProDiligix" className="h-40  mb-10 object-contain" />
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-10 text-center">
          Log in to your account
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-xs text-red-500 text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-gray-50"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-gray-50"
            />
          </div>

          <div className="flex justify-end mb-5">
            <a href="/forgot-password" className="text-sm" style={{ color: '#068BC9' }}>
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#068BC9' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="flex justify-center gap-4 mt-5">
          <a href="#" className="text-xs text-gray-400 hover:text-gray-600">Need help?</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="text-xs" style={{ color: '#068BC9' }}>Contact Support</a>
        </div>

        <p className="text-center text-gray-300 text-xs mt-5">
          © 2026 ProDiligix Technologies Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}