import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowForward, MdAdd, MdEvent, MdCheckCircle, MdCancel, MdPending, MdLoop, MdPlayArrow } from 'react-icons/md';
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import ClientLayout from '../components/ClientLayout';

const BRAND = '#068BC9';

export default function ClientEventsDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      const [dataRes, walletRes] = await Promise.all([
        api.get('/api/events'),
        u?.companyId ? api.get(`/api/wallet/${u.companyId}`).catch(() => null) : Promise.resolve(null)
      ]);
      setOrders(dataRes.data || []);
      if (walletRes) setWallet(walletRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const stats = {
    total: orders.length,
    underReview: orders.filter(s => s.eventStatus === 'under_review').length,
    inProgress: orders.filter(s => s.eventStatus === 'in_progress').length,
    completed: orders.filter(s => s.eventStatus === 'completed').length,
    cancelled: orders.filter(s => s.eventStatus === 'cancelled').length,
  };

  const recent = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const statusColor = s => ({ 'Under Review': '#f59e0b', 'In Progress': '#068BC9', 'Completed': '#22c55e', 'Cancelled': '#ef4444' }[s] || '#9ca3af');
  const statusBg = s => ({ 'Under Review': '#fef3c7', 'In Progress': '#e0f2fe', 'Completed': '#dcfce7', 'Cancelled': '#fee2e2' }[s] || '#f3f4f6');

  return (
    <ClientLayout>
      <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Services</p>
          <h1 className="text-xl font-bold text-gray-800">Events Dashboard</h1>
        </div>
        <button onClick={() => navigate('/events/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm"
          style={{ backgroundColor: BRAND }}>
          <MdAdd size={18} /> New Request
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, color: '#068BC9', bg: '#e0f2fe', icon: <MdEvent size={18}/> },
            { label: 'Under Review', value: stats.underReview, color: '#f59e0b', bg: '#fef3c7', icon: <MdPending size={18}/> },
            { label: 'In Progress', value: stats.inProgress, color: '#068BC9', bg: '#e0f2fe', icon: <MdPlayArrow size={18}/> },
            { label: 'Completed', value: stats.completed, color: '#22c55e', bg: '#dcfce7', icon: <MdCheckCircle size={18}/> },
            { label: 'Cancelled', value: stats.cancelled, color: '#ef4444', bg: '#fee2e2', icon: <MdCancel size={18}/> },
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
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span style={{ color: '#068BC9' }}>💳</span>
              <p className="text-sm font-semibold text-gray-700">Wallet</p>
            </div>
            {wallet ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Available Balance</p>
                  <p className="text-2xl font-bold" style={{ color: '#068BC9' }}>
                    ₹{(parseFloat(wallet.totalRechargedAmount || 0) - parseFloat(wallet.walletUsedAmount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs"><span className="text-gray-400">Total Recharged</span><span className="font-medium text-gray-700">₹{parseFloat(wallet.totalRechargedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-400">Total Used</span><span className="font-medium text-gray-700">₹{parseFloat(wallet.walletUsedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ backgroundColor: '#068BC9', width: `${Math.min(100, (parseFloat(wallet.walletUsedAmount || 0) / parseFloat(wallet.totalRechargedAmount || 1)) * 100)}%` }} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Wallet info unavailable</p>
            )}
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">Status Overview</p>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="55%" height={180}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" barSize={8}
                data={[
                  { name: 'Under Review', value: stats.underReview, fill: '#f59e0b' },
                  { name: 'In Progress', value: stats.inProgress, fill: '#068BC9' },
                  { name: 'Completed', value: stats.completed, fill: '#22c55e' },
                  { name: 'Cancelled', value: stats.cancelled, fill: '#ef4444' },
                ].reverse()} startAngle={90} endAngle={-270}>
                <RadialBar minAngle={5} background={{ fill: '#f3f4f6' }} clockWise dataKey="value" />
                <Tooltip formatter={(v, n, p) => [v, p.payload.name]} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 w-[45%]">
              {[
                { name: 'Under Review', value: stats.underReview, color: '#f59e0b' },
                { name: 'In Progress', value: stats.inProgress, color: '#068BC9' },
                { name: 'Completed', value: stats.completed, color: '#22c55e' },
                { name: 'Cancelled', value: stats.cancelled, color: '#ef4444' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-500">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">Recent Requests</p>
            <button onClick={() => navigate('/events/list')}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ color: BRAND, backgroundColor: '#e0f2fe' }}>
              View All <MdArrowForward size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {recent.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No requests yet</p> : recent.map((s, i) => (
              <div key={i} onClick={() => navigate(`/events/${s.id}`)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{s.serviceRequestId}</p>
                  <p className="text-xs text-gray-400">{s.servicesRequired || 'Event Management'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: statusColor(s.status), backgroundColor: statusBg(s.status) }}>
                    {s.eventStatus}
                  </span>
                  <p className="text-xs text-gray-400">{s.createdAt?.split('T')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
