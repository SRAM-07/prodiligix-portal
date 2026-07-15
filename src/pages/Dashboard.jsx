import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  MdLocalShipping, MdCheckCircle, MdWarning, MdPending,
  MdTrendingUp, MdTrendingDown
} from 'react-icons/md';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';

const actionItems = [
  { label: 'High Risk Orders', value: 3, color: '#ef4444' },
  { label: 'Bad Addresses', value: 5, color: '#f97316' },
  { label: 'Pending Pickup', value: 12, color: '#068BC9' },
  { label: 'To Be Shipped', value: 8, color: '#8b5cf6' },
  { label: 'Exceptions & NDR', value: 14, color: '#ef4444' },
];

function ServiceCard({ title, path, total, items, navigate }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Total: {total} requests</p>
        </div>
        <button
          onClick={() => navigate(path)}
          className="text-xs font-medium px-3 py-1 rounded-lg transition-colors"
          style={{ color: '#068BC9', backgroundColor: '#e0f2fe' }}>
          View All →
        </button>
      </div>
      <div className="flex items-center justify-between">
        <ResponsiveContainer width="55%" height={130}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="30%"
            outerRadius="90%"
            barSize={7}
            data={[...items].reverse()}
            startAngle={90}
            endAngle={-270}>
            <RadialBar minAngle={5} background={{ fill: '#f3f4f6' }} clockWise dataKey="value" />
            <Tooltip
              formatter={(value, name, props) => [`${value}`, props.payload.name]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1.5 w-[45%]">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                <span className="text-xs text-gray-500">{item.name}</span>
              </div>
              <span className="text-xs font-semibold text-gray-700">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [statusCounts, setStatusCounts] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const companyId = 1; // use logged in user companyId when available
        const [statusRes, weeklyRes] = await Promise.all([
          api.get(`/api/dashboard/request-status-counts/${companyId}`),
          api.get(`/api/dashboard/weekly-by-service/${companyId}`)
        ]);
        setStatusCounts(statusRes.data);
        // Format weekly data for AreaChart
        const dates = weeklyRes.data.dates || [];
        const formatted = dates.map((date, i) => ({
          day: date.split('-').slice(1).join('/'),
          delivered: weeklyRes.data['Logistic Management Services']?.[i] || 0,
          returned: 0,
          inTransit: weeklyRes.data['Stamp Paper Procurement']?.[i] || 0,
        }));
        setWeeklyData(formatted);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const shipmentCounts = statusCounts?.shipment_bookings || {};
  const giftingCounts = statusCounts?.corporate_giftings || {};
  const eventCounts = statusCounts?.event_management || {};
  const stampCounts = statusCounts?.stamp_paper || {};

  const totalOrders = Object.values(shipmentCounts).reduce((a, b) => a + b, 0);
  const delivered = shipmentCounts.delivered || 0;
  const pending = shipmentCounts.booked || 0;
  const exceptions = shipmentCounts.exceptions || 0;

  const statCards = [
    { label: 'Total Orders', value: totalOrders, icon: <MdLocalShipping size={22} />, color: '#068BC9', bg: '#e0f2fe', delta: '+12%', up: true },
    { label: 'Delivered', value: delivered, icon: <MdCheckCircle size={22} />, color: '#22c55e', bg: '#dcfce7', delta: '+8%', up: true },
    { label: 'Pending', value: pending, icon: <MdPending size={22} />, color: '#f97316', bg: '#ffedd5', delta: '-3%', up: false },
    { label: 'Exceptions', value: exceptions, icon: <MdWarning size={22} />, color: '#ef4444', bg: '#fee2e2', delta: '+2%', up: false },
  ];

  const serviceData = [
    {
      title: 'Logistic Management',
      path: '/logistics',
      total: Object.values(shipmentCounts).reduce((a, b) => a + b, 0),
      items: [
        { name: 'Delivered', value: shipmentCounts.delivered || 0, fill: '#22c55e' },
        { name: 'In Transit', value: shipmentCounts.in_transit || 0, fill: '#068BC9' },
        { name: 'Booked', value: shipmentCounts.booked || 0, fill: '#3b82f6' },
        { name: 'Exceptions', value: shipmentCounts.exceptions || 0, fill: '#ef4444' },
      ]
    },
    {
      title: 'Stamp Paper Procurement',
      path: '/stamp-paper',
      total: Object.values(stampCounts).reduce((a, b) => a + b, 0),
      items: [
        { name: 'Delivered', value: stampCounts.delivered || 0, fill: '#22c55e' },
        { name: 'In Transit', value: stampCounts.in_transit || 0, fill: '#068BC9' },
        { name: 'Pending', value: stampCounts.pending || 0, fill: '#f97316' },
        { name: 'Cancelled', value: stampCounts.cancelled || 0, fill: '#ef4444' },
      ]
    },
    {
      title: 'Corporate Gifting',
      path: '/gifting',
      total: Object.values(giftingCounts).reduce((a, b) => a + b, 0),
      items: [
        { name: 'Accepted', value: giftingCounts.accepted || 0, fill: '#22c55e' },
        { name: 'Initialized', value: giftingCounts.initialized || 0, fill: '#9ca3af' },
        { name: 'Pending', value: giftingCounts.pending || 0, fill: '#f97316' },
        { name: 'Rejected', value: giftingCounts.rejected || 0, fill: '#ef4444' },
      ]
    },
    {
      title: 'Event & Team Outing',
      path: '/events',
      total: Object.values(eventCounts).reduce((a, b) => a + b, 0),
      items: [
        { name: 'Completed', value: eventCounts.completed || 0, fill: '#22c55e' },
        { name: 'In Progress', value: eventCounts.in_progress || 0, fill: '#3b82f6' },
        { name: 'Under Review', value: eventCounts.under_review || 0, fill: '#f97316' },
        { name: 'Cancelled', value: eventCounts.cancelled || 0, fill: '#ef4444' },
      ]
    },
    {
      title: 'Stamp Paper Procurement',
      path: '/stamp-paper',
      total: Object.values(stampCounts).reduce((a, b) => a + b, 0),
      items: [
        { name: 'Delivered', value: stampCounts.delivered || 0, fill: '#22c55e' },
        { name: 'In Transit', value: stampCounts.in_transit || 0, fill: '#068BC9' },
        { name: 'Pending', value: stampCounts.pending || 0, fill: '#f97316' },
        { name: 'Cancelled', value: stampCounts.cancelled || 0, fill: '#ef4444' },
      ]
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <div>
            <p className="text-gray-400 text-xs">Welcome back,</p>
            <h1 className="text-base font-bold text-gray-800">
              {user ? `${user.firstName} ${user.lastName}` : 'Sriram M'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search orders, AWB..."
                className="bg-transparent text-sm outline-none w-44 text-gray-600"
              />
            </div>
            <p className="text-xs font-medium text-gray-600">ProDiligix Technologies Pvt. Ltd.</p>
          </div>
        </div>

        <div className="p-5">

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: card.bg, color: card.color }}>
                    {card.icon}
                  </div>
                  <span className={`text-xs font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${card.up ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                    {card.up ? <MdTrendingUp size={12} /> : <MdTrendingDown size={12} />}
                    {card.delta}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Action Required */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-5">
            <div className="flex items-center gap-2 mb-3">
              <MdWarning size={16} color="#f97316" />
              <h3 className="font-semibold text-gray-700 text-sm">Action Required</h3>
            </div>
            <div className="grid grid-cols-5 divide-x divide-gray-100">
              {actionItems.map((item, i) => (
                <div key={i} className="text-center px-4">
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-xs mt-1 cursor-pointer font-medium" style={{ color: item.color }}>Act Now →</p>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Trend */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-5">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-semibold text-gray-700 text-sm">Performance Trend</h3>
                <p className="text-xs text-gray-400">Last 7 days</p>
              </div>
              <div className="flex gap-4">
                {[
                  { label: 'Logistics', color: '#22c55e' },
                  { label: 'Stamp Paper', color: '#068BC9' },
                ].map((l, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: l.color }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weeklyData.length > 0 ? weeklyData : [
                { day: 'Mon', delivered: 0, inTransit: 0 },
                { day: 'Tue', delivered: 0, inTransit: 0 },
                { day: 'Wed', delivered: 0, inTransit: 0 },
                { day: 'Thu', delivered: 0, inTransit: 0 },
                { day: 'Fri', delivered: 0, inTransit: 0 },
                { day: 'Sat', delivered: 0, inTransit: 0 },
                { day: 'Sun', delivered: 0, inTransit: 0 },
              ]}>
                <defs>
                  <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInTransit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#068BC9" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#068BC9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="delivered" stroke="#22c55e" strokeWidth={2} fill="url(#colorDelivered)" dot={false} />
                <Area type="monotone" dataKey="inTransit" stroke="#068BC9" strokeWidth={2} fill="url(#colorInTransit)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Service cards */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {serviceData.slice(0, 4).map((s, i) => (
              <ServiceCard key={i} {...s} navigate={navigate} />
            ))}
          </div>

          {/* Last row */}
          <div className="grid grid-cols-2 gap-4">
            <ServiceCard {...serviceData[4]} navigate={navigate} />
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-center items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#e0f2fe' }}>
                <span className="text-2xl">🧮</span>
              </div>
              <p className="text-sm font-semibold text-gray-700">Rate Calculator</p>
              <p className="text-xs text-gray-400 text-center">Get instant shipping quotes for your shipments</p>
              <button
                onClick={() => navigate('/rate-calculator')}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: '#068BC9' }}>
                Calculate Rate →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}