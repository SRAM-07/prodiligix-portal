import React, { useState, useEffect } from 'react';
import { MdDownload, MdReceipt } from 'react-icons/md';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const BRAND = '#068BC9';

export default function AdminInvoices() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    api.get('/api/companies').then(res => setCompanies(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCompany) return;
    setLoading(true);
    api.get(`/api/shipments/company/${selectedCompany}`)
      .then(res => setShipments(res.data.filter(s => s.shipmentAwbNumber && s.deliveryStatus !== 'Cancelled')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCompany]);

  const handleDownload = async (s) => {
    setDownloading(s.id);
    try {
      const res = await api.get(`/api/shipments/${s.id}/invoice`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${s.serviceRequestId}.pdf`;
      a.click();
    } catch (e) {
      alert('Failed to download invoice');
    } finally {
      setDownloading(null);
    }
  };

  const filtered = shipments.filter(s =>
    s.serviceRequestId?.toLowerCase().includes(search.toLowerCase()) ||
    s.shipmentAwbNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = rowsPerPage === 'all' ? 1 : Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = rowsPerPage === 'all' ? filtered : filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />
      <div className="flex-1 transition-all duration-300 overflow-auto"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Invoices</h1>
              <p className="text-xs text-gray-400">Download shipment invoices by company</p>
            </div>
            <input type="text" placeholder="Search by SR ID or AWB..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none w-64" />
          </div>

          {/* Company selector */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Select Company</p>
            <select value={selectedCompany} onChange={e => { setSelectedCompany(e.target.value); setCurrentPage(1); }}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
              <option value="">Select a company</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
            </select>
          </div>

          {/* Invoice table */}
          {selectedCompany && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">Invoice List ({filtered.length})</p>
              </div>
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <MdReceipt size={36} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No invoices found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Invoice ID', 'AWB Number', 'Transporter', 'Mode', 'Date', 'Amount', 'Status', 'Action'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginated.map(s => (
                          <tr key={s.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-xs font-medium whitespace-nowrap" style={{ color: BRAND }}>{s.serviceRequestId}</td>
                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{s.shipmentAwbNumber || '—'}</td>
                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{s.transporter || '—'}</td>
                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{s.transportMode || '—'}</td>
                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                              {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                              ₹{parseFloat(s.shipmentRate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-xs whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">{s.deliveryStatus}</span>
                            </td>
                            <td className="px-4 py-3 text-xs whitespace-nowrap">
                              <button onClick={() => handleDownload(s)} disabled={downloading === s.id}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-medium"
                                style={{ backgroundColor: BRAND }}>
                                <MdDownload size={14} />
                                {downloading === s.id ? 'Downloading...' : 'Download'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Rows per page:</span>
                      <select value={rowsPerPage} onChange={e => { setRowsPerPage(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); setCurrentPage(1); }}
                        className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 outline-none">
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value="all">All</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Showing {rowsPerPage === 'all' ? 1 : (currentPage - 1) * rowsPerPage + 1}-{rowsPerPage === 'all' ? filtered.length : Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}
                      </span>
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                        className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40">Previous</button>
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                        className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40">Next</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
