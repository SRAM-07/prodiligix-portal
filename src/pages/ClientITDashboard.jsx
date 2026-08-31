import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowForward, MdAdd, MdComputer, MdCheckCircle, MdCancel, MdPending, MdBuild, MdDone } from 'react-icons/md';
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import ClientLayout from '../components/ClientLayout';

const BRAND = '#068BC9';

export default function ClientITDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      const [dataRes, walletRes] = await Promise.all([
        api.get('/api/it-solutions'),
        u?.companyId ? api.get(`/api/wallet/balance/${u.companyId}`).catch(() => null) : Promise.resolve(null)
      ]);
      setOrders(dataRes.data || []);
      if (walletRes) setWallet(walletRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(s => s.status === 'Pending').length,
    inProgress: orders.filter(s => s.status === 'In Progress').length,
    resolved: orders.filter(s => s.status === 'Resolved').length,
    cancelled: orders.filter(s => s.status === 'Cancelled').length,
  };

  const recent = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const statusColor = s => ({ 'Pending': '#f59e0b', 'In Progress': '#068BC9', 'Resolved': '#22c55e', 'Cancelled': '#ef4444' }[s] || '#9ca3af');
  const statusBg = s => ({ 'Pending': '#fef3c7', 'In Progress': '#e0f2fe', 'Resolved': '#dcfce7', 'Cancelled': '#fee2e2' }[s] || '#f3f4f6');

  return (
    <ClientLayout>
      <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Services</p>
          <h1 className="text-xl font-bold text-gray-800">IT Solutions Dashboard</h1>
        </div>
        <button onClick={() => navigate('/it-solutions/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm"
          style={{ backgroundColor: BRAND }}>
          <MdAdd size={18} /> New Request
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, color: '#068BC9', bg: '#e0f2fe', icon: <MdComputer size={18}/> },
            { label: 'Pending', value: stats.pending, color: '#f59e0b', bg: '#fef3c7', icon: <MdPending size={18}/> },
            { label: 'In Progress', value: stats.inProgress, color: '#068BC9', bg: '#e0f2fe', icon: <MdBuild size={18}/> },
            { label: 'Resolved', value: stats.resolved, color: '#22c55e', bg: '#dcfce7', icon: <MdDone size={18}/> },
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
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">Status Overview</p>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="55%" height={180}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" barSize={8}
                data={[
                  { name: 'Pending', value: stats.pending, fill: '#f59e0b' },
                  { name: 'In Progress', value: stats.inProgress, fill: '#068BC9' },
                  { name: 'Resolved', value: stats.resolved, fill: '#22c55e' },
                  { name: 'Cancelled', value: stats.cancelled, fill: '#ef4444' },
                ].reverse()} startAngle={90} endAngle={-270}>
                <RadialBar minAngle={5} background={{ fill: '#f3f4f6' }} clockWise dataKey="value" />
                <Tooltip formatter={(v, n, p) => [v, p.payload.name]} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 w-[45%]">
              {[
                { name: 'Pending', value: stats.pending, color: '#f59e0b' },
                { name: 'In Progress', value: stats.inProgress, color: '#068BC9' },
                { name: 'Resolved', value: stats.resolved, color: '#22c55e' },
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
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span style={{ color: '#068BC9' }}>📋</span>
              <p className="text-sm font-semibold text-gray-700">Purchase Order</p>
            </div>
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <p className="text-2xl mb-2">⏳</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Awaiting PO</p>
              <p className="text-xs text-gray-400">Your services are billed via Purchase Order. Contact your CRM team for details.</p>
            </div>
          </div>

        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">Recent Requests</p>
            <button onClick={() => navigate('/it-solutions/list')}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ color: BRAND, backgroundColor: '#e0f2fe' }}>
              View All <MdArrowForward size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {recent.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No requests yet</p> : recent.map((s, i) => (
              <div key={i} onClick={() => navigate(`/it-solutions/${s.id}`)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{s.serviceRequestId}</p>
                  <p className="text-xs text-gray-400">{s.issueType || 'IT Solutions'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: statusColor(s.status), backgroundColor: statusBg(s.status) }}>
                    {s.status}
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
