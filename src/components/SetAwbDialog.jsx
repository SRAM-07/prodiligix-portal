import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import api from '../services/api';

export default function SetAwbDialog({ shipmentId, currentAwb, onClose, onSuccess }) {
  const [awb, setAwb] = useState(currentAwb || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!awb.trim()) {
      setError('Please enter a valid AWB number');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.patch(`/api/shipments/${shipmentId}/awb`, { shipmentAwbNumber: awb.trim() });
      onSuccess('AWB number saved successfully');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save AWB number. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800">Set AWB Number</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <MdClose size={20} className="text-gray-500" />
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-2">
          Enter the AWB number from the carrier's booking (e.g. after manually booking on Delhivery's website).
        </p>

        <input
          type="text"
          placeholder="Enter AWB number"
          value={awb}
          onChange={e => setAwb(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none mb-2" />

        {error && (
          <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: '#068BC9' }}>
            {submitting ? 'Saving...' : 'Save AWB'}
          </button>
        </div>
      </div>
    </div>
  );
}