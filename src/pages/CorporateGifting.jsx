import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdFilterList, MdRefresh, MdSearch, MdClose, MdVisibility, MdDownload, MdAdd } from 'react-icons/md';

const giftingData = [
  {
    id: 'GIFT-20260701001',
    company: 'Rapido Technologies Pvt. Ltd.',
    contactPerson: 'Ankit Sharma',
    purpose: 'Employee Appreciation',
    quantity: 150,
    deliveryType: 'Bulk',
    preferredItems: 'Premium Gift Hampers',
    brandingReq: 'Company Logo on packaging',
    additionalServices: 'Gift Wrapping',
    createdDate: '2026-07-01',
    expectedDelivery: '2026-07-15',
    actualDelivery: '',
    quotationStatus: 'Accepted',
  },
  {
    id: 'GIFT-20260701002',
    company: 'Coca-Cola India Pvt. Ltd.',
    contactPerson: 'Priya Menon',
    purpose: 'Diwali Gifting',
    quantity: 500,
    deliveryType: 'Individual',
    preferredItems: 'Dry Fruits, Sweets',
    brandingReq: 'Custom Box with Brand Colors',
    additionalServices: 'Personal Message Cards',
    createdDate: '2026-07-02',
    expectedDelivery: '2026-07-20',
    actualDelivery: '',
    quotationStatus: 'Pending',
  },
  {
    id: 'GIFT-20260701003',
    company: 'Infosys Limited',
    contactPerson: 'Rahul Verma',
    purpose: 'Client Gifting',
    quantity: 50,
    deliveryType: 'Bulk',
    preferredItems: 'Branded Merchandise',
    brandingReq: 'Infosys Branding',
    additionalServices: 'None',
    createdDate: '2026-07-03',
    expectedDelivery: '2026-07-10',
    actualDelivery: '2026-07-09',
    quotationStatus: 'Delivered',
  },
  {
    id: 'GIFT-20260701004',
    company: 'Wipro Technologies',
    contactPerson: 'Sneha Patil',
    purpose: 'New Year Gifting',
    quantity: 200,
    deliveryType: 'Individual',
    preferredItems: 'Luxury Chocolates, Diaries',
    brandingReq: 'Wipro Logo Embossed',
    additionalServices: 'Gift Wrapping, Cards',
    createdDate: '2026-07-04',
    expectedDelivery: '2026-07-25',
    actualDelivery: '',
    quotationStatus: 'In Progress',
  },
];

const statusConfig = {
  'Accepted': { color: '#22c55e', bg: '#dcfce7' },
  'Pending': { color: '#f97316', bg: '#ffedd5' },
  'Delivered': { color: '#068BC9', bg: '#e0f2fe' },
  'In Progress': { color: '#8b5cf6', bg: '#ede9fe' },
  'Rejected': { color: '#ef4444', bg: '#fee2e2' },
};

const filterOptions = ['Latest', 'Since Date', 'Date Range', 'Status', 'Company', 'Reset / Show All'];

export default function CorporateGifting() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Latest');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const filtered = giftingData.filter(o =>
    o.id.toLowerCase().includes(searchText.toLowerCase()) ||
    o.company.toLowerCase().includes(searchText.toLowerCase()) ||
    o.contactPerson.toLowerCase().includes(searchText.toLowerCase())
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
            <h1 className="text-base font-bold text-gray-800">Corporate Gifting</h1>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <MdSearch size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, Company or Person..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="bg-transparent text-sm outline-none w-56 text-gray-600"
            />
            {searchText && (
              <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => setSearchText('')} />
            )}
          </div>
        </div>

        <div className="p-5">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-gray-800">{giftingData.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Delivered</p>
              <p className="text-2xl font-bold" style={{ color: '#068BC9' }}>
                {giftingData.filter(g => g.quotationStatus === 'Delivered').length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">In Progress</p>
              <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>
                {giftingData.filter(g => g.quotationStatus === 'In Progress').length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Pending</p>
              <p className="text-2xl font-bold" style={{ color: '#f97316' }}>
                {giftingData.filter(g => g.quotationStatus === 'Pending').length}
              </p>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: '#068BC9' }}>
                <MdFilterList size={18} />
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
              <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => setActiveFilter('Latest')} />
            </div>

            <span className="text-sm text-gray-500">({filtered.length})</span>

            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MdRefresh size={18} className="text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/gifting/new')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#22c55e' }}>
              <MdAdd size={18} />
              New Request
            </button>

            <div className="ml-auto">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <MdSearch size={14} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by SR ID / Company / Person"
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
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Service Request ID</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Company Name</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Contact Person</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Purpose of Gifting</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Quantity</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Delivery Type</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Preferred Items & Brands</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Branding Requirements</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Additional Services</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Created Date</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Expected Delivery</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Actual Delivery</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">POD File</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Quotation Status</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const s = statusConfig[order.quotationStatus] || statusConfig['Pending'];
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap cursor-pointer hover:underline"
                        style={{ color: '#068BC9' }}
                        onClick={() => navigate('/gifting/detail')}>
                        {order.id}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.company}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.contactPerson}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.purpose}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.quantity}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.deliveryType}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.preferredItems}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.brandingReq}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.additionalServices}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.createdDate}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.expectedDelivery}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.actualDelivery || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {order.actualDelivery ? (
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            <MdDownload size={16} style={{ color: '#068BC9' }} />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ color: s.color, backgroundColor: s.bg }}>
                          {order.quotationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => navigate('/gifting/detail')}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                          style={{ color: '#068BC9', backgroundColor: '#e0f2fe' }}>
                          <MdVisibility size={14} />
                          View
                        </button>
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