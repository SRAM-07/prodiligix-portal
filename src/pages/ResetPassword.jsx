import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

function validatePassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!token) {
      setError('This reset link is invalid or missing a token.');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/api/auth/reset-password', {
        token,
        password,
        passwordConfirmation: confirmPassword,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. This link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src={process.env.PUBLIC_URL + "/logo.png"}
            alt="ProDiligix"
            className="h-32 mx-auto mb-5"
          />
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            {submitted ? 'Password Reset!' : 'Set a new password'}
          </h2>
          {!submitted && (
            <p className="text-sm text-gray-400">
              Choose a strong new password for your account.
            </p>
          )}
        </div>

        {submitted ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-6">
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#068BC9' }}>
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-2">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Must be 8+ characters with uppercase, lowercase, a number, and a special character.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#068BC9' }}>
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
