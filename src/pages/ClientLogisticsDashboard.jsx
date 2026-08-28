import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdLocalShipping, MdInventory, MdCheckCircle, MdCancel, MdArrowForward, MdAdd, MdAccountBalanceWallet, MdFlightTakeoff, MdLoop } from 'react-icons/md';
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';
import ClientLayout from '../components/ClientLayout';

const BRAND = '#068BC9';

export default function ClientLogisticsDashboard() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeToast, setRechargeToast] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      const [shipmentsRes, walletRes] = await Promise.all([
        api.get('/api/shipments'),
        u?.companyId ? api.get(`/api/wallet/${u.companyId}`).catch(() => null) : Promise.resolve(null)
      ]);
      setShipments(shipmentsRes.data || []);
      if (walletRes) setWallet(walletRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const stats = {
    total: shipments.length,
    booked: shipments.filter(s => s.deliveryStatus === 'Booked').length,
    inTransit: shipments.filter(s => s.deliveryStatus === 'In Transit').length,
    delivered: shipments.filter(s => s.deliveryStatus === 'Delivered').length,
    cancelled: shipments.filter(s => s.deliveryStatus === 'Cancelled').length,
    rto: shipments.filter(s => s.deliveryStatus === 'RTO').length,
  };

  const logisticsSpend = shipments
    .filter(s => s.lastDeductedAmount && s.deliveryStatus !== 'Cancelled')
    .reduce((sum, s) => sum + (parseFloat(s.lastDeductedAmount) || 0), 0);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    return { date: label, Shipments: shipments.filter(s => s.createdAt?.startsWith(dateStr)).length };
  });

  const recent = [...shipments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const statusColor = s => ({ 'Booked': '#068BC9', 'In Transit': '#1d4ed8', 'Delivered': '#22c55e', 'Cancelled': '#ef4444', 'RTO': '#f97316' }[s] || '#9ca3af');
  const statusBg = s => ({ 'Booked': '#e0f2fe', 'In Transit': '#dbeafe', 'Delivered': '#dcfce7', 'Cancelled': '#fee2e2', 'RTO': '#ffedd5' }[s] || '#f3f4f6');

  const handleRecharge = async () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) < 100 || parseFloat(rechargeAmount) > 50000) {
      setRechargeToast('Recharge amount must be between ₹100 and ₹50,000');
      setTimeout(() => setRechargeToast(''), 3000);
      return;
    }
    setRechargeLoading(true);
    try {
      const u = getCurrentUser();
      if (!u?.companyId) {
        setRechargeToast('Company not found. Please re-login.');
        setTimeout(() => setRechargeToast(''), 3000);
        setRechargeLoading(false);
        return;
      }
      const res = await api.post('/api/payments/create-order', {
        companyId: u.companyId,
        amount: parseFloat(rechargeAmount)
      });
      const { paymentSessionId, orderId } = res.data;

      // Load Cashfree SDK dynamically if not present
      if (!window.Cashfree) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      const cashfree = window.Cashfree({ mode: "production" });
      const checkoutResult = await cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_modal",
      });
      (async (result) => {
        if (result.error) {
          setRechargeToast('Payment failed: ' + result.error.message);
        } else {
          // Verify payment
          const verify = await api.get('/api/payments/verify/' + orderId);
          if (verify.data.orderStatus === 'PAID') {
            setRechargeToast('✅ Wallet recharged successfully!');
            setShowRecharge(false);
            setRechargeAmount('');
            // Refresh wallet
            const walletRes = await api.get('/api/wallet/' + u?.companyId).catch(() => null);
            if (walletRes) setWallet(walletRes.data);
          } else {
            setRechargeToast('Payment status: ' + verify.data.orderStatus);
          }
        }
        setTimeout(() => setRechargeToast(''), 4000);
      })(checkoutResult);
    } catch (err) {
      console.error('Recharge error:', err);
      setRechargeToast(err.response?.data?.error || err.message || 'Failed to initiate payment');
      setTimeout(() => setRechargeToast(''), 3000);
    } finally {
      setRechargeLoading(false);
    }
  };

  return (
    <ClientLayout>
        <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Services</p>
            <h1 className="text-xl font-bold text-gray-800">Logistics Dashboard</h1>
          </div>
          <button onClick={() => navigate('/client/logistics/book')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm"
            style={{ backgroundColor: BRAND }}>
            <MdAdd size={18} /> Book Shipment
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total', value: stats.total, icon: <MdInventory size={18}/>, color: '#068BC9', bg: '#e0f2fe' },
              { label: 'Booked', value: stats.booked, icon: <MdLocalShipping size={18}/>, color: '#068BC9', bg: '#e0f2fe' },
              { label: 'In Transit', value: stats.inTransit, icon: <MdFlightTakeoff size={18}/>, color: '#1d4ed8', bg: '#dbeafe' },
              { label: 'Delivered', value: stats.delivered, icon: <MdCheckCircle size={18}/>, color: '#22c55e', bg: '#dcfce7' },
              { label: 'Cancelled', value: stats.cancelled, icon: <MdCancel size={18}/>, color: '#ef4444', bg: '#fee2e2' },
              { label: 'RTO', value: stats.rto, icon: <MdLoop size={18}/>, color: '#f97316', bg: '#ffedd5' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-400 font-medium">{card.label}</p>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.bg, color: card.color }}>{card.icon}</div>
                </div>
                <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Shipment Status Overview</p>
              <div className="flex items-center justify-between">
                <ResponsiveContainer width="55%" height={180}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" barSize={8}
                    data={[
                      { name: 'Booked', value: stats.booked, fill: '#068BC9' },
                      { name: 'In Transit', value: stats.inTransit, fill: '#1d4ed8' },
                      { name: 'Delivered', value: stats.delivered, fill: '#22c55e' },
                      { name: 'Cancelled', value: stats.cancelled, fill: '#ef4444' },
                      { name: 'RTO', value: stats.rto, fill: '#f97316' },
                    ].reverse()}
                    startAngle={90} endAngle={-270}>
                    <RadialBar minAngle={5} background={{ fill: '#f3f4f6' }} clockWise dataKey="value" />
                    <Tooltip formatter={(value, name, props) => [value, props.payload.name]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 w-[45%]">
                  {[
                    { name: 'Booked', value: stats.booked, color: '#068BC9' },
                    { name: 'In Transit', value: stats.inTransit, color: '#1d4ed8' },
                    { name: 'Delivered', value: stats.delivered, color: '#22c55e' },
                    { name: 'Cancelled', value: stats.cancelled, color: '#ef4444' },
                    { name: 'RTO', value: stats.rto, color: '#f97316' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-500">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <MdAccountBalanceWallet size={18} style={{ color: BRAND }} />
                <p className="text-sm font-semibold text-gray-700">Logistics Wallet</p>
              </div>
              {wallet ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400">Available Balance</p>
                    <p className="text-2xl font-bold" style={{ color: BRAND }}>
                      ₹{(parseFloat(wallet.totalRechargedAmount || 0) - parseFloat(wallet.walletUsedAmount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Total Recharged</span>
                      <span className="font-medium text-gray-700">₹{parseFloat(wallet.totalRechargedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Total Used</span>
                      <span className="font-medium text-gray-700">₹{parseFloat(wallet.walletUsedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Logistics Spend</span>
                      <span className="font-medium" style={{ color: BRAND }}>₹{logisticsSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ backgroundColor: BRAND, width: `${Math.min(100, (parseFloat(wallet.walletUsedAmount || 0) / parseFloat(wallet.totalRechargedAmount || 1)) * 100)}%` }} />
                  </div>
                  <button onClick={() => setShowRecharge(true)}
                    className="w-full py-2 rounded-lg text-white text-sm font-medium mt-2"
                    style={{ backgroundColor: BRAND }}>
                    + Recharge Wallet
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Wallet info unavailable</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700">Recent Shipments</p>
              <button onClick={() => navigate('/client/logistics/list')}
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ color: BRAND, backgroundColor: '#e0f2fe' }}>
                View All <MdArrowForward size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {recent.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No shipments yet</p>
              ) : recent.map((s, i) => (
                <div key={i} onClick={() => navigate(`/client/logistics/${s.id}`)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e0f2fe' }}>
                      <MdLocalShipping size={16} style={{ color: BRAND }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.serviceRequestId}</p>
                      <p className="text-xs text-gray-400">{s.shipmentDetails} · {s.transporter}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: statusColor(s.deliveryStatus), backgroundColor: statusBg(s.deliveryStatus) }}>
                      {s.deliveryStatus}
                    </span>
                    <p className="text-xs text-gray-400">{s.createdAt?.split('T')[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      {/* Recharge Modal */}
      {showRecharge && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-1">Recharge Wallet</h2>
            <p className="text-xs text-gray-400 mb-4">Pay securely via UPI, Card or Netbanking</p>
            <p className="text-xs text-gray-400 mb-1">Amount (₹) <span className="text-red-400">*</span></p>
            <input type="number" placeholder="₹100 - ₹50,000" value={rechargeAmount}
              onChange={e => setRechargeAmount(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowRecharge(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
              <button onClick={handleRecharge} disabled={rechargeLoading}
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: BRAND }}>
                {rechargeLoading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}
      {rechargeToast && (
        <div className="fixed top-20 right-6 z-[300] bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3">
          <p className="text-sm font-medium" style={{ color: rechargeToast.includes('✅') ? '#22c55e' : '#ef4444' }}>{rechargeToast}</p>
        </div>
      )}
    </ClientLayout>
  );
}
