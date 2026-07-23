import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';
import { MdArrowBack, MdAttachFile, MdAdd, MdDelete } from 'react-icons/md';
import AddressTypeahead from '../components/AddressTypeahead';
import { getCurrentUser } from '../services/authService';
import api from '../services/api';

const transportModes = ['Air', 'Surface', 'Express'];
const transporters = ['Bluedart', 'DelhiveryOne', 'NimbusPost'];
const modeTypes = ['Forward', 'Reverse'];
const shipmentDetails = ['Laptops', 'Documents', 'Electronics', 'Mobile Phones', 'Other'];
const boxTypes = ['Corrugated Box', 'Wooden Box', 'Plastic Box', 'Envelope'];
const dimensionUnits = ['cms', 'inch', 'feet'];

export default function BookShipment() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const companyId = user?.companyId || 1;

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [ewayFile, setEwayFile] = useState(null);

  const [form, setForm] = useState({
    pickupAddressId: null,
    pickupAddressText: '',
    deliveryAddressId: null,
    deliveryAddressText: '',
    transportMode: '',
    transporter: '',
    modeType: 'Forward',
    declaredValue: '',
    challanNo: '',
    shipmentDetail: '',
    shipmentDescription: '',
    actualWeight: '',
    noOfBoxes: 1,
    dimensionUnit: 'cms',
    insurance: 'yes',
    packaging: 'no',
  });

  const [boxes, setBoxes] = useState([
    { id: 1, noOfBoxes: 1, boxType: '', length: '', width: '', height: '' }
  ]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handlePickupSelect = (addr) => {
    setForm(prev => ({
      ...prev,
      pickupAddressId: addr ? addr.id : null,
      pickupAddressText: addr ? addr.address : prev.pickupAddressText,
    }));
  };

  const handleDeliverySelect = (addr) => {
    setForm(prev => ({
      ...prev,
      deliveryAddressId: addr ? addr.id : null,
      deliveryAddressText: addr ? addr.address : prev.deliveryAddressText,
    }));
  };

  const handleBoxChange = (id, field, value) => {
    setBoxes(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const addBoxGroup = () => {
    setBoxes(prev => [...prev, {
      id: Date.now(), noOfBoxes: 1, boxType: '', length: '', width: '', height: ''
    }]);
  };

  const removeBoxGroup = (id) => {
    if (boxes.length > 1) setBoxes(prev => prev.filter(b => b.id !== id));
  };

  const volumetricWeight = boxes.reduce((total, box) => {
    const v = (parseFloat(box.length) || 0) *
      (parseFloat(box.width) || 0) *
      (parseFloat(box.height) || 0) / 5000;
    return total + v;
  }, 0).toFixed(2);

  const scanWeight = Math.max(
    parseFloat(form.actualWeight) || 0,
    parseFloat(volumetricWeight) || 0
  ).toFixed(2);

  const rateType = parseFloat(form.declaredValue) > 10000 ? 'B2B' : 'B2C';
  const finalRate = (parseFloat(scanWeight) * 45 * 1.18).toFixed(2);

  const totalBoxQuantity = boxes.reduce((sum, b) => sum + (parseInt(b.noOfBoxes) || 0), 0);

  const handleSubmit = async () => {
    if (!form.pickupAddressId || !form.deliveryAddressId || !form.actualWeight) {
      alert('Please select a Pickup Address, Delivery Address and enter Actual Weight');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        companyId,
        pickupAddressId: form.pickupAddressId,
        deliveryAddressId: form.deliveryAddressId,
        transportMode: form.transportMode,
        shipmentDetails: form.shipmentDetail,
        shipmentDetailsDescription: form.shipmentDescription,
        shipmentDeclaredValue: parseFloat(form.declaredValue) || 0,
        deliveryChallanNumber: form.challanNo,
        actualWeight: parseFloat(form.actualWeight),
        boxQuantity: totalBoxQuantity || parseInt(form.noOfBoxes) || 1,
        boxes: JSON.stringify(boxes),
        dimensionUnit: form.dimensionUnit,
        volumetricWeight: parseFloat(volumetricWeight),
        scanWeight: parseFloat(scanWeight),
        insuranceRequired: form.insurance === 'yes',
        packageRequired: form.packaging === 'yes',
        modes: form.modeType.toLowerCase(),
        transporter: form.transporter,
        sourceType: 'wallet',
      };

      await api.post('/api/shipments', payload);

      setSubmitted(true);
      setTimeout(() => navigate('/client/logistics'), 2500);
    } catch (error) {
      console.error('Failed to create shipment:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to book shipment. Please try again.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#dcfce7' }}>
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Shipment Booked Successfully!</h2>
          <p className="text-sm text-gray-400 mb-1">Your shipment request has been submitted.</p>
          <p className="text-sm text-gray-400">ProDiligix team will process it shortly.</p>
          <p className="text-xs text-gray-300 mt-4">Redirecting to orders...</p>
        </div>
      </div>
    );
  }

  return (
    <ClientLayout>

      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 sticky top-0 z-40">
        <button
          onClick={() => navigate('/client/logistics')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <MdArrowBack size={20} className="text-gray-600" />
        </button>
        <div>
          <p className="text-gray-400 text-xs">Logistics Management</p>
          <h1 className="text-base font-bold text-gray-800">Book a Shipment</h1>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">

        {/* Addresses */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-2">
              Pickup Address <span className="text-red-400">*</span>
            </p>
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <AddressTypeahead
                  companyId={companyId}
                  type="pickup"
                  onSelect={handlePickupSelect}
                  placeholder="Type to search pickup address..."
                />
              </div>
              <button
                onClick={() => alert('Add new pickup address — coming soon!')}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs text-gray-500 transition-colors">
                <MdAdd size={16} /> Add
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-2">
              Delivery Address <span className="text-red-400">*</span>
            </p>
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <AddressTypeahead
                  companyId={companyId}
                  type="delivery"
                  onSelect={handleDeliverySelect}
                  placeholder="Type to search delivery address..."
                />
              </div>
              <button
                onClick={() => alert('Add new delivery address — coming soon!')}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs text-gray-500 transition-colors">
                <MdAdd size={16} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Transport details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Transport Mode</p>
              <select
                value={form.transportMode}
                onChange={e => handleChange('transportMode', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                <option value="">Select Mode</option>
                {transportModes.map((m, i) => <option key={i}>{m}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Transporter</p>
              <select
                value={form.transporter}
                onChange={e => handleChange('transporter', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                <option value="">Select Transporter</option>
                {transporters.map((t, i) => <option key={i}>{t}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Mode Type</p>
              <select
                value={form.modeType}
                onChange={e => handleChange('modeType', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                {modeTypes.map((m, i) => <option key={i}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Shipment details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Shipment Declared Value</p>
              <input
                type="number"
                placeholder="Enter declared value"
                value={form.declaredValue}
                onChange={e => handleChange('declaredValue', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Invoice / Delivery Challan No.</p>
              <input
                type="text"
                placeholder="Enter challan number"
                value={form.challanNo}
                onChange={e => handleChange('challanNo', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Shipment Details</p>
              <select
                value={form.shipmentDetail}
                onChange={e => handleChange('shipmentDetail', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                <option value="">Select Type</option>
                {shipmentDetails.map((s, i) => <option key={i}>{s}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Shipment Details Description</p>
              <input
                type="text"
                placeholder="Enter description"
                value={form.shipmentDescription}
                onChange={e => handleChange('shipmentDescription', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
            </div>
          </div>
        </div>

        {/* File uploads */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-2">Upload Invoice / DC Copy</p>
              <label className="flex items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-300 transition-colors">
                <MdAttachFile size={18} className="text-gray-400" />
                <span className="text-sm text-gray-500 truncate">
                  {invoiceFile ? invoiceFile.name : 'Click to upload'}
                </span>
                <input type="file" className="hidden"
                  onChange={e => setInvoiceFile(e.target.files[0])} />
              </label>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Manifest File</p>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                <MdAttachFile size={18} className="text-gray-300" />
                <span className="text-sm text-gray-400">Auto generated after booking</span>
              </div>
            </div>
          </div>

          {/* E-Way Bill — shown only when declared value > 49000 */}
          {parseFloat(form.declaredValue) > 49000 && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">
                Upload E-Way Bill <span className="text-red-400">*</span>
                <span className="text-gray-400 ml-1">(Required for declared value above ₹49,000)</span>
              </p>
              <label className="flex items-center gap-2 border-2 border-dashed border-orange-200 rounded-xl px-4 py-3 cursor-pointer hover:border-orange-300 transition-colors">
                <MdAttachFile size={18} className="text-orange-400" />
                <span className="text-sm text-gray-500 truncate">
                  {ewayFile ? ewayFile.name : 'Click to upload E-Way Bill'}
                </span>
                <input type="file" className="hidden"
                  onChange={e => setEwayFile(e.target.files[0])} />
              </label>
            </div>
          )}
        </div>

        {/* Weight + Boxes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">
                Actual Weight (Kg) <span className="text-red-400">*</span>
              </p>
              <input
                type="number"
                placeholder="0"
                value={form.actualWeight}
                onChange={e => handleChange('actualWeight', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">No. of Boxes</p>
              <input
                type="number"
                min="1"
                value={form.noOfBoxes}
                onChange={e => handleChange('noOfBoxes', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Dimension Unit</p>
              <select
                value={form.dimensionUnit}
                onChange={e => handleChange('dimensionUnit', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                {dimensionUnits.map((d, i) => <option key={i}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Final Rate */}
          <div className="flex justify-end mb-5">
            <div
              className="rounded-xl px-8 py-3 text-center text-white"
              style={{ backgroundColor: parseFloat(form.actualWeight) > 0 ? '#22c55e' : '#ef4444' }}>
              <p className="text-xs opacity-80">Final Rate</p>
              <p className="text-2xl font-bold">
                {parseFloat(form.actualWeight) > 0 ? `₹${finalRate}` : '0.00'}
              </p>
            </div>
          </div>

          {/* Box groups */}
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Shipment Dimensions (grouped)
          </p>

          {boxes.map((box, i) => (
            <div key={box.id} className="border border-gray-200 rounded-xl p-4 mb-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">Box group {i + 1}</p>
                  <p className="text-xs text-gray-400">Fill how many boxes and dimensions</p>
                </div>
                {boxes.length > 1 && (
                  <button
                    onClick={() => removeBoxGroup(box.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <MdDelete size={16} className="text-red-400" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">No. of Boxes (for these dimensions)</p>
                  <input
                    type="number"
                    min="1"
                    value={box.noOfBoxes}
                    onChange={e => handleBoxChange(box.id, 'noOfBoxes', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Box Type</p>
                  <select
                    value={box.boxType}
                    onChange={e => handleBoxChange(box.id, 'boxType', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                    <option value="">Select Box Type</option>
                    {boxTypes.map((t, i) => <option key={i}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['length', 'width', 'height'].map(dim => (
                  <div key={dim}>
                    <p className="text-xs text-gray-400 mb-1 capitalize">
                      {dim} ({form.dimensionUnit})
                    </p>
                    <input
                      type="number"
                      placeholder="0"
                      value={box[dim]}
                      onChange={e => handleBoxChange(box.id, dim, e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={addBoxGroup}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-dashed border-gray-300 hover:border-blue-300 transition-colors text-gray-500 hover:text-blue-500 w-full justify-center mb-5">
            <MdAdd size={16} /> Add Box Group
          </button>

          {/* Auto calculated */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <p className="text-xs text-gray-400 mb-1">Volumetric Weight</p>
              <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5">
                <span className="text-sm text-gray-500">{volumetricWeight}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Scan Weight</p>
              <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5">
                <span className="text-sm text-gray-500">{scanWeight}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Rate Type</p>
              <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5">
                <span className="text-sm text-gray-500">{rateType}</span>
              </div>
            </div>
          </div>

          {/* Insurance + Package */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-700 mb-2">Do you need Insurance?</p>
              <div className="flex gap-4">
                {['yes', 'no'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="insurance"
                      value={opt}
                      checked={form.insurance === opt}
                      onChange={() => handleChange('insurance', opt)}
                      style={{ accentColor: '#068BC9' }} />
                    <span className="text-sm text-gray-700 capitalize">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-700 mb-2">Do you need Package?</p>
              <div className="flex gap-4">
                {['yes', 'no'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="packaging"
                      value={opt}
                      checked={form.packaging === opt}
                      onChange={() => handleChange('packaging', opt)}
                      style={{ accentColor: '#068BC9' }} />
                    <span className="text-sm text-gray-700 capitalize">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pb-6">
          <button
            onClick={() => navigate('/client/logistics')}
            className="px-6 py-2.5 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-2.5 rounded-lg text-sm text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#068BC9' }}>
            {submitting ? 'Booking...' : 'Book Shipment'}
          </button>
        </div>

      </div>
    </ClientLayout>
  );
}