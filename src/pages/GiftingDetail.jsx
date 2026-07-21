import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SmartSidebar from '../components/SmartSidebar';
import {
  MdArrowBack, MdDownload, MdUpload, MdCheckCircle, MdCancel,
  MdHistory, MdClose
} from 'react-icons/md';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';

const statusConfig = {
  accepted: { color: '#22c55e', bg: '#dcfce7', label: 'Accepted' },
  rejected: { color: '#ef4444', bg: '#fee2e2', label: 'Rejected' },
  initialized: { color: '#f97316', bg: '#ffedd5', label: 'Initialized' },
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

export default function GiftingDetail() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
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
          api.get(`/api/corporate-giftings/${id}`),
          api.get(`/api/corporate-giftings/${id}/quotations`)
        ]);
        setDetail(detailRes.data);
        setQuotations(quotationsRes.data);
      } catch (error) {
        console.error('Failed to fetch gifting detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE}/api/corporate-giftings/${id}/quotations`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const quotationsRes = await api.get(`/api/corporate-giftings/${id}/quotations`);
      setQuotations(quotationsRes.data);
      const detailRes = await api.get(`/api/corporate-giftings/${id}`);
      setDetail(detailRes.data);
    } catch (error) {
      console.error('Failed to upload quotation:', error);
      alert('Failed to upload quotation. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAccept = async (quotationId) => {
    try {
      await api.post(`/api/corporate-giftings/${id}/quotations/${quotationId}/accept`);
      const [detailRes, quotationsRes] = await Promise.all([
        api.get(`/api/corporate-giftings/${id}`),
        api.get(`/api/corporate-giftings/${id}/quotations`)
      ]);
      setDetail(detailRes.data);
      setQuotations(quotationsRes.data);
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
      await api.post(`/api/corporate-giftings/${id}/quotations/${selectedQuotationId}/reject`, {
        reason: rejectReason
      });
      const [detailRes, quotationsRes] = await Promise.all([
        api.get(`/api/corporate-giftings/${id}`),
        api.get(`/api/corporate-giftings/${id}/quotations`)
      ]);
      setDetail(detailRes.data);
      setQuotations(quotationsRes.data);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedQuotationId(null);
    } catch (error) {
      console.error('Failed to reject quotation:', error);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );

  if (!detail) return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <p className="text-gray-400 text-sm">Not found</p>
    </div>
  );

  const overallStatus = statusConfig[detail.quotationStatus] || statusConfig.pending;

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
              onClick={() => navigate('/gifting')}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MdArrowBack size={18} className="text-gray-500" />
            </button>
            <div>
              <p className="text-gray-400 text-xs">Corporate Gifting</p>
              <h1 className="text-base font-bold text-gray-800">{detail.serviceRequestId}</h1>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ color: overallStatus.color, backgroundColor: overallStatus.bg }}>
            {overallStatus.label}
          </span>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Company', value: detail.companyName },
              { label: 'Contact Person', value: detail.contactPersonName },
              { label: 'Required Delivery', value: detail.requiredDeliveryDate || '—' },
              { label: 'Expected Delivery', value: detail.expectedDeliveryDate || 'Pending' },
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
                  <InfoRow label="Company Name" value={detail.companyName} />
                  <InfoRow label="Contact Person" value={detail.contactPersonName} />
                  <InfoRow label="Designation" value={detail.designation} />
                  <InfoRow label="Email" value={detail.email} />
                  <InfoRow label="Phone" value={detail.primaryPhone} />
                </div>
              </div>

              {/* Gifting Details */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Gifting Details</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <InfoRow label="Purpose of Gifting" value={detail.purposeOfGifting} />
                  <InfoRow label="Estimated Quantity" value={detail.estimatedQuantity} />
                  <InfoRow label="Delivery Type" value={detail.deliveryType} />
                  <InfoRow label="Required Delivery Date" value={detail.requiredDeliveryDate} />
                  <InfoRow label="Expected Delivery Date" value={detail.expectedDeliveryDate || 'Pending'} />
                </div>
                {detail.specificNotes && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Specific Notes</p>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{detail.specificNotes}</p>
                  </div>
                )}
              </div>

              {/* Quotation History */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MdHistory size={18} style={{ color: '#068BC9' }} />
                  <h3 className="text-sm font-semibold text-gray-700">Quotation History</h3>
                </div>

                {quotations.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No quotations uploaded yet.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs text-gray-400 font-medium pb-2">#</th>
                        <th className="text-left text-xs text-gray-400 font-medium pb-2">Status</th>
                        <th className="text-left text-xs text-gray-400 font-medium pb-2">Rejection Reason</th>
                        <th className="text-left text-xs text-gray-400 font-medium pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotations.map((q, i) => {
                        const s = statusConfig[q.status] || statusConfig.pending;
                        return (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-3 text-sm text-gray-700">Q-{q.id}</td>
                            <td className="py-3">
                              <span className="text-xs font-medium px-2 py-1 rounded-full"
                                style={{ color: s.color, backgroundColor: s.bg }}>
                                {s.label}
                              </span>
                            </td>
                            <td className="py-3 text-xs text-gray-500">{q.rejectedReason || '—'}</td>
                            <td className="py-3">
                              {isCompanyUser && q.status === 'initialized' ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleAccept(q.id)}
                                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                    <MdCheckCircle size={13} />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectClick(q.id)}
                                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
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

              {/* POD File */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">POD File</h3>
                {detail.podCopy ? (
                  <button
                    onClick={() => window.open(detail.podCopy, '_blank')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: '#068BC9' }}>
                    <MdDownload size={16} />
                    Download POD
                  </button>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-3">No POD file uploaded yet.</p>
                )}
              </div>

              {/* Admin Actions — admin/CRM only */}
              {isAdmin && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Admin Actions</h3>
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Upload Quotation</p>
                    <label
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors cursor-pointer">
                      <MdUpload size={16} />
                      {uploading ? 'Uploading...' : 'Upload Quotation'}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                        onChange={handleUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Set Expected Delivery Date</p>
                    <input
                      type="date"
                      defaultValue={detail.expectedDeliveryDate}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-blue-300"
                    />
                  </div>
                  <button
                    className="w-full py-2.5 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: '#068BC9' }}>
                    Update
                  </button>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Timeline</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Request Created', date: detail.createdAt ? detail.createdAt.split('T')[0] : '', done: true },
                    { label: 'Quotation Uploaded', date: quotations.length > 0 ? quotations[quotations.length - 1].createdAt?.split('T')[0] : '', done: quotations.length > 0 },
                    { label: 'Quotation Accepted', date: '', done: detail.quotationStatus === 'accepted' },
                    { label: 'Delivered', date: detail.deliveryDate ? detail.deliveryDate.split('T')[0] : '', done: !!detail.deliveryDate },
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
            <p className="text-xs text-gray-500 mb-3">Please provide a reason for rejection (mandatory)</p>
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