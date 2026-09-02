import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdFilterList, MdRefresh, MdSearch, MdClose, MdDownload, MdExpandMore, MdMailOutline } from 'react-icons/md';
import api from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const fullFileUrl = (path) => path ? (path.startsWith('http') ? path : API_BASE_URL + path) : null;

const filterOptions = ['Sort: Newest First', 'Sort: Oldest First', 'Since Date', 'Date Range', 'Status', 'Company', 'Reset / Show All'];

function getStatusIdColor(row) {
  const status = row.deliveryStatus ? row.deliveryStatus.toLowerCase() : '';
  if (status.includes('cancel') || status.includes('exception')) return '#ef4444';
  if (status.includes('delivered')) return '#22c55e';
  if (status.includes('rto')) return '#f97316';
  if (status.includes('in transit')) return '#1d4ed8';
  if (status.includes('picked up')) return '#0ea5e9';
  if (status.includes('booked') && !row.shipmentAwbNumber) return '#f59e0b'; // Booked but no AWB yet — amber
  if (status.includes('booked')) return '#068BC9'; // Booked with AWB — brand blue
  if (row.requestApproved) return '#0d9488';
  return '#6b7280'; // Not yet processed — gray
}

const statusConfig = {
  'Booked': { color: '#068BC9', bg: '#e0f2fe' },
  'In Transit': { color: '#1d4ed8', bg: '#dbeafe' },
  'Picked Up': { color: '#0ea5e9', bg: '#e0f2fe' },
  'Delivered': { color: '#22c55e', bg: '#dcfce7' },
  'Exception': { color: '#ef4444', bg: '#fee2e2' },
  'Cancelled': { color: '#ef4444', bg: '#fee2e2' },
  'RTO': { color: '#f97316', bg: '#ffedd5' },
};

export default function Logistics() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Sort: Newest First');
  const [statusFilter, setStatusFilter] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [searchText, setSearchText] = useState('');
  const [openDocDropdown, setOpenDocDropdown] = useState(null);
  const [logisticsData, setLogisticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [sinceDate, setSinceDate] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [companyFilter, setCompanyFilter] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [showCompanyOptions, setShowCompanyOptions] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/api/companies');
      setCompanies(res.data);
    } catch (e) { console.error('Failed to fetch companies', e); }
  };
  const fetchShipments = async () => {
    try {
      const response = await api.get('/api/shipments');
      setLogisticsData(response.data);
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const filtered = logisticsData.filter(o => {
    const matchesSearch =
      (o.serviceRequestId || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (o.shipmentAwbNumber || '').toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || o.deliveryStatus === statusFilter;
    const createdAt = o.createdAt ? new Date(o.createdAt) : null;
    const matchesSince = !sinceDate || (createdAt && createdAt >= new Date(sinceDate));
    const matchesDateFrom = !dateFrom || (createdAt && createdAt >= new Date(dateFrom));
    const matchesDateTo = !dateTo || (createdAt && createdAt <= new Date(dateTo + 'T23:59:59'));
    const matchesCompany = !companyFilter || o.companyId === companyFilter;
    return matchesSearch && matchesStatus && matchesSince && matchesDateFrom && matchesDateTo && matchesCompany;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const paginated = sorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter, sortOrder, sinceDate, dateFrom, dateTo, companyFilter]);

  const getAvailableDocs = (row) => {
    const docs = [];
    if (row.invoiceCopy) docs.push({ label: 'Invoice Copy', url: fullFileUrl(row.invoiceCopy) });
    if (row.ewayBill) docs.push({ label: 'E-Way Bill', url: fullFileUrl(row.ewayBill) });
    if (row.shipmentWithLabel) docs.push({ label: 'Shipment Label', url: fullFileUrl(row.shipmentWithLabel) });
    if (row.podCopy) docs.push({ label: 'POD Copy', url: fullFileUrl(row.podCopy) });
    if (row.manifest) docs.push({ label: 'Manifest', url: fullFileUrl(row.manifest) });
    return docs;
  };

  const handleSendLabelEmail = async (shipmentId) => {
    setSendingEmailId(shipmentId);
    try {
      const res = await api.post(`/api/shipments/${shipmentId}/send-label-email`);
      setToast(res.data.message || 'Label email sent successfully');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to send label email';
      setToast(message);
    } finally {
      setSendingEmailId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <p className="text-gray-400 text-sm">Loading shipments...</p>
      </div>
    );
  }

  const columns = [
    'Service Request ID', 'Company', 'Pickup Address', 'Delivery Address', 'Transport Mode', 'Shipment Detail',
    'Declared Value', 'Challan No.', 'Boxes', 'Rate Type', 'Final Rate',
    'AWB Number', 'Delivery Partner', 'Status', 'Created Date', 'Delivery Date',
    'Expected Delivery Date', 'Docs', 'Email Label'
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
            <p className="text-gray-400 text-xs">Services</p>
            <h1 className="text-base font-bold text-gray-800">Logistics Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <MdSearch size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, AWB or Company..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="bg-transparent text-sm outline-none w-56 text-gray-600"
              />
              {searchText && (
                <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => setSearchText('')} />
              )}
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed top-20 right-6 z-[200] bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3">
            <p className="text-sm text-green-600 font-medium">{toast}</p>
          </div>
        )}

        <div className="p-5">

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Total Orders', value: logisticsData.length, color: '#068BC9' },
              { label: 'Delivered', value: logisticsData.filter(o => o.deliveryStatus === 'Delivered').length, color: '#22c55e' },
              { label: 'In Transit', value: logisticsData.filter(o => o.deliveryStatus === 'In Transit').length, color: '#1d4ed8' },
              { label: 'Exceptions', value: logisticsData.filter(o => o.deliveryStatus === 'Exception').length, color: '#ef4444' },
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
                      onClick={() => {
                        if (opt === 'Reset / Show All') {
                          setActiveFilter('Sort: Newest First');
                          setStatusFilter(null);
                          setSortOrder('newest');
                          setSinceDate('');
                          setDateFrom('');
                          setDateTo('');
                          setCompanyFilter(null);
                          setShowCompanyOptions(false);
                          setShowFilter(false);
                        } else if (opt === 'Status') {
                          setShowStatusOptions(true);
                          setShowCompanyOptions(false);
                        } else if (opt === 'Company') {
                          setShowCompanyOptions(true);
                          setShowStatusOptions(false);
                        } else if (opt === 'Sort: Newest First') {
                          setSortOrder('newest');
                          setActiveFilter(opt);
                          setShowFilter(false);
                        } else if (opt === 'Sort: Oldest First') {
                          setSortOrder('oldest');
                          setActiveFilter(opt);
                          setShowFilter(false);
                        } else {
                          setActiveFilter(opt);
                          setShowFilter(false);
                        }
                      }}
                      className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 text-sm flex justify-between items-center"
                      style={{ color: opt === 'Reset / Show All' ? '#ef4444' : '#374151' }}>
                      {opt}
                      {opt === 'Status' && <span className="text-gray-300">›</span>}
                    </div>
                  ))}
                  {showCompanyOptions && (
                    <div className="border-t border-gray-100 mt-1 pt-1 max-h-48 overflow-y-auto">
                      {companies.map((c, i) => (
                        <div key={i}
                          onClick={() => {
                            setCompanyFilter(c.id);
                            setActiveFilter(`Company: ${c.businessName}`);
                            setShowFilter(false);
                            setShowCompanyOptions(false);
                          }}
                          className="px-6 py-2 cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
                          {c.businessName}
                        </div>
                      ))}
                    </div>
                  )}
                  {showStatusOptions && (
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      {['Booked', 'Picked Up', 'In Transit', 'Delivered', 'Exception', 'Cancelled', 'RTO'].map((status, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setStatusFilter(status);
                            setActiveFilter(`Status: ${status}`);
                            setShowFilter(false);
                            setShowStatusOptions(false);
                          }}
                          className="px-6 py-2 cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
                          {status}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Since Date */}
            {activeFilter === 'Since Date' && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <span className="text-xs text-gray-500">Since:</span>
                <input type="date" value={sinceDate} onChange={e => setSinceDate(e.target.value)}
                  className="text-xs text-gray-700 outline-none" />
              </div>
            )}
            {/* Date Range */}
            {activeFilter === 'Date Range' && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <span className="text-xs text-gray-500">From:</span>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="text-xs text-gray-700 outline-none" />
                <span className="text-xs text-gray-500">To:</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="text-xs text-gray-700 outline-none" />
              </div>
            )}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-xs font-medium" style={{ color: '#068BC9' }}>
                {activeFilter}: {sorted.length}
              </span>
              <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => { setActiveFilter('Sort: Newest First'); setStatusFilter(null); setSortOrder('newest'); setSinceDate(''); setDateFrom(''); setDateTo(''); setCompanyFilter(null); setShowCompanyOptions(false); }} />
            </div>

            <span className="text-sm text-gray-500">({sorted.length})</span>

            <button onClick={fetchShipments} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MdRefresh size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto w-full">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-100">
                  {columns.map((col, i) => (
                    <th key={i} className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-10 text-gray-400 text-sm">
                      No shipments found
                    </td>
                  </tr>
                ) : (
                  paginated.map((order, i) => {
                    const s = statusConfig[order.deliveryStatus] || { color: '#9ca3af', bg: '#f3f4f6' };
                    const docs = getAvailableDocs(order);
                    const idColor = getStatusIdColor(order);
                    return (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-bold whitespace-nowrap cursor-pointer hover:underline"
                          style={{ color: idColor }}
                          onClick={() => navigate(`/logistics/${order.id}`)}>
                          {order.serviceRequestId}
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap font-medium" style={{color:"#068BC9"}}>{order.companyName ?? order.companyId ?? '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.pickupCity ?? order.pickupAddressId ?? 'N/A'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.deliveryCity ?? order.deliveryAddressId ?? 'N/A'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.transportMode || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.shipmentDetails || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {order.shipmentDeclaredValue ? `₹${order.shipmentDeclaredValue}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.deliveryChallanNumber || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.boxQuantity || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.rateType || '—'}</td>
                        <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: '#068BC9' }}>
                          {order.shipmentRate ? `₹${order.shipmentRate}` : '—'}
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.shipmentAwbNumber || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.transporter || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-medium px-2 py-1 rounded-full"
                            style={{ color: s.color, backgroundColor: s.bg }}>
                            {order.deliveryStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {order.createdAt ? order.createdAt.split('T')[0] : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {order.deliveryDate ? order.deliveryDate.split('T')[0] : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {order.expectedDeliveryDate ? order.expectedDeliveryDate.split('T')[0] : '—'}
                        </td>

                        {/* Docs column */}
                        <td className="px-4 py-3 whitespace-nowrap relative">
                          {docs.length > 0 ? (
                            <div className="relative">
                              <button
                                onClick={() => setOpenDocDropdown(openDocDropdown === i ? null : i)}
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                                style={{ color: '#068BC9', backgroundColor: '#e0f2fe' }}>
                                <MdDownload size={14} />
                                Docs
                                <MdExpandMore size={14} />
                              </button>
                              {openDocDropdown === i && (
                                <div className="absolute right-0 top-9 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-2 w-44">
                                  {docs.map((doc, di) => (
                                    <div
                                      key={di}
                                      onClick={() => window.open(doc.url, '_blank')}
                                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-xs text-gray-600 cursor-pointer">
                                      <MdDownload size={13} style={{ color: '#068BC9' }} />
                                      {doc.label}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No Docs</span>
                          )}
                        </td>

                        {/* Email Label column */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {order.shipmentWithLabel ? (
                            <button
                              onClick={() => handleSendLabelEmail(order.id)}
                              disabled={sendingEmailId === order.id}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40"
                              title="Send Label Email">
                              <MdMailOutline size={16} style={{ color: '#068BC9' }} />
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-400">
                Showing {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, sorted.length)} of {sorted.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-gray-300 text-xs">...</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className="w-8 h-8 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: currentPage === p ? '#068BC9' : 'transparent',
                          color: currentPage === p ? '#fff' : '#6b7280'
                        }}>
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}