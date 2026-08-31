import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

const BRAND = '#068BC9';

const FAQS = [
  { q: 'How do I log in to the portal?', a: 'Enter your registered email address and password on the login page. If you have forgotten your password, click "Forgot password?" to reset it via email.' },
  { q: 'I forgot my password. How do I reset it?', a: 'Click "Forgot password?" on the login page, enter your registered email, and follow the reset link sent to your inbox. The link expires in 24 hours.' },
  { q: 'How do I book a shipment?', a: 'After logging in, go to Logistic Management and click "New Shipment". Fill in the pickup and delivery details, select your transport mode and carrier, then click Book Carrier.' },
  { q: 'How do I track my shipment?', a: 'Open any shipment from the Logistics dashboard to view its current status and tracking details. Status is automatically synced every 30 minutes.' },
  { q: 'How does wallet recharge work?', a: 'Your ProDiligix wallet is recharged by your CRM team after you transfer the amount. Once recharged, the balance is available immediately for booking shipments.' },
  { q: 'Why was my wallet deducted more than expected?', a: 'The final charge is based on the higher of our quoted rate and the carrier\'s actual billed rate after booking. This ensures accurate billing for your shipments.' },
  { q: 'How do I download my shipment label or POD?', a: 'Open the shipment detail page and scroll to the Documents section. You can download the label, POD, and invoice from there. You can also manually upload documents if needed.' },
  { q: 'Who do I contact for support?', a: 'You can reach our support team at support@prodiligix.com or call us at +91 89045 02229 or +91 89040 54747 during business hours (Mon–Sat, 9am–7pm).' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
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
        backgroundImage: `url(${process.env.PUBLIC_URL}/bg.png)`,
        backgroundSize: '100%',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#f0f9ff'
      }}>

      {/* FAQ Modal */}
      {showFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Frequently Asked Questions</h2>
              <button onClick={() => setShowFaq(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="overflow-y-auto px-6 py-4 space-y-2">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-700">{faq.q}</span>
                    <span className="text-lg font-bold flex-shrink-0" style={{ color: BRAND }}>{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-3">
                      <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">Still need help? <button onClick={() => { setShowFaq(false); setShowContact(true); }} className="font-medium" style={{ color: BRAND }}>Contact Support</button></p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support Modal */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Contact Support</h2>
              <button onClick={() => setShowContact(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: '#e0f2fe' }}>
                <span className="text-xl">✉️</span>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email us at</p>
                  <a href="mailto:support@prodiligix.com" className="text-sm font-semibold" style={{ color: BRAND }}>support@prodiligix.com</a>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                <span className="text-xl">📞</span>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Call us</p>
                  <a href="tel:+918904502229" className="block text-sm font-semibold text-gray-700">+91 89045 02229</a>
                  <a href="tel:+918904054747" className="block text-sm font-semibold text-gray-700">+91 89040 54747</a>
                  <p className="text-xs text-gray-400 mt-1">Mon–Sat, 9am–7pm IST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-0">
          <img src={process.env.PUBLIC_URL + "/logo.png"} alt="ProDiligix" className="h-40 mb-10 object-contain" />
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
            <a onClick={() => navigate("/forgot-password")} className="text-sm cursor-pointer" style={{ color: BRAND }}>
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: BRAND }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="flex justify-center gap-4 mt-5">
          <button onClick={() => setShowFaq(true)} className="text-xs text-gray-400 hover:text-gray-600">Need help?</button>
          <span className="text-gray-300">|</span>
          <button onClick={() => setShowContact(true)} className="text-xs font-medium" style={{ color: BRAND }}>Contact Support</button>
        </div>

        <p className="text-center text-gray-300 text-xs mt-5">
          © 2026 ProDiligix Technologies Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}
