import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { MdCalculate, MdRefresh, MdAdd, MdDelete } from 'react-icons/md';
import api from '../services/api';

const transportModes = ['Air', 'Surface'];
const transporterOptions = {
  Surface: ['Delhivery', 'Bluedart'],
  Air: ['Delhivery', 'Bluedart', 'Indigo', 'Air India', 'Akasa Air', 'Royal King Courier Services'],
};
const boxTypeOptions = ['Flyer', 'Envelope Cover', 'Corrugated Box', 'Wooden Box', 'Other'];
const dimensionUnits = ['cm', 'inch', 'feet'];

function newCard() {
  return {
    _uid: Date.now() + Math.random(),
    count: '',
    boxType: '',
    length: '',
    width: '',
    height: '',
  };
}

export default function RateCalculator() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    companyId: '',
    pickupPincode: '',
    deliveryPincode: '',
    transportMode: '',
    transporter: '',
    actualWeight: '',
    declaredValue: '',
    boxQuantity: '',
    dimensionUnit: 'cm',
    insurance: 'yes',
    packaging: 'no',
  });

  const [boxGroups, setBoxGroups] = useState([]);
  const [currentCards, setCurrentCards] = useState([newCard()]);
  const [result, setResult] = useState(null);
  const [calculated, setCalculated] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/api/companies');
        setCompanies(res.data);
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  const boxesUsed = boxGroups.reduce((sum, g) => sum + Number(g.count || 0), 0);
  const remainingBoxes = (parseInt(form.boxQuantity) || 0) - boxesUsed;

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setCalculated(false);
    if (field === 'transportMode') {
      setForm(prev => ({ ...prev, transporter: '' }));
    }
  };

  const handleBoxQuantityChange = (value) => {
    const qty = parseInt(value) || 0;
    setForm(prev => ({ ...prev, boxQuantity: value }));
    setBoxGroups([]);
    setCurrentCards(qty > 0 ? [newCard()] : []);
    setCalculated(false);
  };

  const handleCardChange = (i, field, value) => {
  setCurrentCards(prev => prev.map((c, idx) => {
    if (idx !== i) return c;
    let updated = { ...c, [field]: value };
    if (field === 'count') {
      const remaining = remainingBoxes + (parseInt(c.count) || 0);
      const num = parseInt(value);
      // allow empty/typing freely — only cap the upper bound, no forced minimum while typing
      if (!isNaN(num) && num > remaining) {
        updated.count = remaining;
      } else {
        updated.count = value;
      }
    }
    return updated;
  }));
};

  const canAddFromCard = (card) => (
    parseInt(card.count) > 0 && parseInt(card.count) <= remainingBoxes &&
    parseFloat(card.length) > 0 && parseFloat(card.width) > 0 && parseFloat(card.height) > 0 &&
    card.boxType
  );

  const addFromCard = (i) => {
    const card = currentCards[i];
    setBoxGroups(prev => [...prev, { ...card }]);
    setCurrentCards(prev => {
      const rest = prev.filter((_, idx) => idx !== i);
      const newRemaining = remainingBoxes - card.count;
      return newRemaining > 0 ? [...rest, newCard()] : rest;
    });
    setCalculated(false);
  };

  const removeGroup = (i) => {
    setBoxGroups(prev => prev.filter((_, idx) => idx !== i));
    setCalculated(false);
  };

  // Divisor matches legacy: 5000 for Air modes, 4000 for Surface/other modes
  const divisor = ['Air', 'Air Urgent', 'Urgent'].includes(form.transportMode) ? 5000 : 4000;

  const volumetricWeight = boxGroups.reduce((total, g) => {
    const l = parseFloat(g.length) || 0;
    const w = parseFloat(g.width) || 0;
    const h = parseFloat(g.height) || 0;
    const c = parseFloat(g.count) || 0;
    return total + (l * w * h * c) / divisor;
  }, 0).toFixed(2);

  const scanWeight = Math.max(parseFloat(form.actualWeight) || 0, parseFloat(volumetricWeight) || 0).toFixed(2);
  const rateType = parseFloat(scanWeight) > 20 ? 'B2B Surface' : 'B2C';

  const handleCalculate = async () => {
    if (!form.companyId) {
      setError('Please select a company first');
      return;
    }
    if (parseFloat(scanWeight) <= 0) {
      setError('Invalid weight');
      return;
    }
    if (!form.pickupPincode || !form.deliveryPincode || !form.transportMode || !form.transporter) {
      setError('Please fill Pickup/Delivery Pincode, Transport Mode and Transporter');
      return;
    }
    setError('');
    setCalculating(true);
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
        companyId: form.companyId,
      });
      const res = await api.get(`/api/shipments/calculate-rate?${params.toString()}`);
      setResult(res.data.charges);
      setCalculated(true);
    } catch (err) {
      console.error('Failed to calculate rate:', err);
      setError(err.response?.data?.error || 'Failed to calculate rate. Please check the pincodes and try again.');
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setForm({
      companyId: form.companyId, // keep selected company, matches legacy resetForm behavior
      pickupPincode: '',
      deliveryPincode: '',
      transportMode: '',
      transporter: '',
      actualWeight: '',
      declaredValue: '',
      boxQuantity: '',
      dimensionUnit: 'cm',
      insurance: 'yes',
      packaging: 'no',
    });
    setBoxGroups([]);
    setCurrentCards([newCard()]);
    setResult(null);
    setCalculated(false);
    setError('');
  };

  const totalValue = result ? parseFloat(result.total) : 0;
  const availableTransporters = transporterOptions[form.transportMode] || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div
          className="flex items-center gap-4 px-6 py-4 sticky top-0 z-40"
          style={{ backgroundColor: '#068BC9' }}>
          <MdCalculate size={22} className="text-white"/>
          <h1 className="text-white font-bold text-base">Serviceability & Rate Calculator</h1>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">

            {/* Left form */}
            <div className="col-span-2 flex flex-col gap-4">

              {/* Company */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-700 mb-3">Select Company</p>
                <select
                  value={form.companyId}
                  onChange={e => handleChange('companyId', e.target.value)}
                  disabled={loadingCompanies}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  <option value="">{loadingCompanies ? 'Loading companies...' : 'Select Company'}</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.businessName}</option>
                  ))}
                </select>
              </div>

              {/* Main form */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Pickup Pincode</p>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter pickup pincode"
                      value={form.pickupPincode}
                      onChange={e => handleChange('pickupPincode', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-300"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Delivery Pincode</p>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter delivery pincode"
                      value={form.deliveryPincode}
                      onChange={e => handleChange('deliveryPincode', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Transport Mode</p>
                    <select
                      value={form.transportMode}
                      onChange={e => handleChange('transportMode', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                      <option value="">Select Mode</option>
                      {transportModes.map((m, i) => <option key={i} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Transporter</p>
                    <select
                      value={form.transporter}
                      onChange={e => handleChange('transporter', e.target.value)}
                      disabled={!form.transportMode}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                      <option value="">Select Transporter</option>
                      {availableTransporters.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Actual Weight of Shipment (Kg)</p>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.actualWeight}
                      onChange={e => handleChange('actualWeight', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-300"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Shipment Declared Value (₹)</p>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.declaredValue}
                      onChange={e => handleChange('declaredValue', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">No. of Boxes</p>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.boxQuantity}
                      onChange={e => handleBoxQuantityChange(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-300"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Dimension Unit</p>
                    <select
                      value={form.dimensionUnit}
                      onChange={e => handleChange('dimensionUnit', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                      {dimensionUnits.map((d, i) => <option key={i} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                {/* Box group cards — pending entry */}
                {remainingBoxes > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Shipment Dimensions (grouped)</p>
                    {currentCards.map((card, i) => (
                      <div key={card._uid} className="border border-gray-200 rounded-xl p-4 mb-3 bg-gray-50">
                        <p className="text-sm font-medium text-gray-700 mb-3">Box group {boxGroups.length + i + 1}</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">No. of Boxes</p>
                            <input
                              type="number"
                              value={card.count}
                              onChange={e => handleCardChange(i, 'count', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Box Type</p>
                            <select
                              value={card.boxType}
                              onChange={e => handleCardChange(i, 'boxType', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                              <option value="">Select Box Type</option>
                              {boxTypeOptions.map((t, ti) => <option key={ti} value={t}>{t}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          {['length', 'width', 'height'].map(dim => (
                            <div key={dim}>
                              <p className="text-xs text-gray-400 mb-1 capitalize">{dim} ({form.dimensionUnit})</p>
                              <input
                                type="number"
                                placeholder="0"
                                value={card[dim]}
                                onChange={e => handleCardChange(i, dim, e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-400">Boxes remaining: {remainingBoxes}</p>
                          <button
                            onClick={() => addFromCard(i)}
                            disabled={!canAddFromCard(card)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-medium disabled:opacity-40 transition-opacity"
                            style={{ backgroundColor: '#068BC9' }}>
                            <MdAdd size={14} /> Add Boxes
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Added box groups */}
                {boxGroups.length > 0 && (
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Added Box Groups</p>
                    {boxGroups.map((g, i) => (
                      <div key={i} className="flex justify-between items-center border border-gray-200 rounded-lg p-3 mb-2">
                        <div>
                          <p className="text-sm text-gray-700"><span className="font-semibold">Boxes:</span> {g.count}</p>
                          <p className="text-xs text-gray-500">Type: {g.boxType}</p>
                          <p className="text-xs text-gray-500">{g.length} × {g.width} × {g.height} {form.dimensionUnit}</p>
                        </div>
                        <button
                          onClick={() => removeGroup(i)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          <MdDelete size={16} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Auto calculated */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Rate Type</p>
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5">
                      <span className="text-sm text-gray-500">{calculated ? rateType : '—'}</span>
                    </div>
                  </div>
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
                </div>

                {/* Insurance + Package */}
                <div className="flex items-center gap-10 mb-4">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-700">Insurance?</p>
                    <div className="flex gap-3">
                      {['yes', 'no'].map(opt => (
                        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="insurance"
                            value={opt}
                            checked={form.insurance === opt}
                            onChange={() => handleChange('insurance', opt)}
                            style={{ accentColor: '#068BC9' }}
                          />
                          <span className="text-sm text-gray-700 capitalize">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-700">Package?</p>
                    <div className="flex gap-3">
                      {['yes', 'no'].map(opt => (
                        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="packaging"
                            value={opt}
                            checked={form.packaging === opt}
                            onChange={() => handleChange('packaging', opt)}
                            style={{ accentColor: '#068BC9' }}
                          />
                          <span className="text-sm text-gray-700 capitalize">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-xs text-red-500">{error}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCalculate}
                    disabled={calculating}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#068BC9' }}>
                    <MdCalculate size={18}/>
                    {calculating ? 'Calculating...' : 'Calculate Rates'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    <MdRefresh size={18}/>
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Right panel - Price breakdown */}
            <div className="col-span-1">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-24">

                <div className="text-center mb-5">
                  <p className="text-xs text-gray-400 mb-1">{form.transportMode || 'Estimated Rate'}</p>
                  <p className="text-4xl font-bold text-gray-800">
                    ₹{calculated && result ? totalValue.toLocaleString() : '0'}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Price Breakdown</p>
                  {calculated && result ? (
                    <div className="flex flex-col gap-3">
                      {Object.entries(result)
                        .filter(([key]) => !['total', 'weight_category', 'region_type'].includes(key))
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="text-sm font-medium text-gray-700">₹{parseFloat(value).toLocaleString()}</span>
                          </div>
                        ))}
                      <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Total</span>
                        <span className="text-base font-bold" style={{ color: '#068BC9' }}>
                          ₹{totalValue.toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-3 bg-gray-50 rounded-lg p-3 flex flex-col gap-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Scan Weight</span>
                          <span className="text-xs font-medium text-gray-600">{scanWeight} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Region Type</span>
                          <span className="text-xs font-medium text-gray-600">{result.region_type || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Transporter</span>
                          <span className="text-xs font-medium text-gray-600">{form.transporter || '—'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MdCalculate size={36} className="text-gray-200 mx-auto mb-2"/>
                      <p className="text-xs text-gray-400">Fill in the details and click Calculate Rates to see the breakdown</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}