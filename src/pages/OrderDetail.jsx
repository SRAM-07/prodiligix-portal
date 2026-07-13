import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  MdArrowBack, MdDownload, MdAttachFile, 
  MdLocalShipping, MdLocationOn, MdInventory,
  MdCheckCircle, MdUpload
} from 'react-icons/md';

export default function OrderDetail() {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [insurance, setInsurance] = useState('yes');
  const [packaging, setPackaging] = useState('no');
  const [activeTab, setActiveTab] = useState('details');

  const tabs = ['details', 'documents', 'tracking'];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 sticky top-0 z-40">
          <button
            onClick={() => navigate('/logistics')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <MdArrowBack size={20} className="text-gray-600"/>
          </button>
          <div className="flex-1">
            <p className="text-gray-400 text-xs">Logistics Management</p>
            <h1 className="text-base font-bold text-gray-800">LOG-202607041085</h1>
          </div>
          <span className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ color: '#068BC9', backgroundColor: '#e0f2fe' }}>
            In Transit
          </span>
        </div>

        <div className="p-6 max-w-5xl mx-auto">

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">AWB Number</p>
              <p className="text-sm font-bold text-gray-800">77056346710</p>
              <p className="text-xs text-gray-400 mt-0.5">Bluedart</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Declared Value</p>
              <p className="text-sm font-bold text-gray-800">₹32,000</p>
              <p className="text-xs text-gray-400 mt-0.5">Laptops</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Final Rate</p>
              <p className="text-sm font-bold" style={{ color: '#22c55e' }}>₹1,494.00</p>
              <p className="text-xs text-gray-400 mt-0.5">B2C · Approved</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Expected Delivery</p>
              <p className="text-sm font-bold text-gray-800">2026-07-07</p>
              <p className="text-xs text-gray-400 mt-0.5">Air · Forward</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-white rounded-xl border border-gray-100 shadow-sm p-1 w-fit">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                style={{
                  backgroundColor: activeTab === tab ? '#068BC9' : 'transparent',
                  color: activeTab === tab ? '#fff' : '#6b7280'
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'details' && (
            <div className="flex flex-col gap-4">

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MdLocationOn size={18} style={{ color: '#068BC9' }}/>
                    <p className="text-sm font-semibold text-gray-700">Pickup Address</p>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">Rapido Bangalore</p>
                  <p className="text-xs text-gray-500 mt-1">Roppen Transportation Service Pvt. Ltd.</p>
                  <p className="text-xs text-gray-400 mt-1">Phone: 7406633660</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MdLocationOn size={18} style={{ color: '#22c55e' }}/>
                    <p className="text-sm font-semibold text-gray-700">Delivery Address</p>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">Divya Rudavath</p>
                  <p className="text-xs text-gray-500 mt-1">C9RV C3V Kavuri Hills Phase 1, Sri Ramana Nagar</p>
                  <p className="text-xs text-gray-400 mt-1">Phone: 8179344152</p>
                </div>
              </div>

              {/* Shipment info */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MdLocalShipping size={18} style={{ color: '#068BC9' }}/>
                  <p className="text-sm font-semibold text-gray-700">Shipment Information</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Transport Mode', value: 'Air' },
                    { label: 'Transporter', value: 'Bluedart' },
                    { label: 'Mode Type', value: 'Forward' },
                    { label: 'Declared Value', value: '₹32,000' },
                    { label: 'Challan No.', value: 'N/A' },
                    { label: 'Shipment Detail', value: 'Laptops' },
                    { label: 'Description', value: 'Elitebook 840 G8 5CG5009804' },
                    { label: 'Actual Weight', value: '3.5 kg' },
                    { label: 'Volumetric Weight', value: '3.45 kg' },
                    { label: 'Scan Weight', value: '3.5 kg' },
                    { label: 'No. of Boxes', value: '1' },
                    { label: 'Rate Type', value: 'B2C' },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg px-3 py-2.5">
                      <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                      <p className="text-sm text-gray-700 font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box group */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MdInventory size={18} style={{ color: '#068BC9' }}/>
                  <p className="text-sm font-semibold text-gray-700">Box Groups</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex justify-between items-start">
                  <div className="grid grid-cols-3 gap-4 flex-1">
                    <div><p className="text-xs text-gray-400">Boxes</p><p className="text-sm font-medium text-gray-700">1</p></div>
                    <div><p className="text-xs text-gray-400">Box Type</p><p className="text-sm font-medium text-gray-700">Corrugated Box</p></div>
                    <div><p className="text-xs text-gray-400">Dimensions (L×W×H)</p><p className="text-sm font-medium text-gray-700">49 × 32 × 11 cm</p></div>
                  </div>
                </div>
              </div>

              {/* Insurance + Packaging */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Additional Options</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Do you need Insurance?</p>
                    <div className="flex gap-4">
                      {['yes', 'no'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="insurance" value={opt}
                            checked={insurance === opt}
                            onChange={() => setInsurance(opt)}
                            style={{ accentColor: '#068BC9' }}/>
                          <span className="text-sm text-gray-700 capitalize">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Do you need Package?</p>
                    <div className="flex gap-4">
                      {['yes', 'no'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="packaging" value={opt}
                            checked={packaging === opt}
                            onChange={() => setPackaging(opt)}
                            style={{ accentColor: '#068BC9' }}/>
                          <span className="text-sm text-gray-700 capitalize">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval banner */}
              <div className="rounded-xl p-4 border flex items-start gap-3"
                style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                <MdCheckCircle size={20} style={{ color: '#22c55e' }} className="flex-shrink-0 mt-0.5"/>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#16a34a' }}>
                    Shipment amount approved and processed successfully
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#4ade80' }}>
                    Approved at: 2026-07-04T08:13:26.049Z · Deducted: ₹1,494.00
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pb-4">
                <button
                  onClick={() => navigate('/logistics')}
                  className="px-6 py-2.5 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  className="px-6 py-2.5 rounded-lg text-sm text-white font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#068BC9' }}>
                  Update
                </button>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Documents</p>
                <div className="grid grid-cols-2 gap-4">

                  {/* Upload Invoice */}
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-300 transition-colors">
                    <MdUpload size={28} className="text-gray-300"/>
                    <p className="text-sm text-gray-500 font-medium">Upload Invoice / DC Copy</p>
                    <p className="text-xs text-gray-400">Click to upload</p>
                  </div>

                  {/* Shipment label */}
                  <div className="border border-gray-200 rounded-xl p-5 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: '#e0f2fe' }}>
                        <MdAttachFile size={20} style={{ color: '#068BC9' }}/>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">shipment_with_label.pdf</p>
                        <p className="text-xs text-gray-400">0.0B</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <MdDownload size={20} style={{ color: '#068BC9' }}/>
                    </button>
                  </div>

                  {/* Manifest */}
                  <div className="border border-gray-200 rounded-xl p-5 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: '#e0f2fe' }}>
                        <MdAttachFile size={20} style={{ color: '#068BC9' }}/>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">manifest.pdf</p>
                        <p className="text-xs text-gray-400">0.0B</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <MdDownload size={20} style={{ color: '#068BC9' }}/>
                    </button>
                  </div>

                  {/* Upload POD */}
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-300 transition-colors">
                    <MdUpload size={28} className="text-gray-300"/>
                    <p className="text-sm text-gray-500 font-medium">Upload POD</p>
                    <p className="text-xs text-gray-400">Click to upload</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-5">Tracking Timeline</p>
              <div className="flex flex-col gap-0">
                {[
                  { status: 'Order Booked', time: '2026-07-04 08:13', done: true },
                  { status: 'Picked Up', time: '2026-07-04 14:30', done: true },
                  { status: 'In Transit', time: '2026-07-05 09:00', done: true },
                  { status: 'Out for Delivery', time: 'Pending', done: false },
                  { status: 'Delivered', time: 'Expected 2026-07-07', done: false },
                ].map((step, i, arr) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: step.done ? '#068BC9' : '#f3f4f6',
                          border: step.done ? 'none' : '2px solid #e5e7eb'
                        }}>
                        {step.done
                          ? <MdCheckCircle size={18} className="text-white"/>
                          : <div className="w-2 h-2 rounded-full bg-gray-300"/>
                        }
                      </div>
                      {i < arr.length - 1 && (
                        <div className="w-0.5 h-10 mt-1"
                          style={{ backgroundColor: step.done ? '#068BC9' : '#e5e7eb' }}/>
                      )}
                    </div>
                    <div className="pb-8">
                      <p className="text-sm font-medium text-gray-700">{step.status}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}