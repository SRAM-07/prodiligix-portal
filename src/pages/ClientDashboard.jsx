import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  MdLocalShipping, MdDescription, MdCardGiftcard,
  MdEvent, MdComputer, MdSearch
} from 'react-icons/md';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';

const services = [
  { icon: <MdLocalShipping size={16} />, title: 'Logistic Management Services', color: '#068BC9', bg: '#e0f2fe', path: '/client/logistics' },
  { icon: <MdDescription size={16} />, title: 'Stamp Paper Procurement', color: '#8b5cf6', bg: '#ede9fe', path: '/stamp-paper' },
  { icon: <MdCardGiftcard size={16} />, title: 'Corporate Gifting', color: '#22c55e', bg: '#dcfce7', path: '/gifting' },
  { icon: <MdEvent size={16} />, title: 'Event & Team Outing', color: '#f97316', bg: '#ffedd5', path: '/events' },
  { icon: <MdComputer size={16} />, title: 'IT Solutions', color: '#06b6d4', bg: '#e0f9ff', path: '/it-solutions' },
];

export default function ClientDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [awbSearch, setAwbSearch] = useState('');
  const [walletPeriod, setWalletPeriod] = useState('This Month');
  const [shipmentStats, setShipmentStats] = useState({});
  const [walletDetails, setWalletDetails] = useState([
    { label: 'Wallet Amount', value: '0.00' },
    { label: 'Amount Used', value: '0.00' },
    { label: 'Balance Amount', value: '0.00' },
  ]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const companyId = user?.companyId || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shipmentRes, walletRes, weeklyRes] = await Promise.all([
          api.get(`/api/dashboard/user-shipment-bookings/${companyId}`),
          api.get(`/api/wallet/balance/${companyId}`),
          api.get(`/api/dashboard/weekly-stats/${companyId}`)
        ]);

        setShipmentStats(shipmentRes.data);

        const w = walletRes.data;
        setWalletDetails([
          { label: 'Wallet Amount', value: w.totalRechargedAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00' },
          { label: 'Amount Used', value: w.walletUsedAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00' },
          { label: 'Balance Amount', value: w.balanceAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00' },
        ]);

        const dates = weeklyRes.data.dates || [];
        const counts = weeklyRes.data.counts || [];
        const formatted = dates.map((date, i) => ({
          date: date.split('-').slice(1).join('/'),
          count: counts[i] || 0,
        }));
        setWeeklyData(formatted);

      } catch (error) {
        console.error('Failed to fetch client dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId]);

  const balanceAmount = parseFloat(walletDetails[2].value.replace(/,/g, ''));

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
            <h2 className="text-sm font-bold text-gray-800">
              {user?.role === 'company_user' ? 'Rapido — Frontdesk' : user?.role === 'company_admin' ? 'Rapido — Admin' : 'Rapido'}
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

        <div className="p-5 flex gap-5">

          {/* Left — Main Content */}
          <div className="flex-1 flex flex-col gap-5">

            {/* Greeting */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4">
                Hi, Roppen Transportation Service Private Limited
              </h2>

              {/* Actions */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 mb-3">Actions</p>
                <div className="grid grid-cols-6 gap-4">
                  {[
                    { label: 'Shipment Booked', value: shipmentStats.booked || 0, color: '#068BC9' },
                    { label: 'Shipment Picked Up', value: shipmentStats.picked_up || 0, color: '#068BC9' },
                    { label: 'Exceptions', value: shipmentStats.exceptions || 0, color: '#068BC9' },
                    { label: 'In Transit', value: shipmentStats.in_transit || 0, color: '#068BC9' },
                    { label: 'Delivered', value: shipmentStats.delivered || 0, color: '#22c55e' },
                    { label: 'Cancelled', value: shipmentStats.cancelled || 0, color: '#ef4444' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate('/client/logistics/book')}
                className="px-5 py-2.5 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: '#22c55e' }}>
                + Book a Shipment
              </button>
            </div>

            {/* Upcoming Pickups */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Upcoming Pickups</p>
              <div className="text-center py-6">
                <p className="text-sm text-gray-400">You have shipments ready to be picked up.</p>
                <button
                  onClick={() => navigate('/client/logistics')}
                  className="mt-3 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-500 hover:bg-gray-50">
                  🚚 View Pickups
                </button>
              </div>
            </div>

            {/* Weekly Service Requests */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Weekly Service Requests</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#068BC9" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: '#9ca3af' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Right — Sidebar Panel */}
          <div className="w-72 flex flex-col gap-5">

            {/* Wallet Details */}
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
              <div className="flex flex-col gap-0">
                {walletDetails.map((w, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-none">
                    <span className="text-sm text-gray-500">{w.label}</span>
                    <span className="text-sm font-semibold text-gray-800">{w.value}</span>
                  </div>
                ))}
                {balanceAmount < 2000 && (
                  <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-xs text-red-500 font-medium">
                      Wallet balance is low. Please contact CRM to recharge immediately.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/rate-calculator')}
                  className="flex items-center gap-2 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <span className="text-lg">🧮</span>
                  <span className="text-xs font-medium text-gray-600">Rate Calculator</span>
                </button>
                <button className="flex items-center gap-2 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <span className="text-lg">📚</span>
                  <span className="text-xs font-medium text-gray-600">Knowledge Base</span>
                </button>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Services</p>
              <div className="flex flex-col gap-2">
                {services.map((service, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(service.path)}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: service.bg, color: service.color }}>
                      {service.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-600">{service.title}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}