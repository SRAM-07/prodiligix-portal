import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SmartSidebar from '../components/SmartSidebar';
import { MdFilterList, MdRefresh, MdSearch, MdClose, MdVisibility, MdAdd, MdDownload } from 'react-icons/md';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';
import QuotationDialog from '../components/QuotationDialog';

const filterOptions = ['Latest', 'Since Date', 'Date Range', 'Status', 'Company', 'Reset / Show All'];

const ADMIN_ROLES = ['super_admin', 'crm_user'];

const statusConfig = {
  'pending': { color: '#f97316', bg: '#ffedd5', label: 'Pending' },
  'initialized': { color: '#068BC9', bg: '#e0f2fe', label: 'Initialized' },
  'accepted': { color: '#22c55e', bg: '#dcfce7', label: 'Accepted' },
  'rejected': { color: '#ef4444', bg: '#fee2e2', label: 'Rejected' },
};

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function safeParseArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function safeParseObject(val) {
  if (!val) return {};
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function formatPreferredItems(row) {
  const items = safeParseArray(row.preferredItems).map(item => {
    if (item === 'Other Suggestions' && row.otherSuggestions) {
      return `Other: ${row.otherSuggestions}`;
    }
    let label = item;
    const itemBrands = safeParseObject(row.itemBrands);
    const otherItemBrands = safeParseObject(row.otherItemBrands);
    const brands = itemBrands[item];
    if (Array.isArray(brands) && brands.length > 0) {
      const brandsList = brands.map(b => (b === 'Others' && otherItemBrands[item]) ? otherItemBrands[item] : b).join(', ');
      label += ` (Brands: ${brandsList})`;
    }
    return label;
  });
  return items.length > 0 ? items.join(' | ') : '—';
}

function formatBranding(row) {
  const items = safeParseArray(row.brandingRequirements).map(item => {
    let label = item;
    const logoOpts = safeParseArray(row.logoPrintedOptions);
    if (item === 'Logo Printed' && logoOpts.length > 0) {
      label += ` (${logoOpts.join(', ')})`;
    }
    return label;
  });
  return items.length > 0 ? items.join(', ') : '—';
}

function formatAdditionalServices(row) {
  const items = safeParseArray(row.additionalServices).map(item => {
    if (item === 'Others' && row.otherAdditionalServices) return row.otherAdditionalServices;
    return item;
  });
  return items.length > 0 ? items.join(', ') : '—';
}

export default function CorporateGifting() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Latest');
  const [searchText, setSearchText] = useState('');
  const [giftingData, setGiftingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quotationDialogId, setQuotationDialogId] = useState(null);
  const navigate = useNavigate();

  const user = getCurrentUser();
  const isAdmin = user && ADMIN_ROLES.includes(user.role);
  const isCrmUser = user?.role === 'crm_user' || user?.role === 'super_admin';
  const isCompanyUser = ['company_user', 'company_admin', 'company_crm_user'].includes(user?.role);

  const fetchGiftings = async () => {
    try {
      const response = await api.get('/api/corporate-giftings');
      setGiftingData(response.data);
    } catch (error) {
      console.error('Failed to fetch corporate giftings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftings();
  }, []);

  const filtered = giftingData.filter(o =>
    (o.serviceRequestId || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (o.companyName || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (o.contactPersonName || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const handleQuotationStatusChange = (giftingId, newStatus) => {
    setGiftingData(prev => prev.map(g => g.id === giftingId ? { ...g, quotationStatus: newStatus } : g));
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SmartSidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <div>
            <p className="text-gray-400 text-xs">Services</p>
            <h1 className="text-base font-bold text-gray-800">Corporate Gifting</h1>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <MdSearch size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, Company or Person..."
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
              { label: 'Total Requests', value: giftingData.length, color: '#068BC9' },
              { label: 'Accepted', value: giftingData.filter(g => g.quotationStatus === 'accepted').length, color: '#22c55e' },
              { label: 'Pending', value: giftingData.filter(g => g.quotationStatus === 'pending').length, color: '#f97316' },
              { label: 'Rejected', value: giftingData.filter(g => g.quotationStatus === 'rejected').length, color: '#ef4444' },
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

            <button onClick={fetchGiftings} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MdRefresh size={18} className="text-gray-400" />
            </button>

            {!isAdmin && (
              <button
                onClick={() => navigate('/gifting/new')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: '#22c55e' }}>
                <MdAdd size={18} />
                New Request
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    'Service Request ID', 'Company Name', 'Contact Person',
                    'Purpose of Gifting', 'Quantity', 'Delivery Type',
                    'Preferred Items & Brands', 'Branding Requirements', 'Additional Services',
                    'Created Date', 'Expected Delivery', 'Actual Delivery', 'POD File',
                    'Quotation Action', 'Quotation Status', 'Actions'
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
                    <td colSpan={16} className="text-center py-10 text-gray-400 text-sm">
                      No corporate gifting requests found
                    </td>
                  </tr>
                ) : (
                  filtered.map((order, i) => {
                    const s = statusConfig[order.quotationStatus] || { color: '#9ca3af', bg: '#f3f4f6', label: order.quotationStatus || 'Initialized' };
                    const podUrl = order.podCopy ? `${API_BASE}${order.podCopy}` : null;
                    return (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap cursor-pointer hover:underline"
                          style={{ color: '#068BC9' }}
                          onClick={() => navigate(`/gifting/${order.id}`)}>
                          {order.serviceRequestId}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.companyName}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.contactPersonName}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.purposeOfGifting || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {String(order.estimatedQuantity).toLowerCase() === 'others' && order.others ? order.others : (order.estimatedQuantity || '—')}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.deliveryType || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600" style={{ minWidth: '220px', whiteSpace: 'normal' }}>{formatPreferredItems(order)}</td>
                        <td className="px-4 py-3 text-xs text-gray-600" style={{ minWidth: '160px', whiteSpace: 'normal' }}>{formatBranding(order)}</td>
                        <td className="px-4 py-3 text-xs text-gray-600" style={{ minWidth: '160px', whiteSpace: 'normal' }}>{formatAdditionalServices(order)}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.createdAt ? order.createdAt.split('T')[0] : '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {order.expectedDeliveryDate ? order.expectedDeliveryDate.split('T')[0] : <span className="text-gray-400 italic">Pending</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {order.deliveryDate ? order.deliveryDate.split('T')[0] : <span className="text-gray-400 italic">Pending</span>}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {podUrl ? (
                            <button
                              onClick={() => window.open(podUrl, '_blank')}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Download POD">
                              <MdDownload size={16} style={{ color: '#068BC9' }} />
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300">No POD</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {isCrmUser && (
                            <button
                              onClick={() => setQuotationDialogId(order.id)}
                              disabled={order.quotationStatus === 'accepted'}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{ color: '#068BC9', backgroundColor: '#e0f2fe' }}>
                              Upload Quotation
                            </button>
                          )}
                          {isCompanyUser && (
                            <button
                              onClick={() => setQuotationDialogId(order.id)}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                              style={{ color: '#22c55e', backgroundColor: '#dcfce7' }}>
                              View Quotations
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className="text-xs font-medium px-2 py-1 rounded-full capitalize"
                            style={{ color: s.color, backgroundColor: s.bg }}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/gifting/${order.id}`)}
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

      {quotationDialogId && (
        <QuotationDialog
          giftingId={quotationDialogId}
          onClose={() => setQuotationDialogId(null)}
          onStatusChange={(newStatus) => handleQuotationStatusChange(quotationDialogId, newStatus)}
        />
      )}
    </div>
  );
}