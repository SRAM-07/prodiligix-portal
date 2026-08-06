import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { MdAdd, MdRefresh, MdClose, MdReceipt } from 'react-icons/md';
import api from '../services/api';

export default function PurchaseOrders() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [pos, setPos] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const emptyForm = {
    companyId: '',
    plantId: '',
    purchaseOrderNumber: '',
    purchaseOrderAmount: '',
    purchaseOrderValidity: '',
    purchaseOrderIsActive: true,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/api/companies');
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPOs = async (companyId) => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/purchase-orders/company/${companyId}`);
      setPos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlants = async (companyId) => {
    if (!companyId) return;
    try {
      const res = await api.get(`/api/plants/company/${companyId}`);
      setPlants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchPOs(selectedCompany);
      fetchPlants(selectedCompany);
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleSubmit = async () => {
    if (!form.companyId || !form.plantId || !form.purchaseOrderNumber || !form.purchaseOrderAmount) {
      setError('Company, Plant, PO Number and Amount are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/purchase-orders', {
        companyId: parseInt(form.companyId),
        plantId: parseInt(form.plantId),
        purchaseOrderNumber: form.purchaseOrderNumber,
        purchaseOrderAmount: parseFloat(form.purchaseOrderAmount),
        purchaseOrderAmountUsed: 0,
        purchaseOrderValidity: form.purchaseOrderValidity || null,
        purchaseOrderIsActive: form.purchaseOrderIsActive,
      });
      setToast('Purchase Order created successfully');
      setShowDialog(false);
      fetchPOs(selectedCompany);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create PO');
    } finally {
      setSubmitting(false);
    }
  };

  const getPlantName = (plantId) =>
    plants.find(p => p.id === plantId)?.name || `Plant ${plantId}`;

  const balance = (po) =>
    ((po.purchaseOrderAmount || 0) - (po.purchaseOrderAmountUsed || 0)).toFixed(2);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <div>
            <p className="text-gray-400 text-xs">Admin</p>
            <h1 className="text-base font-bold text-gray-800">Purchase Orders</h1>
          </div>
          <div className="flex items-center gap-3">
            <select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
              <option value="">Select Company</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
            </select>
            {selectedCompany && (
              <>
                <button onClick={() => fetchPOs(selectedCompany)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <MdRefresh size={18} className="text-gray-400" />
                </button>
                <button onClick={() => { setForm({ ...emptyForm, companyId: selectedCompany }); setError(''); setShowDialog(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: '#068BC9' }}>
                  <MdAdd size={18} /> Add PO
                </button>
              </>
            )}
          </div>
        </div>

        {toast && (
          <div className="fixed top-20 right-6 z-[200] bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3">
            <p className="text-sm text-green-600 font-medium">{toast}</p>
          </div>
        )}

        <div className="p-5">
          {!selectedCompany ? (
            <div className="text-center py-20 text-gray-400 text-sm">Select a company to view purchase orders</div>
          ) : loading ? (
            <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                  { label: 'Total POs', value: pos.length, color: '#068BC9' },
                  { label: 'Active', value: pos.filter(p => p.purchaseOrderIsActive).length, color: '#22c55e' },
                  { label: 'Total Balance', value: `₹${pos.filter(p => p.purchaseOrderIsActive).reduce((sum, p) => sum + parseFloat(balance(p)), 0).toFixed(2)}`, color: '#8b5cf6' },
                ].map((card, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                    <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['PO Number', 'Plant', 'PO Amount', 'Used', 'Balance', 'Validity', 'Status'].map((col, i) => (
                        <th key={i} className="text-left text-xs text-gray-400 font-medium px-5 py-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pos.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No purchase orders found</td></tr>
                    ) : pos.map((po, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-5 py-3 text-sm font-medium text-gray-800">{po.purchaseOrderNumber}</td>
                        <td className="px-5 py-3 text-xs text-gray-600">{getPlantName(po.plantId)}</td>
                        <td className="px-5 py-3 text-xs text-gray-600">₹{parseFloat(po.purchaseOrderAmount || 0).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3 text-xs text-gray-600">₹{parseFloat(po.purchaseOrderAmountUsed || 0).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3 text-xs font-semibold" style={{ color: '#068BC9' }}>₹{parseFloat(balance(po)).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3 text-xs text-gray-600">{po.purchaseOrderValidity || '—'}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-medium px-2 py-1 rounded-full"
                            style={{
                              color: po.purchaseOrderIsActive ? '#22c55e' : '#ef4444',
                              backgroundColor: po.purchaseOrderIsActive ? '#dcfce7' : '#fee2e2'
                            }}>
                            {po.purchaseOrderIsActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Create Purchase Order</h2>
              <button onClick={() => setShowDialog(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <MdClose size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Plant <span className="text-red-400">*</span></p>
                <select value={form.plantId} onChange={e => setForm(p => ({...p, plantId: e.target.value}))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  <option value="">Select Plant</option>
                  {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">PO Number <span className="text-red-400">*</span></p>
                <input type="text" value={form.purchaseOrderNumber}
                  onChange={e => setForm(p => ({...p, purchaseOrderNumber: e.target.value}))}
                  placeholder="e.g. PO-2026-001"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">PO Amount (₹) <span className="text-red-400">*</span></p>
                <input type="number" value={form.purchaseOrderAmount}
                  onChange={e => setForm(p => ({...p, purchaseOrderAmount: e.target.value}))}
                  placeholder="Enter amount"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Validity Date (optional)</p>
                <input type="date" value={form.purchaseOrderValidity}
                  onChange={e => setForm(p => ({...p, purchaseOrderValidity: e.target.value}))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="poActive" checked={form.purchaseOrderIsActive}
                  onChange={e => setForm(p => ({...p, purchaseOrderIsActive: e.target.checked}))}
                  style={{ accentColor: '#068BC9' }} />
                <label htmlFor="poActive" className="text-sm text-gray-600">Active</label>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowDialog(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: '#068BC9' }}>
                {submitting ? 'Creating...' : 'Create PO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}