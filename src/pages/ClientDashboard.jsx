import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';
import {
  MdLocalShipping, MdDescription, MdCardGiftcard,
  MdEvent, MdComputer, MdWarning
} from 'react-icons/md';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';

export default function ClientDashboard() {
  const [awbSearch, setAwbSearch] = useState('');
  const [walletPeriod, setWalletPeriod] = useState('This Month');
  const [shipmentStats, setShipmentStats] = useState({});
  const [statusCounts, setStatusCounts] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [hoveredService, setHoveredService] = useState(null);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const companyId = user?.companyId || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shipmentRes, walletRes, weeklyRes, statusRes] = await Promise.all([
          api.get(`/api/dashboard/user-shipment-bookings/${companyId}`),
          api.get(`/api/wallet/balance/${companyId}`),
          api.get(`/api/dashboard/weekly-stats/${companyId}`),
          api.get(`/api/dashboard/request-status-counts/${companyId}`)
        ]);

        setShipmentStats(shipmentRes.data);
        setWalletData(walletRes.data);
        setStatusCounts(statusRes.data);

        const dates = weeklyRes.data.dates || [];
        const counts = weeklyRes.data.counts || [];
        setWeeklyData(dates.map((date, i) => ({
          date: date.split('-').slice(1).join('/'),
          count: counts[i] || 0,
        })));

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchData();
  }, [companyId]);

  const stampCounts = statusCounts?.stamp_paper || {};
  const giftingCounts = statusCounts?.corporate_giftings || {};
  const eventCounts = statusCounts?.event_management || {};
  const itCounts = statusCounts?.it_solutions || {};
  const balanceAmount = walletData?.balanceAmount || 0;
  const isLowBalance = balanceAmount < 2000;

  const serviceCards = [
    {
      title: 'Logistic Management',
      path: '/client/logistics',
      color: '#068BC9',
      bg: '#e0f2fe',
      icon: <MdLocalShipping size={20} />,
      stats: [
        { label: 'Booked', value: shipmentStats.booked || 0 },
        { label: 'In Transit', value: shipmentStats.in_transit || 0 },
        { label: 'Delivered', value: shipmentStats.delivered || 0 },
        { label: 'Cancelled', value: shipmentStats.cancelled || 0 },
      ]
    },
    {
      title: 'Stamp Paper',
      path: '/stamp-paper',
      color: '#8b5cf6',
      bg: '#ede9fe',
      icon: <MdDescription size={20} />,
      stats: [
        { label: 'Pending', value: stampCounts.pending || 0 },
        { label: 'In Transit', value: stampCounts.in_transit || 0 },
        { label: 'Delivered', value: stampCounts.delivered || 0 },
        { label: 'Cancelled', value: stampCounts.cancelled || 0 },
      ]
    },
    {
      title: 'Corporate Gifting',
      path: '/gifting',
      color: '#22c55e',
      bg: '#dcfce7',
      icon: <MdCardGiftcard size={20} />,
      stats: [
        { label: 'Pending', value: giftingCounts.pending || 0 },
        { label: 'Initialized', value: giftingCounts.initialized || 0 },
        { label: 'Accepted', value: giftingCounts.accepted || 0 },
        { label: 'Rejected', value: giftingCounts.rejected || 0 },
      ]
    },
    {
      title: 'Event & Team Outing',
      path: '/events',
      color: '#f97316',
      bg: '#ffedd5',
      icon: <MdEvent size={20} />,
      stats: [
        { label: 'Under Review', value: eventCounts.under_review || 0 },
        { label: 'In Progress', value: eventCounts.in_progress || 0 },
        { label: 'Completed', value: eventCounts.completed || 0 },
        { label: 'Cancelled', value: eventCounts.cancelled || 0 },
      ]
    },
    {
      title: 'IT Solutions',
      path: '/it-solutions',
      color: '#06b6d4',
      bg: '#e0f9ff',
      icon: <MdComputer size={20} />,
      stats: [
        { label: 'Pending', value: itCounts.pending || 0 },
        { label: 'In Progress', value: itCounts.in_progress || 0 },
        { label: 'Resolved', value: itCounts.resolved || 0 },
        { label: 'Cancelled', value: itCounts.cancelled || 0 },
      ]
    },
  ];

  const topStats = [
    {
      key: 'logistics',
      label: 'Logistics',
      total: (shipmentStats.booked || 0) + (shipmentStats.picked_up || 0) + (shipmentStats.in_transit || 0) + (shipmentStats.delivered || 0) + (shipmentStats.exceptions || 0) + (shipmentStats.cancelled || 0),
      color: '#068BC9',
      breakdown: [
        { label: 'Booked', value: shipmentStats.booked || 0 },
        { label: 'Picked Up', value: shipmentStats.picked_up || 0 },
        { label: 'In Transit', value: shipmentStats.in_transit || 0 },
        { label: 'Delivered', value: shipmentStats.delivered || 0 },
        { label: 'Exceptions', value: shipmentStats.exceptions || 0 },
        { label: 'Cancelled', value: shipmentStats.cancelled || 0 },
      ]
    },
    {
      key: 'stamp',
      label: 'Stamp Paper',
      total: (stampCounts.pending || 0) + (stampCounts.in_transit || 0) + (stampCounts.delivered || 0) + (stampCounts.cancelled || 0),
      color: '#8b5cf6',
      breakdown: [
        { label: 'Pending', value: stampCounts.pending || 0 },
        { label: 'In Transit', value: stampCounts.in_transit || 0 },
        { label: 'Delivered', value: stampCounts.delivered || 0 },
        { label: 'Cancelled', value: stampCounts.cancelled || 0 },
      ]
    },
    {
      key: 'gifting',
      label: 'Corporate Gifting',
      total: (giftingCounts.pending || 0) + (giftingCounts.initialized || 0) + (giftingCounts.accepted || 0) + (giftingCounts.rejected || 0),
      color: '#22c55e',
      breakdown: [
        { label: 'Pending', value: giftingCounts.pending || 0 },
        { label: 'Initialized', value: giftingCounts.initialized || 0 },
        { label: 'Accepted', value: giftingCounts.accepted || 0 },
        { label: 'Rejected', value: giftingCounts.rejected || 0 },
      ]
    },
    {
      key: 'events',
      label: 'Event Management',
      total: (eventCounts.under_review || 0) + (eventCounts.in_progress || 0) + (eventCounts.completed || 0) + (eventCounts.cancelled || 0),
      color: '#f97316',
      breakdown: [
        { label: 'Under Review', value: eventCounts.under_review || 0 },
        { label: 'In Progress', value: eventCounts.in_progress || 0 },
        { label: 'Completed', value: eventCounts.completed || 0 },
        { label: 'Cancelled', value: eventCounts.cancelled || 0 },
      ]
    },
    {
      key: 'it',
      label: 'IT Solutions',
      total: (itCounts.pending || 0) + (itCounts.in_progress || 0) + (itCounts.resolved || 0) + (itCounts.cancelled || 0),
      color: '#06b6d4',
      breakdown: [
        { label: 'Pending', value: itCounts.pending || 0 },
        { label: 'In Progress', value: itCounts.in_progress || 0 },
        { label: 'Resolved', value: itCounts.resolved || 0 },
        { label: 'Cancelled', value: itCounts.cancelled || 0 },
      ]
    },
  ];

  return (
    <ClientLayout>

      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
        <div>
          <p className="text-gray-400 text-xs">Welcome back,</p>
          <h2 className="text-sm font-bold text-gray-800">
            Rapido — {user?.role === 'company_admin' ? 'Admin' : 'Frontdesk'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
            <span className="text-xs text-gray-400 font-medium">AWB</span>
            <div className="w-px h-4 bg-gray-200" />
            <input
              type="text"
              placeholder="Provide AWB number"
              value={awbSearch}
              onChange={e => setAwbSearch(e.target.value)}
              className="bg-transparent text-sm outline-none w-40 text-gray-600"
            />
            <button
              className="px-3 py-1 rounded-md text-white text-xs font-medium"
              style={{ backgroundColor: '#068BC9' }}>
              Search
            </button>
          </div>
          <p className="text-xs font-medium text-gray-600">Roppen Transportation Service Pvt. Ltd.</p>
        </div>
      </div>

      <div className="p-5">

        {/* Welcome + Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                Hi, Roppen Transportation Service Private Limited 👋
              </h2>
              <p className="text-sm text-gray-400">Here's what's happening with your services today.</p>
            </div>
            <button
              onClick={() => navigate('/client/logistics/book')}
              className="px-5 py-2.5 rounded-lg text-white text-sm font-medium flex-shrink-0"
              style={{ backgroundColor: '#22c55e' }}>
              + Book a Shipment
            </button>
          </div>

          <div className="grid grid-cols-5 gap-4 mt-5 pt-5 border-t border-gray-50 relative">
            {topStats.map((service, i) => (
              <div
                key={i}
                className="text-center relative cursor-default"
                onMouseEnter={() => setHoveredService(service.key)}
                onMouseLeave={() => setHoveredService(null)}>
                <p className="text-2xl font-bold" style={{ color: service.color }}>{service.total}</p>
                <p className="text-xs text-gray-400 mt-1">{service.label}</p>

                {hoveredService === service.key && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-100 p-4 w-56">
                    <p className="text-xs font-semibold text-gray-700 mb-3">{service.label}</p>
                    <div className="flex flex-col gap-2">
                      {service.breakdown.map((item, j) => (
                        <div key={j} className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">{item.label}</span>
                          <span className="text-xs font-semibold text-gray-700">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-5 gap-4 mb-5">
          {serviceCards.map((service, i) => (
            <button
              key={i}
              onClick={() => navigate(service.path)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md hover:border-blue-100 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: service.bg, color: service.color }}>
                  {service.icon}
                </div>
                <p className="text-xs font-semibold text-gray-700 leading-tight">{service.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {service.stats.map((stat, j) => (
                  <div key={j} className="text-center bg-gray-50 rounded-lg py-1.5">
                    <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                    <p className="text-gray-400" style={{ fontSize: '10px' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-5">

          {/* Weekly chart */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700">Weekly Service Requests</p>
              <p className="text-xs text-gray-400">Last 7 days — Logistics</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#068BC9" radius={[4, 4, 0, 0]}
                  label={{ position: 'top', fontSize: 10, fill: '#9ca3af' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Wallet */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-semibold text-gray-700">Wallet Details</p>
              <select
                value={walletPeriod}
                onChange={e => setWalletPeriod(e.target.value)}
                className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1 outline-none">
                <option>This Month</option>
                <option>Last Month</option>
                <option>Two Months Ago</option>
              </select>
            </div>

            <div className="flex flex-col gap-0 mb-4">
              {[
                { label: 'Wallet Amount', value: walletData?.totalRechargedAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00' },
                { label: 'Amount Used', value: walletData?.walletUsedAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00' },
                { label: 'Balance Amount', value: walletData?.balanceAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00' },
              ].map((w, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-none">
                  <span className="text-sm text-gray-500">{w.label}</span>
                  <span className="text-sm font-semibold text-gray-800">{w.value}</span>
                </div>
              ))}
            </div>

            {isLowBalance && (
              <div className="p-2 rounded-lg bg-red-50 border border-red-100 mb-4">
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <MdWarning size={12} />
                  Wallet balance is low. Contact CRM.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/rate-calculator')}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <span className="text-lg">🧮</span>
                <span className="text-xs font-medium text-gray-600">Rate Calculator</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <span className="text-lg">📚</span>
                <span className="text-xs font-medium text-gray-600">Knowledge Base</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </ClientLayout>
  );
}