import React, { useState } from 'react';
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

const statCards = [
  { label: 'Total Orders', value: '1,284', icon: <MdLocalShipping size={22}/>, color: '#068BC9', bg: '#e0f2fe', delta: '+12%', up: true },
  { label: 'Delivered', value: '1,120', icon: <MdCheckCircle size={22}/>, color: '#22c55e', bg: '#dcfce7', delta: '+8%', up: true },
  { label: 'Pending', value: '77', icon: <MdPending size={22}/>, color: '#f97316', bg: '#ffedd5', delta: '-3%', up: false },
  { label: 'Exceptions', value: '14', icon: <MdWarning size={22}/>, color: '#ef4444', bg: '#fee2e2', delta: '+2%', up: false },
];

const actionItems = [
  { label: 'High Risk Orders', value: 3, color: '#ef4444' },
  { label: 'Bad Addresses', value: 5, color: '#f97316' },
  { label: 'Pending Pickup', value: 12, color: '#068BC9' },
  { label: 'To Be Shipped', value: 8, color: '#8b5cf6' },
  { label: 'Exceptions & NDR', value: 14, color: '#ef4444' },
];

const trendData = [
  { day: 'Mon', delivered: 42, returned: 5, inTransit: 18 },
  { day: 'Tue', delivered: 38, returned: 3, inTransit: 22 },
  { day: 'Wed', delivered: 55, returned: 7, inTransit: 15 },
  { day: 'Thu', delivered: 48, returned: 4, inTransit: 20 },
  { day: 'Fri', delivered: 62, returned: 6, inTransit: 25 },
  { day: 'Sat', delivered: 35, returned: 2, inTransit: 12 },
  { day: 'Sun', delivered: 28, returned: 1, inTransit: 8 },
];

const serviceData = [
  {
    title: 'Logistic Management',
    path: '/logistics',
    total: 200,
    items: [
      { name: 'Delivered', value: 60, fill: '#22c55e' },
      { name: 'In Transit', value: 12, fill: '#068BC9' },
      { name: 'Booked', value: 15, fill: '#3b82f6' },
      { name: 'Exceptions', value: 2, fill: '#ef4444' },
    ]
  },
  {
    title: 'IT Solutions',
    path: '/it-solutions',
    total: 50,
    items: [
      { name: 'Delivered', value: 30, fill: '#22c55e' },
      { name: 'Shipped', value: 30, fill: '#068BC9' },
      { name: 'Packed', value: 16, fill: '#06b6d4' },
      { name: 'Requested', value: 24, fill: '#8b5cf6' },
    ]
  },
  {
    title: 'Corporate Gifting',
    path: '/gifting',
    total: 70,
    items: [
      { name: 'Accepted', value: 57, fill: '#22c55e' },
      { name: 'Initialized', value: 21, fill: '#9ca3af' },
      { name: 'Pending', value: 14, fill: '#f97316' },
      { name: 'Rejected', value: 7, fill: '#ef4444' },
    ]
  },
  {
    title: 'Event & Team Outing',
    path: '/events',
    total: 48,
    items: [
      { name: 'Completed', value: 52, fill: '#22c55e' },
      { name: 'In Progress', value: 25, fill: '#3b82f6' },
      { name: 'Under Review', value: 17, fill: '#f97316' },
      { name: 'Cancelled', value: 6, fill: '#ef4444' },
    ]
  },
  {
    title: 'Stamp Paper Procurement',
    path: '/stamp-paper',
    total: 47,
    items: [
      { name: 'Delivered', value: 60, fill: '#22c55e' },
      { name: 'In Transit', value: 25, fill: '#068BC9' },
      { name: 'Pending', value: 11, fill: '#f97316' },
      { name: 'Cancelled', value: 4, fill: '#ef4444' },
    ]
  },
];

function ServiceCard({ title, path, total, items, navigate }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Total: {total} orders</p>
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
            data={items}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              minAngle={5}
              background={{ fill: '#f3f4f6' }}
              clockWise
              dataKey="value"
            />
            <Tooltip
              formatter={(value,name,props) => [`${value}%`, props.payload.name]}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px'
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1.5 w-[45%]">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }}/>
                <span className="text-xs text-gray-500">{item.name}</span>
              </div>
              <span className="text-xs font-semibold text-gray-700">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const navigate = useNavigate();

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
            <h1 className="text-base font-bold text-gray-800">Sriram M</h1>
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
                    {card.up ? <MdTrendingUp size={12}/> : <MdTrendingDown size={12}/>}
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
              <MdWarning size={16} color="#f97316"/>
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

          {/* Performance Trend — AreaChart */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-5">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-semibold text-gray-700 text-sm">Performance Trend</h3>
                <p className="text-xs text-gray-400">Last 7 days</p>
              </div>
              <div className="flex gap-4">
                {[
                  { label: 'Delivered', color: '#22c55e' },
                  { label: 'Returned', color: '#ef4444' },
                  { label: 'In Transit', color: '#068BC9' },
                ].map((l, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: l.color }}/>
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInTransit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#068BC9" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#068BC9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5"/>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }}/>
                <Area type="monotone" dataKey="delivered" stroke="#22c55e" strokeWidth={2} fill="url(#colorDelivered)" dot={false}/>
                <Area type="monotone" dataKey="returned" stroke="#ef4444" strokeWidth={2} fill="url(#colorReturned)" dot={false}/>
                <Area type="monotone" dataKey="inTransit" stroke="#068BC9" strokeWidth={2} fill="url(#colorInTransit)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Service cards — 2x2 grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {serviceData.slice(0, 4).map((s, i) => (
              <ServiceCard key={i} {...s} navigate={navigate}/>
            ))}
          </div>

          {/* Last row */}
          <div className="grid grid-cols-2 gap-4">
            <ServiceCard {...serviceData[4]} navigate={navigate}/>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-center items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#e0f2fe' }}>
                <span className="text-2xl">🧮</span>
              </div>
              <p className="text-sm font-semibold text-gray-700">Rate Calculator</p>
              <p className="text-xs text-gray-400 text-center">Get instant shipping quotes for your shipments</p>
              <button
                onClick={() => navigate('/rate-calculator')}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
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