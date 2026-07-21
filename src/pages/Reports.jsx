import React, { useState, useEffect } from 'react';
import SmartSidebar from '../components/SmartSidebar';
import { MdDownload, MdFilterList, MdRefresh, MdSearch, MdClose } from 'react-icons/md';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';

const tabs = [
  { key: 'logistics', label: 'Logistics Management' },
  { key: 'stamp', label: 'Stamp Paper' },
  { key: 'gifting', label: 'Corporate Gifting' },
  { key: 'events', label: 'Event & Team Outing' },
  { key: 'it', label: 'IT Solutions' },
];

const filterOptions = ['Latest', 'Since Date', 'Date Range', 'Status', 'Company', 'Reset / Show All'];

const statusConfig = {
  'Booked': { color: '#068BC9', bg: '#e0f2fe' },
  'In Transit': { color: '#1d4ed8', bg: '#dbeafe' },
  'Picked Up': { color: '#0ea5e9', bg: '#e0f2fe' },
  'Delivered': { color: '#22c55e', bg: '#dcfce7' },
  'Exception': { color: '#ef4444', bg: '#fee2e2' },
  'Cancelled': { color: '#ef4444', bg: '#fee2e2' },
  'RTO': { color: '#f97316', bg: '#ffedd5' },
  'Pending': { color: '#f97316', bg: '#ffedd5' },
  'In Printing': { color: '#8b5cf6', bg: '#ede9fe' },
  'pending': { color: '#f97316', bg: '#ffedd5' },
  'initialized': { color: '#068BC9', bg: '#e0f2fe' },
  'accepted': { color: '#22c55e', bg: '#dcfce7' },
  'rejected': { color: '#ef4444', bg: '#fee2e2' },
  'under_review': { color: '#f97316', bg: '#ffedd5' },
  'in_progress': { color: '#3b82f6', bg: '#eff6ff' },
  'In Progress': { color: '#3b82f6', bg: '#eff6ff' },
  'completed': { color: '#22c55e', bg: '#dcfce7' },
  'cancelled': { color: '#ef4444', bg: '#fee2e2' },
  'closed': { color: '#9ca3af', bg: '#f3f4f6' },
  'Resolved': { color: '#22c55e', bg: '#dcfce7' },
  'High': { color: '#ef4444', bg: '#fee2e2' },
  'Medium': { color: '#f97316', bg: '#ffedd5' },
  'Low': { color: '#22c55e', bg: '#dcfce7' },
};

const getStatus = (val) => statusConfig[val] || { color: '#9ca3af', bg: '#f3f4f6' };

function safeParseArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function safeParseObject(val) {
  if (!val) return {};
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function formatPreferredItems(row) {
  const items = safeParseArray(row.preferredItems).map(item => {
    if (item === 'Other Suggestions' && row.otherSuggestions) {
      return `Other: ${row.otherSuggestions}`;
    }
    let label = item;
    const itemBrands = safeParseObject(row.itemBrands);
    const otherItemBrands = safeParseObject(row.otherItemBrands);
    const brands = itemBrands[item];
    if (Array.isArray(brands) && brands.length > 0) {
      const brandsList = brands.map(b => (b === 'Others' && otherItemBrands[item]) ? otherItemBrands[item] : b).join(', ');
      label += ` (Brands: ${brandsList})`;
    }
    return label;
  });
  return items.length > 0 ? items.join(' | ') : '—';
}

function formatBranding(row) {
  const items = safeParseArray(row.brandingRequirements).map(item => {
    let label = item;
    const logoOpts = safeParseArray(row.logoPrintedOptions);
    if (item === 'Logo Printed' && logoOpts.length > 0) {
      label += ` (${logoOpts.join(', ')})`;
    }
    return label;
  });
  return items.length > 0 ? items.join(', ') : '—';
}

function formatAdditionalServices(row) {
  const items = safeParseArray(row.additionalServices).map(item => {
    if (item === 'Others' && row.otherAdditionalServices) return row.otherAdditionalServices;
    return item;
  });
  return items.length > 0 ? items.join(', ') : '—';
}

export default function Reports() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('logistics');
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Latest');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  const [logisticsData, setLogisticsData] = useState([]);
  const [stampData, setStampData] = useState([]);
  const [giftingData, setGiftingData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [itData, setItData] = useState([]);

  const user = getCurrentUser();
  const isCompanyAdmin = user && user.role === 'company_admin';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [logisticsRes, stampRes, giftingRes, eventsRes, itRes] = await Promise.all([
          api.get('/api/shipments'),
          api.get('/api/stamp-paper'),
          api.get('/api/corporate-giftings'),
          api.get('/api/events'),
          api.get('/api/it-solutions'),
        ]);
        setLogisticsData(logisticsRes.data);
        setStampData(stampRes.data);
        setGiftingData(giftingRes.data);
        setEventsData(eventsRes.data);
        setItData(itRes.data);
      } catch (error) {
        console.error('Failed to fetch reports data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleDownload = () => {
    alert(`Downloading MIS Report for ${tabs.find(t => t.key === activeTab)?.label}...`);
  };

  const renderLogistics = () => {
    const filtered = logisticsData.filter(r =>
      (r.serviceRequestId || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (r.shipmentAwbNumber || '').toLowerCase().includes(searchText.toLowerCase())
    );
    const baseCols = ['Created Date', 'Service Request ID', 'Company ID', 'Modes', 'Transport Mode',
      'Delivery Partner', 'Delivery Status', 'Shipment Detail', 'Declared Value',
      'Actual Weight', 'Scan Weight', 'No. of Boxes', 'AWB Number'];
    const restrictedCols = ['Insurance Required', 'Package Required'];
    const tailCols = ['Invoice/Challan No.', 'Rate Type', 'Delivery Date', 'Expected Delivery Date', 'Final Rate', 'POD Status'];
    const columns = isCompanyAdmin ? [...baseCols, ...tailCols] : [...baseCols, ...restrictedCols, ...tailCols];

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map((h, i) => (
                <th key={i} className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-10 text-gray-400 text-sm">No shipment records found</td></tr>
            ) : filtered.map((r, i) => {
              const s = getStatus(r.deliveryStatus);
              return (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.createdAt ? r.createdAt.split('T')[0] : '—'}</td>
                  <td className="px-4 py-3 text-xs font-medium whitespace-nowrap" style={{ color: '#068BC9' }}>{r.serviceRequestId}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.companyId ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap capitalize">{r.modes || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.transportMode || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.transporter || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>{r.deliveryStatus || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.shipmentDetails || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.shipmentDeclaredValue ? `₹${r.shipmentDeclaredValue}` : '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.actualWeight ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.scanWeight ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.boxQuantity ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.shipmentAwbNumber || '—'}</td>
                  {!isCompanyAdmin && (
                    <>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.insuranceRequired ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.packageRequired ? 'Yes' : 'No'}</td>
                    </>
                  )}
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.deliveryChallanNumber || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.rateType || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.deliveryDate ? r.deliveryDate.split('T')[0] : '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.expectedDeliveryDate ? r.expectedDeliveryDate.split('T')[0] : '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.shipmentRate ? `₹${r.shipmentRate}` : '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{ color: r.podCopy ? '#22c55e' : '#9ca3af', backgroundColor: r.podCopy ? '#dcfce7' : '#f3f4f6' }}>
                      {r.podCopy ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderStamp = () => {
    const filtered = stampData.filter(r =>
      (r.serviceRequestId || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (r.firstPartyName || '').toLowerCase().includes(searchText.toLowerCase())
    );
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-gray-100">
              {['Service Request ID', '1st Party Name', '2nd Party Name', 'Denomination',
                'Quantity', 'Total Charges', 'Status', 'Request Date', 'Delivery Date'].map((h, i) => (
                <th key={i} className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-sm">No stamp paper records found</td></tr>
            ) : filtered.map((r, i) => {
              const s = getStatus(r.status);
              return (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium whitespace-nowrap" style={{ color: '#068BC9' }}>{r.serviceRequestId}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.firstPartyName}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.secondPartyName}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">₹{r.denomination}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.quantity}</td>
                  <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: '#068BC9' }}>₹{r.totalCharges}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.createdAt ? r.createdAt.split('T')[0] : '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.deliveryDate ? r.deliveryDate.split('T')[0] : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderGifting = () => {
    const filtered = giftingData.filter(r =>
      (r.serviceRequestId || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (r.companyName || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (r.contactPersonName || '').toLowerCase().includes(searchText.toLowerCase())
    );
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-gray-100">
              {['Service Request ID', 'Company Name', 'Contact Person', 'Purpose of Gifting',
                'Quantity', 'Delivery Type', 'Preferred Items & Brands', 'Branding Requirements',
                'Additional Services', 'Created Date', 'Expected Delivery Date', 'Actual Delivery Date',
                'Quotation Status'].map((h, i) => (
                <th key={i} className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={13} className="text-center py-10 text-gray-400 text-sm">No corporate gifting records found</td></tr>
            ) : filtered.map((r, i) => {
              const s = getStatus(r.quotationStatus);
              return (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium whitespace-nowrap" style={{ color: '#068BC9' }}>{r.serviceRequestId}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.companyName}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.contactPersonName}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.purposeOfGifting || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    {String(r.estimatedQuantity).toLowerCase() === 'others' && r.others ? r.others : (r.estimatedQuantity || '—')}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.deliveryType || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600" style={{ minWidth: '220px', whiteSpace: 'normal' }}>{formatPreferredItems(r)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600" style={{ minWidth: '160px', whiteSpace: 'normal' }}>{formatBranding(r)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600" style={{ minWidth: '160px', whiteSpace: 'normal' }}>{formatAdditionalServices(r)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.createdAt ? r.createdAt.split('T')[0] : '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    {r.expectedDeliveryDate ? r.expectedDeliveryDate.split('T')[0] : <span className="text-gray-400 italic">Pending</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    {r.deliveryDate ? r.deliveryDate.split('T')[0] : <span className="text-gray-400 italic">Pending</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-medium px-2 py-1 rounded-full capitalize" style={{ color: s.color, backgroundColor: s.bg }}>
                      {r.quotationStatus || 'Initialized'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderEvents = () => {
    const filtered = eventsData.filter(r =>
      (r.serviceRequestId || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (r.businessName || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (r.contactPersonName || '').toLowerCase().includes(searchText.toLowerCase())
    );
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-gray-100">
              {['Service Request ID', 'Company', 'Contact Person', 'Event Type', 'Event Date',
                'Venue', 'Location', 'Participants', 'Event Duration', 'Services Required',
                'Budget', 'Created Date', 'Event Status'].map((h, i) => (
                <th key={i} className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={13} className="text-center py-10 text-gray-400 text-sm">No event records found</td></tr>
            ) : filtered.map((r, i) => {
              const s = getStatus(r.eventStatus);
              const services = safeParseArray(r.servicesRequired);
              return (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium whitespace-nowrap" style={{ color: '#068BC9' }}>{r.serviceRequestId}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.businessName}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.contactPersonName}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.eventType || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.eventDate ? r.eventDate.split('T')[0] : '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.venue || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.location || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.participants || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.eventDuration || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600" style={{ minWidth: '180px', whiteSpace: 'normal' }}>
                    {services.length > 0 ? services.join(', ') : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.budget ? `₹${r.budget}` : '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.createdAt ? r.createdAt.split('T')[0] : '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>{r.eventStatus}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderIT = () => {
    const filtered = itData.filter(r =>
      (r.serviceRequestId || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (r.contactPersonName || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (r.serviceType || '').toLowerCase().includes(searchText.toLowerCase())
    );
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-gray-100">
              {['Service Request ID', 'Contact Person', 'Email', 'Service Type', 'Priority',
                'Assigned To', 'Status', 'Created Date'].map((h, i) => (
                <th key={i} className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">No IT solution records found</td></tr>
            ) : filtered.map((r, i) => {
              const s = getStatus(r.status);
              const p = getStatus(r.priority);
              return (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium whitespace-nowrap" style={{ color: '#068BC9' }}>{r.serviceRequestId}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.contactPersonName}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.email}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.serviceType}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: p.color, backgroundColor: p.bg }}>{r.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.assignedTo || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.createdAt ? r.createdAt.split('T')[0] : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <p className="text-gray-400 text-sm">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SmartSidebar onToggle={setSidebarExpanded} />

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

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium ml-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#22c55e' }}>
              <MdDownload size={18}/>
              Download MIS Report
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            {activeTab === 'logistics' && renderLogistics()}
            {activeTab === 'stamp' && renderStamp()}
            {activeTab === 'gifting' && renderGifting()}
            {activeTab === 'events' && renderEvents()}
            {activeTab === 'it' && renderIT()}
          </div>

        </div>
      </div>
    </div>
  );
}