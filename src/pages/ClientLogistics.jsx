import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdFilterList, MdRefresh, MdSearch, MdClose, MdDownload, MdVisibility } from 'react-icons/md';

const ordersData = [
  {
    id: 'LOG-202607041085', company: 'Roppen Transportation Service Pvt. Ltd.',
    pickupFacility: 'Rapido Bangalore', deliveryFacility: 'Divya Rudavath',
    senderPhone: '7406633660', receiverPhone: '8179344152', transportMode: 'Air',
    shipmentDetail: 'Laptops', declaredValue: 32000, challanNo: 'na', noOfBoxes: 1,
    rateType: 'B2C', finalRate: 1494.0, awb: '77056346710', deliveryPartner: 'Bluedart',
    deliveryStatus: 'in transit', createdDate: '2026-07-04', deliveryDate: '',
    expectedDelivery: '2026-07-07',
  },
  {
    id: 'LOG-202607041084', company: 'Roppen Transportation Service Pvt. Ltd.',
    pickupFacility: 'Rapido Bangalore', deliveryFacility: 'Ravi Prakash Gopalan',
    senderPhone: '7406633660', receiverPhone: '9887356675', transportMode: 'Air',
    shipmentDetail: 'Laptops', declaredValue: 32000, challanNo: 'na', noOfBoxes: 1,
    rateType: 'B2C', finalRate: 1593.94, awb: '90574780903', deliveryPartner: 'Bluedart',
    deliveryStatus: 'in transit', createdDate: '2026-07-04', deliveryDate: '',
    expectedDelivery: '2026-07-08',
  },
  {
    id: 'LOG-202607041083', company: 'Roppen Transportation Service Pvt. Ltd.',
    pickupFacility: 'Rapido Bangalore', deliveryFacility: 'Sahil Chhabra',
    senderPhone: '7406633660', receiverPhone: '8053211788', transportMode: 'Air',
    shipmentDetail: 'Laptops', declaredValue: 32000, challanNo: 'na', noOfBoxes: 1,
    rateType: 'B2C', finalRate: 1494.0, awb: '77056308044', deliveryPartner: 'Bluedart',
    deliveryStatus: 'in transit', createdDate: '2026-07-04', deliveryDate: '',
    expectedDelivery: '2026-07-09',
  },
  {
    id: 'LOG-202607041082', company: 'Roppen Transportation Service Pvt. Ltd.',
    pickupFacility: 'Rapido Bangalore', deliveryFacility: 'Ankul Ranjan',
    senderPhone: '8340570245', receiverPhone: '7406633660', transportMode: 'Air',
    shipmentDetail: 'Laptops', declaredValue: 49000, challanNo: 'na', noOfBoxes: 1,
    rateType: 'B2C', finalRate: 0.0, awb: '31791010027624', deliveryPartner: 'Delhivery',
    deliveryStatus: 'cancelled', createdDate: '2026-07-04', deliveryDate: '',
    expectedDelivery: '2026-07-08',
  },
  {
    id: 'LOG-202607041081', company: 'Roppen Transportation Service Pvt. Ltd.',
    pickupFacility: 'Rapido Bangalore', deliveryFacility: 'Priya Sharma',
    senderPhone: '7406633660', receiverPhone: '9876543210', transportMode: 'Ground',
    shipmentDetail: 'Documents', declaredValue: 5000, challanNo: 'na', noOfBoxes: 1,
    rateType: 'B2C', finalRate: 321.9, awb: '77056300011', deliveryPartner: 'Bluedart',
    deliveryStatus: 'delivered', createdDate: '2026-07-03', deliveryDate: '2026-07-06',
    expectedDelivery: '2026-07-06',
  },
];

const statusConfig = {
  'in transit': { color: '#068BC9', bg: '#e0f2fe', label: 'In Transit' },
  'delivered': { color: '#22c55e', bg: '#dcfce7', label: 'Delivered' },
  'cancelled': { color: '#ef4444', bg: '#fee2e2', label: 'Cancelled' },
  'booked': { color: '#8b5cf6', bg: '#ede9fe', label: 'Booked' },
};

const filterOptions = ['Latest', 'Since Date', 'Date Range', 'Status', 'Reset / Show All'];

export default function ClientLogistics() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Latest');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const filtered = ordersData.filter(o =>
    o.id.toLowerCase().includes(searchText.toLowerCase()) ||
    o.awb.includes(searchText) ||
    o.deliveryFacility.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <div>
            <p className="text-gray-400 text-xs">Services</p>
            <h1 className="text-base font-bold text-gray-800">Logistic Management Services</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <MdSearch size={16} className="text-gray-400"/>
              <input
                type="text"
                placeholder="Search by ID, AWB..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="bg-transparent text-sm outline-none w-48 text-gray-600"
              />
              {searchText && (
                <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => setSearchText('')}/>
              )}
            </div>
          </div>
        </div>

        <div className="p-5">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Shipment Booked', value: ordersData.filter(o => o.deliveryStatus === 'booked').length || 1, color: '#068BC9' },
              { label: 'In Transit', value: ordersData.filter(o => o.deliveryStatus === 'in transit').length, color: '#3b82f6' },
              { label: 'Delivered', value: ordersData.filter(o => o.deliveryStatus === 'delivered').length, color: '#22c55e' },
              { label: 'Cancelled', value: ordersData.filter(o => o.deliveryStatus === 'cancelled').length, color: '#ef4444' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: '#068BC9' }}>
                <MdFilterList size={18}/>
                Add Filter
                <span className="ml-1">{showFilter ? '▲' : '▼'}</span>
              </button>
              {showFilter && (
                <div className="absolute top-10 left-0 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-2 w-52">
                  <p className="text-xs text-gray-400 px-4 py-1 font-medium uppercase tracking-wider">Select Filter Type</p>
                  {filterOptions.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => { setActiveFilter(opt); setShowFilter(false); }}
                      className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 text-sm"
                      style={{ color: opt === 'Reset / Show All' ? '#ef4444' : '#374151' }}>
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-xs font-medium" style={{ color: '#068BC9' }}>
                {activeFilter}: {filtered.length}
              </span>
              <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => setActiveFilter('Latest')}/>
            </div>

            <span className="text-sm text-gray-500">({filtered.length})</span>

            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MdRefresh size={18} className="text-gray-400"/>
            </button>

            {/* Book a Shipment button */}
            <button
              onClick={() => navigate('/client/logistics/book')}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-semibold ml-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#22c55e' }}>
              + Book a Shipment
            </button>

            <div className="ml-auto">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <MdSearch size={14} className="text-gray-400"/>
                <input
                  type="text"
                  placeholder="Service Request ID or AWB Number"
                  className="bg-transparent text-xs outline-none w-52 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Service Request ID', 'Company Name', 'Pickup Facility', 'Delivery Facility',
                    'Sender Phone', 'Receiver Phone', 'Transport Mode', 'Shipment Detail',
                    'Declared Value', 'Challan No', 'No. of Boxes', 'Rate Type', 'Final Rate',
                    'AWB Number', 'Delivery Partner', 'Delivery Status', 'Created Date',
                    'Delivery Date', 'Expected Delivery', 'Actions'].map((h, i) => (
                    <th key={i} className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const s = statusConfig[order.deliveryStatus] || statusConfig['booked'];
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium whitespace-nowrap cursor-pointer hover:underline"
                        style={{ color: '#068BC9' }}
                        onClick={() => navigate('/logistics/detail')}>
                        {order.id}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.company}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#068BC9' }}>{order.pickupFacility}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#068BC9' }}>{order.deliveryFacility}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.senderPhone}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.receiverPhone}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.transportMode}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.shipmentDetail}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">₹{order.declaredValue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.challanNo}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.noOfBoxes}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.rateType}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">₹{order.finalRate}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.awb}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.deliveryPartner}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ color: s.color, backgroundColor: s.bg }}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.createdDate}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.deliveryDate || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.expectedDelivery}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Download Label">
                            <MdDownload size={16} style={{ color: '#068BC9' }}/>
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="View">
                            <MdVisibility size={16} style={{ color: '#068BC9' }}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}