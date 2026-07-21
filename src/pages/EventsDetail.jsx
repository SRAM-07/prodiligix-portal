import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SmartSidebar from '../components/SmartSidebar';
import {
  MdArrowBack, MdDownload, MdUpload, MdCheckCircle,
  MdCancel, MdHistory, MdClose, MdEvent
} from 'react-icons/md';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';

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
  Accepted: { color: '#22c55e', bg: '#dcfce7', label: 'Accepted' },
  Rejected: { color: '#ef4444', bg: '#fee2e2', label: 'Rejected' },
  Initialized: { color: '#f97316', bg: '#ffedd5', label: 'Initialized' },
  pending: { color: '#9ca3af', bg: '#f3f4f6', label: 'Pending' },
};

const ADMIN_ROLES = ['super_admin', 'crm_user'];
const COMPANY_ROLES = ['company_user', 'company_admin', 'company_crm_user'];

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
  const [detail, setDetail] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventStatus, setEventStatus] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const user = getCurrentUser();
  const isAdmin = user && ADMIN_ROLES.includes(user.role);
  const isCompanyUser = user && COMPANY_ROLES.includes(user.role);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const [detailRes, quotationsRes] = await Promise.all([
          api.get(`/api/events/${id}`),
          api.get(`/api/events/${id}/quotations`)
        ]);
        setDetail(detailRes.data);
        setEventStatus(detailRes.data.eventStatus);
        setQuotations(quotationsRes.data);
      } catch (error) {
        console.error('Failed to fetch event detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const refreshData = async () => {
    const [detailRes, quotationsRes] = await Promise.all([
      api.get(`/api/events/${id}`),
      api.get(`/api/events/${id}/quotations`)
    ]);
    setDetail(detailRes.data);
    setEventStatus(detailRes.data.eventStatus);
    setQuotations(quotationsRes.data);
  };

  const handleUpdateStatus = async () => {
    try {
      await api.put(`/api/events/${id}`, { eventStatus });
      await refreshData();
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleUploadQuotation = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE}/api/events/${id}/quotations/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Upload failed');
      }

      await refreshData();
    } catch (error) {
      alert(error.message || 'Failed to upload quotation');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAccept = async (quotationId) => {
    try {
      await api.post(`/api/events/${id}/quotations/${quotationId}/accept`);
      await refreshData();
    } catch (error) {
      console.error('Failed to accept quotation:', error);
    }
  };

  const handleRejectClick = (quotationId) => {
    setSelectedQuotationId(quotationId);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return;
    try {
      await api.post(`/api/events/${id}/quotations/${selectedQuotationId}/reject`, {
        reason: rejectReason
      });
      await refreshData();
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedQuotationId(null);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reject quotation');
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );

  if (!detail) return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <p className="text-gray-400 text-sm">Event not found</p>
    </div>
  );

  const es = eventStatusConfig[eventStatus] || eventStatusConfig.under_review;
  const rejectionCount = quotations.filter(q => q.status === 'Rejected').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SmartSidebar onToggle={setSidebarExpanded} />

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
              <h1 className="text-base font-bold text-gray-800">{detail.serviceRequestId}</h1>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ color: es.color, backgroundColor: es.bg }}>
            {es.label}
          </span>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Company', value: detail.businessName },
              { label: 'Event Date', value: detail.eventDate ? detail.eventDate.split('T')[0] : '—' },
              { label: 'Participants', value: detail.participants },
              { label: 'Budget', value: detail.budget ? `₹${detail.budget}` : '—' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className="text-sm font-semibold text-gray-700">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5">

            {/* Left */}
            <div className="col-span-2 flex flex-col gap-5">

              {/* Contact Info */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Contact Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <InfoRow label="Company Name" value={detail.businessName} />
                  <InfoRow label="Contact Person" value={detail.contactPersonName} />
                  <InfoRow label="Designation" value={detail.designation} />
                  <InfoRow label="Email" value={detail.contactPersonEmail} />
                  <InfoRow label="Phone" value={detail.contactPersonPhonenumber} />
                  <InfoRow label="Company Address" value={detail.companyAddress} />
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MdEvent size={18} style={{ color: '#068BC9' }} />
                  <h3 className="text-sm font-semibold text-gray-700">Event Details</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <InfoRow label="Event Type" value={detail.eventType} />
                  <InfoRow label="Event Date" value={detail.eventDate ? detail.eventDate.split('T')[0] : '—'} />
                  <InfoRow label="Venue" value={detail.venue} />
                  <InfoRow label="Location" value={detail.location} />
                  <InfoRow label="Participants" value={detail.participants} />
                  <InfoRow label="Duration" value={detail.eventDuration} />
                  <InfoRow label="Budget" value={detail.budget ? `₹${detail.budget}` : '—'} />
                </div>

                {detail.servicesRequired && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Services Required</p>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(detail.servicesRequired).map((s, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {detail.eventNotes && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Event Notes</p>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{detail.eventNotes}</p>
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
                            <td className="py-3 text-sm text-gray-700">{q.quotationNumber || `Q-${q.id}`}</td>
                            <td className="py-3">
                              <span className="text-xs font-medium px-2 py-1 rounded-full"
                                style={{ color: qs.color, backgroundColor: qs.bg }}>
                                {qs.label}
                              </span>
                            </td>
                            <td className="py-3 text-xs text-gray-500">{q.rejectionNote || '—'}</td>
                            <td className="py-3">
                              {isCompanyUser && q.status === 'Initialized' ? (
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
                                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-40">
                                    <MdCancel size={13} />
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
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

              {isAdmin && (
                <>
                  {/* Event Status */}
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
                      onClick={handleUpdateStatus}
                      className="w-full py-2.5 rounded-lg text-white text-sm font-medium"
                      style={{ backgroundColor: '#068BC9' }}>
                      Update Status
                    </button>
                  </div>

                  {/* Upload Quotation */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Upload Quotation</h3>
                    <p className="text-xs text-gray-400 mb-3">Accepted: PDF, Excel, Images</p>
                    <label
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border-2 border-dashed transition-colors ${
                        rejectionCount >= 5
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                          : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 cursor-pointer'
                      }`}>
                      <MdUpload size={16} />
                      {uploading ? 'Uploading...' : 'Upload File'}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                        onChange={handleUploadQuotation}
                        disabled={uploading || rejectionCount >= 5}
                      />
                    </label>
                  </div>
                </>
              )}

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Timeline</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Request Created', date: detail.createdAt ? detail.createdAt.split('T')[0] : '', done: true },
                    { label: 'Under Review', date: '', done: true },
                    { label: 'Quotation Uploaded', date: quotations.length > 0 ? quotations[quotations.length - 1].createdAt?.split('T')[0] : '', done: quotations.length > 0 },
                    { label: 'Quotation Accepted', date: '', done: quotations.some(q => q.status === 'Accepted') },
                    { label: 'Event Completed', date: '', done: eventStatus === 'completed' },
                  ].map((step, i, arr) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                          style={{ backgroundColor: step.done ? '#068BC9' : '#e5e7eb' }} />
                        {i < arr.length - 1 && <div className="w-0.5 h-6" style={{ backgroundColor: '#e5e7eb' }} />}
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