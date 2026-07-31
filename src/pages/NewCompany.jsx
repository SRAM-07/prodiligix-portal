import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdArrowBack } from 'react-icons/md';
import api from '../services/api';

export default function NewCompany() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhonenumber: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    billingType: 'wallet',
    hasPlants: false,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.businessName.trim()) {
      setError('Company name is required');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/api/companies', form);
      navigate(`/companies/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create company. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 sticky top-0 z-40">
          <button onClick={() => navigate('/companies')} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <MdArrowBack size={20} className="text-gray-500" />
          </button>
          <div>
            <p className="text-gray-400 text-xs">Admin</p>
            <h1 className="text-base font-bold text-gray-800">Add New Company</h1>
          </div>
        </div>

        <div className="p-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Company / Business Name *</label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={e => handleChange('businessName', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none"
                  placeholder="e.g. Rapido Technologies Pvt. Ltd." />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Contact Person Name</label>
                <input
                  type="text"
                  value={form.contactPersonName}
                  onChange={e => handleChange('contactPersonName', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Contact Email</label>
                <input
                  type="email"
                  value={form.contactPersonEmail}
                  onChange={e => handleChange('contactPersonEmail', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Contact Phone</label>
                <input
                  type="text"
                  value={form.contactPersonPhonenumber}
                  onChange={e => handleChange('contactPersonPhonenumber', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Billing Type</label>
                <select
                  value={form.billingType}
                  onChange={e => handleChange('billingType', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  <option value="wallet">Wallet</option>
                  <option value="po">Purchase Order (PO)</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => handleChange('address', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => handleChange('city', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={e => handleChange('state', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Zipcode</label>
                <input
                  type="text"
                  value={form.zipcode}
                  onChange={e => handleChange('zipcode', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="hasPlants"
                  checked={form.hasPlants}
                  onChange={e => handleChange('hasPlants', e.target.checked)}
                  className="w-4 h-4" />
                <label htmlFor="hasPlants" className="text-sm text-gray-600">Has multiple plants/locations</label>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/companies')}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: '#22c55e' }}>
                {submitting ? 'Creating...' : 'Create Company'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
