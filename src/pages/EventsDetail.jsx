import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  MdArrowBack, MdDownload, MdUpload, MdCheckCircle,
  MdCancel, MdHistory, MdClose, MdEvent
} from 'react-icons/md';

const eventDetail = {
  id: 'EVT-20260701001',
  company: 'Rapido Technologies Pvt. Ltd.',
  contactPerson: 'Ankit Sharma',
  designation: 'HR Manager',
  email: 'ankit.sharma@rapido.bike',
  phone: '+91 98765 43210',
  companyAddress: 'Rapido HQ, Koramangala, Bangalore',
  eventType: 'Team Outing',
  eventDate: '2026-07-20',
  venue: 'Coorg Resort',
  location: 'Coorg, Karnataka',
  participants: 85,
  budget: 500000,
  duration: '2 Days',
  servicesRequired: ['Venue', 'Catering', 'AV Equipment', 'Transportation'],
  eventNotes: 'Please arrange for outdoor activities and team bonding sessions.',
  eventStatus: 'in_progress',
  createdAt: '2026-07-01',
};

const quotationHistory = [
  {
    id: 1,
    quotationNumber: 'QTN-001',
    fileName: 'Event_Quotation_v1.pdf',
    fileUrl: '#',
    status: 'rejected',
    rejectionNote: 'Budget exceeded. Please revise.',
  },
  {
    id: 2,
    quotationNumber: 'QTN-002',
    fileName: 'Event_Quotation_v2.pdf',
    fileUrl: '#',
    status: 'initialized',
    rejectionNote: '',
  },
];

const eventStatusOptions = [
  { label: 'Under Review', value: 'under_review' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Closed', value: 'closed' },
];

const eventStatusConfig = {
  under_review: { color: '#f97316', bg: '#ffedd5', label: 'Under Review' },
  in_progress: { color: '#3b82f6', bg: '#eff6ff', label: 'In Progress' },
  completed: { color: '#22c55e', bg: '#dcfce7', label: 'Completed' },
  cancelled: { color: '#ef4444', bg: '#fee2e2', label: 'Cancelled' },
  closed: { color: '#9ca3af', bg: '#f3f4f6', label: 'Closed' },
};

const quotationStatusConfig = {
  accepted: { color: '#22c55e', bg: '#dcfce7', label: 'Accepted' },
  rejected: { color: '#ef4444', bg: '#fee2e2', label: 'Rejected' },
  initialized: { color: '#f97316', bg: '#ffedd5', label: 'Initialized' },
  pending: { color: '#9ca3af', bg: '#f3f4f6', label: 'Pending' },
};

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-700">{value || '—'}</span>
    </div>
  );
}

export default function EventsDetail() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [eventStatus, setEventStatus] = useState(eventDetail.eventStatus);
  const [quotations, setQuotations] = useState(quotationHistory);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);
  const navigate = useNavigate();

  const es = eventStatusConfig[eventStatus] || eventStatusConfig.under_review;
  const rejectionCount = quotations.filter(q => q.status === 'rejected').length;

  const handleAccept = (quotationId) => {
    setQuotations(prev =>
      prev.map(q => q.id === quotationId ? { ...q, status: 'accepted' } : q)
    );
    setEventStatus('in_progress');
  };

  const handleRejectClick = (quotationId) => {
    if (rejectionCount >= 5) return;
    setSelectedQuotationId(quotationId);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) return;
    setQuotations(prev =>
      prev.map(q => q.id === selectedQuotationId
        ? { ...q, status: 'rejected', rejectionNote: rejectReason }
        : q)
    );
    setEventStatus('cancelled');
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedQuotationId(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/events')}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MdArrowBack size={18} className="text-gray-500" />
            </button>
            <div>
              <p className="text-gray-400 text-xs">Event & Team Outing</p>
              <h1 className="text-base font-bold text-gray-800">{eventDetail.id}</h1>
            </div>
          </div>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ color: es.color, backgroundColor: es.bg }}>
            {es.label}
          </span>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Company', value: eventDetail.company },
              { label: 'Event Date', value: eventDetail.eventDate },
              { label: 'Participants', value: eventDetail.participants },
              { label: 'Budget', value: `₹${eventDetail.budget.toLocaleString()}` },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className="text-sm font-semibold text-gray-700">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5">

            {/* Left — Event Details */}
            <div className="col-span-2 flex flex-col gap-5">

              {/* Contact Info */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Contact Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <InfoRow label="Company Name" value={eventDetail.company} />
                  <InfoRow label="Contact Person" value={eventDetail.contactPerson} />
                  <InfoRow label="Designation" value={eventDetail.designation} />
                  <InfoRow label="Email" value={eventDetail.email} />
                  <InfoRow label="Phone" value={eventDetail.phone} />
                  <InfoRow label="Company Address" value={eventDetail.companyAddress} />
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MdEvent size={18} style={{ color: '#068BC9' }} />
                  <h3 className="text-sm font-semibold text-gray-700">Event Details</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <InfoRow label="Event Type" value={eventDetail.eventType} />
                  <InfoRow label="Event Date" value={eventDetail.eventDate} />
                  <InfoRow label="Venue" value={eventDetail.venue} />
                  <InfoRow label="Location" value={eventDetail.location} />
                  <InfoRow label="Participants" value={eventDetail.participants} />
                  <InfoRow label="Duration" value={eventDetail.duration} />
                  <InfoRow label="Budget" value={`₹${eventDetail.budget.toLocaleString()}`} />
                </div>

                {/* Services Required */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Services Required</p>
                  <div className="flex flex-wrap gap-2">
                    {eventDetail.servicesRequired.map((s, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Event Notes */}
                {eventDetail.eventNotes && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Event Notes</p>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{eventDetail.eventNotes}</p>
                  </div>
                )}
              </div>

              {/* Quotation History */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MdHistory size={18} style={{ color: '#068BC9' }} />
                    <h3 className="text-sm font-semibold text-gray-700">Quotation History</h3>
                  </div>
                  {rejectionCount >= 5 && (
                    <span className="text-xs text-red-500 font-medium">Max rejections (5) reached</span>
                  )}
                </div>

                {quotations.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No quotations uploaded yet.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs text-gray-400 font-medium pb-2">Quotation #</th>
                        <th className="text-left text-xs text-gray-400 font-medium pb-2">File</th>
                        <th className="text-left text-xs text-gray-400 font-medium pb-2">Status</th>
                        <th className="text-left text-xs text-gray-400 font-medium pb-2">Rejection Note</th>
                        <th className="text-left text-xs text-gray-400 font-medium pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotations.map((q, i) => {
                        const qs = quotationStatusConfig[q.status] || quotationStatusConfig.pending;
                        return (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-3 text-sm text-gray-700">{q.quotationNumber}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{q.fileName}</span>
                                <button
                                  onClick={() => window.open(q.fileUrl, '_blank')}
                                  className="p-1 rounded hover:bg-gray-100">
                                  <MdDownload size={14} style={{ color: '#068BC9' }} />
                                </button>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="text-xs font-medium px-2 py-1 rounded-full"
                                style={{ color: qs.color, backgroundColor: qs.bg }}>
                                {qs.label}
                              </span>
                            </td>
                            <td className="py-3 text-xs text-gray-500">{q.rejectionNote || '—'}</td>
                            <td className="py-3">
                              {q.status === 'initialized' && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleAccept(q.id)}
                                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                    <MdCheckCircle size={13} />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectClick(q.id)}
                                    disabled={rejectionCount >= 5}
                                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                    <MdCancel size={13} />
                                    Reject
                                  </button>
                                </div>
                              )}
                              {q.status !== 'initialized' && <span className="text-xs text-gray-400">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right — Admin Panel */}
            <div className="flex flex-col gap-5">

              {/* Event Status — CRM only */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Event Status</h3>
                <select
                  value={eventStatus}
                  onChange={e => setEventStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 outline-none mb-3">
                  {eventStatusOptions.map((opt, i) => (
                    <option key={i} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#068BC9' }}>
                  Update Status
                </button>
              </div>

              {/* Upload Quotation — CRM only */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Upload Quotation</h3>
                <p className="text-xs text-gray-400 mb-3">Accepted: PDF, Excel, Images</p>
                <button
                  disabled={rejectionCount >= 5}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <MdUpload size={16} />
                  Upload File
                </button>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Timeline</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Request Created', date: eventDetail.createdAt, done: true },
                    { label: 'Under Review', date: eventDetail.createdAt, done: true },
                    { label: 'Quotation Uploaded', date: '2026-07-03', done: true },
                    { label: 'Quotation Accepted', date: '', done: false },
                    { label: 'Event Completed', date: '', done: false },
                  ].map((step, i, arr) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                          style={{ backgroundColor: step.done ? '#068BC9' : '#e5e7eb' }} />
                        {i < arr.length - 1 && (
                          <div className="w-0.5 h-6" style={{ backgroundColor: '#e5e7eb' }} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">{step.label}</p>
                        {step.date && <p className="text-xs text-gray-400">{step.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Reject Quotation</h3>
              <button onClick={() => setShowRejectModal(false)}>
                <MdClose size={18} className="text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-1">
              Rejection {rejectionCount + 1} of 5 — provide a reason (mandatory)
            </p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-blue-300 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectReason.trim()}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: '#ef4444' }}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}