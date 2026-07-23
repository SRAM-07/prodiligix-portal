import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';
import { MdFilterList, MdRefresh, MdSearch, MdClose, MdDownload, MdExpandMore, MdAdd } from 'react-icons/md';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';

const filterOptions = ['Latest', 'Since Date', 'Date Range', 'Status', 'Reset / Show All'];

function getStatusIdColor(row) {
  const status = row.deliveryStatus ? row.deliveryStatus.toLowerCase() : '';
  if (status.includes('cancel') || status.includes('exception')) return '#ef4444';
  if (status.includes('delivered')) return '#22c55e';
  if (status.includes('rto')) return '#f97316';
  if (status.includes('in transit')) return '#1d4ed8';
  if (status.includes('picked up')) return '#0ea5e9';
  return '#068BC9';
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

export default function ClientLogistics() {
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Latest');
  const [searchText, setSearchText] = useState('');
  const [openDocDropdown, setOpenDocDropdown] = useState(null);
  const [shipmentsData, setShipmentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const companyId = user?.companyId || 1;

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await api.get(`/api/shipments/company/${companyId}`);
        setShipmentsData(response.data);
      } catch (error) {
        console.error('Failed to fetch shipments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, [companyId]);

  const filtered = shipmentsData.filter(o =>
    (o.serviceRequestId || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (o.shipmentAwbNumber || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const getAvailableDocs = (row) => {
    const docs = [];
    if (row.invoiceCopy) docs.push({ label: 'Invoice Copy', url: row.invoiceCopy });
    if (row.ewayBill) docs.push({ label: 'E-Way Bill', url: row.ewayBill });
    if (row.shipmentWithLabel) docs.push({ label: 'Shipment Label', url: row.shipmentWithLabel });
    if (row.podCopy) docs.push({ label: 'POD Copy', url: row.podCopy });
    if (row.manifest) docs.push({ label: 'Manifest', url: row.manifest });
    return docs;
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );

  return (
    <ClientLayout>

      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
        <div>
          <p className="text-gray-400 text-xs">Services</p>
          <h1 className="text-base font-bold text-gray-800">Logistic Management Services</h1>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
          <MdSearch size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID or AWB..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="bg-transparent text-sm outline-none w-48 text-gray-600"
          />
          {searchText && (
            <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => setSearchText('')} />
          )}
        </div>
      </div>

      <div className="p-5">

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Shipment Booked', value: shipmentsData.filter(o => o.deliveryStatus === 'Booked').length, color: '#068BC9' },
            { label: 'In Transit', value: shipmentsData.filter(o => o.deliveryStatus === 'In Transit').length, color: '#1d4ed8' },
            { label: 'Delivered', value: shipmentsData.filter(o => o.deliveryStatus === 'Delivered').length, color: '#22c55e' },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.label}</p>
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
            onClick={() => navigate('/client/logistics/book')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: '#22c55e' }}>
            <MdAdd size={18} />
            + Book a Shipment
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  'Service Request ID', 'Transport Mode', 'Shipment Detail',
                  'Declared Value', 'Boxes', 'Final Rate', 'Payment Status', 'AWB Number',
                  'Delivery Partner', 'Status', 'Created Date', 'Actions'
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
                  <td colSpan={12} className="text-center py-10 text-gray-400 text-sm">
                    No shipments found
                  </td>
                </tr>
              ) : (
                filtered.map((order, i) => {
                  const s = statusConfig[order.deliveryStatus] || { color: '#9ca3af', bg: '#f3f4f6' };
                  const docs = getAvailableDocs(order);
                  const idColor = getStatusIdColor(order);
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-bold whitespace-nowrap cursor-pointer hover:underline"
                        style={{ color: idColor }}>
                        {order.serviceRequestId}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.transportMode || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.shipmentDetails || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {order.shipmentDeclaredValue ? `₹${order.shipmentDeclaredValue}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.boxQuantity || '—'}</td>
                      <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: '#068BC9' }}>
                        {order.shipmentRate ? `₹${order.shipmentRate}` : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{
                            color: order.requestApproved ? '#22c55e' : '#f97316',
                            backgroundColor: order.requestApproved ? '#dcfce7' : '#ffedd5'
                          }}>
                          {order.requestApproved ? 'Processed' : 'Pending'}
                        </span>
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
                      <td className="px-4 py-3 whitespace-nowrap relative">
                        {docs.length > 0 ? (
                          <div className="relative">
                            <button
                              onClick={() => setOpenDocDropdown(openDocDropdown === i ? null : i)}
                              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ClientLayout>
  );
}