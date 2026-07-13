import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async () => {
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="ProDiligix"
            className="h-10 mx-auto mb-5"
          />
          <h2 className="text-lg font-bold text-gray-800 mb-2">Forgot your password?</h2>
          <p className="text-sm text-gray-400">
            Enter your email address to receive a link for resetting your password.
          </p>
        </div>

        {submitted ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#dcfce7' }}>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Email sent!</p>
            <p className="text-xs text-gray-400 mb-6">
              Reset password instructions have been sent to <strong>{email}</strong>. Please check your inbox.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#068BC9' }}>
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Email input */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">Email Address</label>
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-300 transition-colors"
              />
              {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white mb-3 transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#068BC9' }}>
              Send a password reset email
            </button>

            {/* Back to login */}
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
              Back to Sign In
            </button>
          </>
        )}

      </div>
    </div>
  );
}