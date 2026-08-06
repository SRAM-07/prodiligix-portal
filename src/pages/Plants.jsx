import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { MdSearch, MdClose, MdAdd, MdEdit, MdDelete, MdFactory, MdRefresh } from 'react-icons/md';
import api from '../services/api';

export default function Plants() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [plants, setPlants] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editPlant, setEditPlant] = useState(null);
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const emptyForm = {
    companyId: '',
    name: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhonenumber: '',
    address: '',
    district: '',
    city: '',
    state: '',
    zipcode: '',
    isActive: true,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchPlants = async () => {
    setLoading(true);
    try {
      const res = selectedCompany
        ? await api.get(`/api/plants/company/${selectedCompany}`)
        : await api.get('/api/plants');
      setPlants(res.data);
    } catch (err) {
      console.error('Failed to fetch plants:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/api/companies');
      setCompanies(res.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchPlants();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchPlants();
    // eslint-disable-next-line
  }, [selectedCompany]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const openAdd = () => {
    setEditPlant(null);
    setForm({ ...emptyForm, companyId: selectedCompany || '' });
    setError('');
    setShowDialog(true);
  };

  const openEdit = (plant) => {
    setEditPlant(plant);
    setForm({
      companyId: plant.companyId || '',
      name: plant.name || '',
      contactPersonName: plant.contactPersonName || '',
      contactPersonEmail: plant.contactPersonEmail || '',
      contactPersonPhonenumber: plant.contactPersonPhonenumber || '',
      address: plant.address || '',
      district: plant.district || '',
      city: plant.city || '',
      state: plant.state || '',
      zipcode: plant.zipcode || '',
      isActive: plant.isActive ?? true,
    });
    setError('');
    setShowDialog(true);
  };

  const handleDelete = async (plant) => {
    if (!window.confirm(`Delete plant "${plant.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/plants/${plant.id}`);
      setToast('Plant deleted successfully');
      fetchPlants();
    } catch (err) {
      setToast('Failed to delete plant');
    }
  };

  const validate = () => {
    if (!form.companyId) return 'Company is required';
    if (!form.name.trim()) return 'Plant name is required';
    if (!form.city.trim()) return 'City is required';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setSubmitting(true);
    setError('');
    try {
      const payload = { ...form, companyId: parseInt(form.companyId) };
      if (editPlant) {
        await api.put(`/api/plants/${editPlant.id}`, payload);
        setToast('Plant updated successfully');
      } else {
        await api.post('/api/plants', payload);
        setToast('Plant created successfully');
      }
      setShowDialog(false);
      fetchPlants();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save plant');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = plants.filter(p =>
    (p.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (p.city || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const getCompanyName = (companyId) =>
    companies.find(c => c.id === companyId)?.businessName || `Company ${companyId}`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <div>
            <p className="text-gray-400 text-xs">Admin</p>
            <h1 className="text-base font-bold text-gray-800">Plants</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <MdSearch size={16} className="text-gray-400" />
              <input type="text" placeholder="Search by name or city..."
                value={searchText} onChange={e => setSearchText(e.target.value)}
                className="bg-transparent text-sm outline-none w-44 text-gray-600" />
              {searchText && <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => setSearchText('')} />}
            </div>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#068BC9' }}>
              <MdAdd size={18} /> Add Plant
            </button>
          </div>
        </div>

        {toast && (
          <div className="fixed top-20 right-6 z-[200] bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3">
            <p className="text-sm text-green-600 font-medium">{toast}</p>
          </div>
        )}

        <div className="p-5">
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Total Plants', value: plants.length, color: '#068BC9' },
              { label: 'Active', value: plants.filter(p => p.isActive).length, color: '#22c55e' },
              { label: 'Inactive', value: plants.filter(p => !p.isActive).length, color: '#ef4444' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
              <option value="">All Companies</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
            </select>
            <button onClick={fetchPlants} className="p-1.5 rounded-lg hover:bg-gray-100">
              <MdRefresh size={18} className="text-gray-400" />
            </button>
            <span className="text-sm text-gray-400">({filtered.length})</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {loading ? (
              <p className="text-gray-400 text-sm col-span-3 text-center py-10">Loading plants...</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-400 text-sm col-span-3 text-center py-10">No plants found</p>
            ) : filtered.map((plant, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#e0f2fe' }}>
                      <MdFactory size={18} style={{ color: '#068BC9' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{plant.name}</p>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          color: plant.isActive ? '#22c55e' : '#ef4444',
                          backgroundColor: plant.isActive ? '#dcfce7' : '#fee2e2'
                        }}>
                        {plant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(plant)} className="p-1.5 rounded-lg hover:bg-gray-100">
                      <MdEdit size={15} className="text-gray-400" />
                    </button>
                    <button onClick={() => handleDelete(plant)} className="p-1.5 rounded-lg hover:bg-red-50">
                      <MdDelete size={15} className="text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>{plant.address || '—'}</p>
                  <p>{plant.city}{plant.district ? `, ${plant.district}` : ''}, {plant.state} — {plant.zipcode}</p>
                  {plant.contactPersonName && <p className="text-gray-400 mt-2">{plant.contactPersonName} · {plant.contactPersonPhonenumber}</p>}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <p className="text-xs text-gray-400">{getCompanyName(plant.companyId)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">{editPlant ? 'Edit Plant' : 'Add New Plant'}</h2>
              <button onClick={() => setShowDialog(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <MdClose size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Company <span className="text-red-400">*</span></p>
                <select value={form.companyId} onChange={e => setForm(p => ({...p, companyId: e.target.value}))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  <option value="">Select Company</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Plant Name <span className="text-red-400">*</span></p>
                <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Contact Person</p>
                  <input type="text" value={form.contactPersonName} onChange={e => setForm(p => ({...p, contactPersonName: e.target.value}))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Contact Phone</p>
                  <input type="text" maxLength={10} value={form.contactPersonPhonenumber} onChange={e => setForm(p => ({...p, contactPersonPhonenumber: e.target.value}))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Contact Email</p>
                <input type="email" value={form.contactPersonEmail} onChange={e => setForm(p => ({...p, contactPersonEmail: e.target.value}))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Address</p>
                <input type="text" value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">City <span className="text-red-400">*</span></p>
                  <input type="text" value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">District</p>
                  <input type="text" value={form.district} onChange={e => setForm(p => ({...p, district: e.target.value}))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">State</p>
                  <input type="text" value={form.state} onChange={e => setForm(p => ({...p, state: e.target.value}))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Pincode</p>
                  <input type="text" maxLength={6} value={form.zipcode} onChange={e => setForm(p => ({...p, zipcode: e.target.value}))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="plantActive" checked={form.isActive}
                  onChange={e => setForm(p => ({...p, isActive: e.target.checked}))}
                  style={{ accentColor: '#068BC9' }} />
                <label htmlFor="plantActive" className="text-sm text-gray-600">Active</label>
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
                {submitting ? 'Saving...' : editPlant ? 'Update Plant' : 'Create Plant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}