import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';
import { MdArrowBack, MdAttachFile, MdAdd, MdDelete } from 'react-icons/md';
import AddressTypeahead from '../components/AddressTypeahead';
import AddAddressDialog from '../components/AddAddressDialog';
import { getCurrentUser } from '../services/authService';
import api from '../services/api';

const transportModes = ['Air', 'Air Urgent', 'Surface', 'Surface Urgent', 'PTL (Part Truck Load)', 'FTL (FullTruckLoad)'];
const transporters = ['Bluedart', 'DelhiveryOne', 'NimbusPost'];
const modeTypes = ['Forward', 'Reverse', 'Point to Point'];
const shipmentDetails = ['Laptops', 'Documents', 'Electronics', 'Mobile Phones', 'Other'];
const boxTypes = ['Corrugated Box', 'Wooden Box', 'Plastic Box', 'Envelope'];
const dimensionUnits = ['cms', 'inch', 'feet'];
const URGENT_OR_MANUAL_MODES = ['Air Urgent', 'Surface Urgent', 'PTL (Part Truck Load)', 'FTL (FullTruckLoad)'];

export default function BookShipment() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const companyId = user?.companyId || 1;

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [ewayFile, setEwayFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [showAddAddress, setShowAddAddress] = useState(null); // 'pickup' | 'delivery' | null
  const [addressRefreshKey, setAddressRefreshKey] = useState(0);

  const [form, setForm] = useState({
    pickupAddressId: null,
    pickupAddressText: '',
    pickupPincode: '',
    deliveryAddressId: null,
    deliveryAddressText: '',
    deliveryPincode: '',
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
    manualRate: '',
  });

  const [boxes, setBoxes] = useState([
    { id: 1, noOfBoxes: 1, boxType: '', length: '', width: '', height: '' }
  ]);

  const [calculatedRate, setCalculatedRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState('');

  const isUrgentMode = URGENT_OR_MANUAL_MODES.includes(form.transportMode);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const formatFullAddress = (addr) => {
    return [addr.facilityName, addr.address, addr.city, addr.state, addr.zipcode].filter(Boolean).join(', ');
  };

  const handlePickupSelect = (addr) => {
    setForm(prev => ({
      ...prev,
      pickupAddressId: addr ? addr.id : null,
      pickupAddressText: addr ? formatFullAddress(addr) : prev.pickupAddressText,
      pickupPincode: addr ? addr.zipcode : prev.pickupPincode,
    }));
    setErrors(prev => ({ ...prev, pickupAddressId: '' }));
  };

  const handleDeliverySelect = (addr) => {
    setForm(prev => ({
      ...prev,
      deliveryAddressId: addr ? addr.id : null,
      deliveryAddressText: addr ? formatFullAddress(addr) : prev.deliveryAddressText,
      deliveryPincode: addr ? addr.zipcode : prev.deliveryPincode,
    }));
    setErrors(prev => ({ ...prev, deliveryAddressId: '' }));
  };

  const handleBoxChange = (id, field, value) => {
    setBoxes(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
    setErrors(prev => ({ ...prev, boxes: '' }));
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
    const divisor = form.transportMode === 'Air' || form.transportMode === 'Air Urgent' ? 5000 : 4000;
    const v = (parseFloat(box.length) || 0) *
      (parseFloat(box.width) || 0) *
      (parseFloat(box.height) || 0) * (parseFloat(box.noOfBoxes) || 1) / divisor;
    return total + v;
  }, 0).toFixed(2);

  const scanWeight = Math.max(
    parseFloat(form.actualWeight) || 0,
    parseFloat(volumetricWeight) || 0
  ).toFixed(2);

  const rateType = parseFloat(scanWeight) > 10 ? 'B2B' : 'B2C';

  const totalBoxQuantity = boxes.reduce((sum, b) => sum + (parseInt(b.noOfBoxes) || 0), 0);

  useEffect(() => {
    const canCalculate =
      !isUrgentMode &&
      form.pickupPincode && form.pickupPincode.length === 6 &&
      form.deliveryPincode && form.deliveryPincode.length === 6 &&
      form.transportMode && form.transporter &&
      parseFloat(scanWeight) > 0;

    if (!canCalculate) {
      setCalculatedRate(null);
      setRateError('');
      return;
    }

    const timeout = setTimeout(async () => {
      setRateLoading(true);
      setRateError('');
      try {
        const params = new URLSearchParams({
          fromPincode: form.pickupPincode,
          toPincode: form.deliveryPincode,
          weight: scanWeight,
          mode: form.transportMode.toLowerCase(),
          declaredValue: form.declaredValue || 0,
          insurance: form.insurance === 'yes',
          packageRequired: form.packaging === 'yes',
          provider: form.transporter,
          companyId: companyId,
        });
        const res = await api.get(`/api/shipments/calculate-rate?${params.toString()}`);
        setCalculatedRate(res.data.charges?.total || null);
      } catch (err) {
        setRateError('Unable to calculate rate automatically — will be set manually after booking.');
        setCalculatedRate(null);
      } finally {
        setRateLoading(false);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [isUrgentMode, form.pickupPincode, form.deliveryPincode, form.transportMode, form.transporter,
      form.declaredValue, form.insurance, form.packaging, scanWeight, companyId]);

  const validate = () => {
    const newErrors = {};

    if (!form.pickupAddressId) newErrors.pickupAddressId = 'Pickup address is required';
    if (!form.deliveryAddressId) newErrors.deliveryAddressId = 'Delivery address is required';
    if (!form.transportMode) newErrors.transportMode = 'Transport mode is required';
    if (!form.transporter) newErrors.transporter = 'Transporter is required';
    if (!form.declaredValue || parseFloat(form.declaredValue) <= 0) newErrors.declaredValue = 'Declared value is required';
    if (!form.shipmentDetail) newErrors.shipmentDetail = 'Shipment detail type is required';
    if (!form.shipmentDescription.trim()) newErrors.shipmentDescription = 'Description is required';
    if (!form.actualWeight || parseFloat(form.actualWeight) <= 0) newErrors.actualWeight = 'Actual weight is required';
    if (!form.noOfBoxes || parseInt(form.noOfBoxes) < 1) newErrors.noOfBoxes = 'Number of boxes is required';

    const incompleteBox = boxes.some(b =>
      !b.boxType || !b.length || !b.width || !b.height || !b.noOfBoxes || parseInt(b.noOfBoxes) < 1
    );
    if (incompleteBox) newErrors.boxes = 'Please fill box type and all dimensions for every box group';

    if (isUrgentMode && (!form.manualRate || parseFloat(form.manualRate) <= 0)) {
      newErrors.manualRate = 'Please enter the final rate for this shipment';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

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
        modes: form.modeType.toLowerCase().replace(/\s+/g, ''),
        transporter: form.transporter,
        sourceType: 'wallet',
      };

      if (isUrgentMode) {
        payload.shipmentRate = parseFloat(form.manualRate);
      }

      const response = await api.post('/api/shipments', payload);
      const newShipmentId = response.data.id;

      if (newShipmentId && (invoiceFile || ewayFile)) {
        try {
          if (invoiceFile) {
            const invoiceForm = new FormData();
            invoiceForm.append('file', invoiceFile);
            await api.post(`/api/shipments/${newShipmentId}/upload-invoice`, invoiceForm, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          }
          if (ewayFile) {
            const ewayForm = new FormData();
            ewayForm.append('file', ewayFile);
            await api.post(`/api/shipments/${newShipmentId}/upload-eway-bill`, ewayForm, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          }
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        if (newShipmentId) {
          navigate(`/client/logistics/${newShipmentId}`);
        } else {
          navigate('/client/logistics');
        }
      }, 2000);
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
          <p className="text-sm text-gray-400">Taking you to the shipment details...</p>
          <p className="text-xs text-gray-300 mt-4">Redirecting...</p>
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

      <div
        className="relative min-h-screen overflow-hidden"
        style={{ backgroundColor: '#F7FBFF' }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/shipment-bg.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left bottom',
            backgroundSize: 'contain',
            opacity: 0.22,
            pointerEvents: 'none'
          }}
        />
        <div className="relative z-10 p-6 max-w-4xl mx-auto">

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
                    value={form.pickupAddressText}
                    onSelect={handlePickupSelect}
                    placeholder="Type to search pickup address..."
                    refreshTrigger={addressRefreshKey}
                  />
                </div>
                <button
                  onClick={() => setShowAddAddress('pickup')}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs text-gray-500 transition-colors">
                  <MdAdd size={16} /> Add
                </button>
              </div>
              {errors.pickupAddressId && <p className="text-xs text-red-400 mt-1">{errors.pickupAddressId}</p>}
              {form.pickupPincode && (
                <p className="text-xs text-gray-400 mt-1">Pincode: {form.pickupPincode}</p>
              )}
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
                    value={form.deliveryAddressText}
                    onSelect={handleDeliverySelect}
                    placeholder="Type to search delivery address..."
                    refreshTrigger={addressRefreshKey}
                  />
                </div>
                <button
                  onClick={() => setShowAddAddress('delivery')}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs text-gray-500 transition-colors">
                  <MdAdd size={16} /> Add
                </button>
              </div>
              {errors.deliveryAddressId && <p className="text-xs text-red-400 mt-1">{errors.deliveryAddressId}</p>}
              {form.deliveryPincode && (
                <p className="text-xs text-gray-400 mt-1">Pincode: {form.deliveryPincode}</p>
              )}
            </div>
          </div>

          {/* Transport details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Transport Mode <span className="text-red-400">*</span></p>
                <select
                  value={form.transportMode}
                  onChange={e => handleChange('transportMode', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  <option value="">Select Mode</option>
                  {transportModes.map((m, i) => <option key={i}>{m}</option>)}
                </select>
                {errors.transportMode && <p className="text-xs text-red-400 mt-1">{errors.transportMode}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Transporter <span className="text-red-400">*</span></p>
                <select
                  value={form.transporter}
                  onChange={e => handleChange('transporter', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  <option value="">Select Transporter</option>
                  {transporters.map((t, i) => <option key={i}>{t}</option>)}
                </select>
                {errors.transporter && <p className="text-xs text-red-400 mt-1">{errors.transporter}</p>}
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
                <p className="text-xs text-gray-400 mb-1">Shipment Declared Value <span className="text-red-400">*</span></p>
                <input
                  type="number"
                  placeholder="Enter declared value"
                  value={form.declaredValue}
                  onChange={e => handleChange('declaredValue', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.declaredValue && <p className="text-xs text-red-400 mt-1">{errors.declaredValue}</p>}
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
                <p className="text-xs text-gray-400 mb-1">Shipment Details <span className="text-red-400">*</span></p>
                <select
                  value={form.shipmentDetail}
                  onChange={e => handleChange('shipmentDetail', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  <option value="">Select Type</option>
                  {shipmentDetails.map((s, i) => <option key={i}>{s}</option>)}
                </select>
                {errors.shipmentDetail && <p className="text-xs text-red-400 mt-1">{errors.shipmentDetail}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Shipment Details Description <span className="text-red-400">*</span></p>
                <input
                  type="text"
                  placeholder="Enter description"
                  value={form.shipmentDescription}
                  onChange={e => handleChange('shipmentDescription', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.shipmentDescription && <p className="text-xs text-red-400 mt-1">{errors.shipmentDescription}</p>}
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
                {errors.actualWeight && <p className="text-xs text-red-400 mt-1">{errors.actualWeight}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">No. of Boxes <span className="text-red-400">*</span></p>
                <input
                  type="number"
                  min="1"
                  value={form.noOfBoxes}
                  onChange={e => handleChange('noOfBoxes', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.noOfBoxes && <p className="text-xs text-red-400 mt-1">{errors.noOfBoxes}</p>}
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
              {isUrgentMode ? (
                <div className="w-64">
                  <p className="text-xs text-gray-400 mb-1">
                    Final Rate (Manual Entry) <span className="text-red-400">*</span>
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    No automatic pricing available for this mode — enter the agreed rate.
                  </p>
                  <input
                    type="number"
                    placeholder="Enter final rate"
                    value={form.manualRate}
                    onChange={e => handleChange('manualRate', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                  {errors.manualRate && <p className="text-xs text-red-400 mt-1">{errors.manualRate}</p>}
                </div>
              ) : (
                <div
                  className="rounded-xl px-8 py-3 text-center text-white min-w-[160px]"
                  style={{ backgroundColor: rateLoading ? '#9ca3af' : calculatedRate ? '#22c55e' : '#ef4444' }}>
                  <p className="text-xs opacity-80">Final Rate</p>
                  <p className="text-2xl font-bold">
                    {rateLoading ? '...' : calculatedRate ? `₹${parseFloat(calculatedRate).toFixed(2)}` : '—'}
                  </p>
                  {rateError && (
                    <p className="text-xs opacity-90 mt-1">{rateError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Box groups */}
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Shipment Dimensions (grouped) <span className="text-red-400">*</span>
            </p>
            {errors.boxes && <p className="text-xs text-red-400 mb-2">{errors.boxes}</p>}

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
      </div>

      {showAddAddress && (
        <AddAddressDialog
          type={showAddAddress}
          onClose={() => setShowAddAddress(null)}
          onSuccess={(newAddress) => {
            if (showAddAddress === 'pickup') {
              handlePickupSelect(newAddress);
            } else {
              handleDeliverySelect(newAddress);
            }
            setAddressRefreshKey(prev => prev + 1);
          }}
        />
      )}
    </ClientLayout>
  );
}