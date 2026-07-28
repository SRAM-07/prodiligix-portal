import React, { useState } from 'react';
import { MdClose, MdWarning } from 'react-icons/md';
import api from '../services/api';

export default function CancelShipmentDialog({ shipmentId, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Please enter a reason for cancellation');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.patch(`/api/shipments/${shipmentId}/cancel`, { reason });
      onSuccess('Shipment cancelled successfully. Amount refunded if applicable.');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to cancel shipment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MdWarning size={20} className="text-red-500" />
            <h2 className="text-base font-bold text-gray-800">Cancel Shipment</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <MdClose size={20} className="text-gray-500" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to cancel this shipment? Any amount already deducted will be refunded automatically.
        </p>

        <p className="text-xs text-gray-400 mb-1">Reason for Cancellation <span className="text-red-400">*</span></p>
        <textarea
          rows={3}
          placeholder="Enter reason for cancellation..."
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none resize-none mb-2" />

        {error && (
          <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            Keep Shipment
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50 bg-red-500 hover:bg-red-600 transition-colors">
            {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
}