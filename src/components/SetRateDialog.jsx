import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import api from '../services/api';

export default function SetRateDialog({ shipmentId, currentRate, onClose, onSuccess }) {
  const [rate, setRate] = useState(currentRate || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rate || parseFloat(rate) <= 0) {
      setError('Enter a valid rate');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.patch(`/api/shipments/${shipmentId}/rate`, { shipmentRate: parseFloat(rate) });
      const deductionRes = await api.post(`/api/shipments/${shipmentId}/process-deduction`);
      onSuccess(deductionRes.data.message || 'Processed successfully');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800">Set Shipment Rate</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <MdClose size={20} className="text-gray-500" />
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-2">Final Rate (₹)</p>
        <input
          type="number"
          value={rate}
          onChange={e => setRate(e.target.value)}
          placeholder="Enter final shipment rate"
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none mb-2"
        />
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        <p className="text-xs text-gray-400 mb-4">
          This will set the rate and immediately deduct/credit the difference from the company's wallet or purchase order.
        </p>

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
            {submitting ? 'Processing...' : 'Set Rate & Process'}
          </button>
        </div>
      </div>
    </div>
  );
}