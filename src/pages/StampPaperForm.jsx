import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdArrowBack } from 'react-icons/md';

const stampDutyOptions = ['First Party', 'Second Party', 'Both'];

export default function StampPaperForm() {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    firstPartyName: '',
    firstPartyPan: '',
    secondPartyName: '',
    secondPartyPan: '',
    considerationValue: '',
    denomination: '',
    description: '',
    quantity: '',
    stampDutyPaidBy: '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Pricing logic from spec doc
  const calculateCharges = () => {
    const denom = parseFloat(form.denomination) || 0;
    const qty = parseInt(form.quantity) || 0;

    if (!denom || !qty) return { totalAmount: 0, procurementCharge: 0, gstFee: 0, totalCharges: 0 };

    const totalAmount = denom * qty;

    let procurementCharge = 0;
    if (denom <= 100) {
      procurementCharge = qty * 40;
    } else if (denom <= 900) {
      procurementCharge = qty * 50;
    } else {
      procurementCharge = totalAmount * 0.10;
    }

    const gstFee = procurementCharge * 0.18;
    const totalCharges = totalAmount + procurementCharge + gstFee;

    return {
      totalAmount: totalAmount.toFixed(2),
      procurementCharge: procurementCharge.toFixed(2),
      gstFee: gstFee.toFixed(2),
      totalCharges: totalCharges.toFixed(2),
    };
  };

  const charges = calculateCharges();

  const validate = () => {
    const newErrors = {};
    if (!form.firstPartyName) newErrors.firstPartyName = 'Required';
    if (!form.secondPartyName) newErrors.secondPartyName = 'Required';
    if (!form.denomination) newErrors.denomination = 'Required';
    if (!form.description) newErrors.description = 'Required';
    if (!form.quantity || form.quantity <= 0) newErrors.quantity = 'Required';
    if (!form.stampDutyPaidBy) newErrors.stampDutyPaidBy = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitted(true);
    setTimeout(() => navigate('/stamp-paper'), 2500);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#dcfce7' }}>
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Stamp Paper Booked!</h2>
          <p className="text-sm text-gray-400 mb-1">Your stamp paper request has been submitted.</p>
          <p className="text-sm text-gray-400">ProDiligix team will process it shortly.</p>
          <p className="text-xs text-gray-300 mt-4">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 sticky top-0 z-40">
          <button onClick={() => navigate('/stamp-paper')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <MdArrowBack size={20} className="text-gray-600" />
          </button>
          <div>
            <p className="text-gray-400 text-xs">Stamp Paper Procurement</p>
            <h1 className="text-base font-bold text-gray-800">Book Your Stamp Paper</h1>
          </div>
        </div>

        <div className="p-6 max-w-4xl mx-auto">

          {/* Party Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Party Details</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">First Party Name <span className="text-red-400">*</span></p>
                <input type="text" value={form.firstPartyName}
                  onChange={e => handleChange('firstPartyName', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.firstPartyName && <p className="text-xs text-red-400 mt-1">{errors.firstPartyName}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">First Party PAN Number</p>
                <input type="text" value={form.firstPartyPan}
                  onChange={e => handleChange('firstPartyPan', e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Second Party Name <span className="text-red-400">*</span></p>
                <input type="text" value={form.secondPartyName}
                  onChange={e => handleChange('secondPartyName', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.secondPartyName && <p className="text-xs text-red-400 mt-1">{errors.secondPartyName}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Second Party PAN Number</p>
                <input type="text" value={form.secondPartyPan}
                  onChange={e => handleChange('secondPartyPan', e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
            </div>
          </div>

          {/* Stamp Paper Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Stamp Paper Details</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Consideration Value</p>
                <input type="number" min="0" value={form.considerationValue}
                  onChange={e => handleChange('considerationValue', e.target.value)}
                  placeholder="Enter consideration value"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Denomination of Stamp Paper <span className="text-red-400">*</span></p>
                <input type="number" min="0" value={form.denomination}
                  onChange={e => handleChange('denomination', e.target.value)}
                  placeholder="e.g. 100, 500, 1000"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                {errors.denomination && <p className="text-xs text-red-400 mt-1">{errors.denomination}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Description <span className="text-red-400">*</span></p>
                <textarea rows={3} value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Enter description of stamp paper"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none resize-none" />
                {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Stamp Duty Paid By <span className="text-red-400">*</span></p>
                  <select value={form.stampDutyPaidBy}
                    onChange={e => handleChange('stampDutyPaidBy', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                    <option value="">Select</option>
                    {stampDutyOptions.map((o, i) => <option key={i}>{o}</option>)}
                  </select>
                  {errors.stampDutyPaidBy && <p className="text-xs text-red-400 mt-1">{errors.stampDutyPaidBy}</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Quantity <span className="text-red-400">*</span></p>
                  <input type="number" min="1" value={form.quantity}
                    onChange={e => handleChange('quantity', e.target.value)}
                    placeholder="Enter quantity"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                  {errors.quantity && <p className="text-xs text-red-400 mt-1">{errors.quantity}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Charges Summary */}
          {parseFloat(form.denomination) > 0 && parseInt(form.quantity) > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Charges Summary</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Total Amount</p>
                  <p className="text-sm font-semibold text-gray-700">₹{charges.totalAmount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Procurement Charge</p>
                  <p className="text-sm font-semibold text-gray-700">₹{charges.procurementCharge}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">GST (18%)</p>
                  <p className="text-sm font-semibold text-gray-700">₹{charges.gstFee}</p>
                </div>
                <div className="rounded-lg p-3 text-center"
                  style={{ backgroundColor: '#e0f2fe' }}>
                  <p className="text-xs mb-1" style={{ color: '#068BC9' }}>Total Charges</p>
                  <p className="text-sm font-bold" style={{ color: '#068BC9' }}>₹{charges.totalCharges}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pb-6">
            <button onClick={() => navigate('/stamp-paper')}
              className="px-6 py-2.5 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit}
              className="px-8 py-2.5 rounded-lg text-sm text-white font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#068BC9' }}>
              Book Stamp Paper
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}