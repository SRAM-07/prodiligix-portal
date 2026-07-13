import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdFilterList, MdRefresh, MdSearch, MdClose, MdVisibility, MdDownload, MdExpandMore } from 'react-icons/md';

const logisticsData = [
  {
    id: 'LOG-20260701001',
    company: 'Rapido Technologies Pvt. Ltd.',
    pickupFacility: 'Rapido HQ - Bangalore',
    deliveryFacility: 'Rapido Warehouse - Mumbai',
    senderPhone: '+91 98765 43210',
    receiverPhone: '+91 87654 32109',
    transportMode: 'Surface',
    shipmentDetail: 'Electronics',
    declaredValue: '₹45,000',
    challanNo: 'CH-2026001',
    boxes: 3,
    rateType: 'Volumetric',
    finalRate: '₹1,250',
    awb: 'AWB123456789',
    deliveryPartner: 'Delhivery',
    status: 'In Transit',
    createdDate: '2026-07-01',
    deliveryDate: '',
    expectedDelivery: '2026-07-08',
    requestApproved: true,
    invoiceCopy: '#',
    ewayBill: '#',
    shipmentLabel: '#',
    podCopy: null,
    manifest: null,
  },
  {
    id: 'LOG-20260701002',
    company: 'Rapido Technologies Pvt. Ltd.',
    pickupFacility: 'Rapido HQ - Bangalore',
    deliveryFacility: 'Rapido Office - Delhi',
    senderPhone: '+91 98765 43210',
    receiverPhone: '+91 76543 21098',
    transportMode: 'Air',
    shipmentDetail: 'Documents',
    declaredValue: '₹5,000',
    challanNo: 'CH-2026002',
    boxes: 1,
    rateType: 'Actual',
    finalRate: '₹850',
    awb: 'AWB987654321',
    deliveryPartner: 'Bluedart',
    status: 'Delivered',
    createdDate: '2026-07-02',
    deliveryDate: '2026-07-05',
    expectedDelivery: '2026-07-06',
    requestApproved: true,
    invoiceCopy: '#',
    ewayBill: null,
    shipmentLabel: '#',
    podCopy: '#',
    manifest: '#',
  },
  {
    id: 'LOG-20260701003',
    company: 'Rapido Technologies Pvt. Ltd.',
    pickupFacility: 'Rapido Warehouse - Chennai',
    deliveryFacility: 'Rapido Office - Hyderabad',
    senderPhone: '+91 87654 32109',
    receiverPhone: '+91 65432 10987',
    transportMode: 'Surface',
    shipmentDetail: 'Spare Parts',
    declaredValue: '₹12,000',
    challanNo: 'CH-2026003',
    boxes: 5,
    rateType: 'Volumetric',
    finalRate: '₹2,100',
    awb: '',
    deliveryPartner: 'Delhivery',
    status: 'Exception',
    createdDate: '2026-07-03',
    deliveryDate: '',
    expectedDelivery: '2026-07-10',
    requestApproved: false,
    invoiceCopy: '#',
    ewayBill: '#',
    shipmentLabel: null,
    podCopy: null,
    manifest: null,
  },
  {
    id: 'LOG-20260701004',
    company: 'Rapido Technologies Pvt. Ltd.',
    pickupFacility: 'Rapido HQ - Bangalore',
    deliveryFacility: 'Rapido Office - Pune',
    senderPhone: '+91 98765 43210',
    receiverPhone: '+91 54321 09876',
    transportMode: 'Surface',
    shipmentDetail: 'Office Supplies',
    declaredValue: '₹8,500',
    challanNo: 'CH-2026004',
    boxes: 2,
    rateType: 'Actual',
    finalRate: '₹650',
    awb: 'AWB456789123',
    deliveryPartner: 'Delhivery',
    status: 'Booked',
    createdDate: '2026-07-04',
    deliveryDate: '',
    expectedDelivery: '2026-07-12',
    requestApproved: false,
    invoiceCopy: null,
    ewayBill: null,
    shipmentLabel: null,
    podCopy: null,
    manifest: null,
  },
];

const filterOptions = ['Latest', 'Since Date', 'Date Range', 'Status', 'Company', 'Reset / Show All'];

function getStatusIdColor(row) {
  const status = row.status ? row.status.toLowerCase() : '';
  if (status.includes('cancel') || status.includes('exception')) return '#ef4444';
  if (status.includes('delivered')) return '#22c55e';
  if (status.includes('rto')) return '#f97316';
  if (status.includes('in transit')) return '#1d4ed8';
  if (status.includes('picked up')) return '#0ea5e9';
  if (row.requestApproved) return '#0d9488';
  return '#068BC9';
}

const statusConfig = {
  'Booked': { color: '#068BC9', bg: '#e0f2fe' },
  'In Transit': { color: '#1d4ed8', bg: '#dbeafe' },
  'Picked Up': { color: '#0ea5e9', bg: '#e0f2fe' },
  'Delivered': { color: '#22c55e', bg: '#dcfce7' },
  'Exception': { color: '#ef4444', bg: '#fee2e2' },
  'Cancelled': { color: '#ef4444', bg: '#fee2e2' },
  'RTO': { color: '#f97316', bg: '#ffedd5' },
};

export default function Logistics() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Latest');
  const [searchText, setSearchText] = useState('');
  const [openDocDropdown, setOpenDocDropdown] = useState(null);
  const navigate = useNavigate();

  const filtered = logisticsData.filter(o =>
    o.id.toLowerCase().includes(searchText.toLowerCase()) ||
    o.company.toLowerCase().includes(searchText.toLowerCase()) ||
    (o.awb && o.awb.toLowerCase().includes(searchText.toLowerCase()))
  );

  const getAvailableDocs = (row) => {
    const docs = [];
    if (row.invoiceCopy) docs.push({ label: 'Invoice Copy', url: row.invoiceCopy });
    if (row.ewayBill) docs.push({ label: 'E-Way Bill', url: row.ewayBill });
    if (row.shipmentLabel) docs.push({ label: 'Shipment Label', url: row.shipmentLabel });
    if (row.podCopy) docs.push({ label: 'POD Copy', url: row.podCopy });
    if (row.manifest) docs.push({ label: 'Manifest', url: row.manifest });
    return docs;
  };

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
            <h1 className="text-base font-bold text-gray-800">Logistics Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <MdSearch size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, AWB or Company..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="bg-transparent text-sm outline-none w-56 text-gray-600"
              />
              {searchText && (
                <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => setSearchText('')} />
              )}
            </div>
          </div>
        </div>

        <div className="p-5">

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Total Orders', value: logisticsData.length, color: '#068BC9' },
              { label: 'Delivered', value: logisticsData.filter(o => o.status === 'Delivered').length, color: '#22c55e' },
              { label: 'In Transit', value: logisticsData.filter(o => o.status === 'In Transit').length, color: '#1d4ed8' },
              { label: 'Exceptions', value: logisticsData.filter(o => o.status === 'Exception').length, color: '#ef4444' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
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
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    'Service Request ID', 'Company', 'Pickup Facility', 'Delivery Facility',
                    'Sender Phone', 'Receiver Phone', 'Transport Mode', 'Shipment Detail',
                    'Declared Value', 'Challan No.', 'Boxes', 'Rate Type', 'Final Rate',
                    'AWB Number', 'Delivery Partner', 'Status',
                    'Created Date', 'Delivery Date', 'Expected Delivery', 'Actions'
                  ].map((col, i) => (
                    <th key={i} className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const s = statusConfig[order.status] || { color: '#9ca3af', bg: '#f3f4f6' };
                  const docs = getAvailableDocs(order);
                  const idColor = getStatusIdColor(order);
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-bold whitespace-nowrap cursor-pointer hover:underline"
                        style={{ color: idColor }}
                        onClick={() => navigate('/logistics/detail')}>
                        {order.id}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.company}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.pickupFacility}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.deliveryFacility}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.senderPhone}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.receiverPhone}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.transportMode}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.shipmentDetail}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.declaredValue}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.challanNo}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.boxes}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.rateType}</td>
                      <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: '#068BC9' }}>{order.finalRate}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.awb || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.deliveryPartner}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ color: s.color, backgroundColor: s.bg }}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.createdDate}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.deliveryDate || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.expectedDelivery}</td>
                      <td className="px-4 py-3 whitespace-nowrap relative">
                        {docs.length > 0 ? (
                          <div className="relative">
                            <button
                              onClick={() => setOpenDocDropdown(openDocDropdown === i ? null : i)}
                              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                              style={{ color: '#068BC9', backgroundColor: '#e0f2fe' }}>
                              <MdDownload size={14} />
                              Docs
                              <MdExpandMore size={14} />
                            </button>
                            {openDocDropdown === i && (
                              <div className="absolute right-0 top-9 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-2 w-44">
                                {docs.map((doc, di) => (
                                <div
                                  key={di}
                                    onClick={() => window.open(doc.url, '_blank')}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-xs text-gray-600 cursor-pointer">
                                    <MdDownload size={13} style={{ color: '#068BC9' }} />
                                    {doc.label}
                                </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No Docs</span>
                        )}
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