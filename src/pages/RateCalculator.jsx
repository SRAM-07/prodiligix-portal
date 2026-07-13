import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { MdCalculate, MdRefresh } from 'react-icons/md';

const companies = ['Rapido Technologies Pvt. Ltd.', 'Coca-Cola India Pvt. Ltd.', 'Infosys Limited', 'Wipro Technologies', 'HCL Technologies'];
const transportModes = ['Air', 'Surface', 'Express'];
const transporters = ['Bluedart', 'DelhiveryOne', 'NimbusPost', 'DTDC'];
const dimensionUnits = ['cm', 'inch'];

export default function RateCalculator() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [form, setForm] = useState({
    company: '',
    pickupPincode: '',
    deliveryPincode: '',
    transportMode: '',
    transporter: '',
    actualWeight: '',
    declaredValue: '',
    noOfBoxes: '',
    dimensionUnit: 'cm',
    length: '',
    width: '',
    height: '',
    insurance: 'yes',
  });

  const [result, setResult] = useState(null);
  const [calculated, setCalculated] = useState(false);

  const volumetricWeight = form.length && form.width && form.height
    ? ((parseFloat(form.length) * parseFloat(form.width) * parseFloat(form.height)) / 5000).toFixed(2)
    : 0;

  const scanWeight = Math.max(parseFloat(form.actualWeight) || 0, parseFloat(volumetricWeight) || 0).toFixed(2);

  const rateType = parseFloat(form.declaredValue) > 10000 ? 'B2B' : 'B2C';

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setCalculated(false);
  };

  const handleCalculate = () => {
    if (!form.pickupPincode || !form.deliveryPincode || !form.actualWeight) {
      alert('Please fill Pickup Pincode, Delivery Pincode and Actual Weight');
      return;
    }

    const baseRate = parseFloat(scanWeight) * 45;
    const fuelSurcharge = baseRate * 0.18;
    const insuranceCharge = form.insurance === 'yes' ? parseFloat(form.declaredValue || 0) * 0.005 : 0;
    const gst = (baseRate + fuelSurcharge) * 0.18;
    const total = baseRate + fuelSurcharge + insuranceCharge + gst;

    setResult({
      baseRate: baseRate.toFixed(2),
      fuelSurcharge: fuelSurcharge.toFixed(2),
      insuranceCharge: insuranceCharge.toFixed(2),
      gst: gst.toFixed(2),
      total: total.toFixed(2),
    });
    setCalculated(true);
  };

  const handleReset = () => {
    setForm({
      company: '',
      pickupPincode: '',
      deliveryPincode: '',
      transportMode: '',
      transporter: '',
      actualWeight: '',
      declaredValue: '',
      noOfBoxes: '',
      dimensionUnit: 'cm',
      length: '',
      width: '',
      height: '',
      insurance: 'yes',
    });
    setResult(null);
    setCalculated(false);
  };

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
                  value={form.company}
                  onChange={e => handleChange('company', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  <option value="">Select Company</option>
                  {companies.map((c, i) => <option key={i} value={c}>{c}</option>)}
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
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                      <option value="">Select Transporter</option>
                      {transporters.map((t, i) => <option key={i} value={t}>{t}</option>)}
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

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">No. of Boxes</p>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.noOfBoxes}
                      onChange={e => handleChange('noOfBoxes', e.target.value)}
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

                {/* Dimensions */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Length ({form.dimensionUnit})</p>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.length}
                      onChange={e => handleChange('length', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-300"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Width ({form.dimensionUnit})</p>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.width}
                      onChange={e => handleChange('width', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-300"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Height ({form.dimensionUnit})</p>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.height}
                      onChange={e => handleChange('height', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-300"
                    />
                  </div>
                </div>

                {/* Auto calculated */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Rate Type</p>
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5">
                      <span className="text-sm text-gray-500">{rateType}</span>
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

                {/* Insurance */}
                <div className="flex items-center gap-6 mb-5">
                  <p className="text-sm text-gray-700">Do you need Insurance?</p>
                  <div className="flex gap-4">
                    {['yes', 'no'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
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

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCalculate}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#068BC9' }}>
                    <MdCalculate size={18}/>
                    Calculate Rates
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

                {/* Total */}
                <div className="text-center mb-5">
                  <p className="text-xs text-gray-400 mb-1">Estimated Rate</p>
                  <p className="text-4xl font-bold text-gray-800">
                    ₹{calculated && result ? parseFloat(result.total).toLocaleString() : '0'}
                  </p>
                </div>

                {/* Price breakdown */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Price Breakdown</p>
                  {calculated && result ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Base Rate</span>
                        <span className="text-sm font-medium text-gray-700">₹{parseFloat(result.baseRate).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Fuel Surcharge (18%)</span>
                        <span className="text-sm font-medium text-gray-700">₹{parseFloat(result.fuelSurcharge).toLocaleString()}</span>
                      </div>
                      {form.insurance === 'yes' && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Insurance (0.5%)</span>
                          <span className="text-sm font-medium text-gray-700">₹{parseFloat(result.insuranceCharge).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">GST (18%)</span>
                        <span className="text-sm font-medium text-gray-700">₹{parseFloat(result.gst).toLocaleString()}</span>
                      </div>
                      <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Total</span>
                        <span className="text-base font-bold" style={{ color: '#068BC9' }}>
                          ₹{parseFloat(result.total).toLocaleString()}
                        </span>
                      </div>

                      {/* Shipment info */}
                      <div className="mt-3 bg-gray-50 rounded-lg p-3 flex flex-col gap-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Scan Weight</span>
                          <span className="text-xs font-medium text-gray-600">{scanWeight} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Rate Type</span>
                          <span className="text-xs font-medium text-gray-600">{rateType}</span>
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