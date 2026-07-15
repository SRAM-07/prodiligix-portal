import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdFilterList, MdRefresh, MdSearch, MdClose, MdVisibility, MdAdd } from 'react-icons/md';
import api from '../services/api';

const filterOptions = ['Latest', 'Since Date', 'Date Range', 'Status', 'Company', 'Reset / Show All'];

const statusConfig = {
  'Pending': { color: '#f97316', bg: '#ffedd5' },
  'In Progress': { color: '#3b82f6', bg: '#eff6ff' },
  'Resolved': { color: '#22c55e', bg: '#dcfce7' },
  'Cancelled': { color: '#ef4444', bg: '#fee2e2' },
};

const priorityConfig = {
  'High': { color: '#ef4444', bg: '#fee2e2' },
  'Medium': { color: '#f97316', bg: '#ffedd5' },
  'Low': { color: '#22c55e', bg: '#dcfce7' },
};

export default function ITSolutions() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Latest');
  const [searchText, setSearchText] = useState('');
  const [itData, setItData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchITSolutions = async () => {
      try {
        const response = await api.get('/api/it-solutions');
        setItData(response.data);
      } catch (error) {
        console.error('Failed to fetch IT solutions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchITSolutions();
  }, []);

  const filtered = itData.filter(o =>
    (o.serviceRequestId || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (o.contactPersonName || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (o.serviceType || '').toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <div>
            <p className="text-gray-400 text-xs">Services</p>
            <h1 className="text-base font-bold text-gray-800">IT Solutions</h1>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <MdSearch size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or Service Type..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="bg-transparent text-sm outline-none w-56 text-gray-600"
            />
            {searchText && (
              <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => setSearchText('')} />
            )}
          </div>
        </div>

        <div className="p-5">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Total Requests', value: itData.length, color: '#068BC9' },
              { label: 'Resolved', value: itData.filter(o => o.status === 'Resolved').length, color: '#22c55e' },
              { label: 'In Progress', value: itData.filter(o => o.status === 'In Progress').length, color: '#3b82f6' },
              { label: 'Pending', value: itData.filter(o => o.status === 'Pending').length, color: '#f97316' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: '#068BC9' }}>
                <MdFilterList size={18} />
                Add Filter
                <span className="ml-1">{showFilter ? '▲' : '▼'}</span>
              </button>
              {showFilter && (
                <div className="absolute top-10 left-0 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-2 w-52">
                  <p className="text-xs text-gray-400 px-4 py-1 font-medium uppercase tracking-wider">Select Filter Type</p>
                  {filterOptions.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => { setActiveFilter(opt); setShowFilter(false); }}
                      className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 text-sm"
                      style={{ color: opt === 'Reset / Show All' ? '#ef4444' : '#374151' }}>
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-xs font-medium" style={{ color: '#068BC9' }}>
                {activeFilter}: {filtered.length}
              </span>
              <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => setActiveFilter('Latest')} />
            </div>

            <span className="text-sm text-gray-500">({filtered.length})</span>

            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MdRefresh size={18} className="text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/it-solutions/new')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#22c55e' }}>
              <MdAdd size={18} />
              New Request
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    'Service Request ID', 'Contact Person', 'Email',
                    'Service Type', 'Priority', 'Assigned To',
                    'Status', 'Created Date', 'Actions'
                  ].map((col, i) => (
                    <th key={i} className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-400 text-sm">
                      No IT solution requests found
                    </td>
                  </tr>
                ) : (
                  filtered.map((order, i) => {
                    const s = statusConfig[order.status] || { color: '#9ca3af', bg: '#f3f4f6' };
                    const p = priorityConfig[order.priority] || { color: '#9ca3af', bg: '#f3f4f6' };
                    return (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap cursor-pointer hover:underline"
                          style={{ color: '#068BC9' }}
                          onClick={() => navigate(`/it-solutions/${order.id}`)}>
                          {order.serviceRequestId}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.contactPersonName}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.email}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.serviceType}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-medium px-2 py-1 rounded-full"
                            style={{ color: p.color, backgroundColor: p.bg }}>
                            {order.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.assignedTo || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-medium px-2 py-1 rounded-full"
                            style={{ color: s.color, backgroundColor: s.bg }}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {order.createdAt ? order.createdAt.split('T')[0] : '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/it-solutions/${order.id}`)}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            style={{ color: '#068BC9', backgroundColor: '#e0f2fe' }}>
                            <MdVisibility size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}