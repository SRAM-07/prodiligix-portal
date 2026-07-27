import React, { useState } from 'react';
import { MdClose, MdLocalShipping } from 'react-icons/md';
import api from '../services/api';

export default function BookWithCarrierDialog({ shipment, onClose, onSuccess }) {
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setBooking(true);
    setError('');
    try {
      const res = await api.post(`/api/shipments/${shipment.id}/create-with-carrier`);
      if (res.data.success) {
        onSuccess(`Shipment booked! AWB: ${res.data.waybill}`);
        onClose();
      } else {
        setError(res.data.error || 'Booking failed — carrier did not confirm.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book with carrier. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const isForward = shipment.modes?.toLowerCase() === 'forward';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MdLocalShipping size={20} style={{ color: '#068BC9' }} />
            <h2 className="text-base font-bold text-gray-800">Review & Book with Carrier</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <MdClose size={20} className="text-gray-500" />
          </button>
        </div>

        {!isForward ? (
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-4">
            <p className="text-sm text-orange-600">
              Automated booking is currently only available for <strong>Forward</strong> shipments.
              This shipment is <strong>{shipment.modes || 'unspecified'}</strong> mode — please book manually with the carrier and enter the AWB number.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">
              Review the details below. Clicking "Confirm & Book" will send this shipment to Delhivery and generate a real AWB number automatically.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-3 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Service Request ID</p>
                  <p className="text-sm font-medium text-gray-700">{shipment.serviceRequestId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Pickup Location</p>
                  <p className="text-sm font-medium text-gray-700">Prodiligix Technologies pvt ltd (HSR LAYOUT)</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Transport Mode</p>
                  <p className="text-sm font-medium text-gray-700">{shipment.transportMode || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Weight</p>
                  <p className="text-sm font-medium text-gray-700">{shipment.actualWeight || '—'} kg</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Declared Value</p>
                  <p className="text-sm font-medium text-gray-700">₹{shipment.shipmentDeclaredValue || '0'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Payment Mode</p>
                  <p className="text-sm font-medium text-gray-700">Prepaid</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Shipment Details</p>
                <p className="text-sm font-medium text-gray-700">{shipment.shipmentDetails || '—'}</p>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            {isForward ? 'Cancel' : 'Close'}
          </button>
          {isForward && (
            <button
              onClick={handleConfirm}
              disabled={booking}
              className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#068BC9' }}>
              {booking ? 'Booking...' : 'Confirm & Book'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}