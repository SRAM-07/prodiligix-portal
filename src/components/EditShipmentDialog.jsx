// src/components/EditShipmentDialog.jsx
import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import api from '../services/api';

export default function EditShipmentDialog({ shipment, onClose, onSuccess }) {
  const hasAwb = !!shipment.shipmentAwbNumber;

  const [form, setForm] = useState({
    // Weight fields (always editable if AWB exists)
    companyId: shipment.companyId,   // ← add this line
    actualWeight: shipment.actualWeight ?? '',
    scanWeight: shipment.scanWeight ?? '',
    volumetricWeight: shipment.volumetricWeight ?? '',

    // Full fields (only editable if no AWB)
    transportMode: shipment.transportMode ?? '',
    shipmentDetails: shipment.shipmentDetails ?? '',
    shipmentDeclaredValue: shipment.shipmentDeclaredValue ?? '',
    deliveryChallanNumber: shipment.deliveryChallanNumber ?? '',
    boxQuantity: shipment.boxQuantity ?? '',
    pickupAddressId: shipment.pickupAddressId ?? '',
    deliveryAddressId: shipment.deliveryAddressId ?? '',
    requestingPlantId: shipment.requestingPlantId ?? '',
    sendingPlantId: shipment.sendingPlantId ?? '',
    receivingPlantId: shipment.receivingPlantId ?? '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/api/shipments/${shipment.id}`, form);
      onSuccess('Shipment updated successfully');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update shipment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">Edit Shipment</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {shipment.serviceRequestId}
              {hasAwb && (
                <span className="ml-2 text-amber-500 font-medium">
                  · AWB exists — weight fields only
                </span>
              )}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <MdClose size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">

          {/* Weight fields — always shown */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Weight Details
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Actual Weight (kg)', field: 'actualWeight' },
                { label: 'Scan Weight (kg)', field: 'scanWeight' },
                { label: 'Volumetric Weight', field: 'volumetricWeight' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form[field]}
                    onChange={set(field)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#068BC9] transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Full form — only if no AWB */}
          {!hasAwb && (
            <>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Shipment Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Transport Mode</label>
                    <select
                      value={form.transportMode}
                      onChange={set('transportMode')}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#068BC9]">
                      <option value="">Select</option>
                      <option value="Surface">Surface</option>
                      <option value="Air">Air</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Box Quantity</label>
                    <input
                      type="number"
                      value={form.boxQuantity}
                      onChange={set('boxQuantity')}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#068BC9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Declared Value (₹)</label>
                    <input
                      type="number"
                      value={form.shipmentDeclaredValue}
                      onChange={set('shipmentDeclaredValue')}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#068BC9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Challan No.</label>
                    <input
                      type="text"
                      value={form.deliveryChallanNumber}
                      onChange={set('deliveryChallanNumber')}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#068BC9]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Shipment Details</label>
                    <textarea
                      value={form.shipmentDetails}
                      onChange={set('shipmentDetails')}
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#068BC9] resize-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Address & Plant IDs
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Pickup Address ID', field: 'pickupAddressId' },
                    { label: 'Delivery Address ID', field: 'deliveryAddressId' },
                    { label: 'Requesting Plant ID', field: 'requestingPlantId' },
                    { label: 'Sending Plant ID', field: 'sendingPlantId' },
                    { label: 'Receiving Plant ID', field: 'receivingPlantId' },
                  ].map(({ label, field }) => (
                    <div key={field}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input
                        type="number"
                        value={form[field]}
                        onChange={set(field)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#068BC9]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#068BC9' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}