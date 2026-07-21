import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SmartSidebar from '../components/SmartSidebar';
import { MdFilterList, MdRefresh, MdSearch, MdClose, MdVisibility, MdAdd } from 'react-icons/md';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';
import EventQuotationDialog from '../components/EventQuotationDialog';

const filterOptions = ['Latest', 'Since Date', 'Date Range', 'Status', 'Company', 'Reset / Show All'];

const ADMIN_ROLES = ['super_admin', 'crm_user'];

const eventStatusConfig = {
  'under_review': { color: '#f97316', bg: '#ffedd5', label: 'Under Review' },
  'in_progress': { color: '#3b82f6', bg: '#eff6ff', label: 'In Progress' },
  'completed': { color: '#22c55e', bg: '#dcfce7', label: 'Completed' },
  'cancelled': { color: '#ef4444', bg: '#fee2e2', label: 'Cancelled' },
  'closed': { color: '#9ca3af', bg: '#f3f4f6', label: 'Closed' },
};

export default function Events() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Latest');
  const [searchText, setSearchText] = useState('');
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quotationDialogId, setQuotationDialogId] = useState(null);
  const navigate = useNavigate();

  const user = getCurrentUser();
  const isAdmin = user && ADMIN_ROLES.includes(user.role);
  const isCrmUser = user?.role === 'crm_user' || user?.role === 'super_admin';
  const isCompanyUser = ['company_user', 'company_admin', 'company_crm_user'].includes(user?.role);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/api/events');
      setEventsData(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filtered = eventsData.filter(o =>
    (o.serviceRequestId || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (o.businessName || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (o.contactPersonName || '').toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SmartSidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <div>
            <p className="text-gray-400 text-xs">Services</p>
            <h1 className="text-base font-bold text-gray-800">Event & Team Outing Management</h1>
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
            {[
              { label: 'Total Requests', value: eventsData.length, color: '#068BC9' },
              { label: 'In Progress', value: eventsData.filter(e => e.eventStatus === 'in_progress').length, color: '#3b82f6' },
              { label: 'Under Review', value: eventsData.filter(e => e.eventStatus === 'under_review').length, color: '#f97316' },
              { label: 'Completed', value: eventsData.filter(e => e.eventStatus === 'completed').length, color: '#22c55e' },
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

            <button onClick={fetchEvents} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MdRefresh size={18} className="text-gray-400" />
            </button>

            {!isAdmin && (
              <button
                onClick={() => navigate('/events/new')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: '#22c55e' }}>
                <MdAdd size={18} />
                New Event
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    'Service Request ID', 'Company', 'Contact Person',
                    'Event Type', 'Event Date', 'Venue', 'Location',
                    'Participants', 'Event Duration', 'Budget', 'Created Date',
                    'Quotation Action', 'Event Status', 'Actions'
                  ].map((col, i) => (
                    <th key={i} className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="text-center py-10 text-gray-400 text-sm">
                      No events found
                    </td>
                  </tr>
                ) : (
                  filtered.map((event, i) => {
                    const s = eventStatusConfig[event.eventStatus] || { color: '#9ca3af', bg: '#f3f4f6', label: event.eventStatus };
                    return (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap cursor-pointer hover:underline"
                          style={{ color: '#068BC9' }}
                          onClick={() => navigate(`/events/${event.id}`)}>
                          {event.serviceRequestId}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{event.businessName}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{event.contactPersonName}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{event.eventType || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {event.eventDate ? event.eventDate.split('T')[0] : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{event.venue || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{event.location || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{event.participants || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{event.eventDuration || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {event.budget ? `₹${event.budget}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {event.createdAt ? event.createdAt.split('T')[0] : '—'}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {isCrmUser && (
                            <button
                              onClick={() => setQuotationDialogId(event.id)}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                              style={{ color: '#068BC9', backgroundColor: '#e0f2fe' }}>
                              Upload Quotation
                            </button>
                          )}
                          {isCompanyUser && (
                            <button
                              onClick={() => setQuotationDialogId(event.id)}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                              style={{ color: '#22c55e', backgroundColor: '#dcfce7' }}>
                              View Quotations
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-medium px-2 py-1 rounded-full"
                            style={{ color: s.color, backgroundColor: s.bg }}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/events/${event.id}`)}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            style={{ color: '#068BC9', backgroundColor: '#e0f2fe' }}>
                            <MdVisibility size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {quotationDialogId && (
        <EventQuotationDialog
          eventId={quotationDialogId}
          onClose={() => setQuotationDialogId(null)}
          onStatusChange={() => fetchEvents()}
        />
      )}
    </div>
  );
}