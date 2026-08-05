import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import api from '../services/api';

export default function EditAddressDialog({ address, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    facilityName: address.facilityName || '',
    contactPersonName: address.contactPersonName || '',
    contactPersonEmail: address.contactPersonEmail || '',
    contactPersonPhonenumber: address.contactPersonPhonenumber || '',
    address: address.address || '',
    city: address.city || '',
    state: address.state || '',
    zipcode: address.zipcode || '',
    type: address.type || 'pickup',
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    if (!form.facilityName.trim()) return 'Facility/Location name is required';
    if (!form.contactPersonName.trim()) return 'Contact person name is required';
    if (!form.contactPersonPhonenumber.trim() || form.contactPersonPhonenumber.length !== 10) return 'Enter a valid 10-digit phone number';
    if (!form.address.trim()) return 'Address is required';
    if (!form.city.trim()) return 'City is required';
    if (!form.state.trim()) return 'State is required';
    if (!form.zipcode.trim() || form.zipcode.length !== 6) return 'Enter a valid 6-digit pincode';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/api/addresses/${address.id}`, {
        companyId: address.companyId,
        userId: address.userId,
        type: form.type,
        facilityName: form.facilityName,
        contactPersonName: form.contactPersonName,
        contactPersonEmail: form.contactPersonEmail,
        contactPersonPhonenumber: form.contactPersonPhonenumber,
        address: form.address,
        city: form.city,
        state: form.state,
        zipcode: form.zipcode,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update address.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800">Edit Address</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <MdClose size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">Address Type</p>
            <select value={form.type} onChange={e => handleChange('type', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
              <option value="pickup">Pickup</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Facility / Location Name <span className="text-red-400">*</span></p>
            <input type="text" value={form.facilityName} onChange={e => handleChange('facilityName', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Contact Person Name <span className="text-red-400">*</span></p>
              <input type="text" value={form.contactPersonName} onChange={e => handleChange('contactPersonName', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Contact Phone <span className="text-red-400">*</span></p>
              <input type="text" maxLength={10} value={form.contactPersonPhonenumber} onChange={e => handleChange('contactPersonPhonenumber', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Contact Email</p>
            <input type="email" value={form.contactPersonEmail} onChange={e => handleChange('contactPersonEmail', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Full Address <span className="text-red-400">*</span></p>
            <textarea rows={2} value={form.address} onChange={e => handleChange('address', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">City <span className="text-red-400">*</span></p>
              <input type="text" value={form.city} onChange={e => handleChange('city', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">State <span className="text-red-400">*</span></p>
              <input type="text" value={form.state} onChange={e => handleChange('state', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Pincode <span className="text-red-400">*</span></p>
              <input type="text" maxLength={6} value={form.zipcode} onChange={e => handleChange('zipcode', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: '#068BC9' }}>
            {submitting ? 'Saving...' : 'Update Address'}
          </button>
        </div>
      </div>
    </div>
  );
}