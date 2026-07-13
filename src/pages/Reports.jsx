import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { MdDownload, MdFilterList, MdRefresh, MdSearch, MdClose } from 'react-icons/md';

const logisticsReports = [
  {
    createdDate: '04/07/2026', id: 'LOG-202607041085', company: 'Roppen Transportation Service Pvt. Ltd.',
    sendingAddress: 'Rapido Bangalore', receivingAddress: 'Divya Rudavath', senderPhone: '7406633660',
    receiverPhone: '8179344152', modes: 'Forward', transportMode: 'Air', deliveryPartner: 'Bluedart',
    deliveryStatus: 'in transit', shipmentDetail: 'Laptops', declaredValue: 32000, actualWeight: 3.5,
    scanWeight: 3.5, noOfBoxes: 1, awb: '77056346710', insuranceRequired: true, packageRequired: false,
    deliveryDate: '', expectedDelivery: '07/07/2026', finalRate: 1494.0, podStatus: 'No',
  },
  {
    createdDate: '04/07/2026', id: 'LOG-202607041084', company: 'Roppen Transportation Service Pvt. Ltd.',
    sendingAddress: 'Rapido Bangalore', receivingAddress: 'Ravi Prakash Gopalan', senderPhone: '7406633660',
    receiverPhone: '9887356675', modes: 'Forward', transportMode: 'Air', deliveryPartner: 'Bluedart',
    deliveryStatus: 'in transit', shipmentDetail: 'Laptops', declaredValue: 32000, actualWeight: 3.5,
    scanWeight: 3.5, noOfBoxes: 1, awb: '90574780903', insuranceRequired: true, packageRequired: false,
    deliveryDate: '', expectedDelivery: '08/07/2026', finalRate: 1593.94, podStatus: 'No',
  },
  {
    createdDate: '04/07/2026', id: 'LOG-202607041083', company: 'Roppen Transportation Service Pvt. Ltd.',
    sendingAddress: 'Rapido Bangalore', receivingAddress: 'Sahil Chhabra', senderPhone: '7406633660',
    receiverPhone: '8053211788', modes: 'Forward', transportMode: 'Air', deliveryPartner: 'Bluedart',
    deliveryStatus: 'in transit', shipmentDetail: 'Laptops', declaredValue: 32000, actualWeight: 3.5,
    scanWeight: 3.5, noOfBoxes: 1, awb: '77056308044', insuranceRequired: true, packageRequired: false,
    deliveryDate: '', expectedDelivery: '09/07/2026', finalRate: 1494.0, podStatus: 'No',
  },
  {
    createdDate: '04/07/2026', id: 'LOG-202607041082', company: 'Roppen Transportation Service Pvt. Ltd.',
    sendingAddress: 'Rapido Bangalore', receivingAddress: 'Ankul Ranjan', senderPhone: '8340570245',
    receiverPhone: '7406633660', modes: 'Reverse', transportMode: 'Air', deliveryPartner: 'Delhivery',
    deliveryStatus: 'cancelled', shipmentDetail: 'Laptops', declaredValue: 49000, actualWeight: 3.5,
    scanWeight: 3.5, noOfBoxes: 1, awb: '31791010027624', insuranceRequired: true, packageRequired: false,
    deliveryDate: '', expectedDelivery: '08/07/2026', finalRate: 0.0, podStatus: 'No',
  },
];

const stampReports = [
  {
    createdDate: '03/07/2026', id: 'STMP-20260703001', firstParty: 'Roppen Transportation Services Pvt. Ltd.',
    secondParty: 'SWAI Technologies Private Limited', denomination: 500, quantity: 1,
    procurementCharges: 50, gst: 9, totalCharges: 559, status: 'In Transit', deliveryDate: '',
  },
  {
    createdDate: '02/07/2026', id: 'STMP-20260702001', firstParty: 'Hivenix Inc.',
    secondParty: 'CTRLX TECHNOLOGIES PRIVATE LIMITED', denomination: 500, quantity: 1,
    procurementCharges: 50, gst: 9, totalCharges: 559, status: 'In Transit', deliveryDate: '',
  },
  {
    createdDate: '01/07/2026', id: 'STMP-20260701006', firstParty: 'PhonePe Limited',
    secondParty: 'Nutana Transportation Services Pvt. Ltd.', denomination: 500, quantity: 2,
    procurementCharges: 100, gst: 18, totalCharges: 1118, status: 'Delivered', deliveryDate: '01/07/2026',
  },
];

const giftingReports = [
  {
    createdDate: '01/07/2026', id: 'GIFT-20260701001', company: 'Rapido Technologies Pvt. Ltd.',
    contactPerson: 'Ankit Sharma', purpose: 'Employee Appreciation', quantity: 150,
    deliveryType: 'Bulk', preferredItems: 'Premium Gift Hampers', status: 'Accepted',
    expectedDelivery: '15/07/2026', actualDelivery: '',
  },
  {
    createdDate: '02/07/2026', id: 'GIFT-20260701002', company: 'Coca-Cola India Pvt. Ltd.',
    contactPerson: 'Priya Menon', purpose: 'Diwali Gifting', quantity: 500,
    deliveryType: 'Individual', preferredItems: 'Dry Fruits, Sweets', status: 'Pending',
    expectedDelivery: '20/07/2026', actualDelivery: '',
  },
];

const eventsReports = [
  {
    createdDate: '01/07/2026', id: 'EVT-20260701001', company: 'Rapido Technologies Pvt. Ltd.',
    eventType: 'Team Outing', eventDate: '20/07/2026', venue: 'Coorg Resort',
    location: 'Coorg, Karnataka', participants: 85, duration: '2 Days',
    eventStatus: 'In Progress', quotationStatus: 'Accepted',
  },
  {
    createdDate: '04/07/2026', id: 'EVT-20260701004', company: 'Wipro Technologies',
    eventType: 'Team Building', eventDate: '18/07/2026', venue: 'Della Adventure Park',
    location: 'Pune, Maharashtra', participants: 120, duration: '1 Day',
    eventStatus: 'Completed', quotationStatus: 'Accepted',
  },
];

const tabs = [
  { key: 'logistics', label: 'Logistics Management' },
  { key: 'stamp', label: 'Stamp Paper' },
  { key: 'gifting', label: 'Corporate Gifting' },
  { key: 'events', label: 'Event & Team Outing' },
];

const filterOptions = ['Latest', 'Since Date', 'Date Range', 'Status', 'Company', 'Reset / Show All'];

const statusConfig = {
  'in transit': { color: '#068BC9', bg: '#e0f2fe', label: 'In Transit' },
  'delivered': { color: '#22c55e', bg: '#dcfce7', label: 'Delivered' },
  'cancelled': { color: '#ef4444', bg: '#fee2e2', label: 'Cancelled' },
  'In Transit': { color: '#068BC9', bg: '#e0f2fe', label: 'In Transit' },
  'Delivered': { color: '#22c55e', bg: '#dcfce7', label: 'Delivered' },
  'Accepted': { color: '#22c55e', bg: '#dcfce7', label: 'Accepted' },
  'Pending': { color: '#f97316', bg: '#ffedd5', label: 'Pending' },
  'In Progress': { color: '#3b82f6', bg: '#eff6ff', label: 'In Progress' },
  'Completed': { color: '#22c55e', bg: '#dcfce7', label: 'Completed' },
};

export default function Reports() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('logistics');
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Latest');
  const [searchText, setSearchText] = useState('');

  const handleDownload = () => {
    alert(`Downloading MIS Report for ${tabs.find(t => t.key === activeTab)?.label}...`);
  };

  const renderLogistics = () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max">
        <thead>
          <tr className="border-b border-gray-100">
            {['Created Date', 'Service Request ID', 'Company Name', 'Sending Address', 'Receiving Address',
              'Sender Phone', 'Receiver Phone', 'Modes', 'Transport Mode', 'Delivery Partner',
              'Delivery Status', 'Shipment Detail', 'Declared Value', 'Actual Weight', 'Scan Weight',
              'No. of Boxes', 'AWB Number', 'Insurance', 'Package', 'Delivery Date',
              'Expected Delivery', 'Final Rate', 'POD Status'].map((h, i) => (
              <th key={i} className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logisticsReports.filter(r =>
            r.id.toLowerCase().includes(searchText.toLowerCase()) ||
            r.company.toLowerCase().includes(searchText.toLowerCase())
          ).map((r, i) => {
            const s = statusConfig[r.deliveryStatus];
            return (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.createdDate}</td>
                <td className="px-4 py-3 text-xs font-medium whitespace-nowrap" style={{ color: '#068BC9' }}>{r.id}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.company}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap" style={{ color: '#068BC9' }}>{r.sendingAddress}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap" style={{ color: '#068BC9' }}>{r.receivingAddress}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.senderPhone}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.receiverPhone}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.modes}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.transportMode}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.deliveryPartner}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: s?.color, backgroundColor: s?.bg }}>
                    {s?.label || r.deliveryStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.shipmentDetail}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">₹{r.declaredValue.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.actualWeight}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.scanWeight}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.noOfBoxes}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.awb}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.insuranceRequired ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.packageRequired ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.deliveryDate || '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.expectedDelivery}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">₹{r.finalRate}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{ color: r.podStatus === 'Yes' ? '#22c55e' : '#9ca3af', backgroundColor: r.podStatus === 'Yes' ? '#dcfce7' : '#f3f4f6' }}>
                    {r.podStatus}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderStamp = () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max">
        <thead>
          <tr className="border-b border-gray-100">
            {['Created Date', 'Service Request ID', '1st Party Name', '2nd Party Name',
              'Denomination', 'Quantity', 'Procurement Charges', 'GST', 'Total Charges',
              'Status', 'Delivery Date'].map((h, i) => (
              <th key={i} className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stampReports.filter(r =>
            r.id.toLowerCase().includes(searchText.toLowerCase()) ||
            r.firstParty.toLowerCase().includes(searchText.toLowerCase())
          ).map((r, i) => {
            const s = statusConfig[r.status];
            return (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.createdDate}</td>
                <td className="px-4 py-3 text-xs font-medium whitespace-nowrap" style={{ color: '#068BC9' }}>{r.id}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.firstParty}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.secondParty}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">₹{r.denomination}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.quantity}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">₹{r.procurementCharges}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">₹{r.gst}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">₹{r.totalCharges}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: s?.color, backgroundColor: s?.bg }}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.deliveryDate || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderGifting = () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max">
        <thead>
          <tr className="border-b border-gray-100">
            {['Created Date', 'Service Request ID', 'Company Name', 'Contact Person',
              'Purpose', 'Quantity', 'Delivery Type', 'Preferred Items',
              'Status', 'Expected Delivery', 'Actual Delivery'].map((h, i) => (
              <th key={i} className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {giftingReports.filter(r =>
            r.id.toLowerCase().includes(searchText.toLowerCase()) ||
            r.company.toLowerCase().includes(searchText.toLowerCase())
          ).map((r, i) => {
            const s = statusConfig[r.status];
            return (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.createdDate}</td>
                <td className="px-4 py-3 text-xs font-medium whitespace-nowrap" style={{ color: '#068BC9' }}>{r.id}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.company}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.contactPerson}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.purpose}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.quantity}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.deliveryType}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.preferredItems}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: s?.color, backgroundColor: s?.bg }}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.expectedDelivery}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.actualDelivery || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderEvents = () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max">
        <thead>
          <tr className="border-b border-gray-100">
            {['Created Date', 'Service Request ID', 'Company Name', 'Event Type',
              'Event Date', 'Venue', 'Location', 'Participants',
              'Duration', 'Event Status', 'Quotation Status'].map((h, i) => (
              <th key={i} className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {eventsReports.filter(r =>
            r.id.toLowerCase().includes(searchText.toLowerCase()) ||
            r.company.toLowerCase().includes(searchText.toLowerCase())
          ).map((r, i) => {
            const es = statusConfig[r.eventStatus];
            const qs = statusConfig[r.quotationStatus];
            return (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.createdDate}</td>
                <td className="px-4 py-3 text-xs font-medium whitespace-nowrap" style={{ color: '#068BC9' }}>{r.id}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.company}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.eventType}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.eventDate}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.venue}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.location}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.participants}</td>
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.duration}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: es?.color, backgroundColor: es?.bg }}>
                    {r.eventStatus}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: qs?.color, backgroundColor: qs?.bg }}>
                    {r.quotationStatus}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
            <p className="text-gray-400 text-xs">Tools</p>
            <h1 className="text-base font-bold text-gray-800">Reports</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <MdSearch size={16} className="text-gray-400"/>
              <input
                type="text"
                placeholder="Search by ID or Company..."
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

          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-white rounded-xl border border-gray-100 shadow-sm p-1 w-fit">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearchText(''); }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                style={{
                  backgroundColor: activeTab === tab.key ? '#068BC9' : 'transparent',
                  color: activeTab === tab.key ? '#fff' : '#6b7280'
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter + Download bar */}
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
                {activeFilter}
              </span>
              <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => setActiveFilter('Latest')}/>
            </div>

            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MdRefresh size={18} className="text-gray-400"/>
            </button>

            {/* Download MIS button */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium ml-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#22c55e' }}>
              <MdDownload size={18}/>
              Download MIS Report
            </button>

            <div className="ml-auto">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <MdSearch size={14} className="text-gray-400"/>
                <input
                  type="text"
                  placeholder="Service Request ID or Company Name"
                  className="bg-transparent text-xs outline-none w-52 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            {activeTab === 'logistics' && renderLogistics()}
            {activeTab === 'stamp' && renderStamp()}
            {activeTab === 'gifting' && renderGifting()}
            {activeTab === 'events' && renderEvents()}
          </div>

        </div>
      </div>
    </div>
  );
}