import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SmartSidebar from '../components/SmartSidebar';
import { MdArrowBack, MdDownload, MdUpload, MdCheckCircle, MdCancel, MdStar, MdStarBorder, MdLocalShipping } from 'react-icons/md';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';

const ADMIN_ROLES = ['super_admin', 'crm_user'];
const COMPANY_ROLES = ['company_user', 'company_admin', 'company_crm_user'];
const BRAND = '#068BC9';

const WORKFLOW_STEPS = [
  { key: 'requirement_submitted', label: 'Requirement Submitted' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'quotation_shared', label: 'Quotation Shared' },
  { key: 'quotation_accepted', label: 'Quotation Accepted' },
  { key: 'awaiting_po', label: 'Awaiting PO' },
  { key: 'sample_approved', label: 'Sample Approved' },
  { key: 'production', label: 'Production' },
  { key: 'quality_check', label: 'Quality Check' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'feedback_received', label: 'Feedback Received' },
];

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const fullFileUrl = (path) => path ? (path.startsWith('http') ? path : `${API_BASE_URL}${path}`) : null;

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
  const [activeTab, setActiveTab] = useState('details');
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackProductQuality, setFeedbackProductQuality] = useState('');
  const [feedbackDelivery, setFeedbackDelivery] = useState('');
  const [feedbackRecommend, setFeedbackRecommend] = useState('');
  const [dispatchDetails, setDispatchDetails] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const user = getCurrentUser();
  const isAdmin = user && ADMIN_ROLES.includes(user.role);
  const isCompanyUser = user && COMPANY_ROLES.includes(user.role);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const fetchDetail = async () => {
    try {
      const [detailRes, quotationsRes] = await Promise.all([
        api.get(`/api/corporate-giftings/${id}`),
        api.get(`/api/corporate-giftings/${id}/quotations`),
      ]);
      setDetail(detailRes.data);
      setQuotations(quotationsRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateWorkflowStatus = async (status) => {
    try {
      await api.patch(`/api/corporate-giftings/${id}/workflow-status`, { workflowStatus: status });
      setToast('Status updated');
      fetchDetail();
    } catch { setToast('Failed to update status'); }
  };

  const uploadFile = async (file, type) => {
    const fd = new FormData(); fd.append('file', file);
    setUploading(true);
    try {
      await api.post(`/api/corporate-giftings/${id}/upload-${type}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setToast(`${type.toUpperCase()} uploaded`);
      fetchDetail();
    } catch { setToast('Upload failed'); }
    finally { setUploading(false); }
  };

  const submitDispatch = async () => {
    try {
      await api.patch(`/api/corporate-giftings/${id}/dispatch`, { dispatchDetails, trackingNumber });
      setToast('Dispatch details saved');
      fetchDetail();
    } catch { setToast('Failed to save dispatch details'); }
  };

  const submitFeedback = async () => {
    try {
      await api.post(`/api/corporate-giftings/${id}/feedback`, { feedback, feedbackRating, productQuality: feedbackProductQuality, delivery: feedbackDelivery, recommend: feedbackRecommend });
      setToast('Feedback submitted!');
      fetchDetail();
    } catch { setToast('Failed to submit feedback'); }
  };

  const acceptQuotation = async (qId) => {
    try {
      await api.post(`/api/corporate-giftings/${id}/quotations/${qId}/accept`);
      setToast('Quotation accepted');
      fetchDetail();
    } catch { setToast('Failed to accept quotation'); }
  };

  const rejectQuotation = async () => {
    try {
      await api.post(`/api/corporate-giftings/${id}/quotations/${selectedQuotationId}/reject`, { reason: rejectReason });
      setToast('Quotation rejected');
      setShowRejectModal(false);
      fetchDetail();
    } catch { setToast('Failed to reject quotation'); }
  };

  const currentStepIndex = detail ? WORKFLOW_STEPS.findIndex(s => s.key === detail.workflowStatus) : 0;

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'workflow', label: 'Status' },
    { key: 'quotations', label: 'Quotations' },
    { key: 'po', label: 'Purchase Order' },
    { key: 'sample', label: 'Sample' },
    { key: 'dispatch', label: 'Dispatch' },
    { key: 'pod', label: 'POD' },
    { key: 'feedback', label: 'Feedback' },
  ];

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  if (!detail) return <div className="flex items-center justify-center h-screen text-gray-400">Not found</div>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SmartSidebar onToggle={setSidebarExpanded} />
      <div className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarExpanded ? "240px" : "64px", transition: "margin-left 0.3s ease" }}>
        {toast && <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">{toast}</div>}

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3">
          <button onClick={() => navigate('/gifting/list')} className="p-1.5 rounded-lg hover:bg-gray-100">
            <MdArrowBack size={20} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-800">{detail.serviceRequestId}</h1>
            <p className="text-xs text-gray-400">{detail.companyName} · Corporate Gifting</p>
          </div>
          <span className="ml-auto text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#e0f2fe', color: BRAND }}>
            {WORKFLOW_STEPS.find(s => s.key === detail.workflowStatus)?.label || detail.workflowStatus}
          </span>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-100 bg-white flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* DETAILS TAB */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Contact Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Company" value={detail.companyName} />
                  <InfoRow label="Contact Person" value={detail.contactPersonName} />
                  <InfoRow label="Designation" value={detail.designation} />
                  <InfoRow label="Email" value={detail.email} />
                  <InfoRow label="Phone" value={detail.primaryPhone} />
                  <InfoRow label="Website" value={detail.companyWebsite} />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Gifting Requirements</p>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Purpose" value={detail.purposeOfGifting} />
                  <InfoRow label="Quantity" value={detail.estimatedQuantity} />
                  <InfoRow label="Delivery Type" value={detail.deliveryType} />
                  <InfoRow label="Required By" value={detail.requiredDeliveryDate} />
                  <InfoRow label="Specific Notes" value={detail.specificNotes} />
                </div>
              </div>
            </div>
          )}

          {/* WORKFLOW TAB */}
          {activeTab === 'workflow' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-6">Workflow Progress</p>
              <div className="space-y-3">
                {WORKFLOW_STEPS.map((step, i) => (
                  <div key={step.key} className={`flex items-center gap-3 p-3 rounded-lg ${i === currentStepIndex ? 'bg-blue-50 border border-blue-200' : i < currentStepIndex ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${i < currentStepIndex ? 'bg-green-500' : i === currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'}`}>
                      {i < currentStepIndex ? '✓' : i + 1}
                    </div>
                    <span className={`text-sm font-medium ${i === currentStepIndex ? 'text-blue-700' : i < currentStepIndex ? 'text-green-700' : 'text-gray-400'}`}>{step.label}</span>
                    {i === currentStepIndex && isAdmin && i < WORKFLOW_STEPS.length - 1 && (
                      <button onClick={() => updateWorkflowStatus(WORKFLOW_STEPS[i + 1].key)}
                        className="ml-auto text-xs px-3 py-1 rounded-lg text-white" style={{ backgroundColor: BRAND }}>
                        Move to Next →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUOTATIONS TAB */}
          {activeTab === 'quotations' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">Quotations</p>
                {isAdmin && (
                  <label className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg text-white cursor-pointer" style={{ backgroundColor: BRAND }}>
                    <MdUpload size={14} /> Upload Quotation
                    <input type="file" accept=".pdf" className="hidden" onChange={e => { if (e.target.files[0]) { const fd = new FormData(); fd.append('file', e.target.files[0]); api.post(`/api/corporate-giftings/${id}/quotations`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(() => { setToast('Quotation uploaded'); fetchDetail(); }).catch(() => setToast('Upload failed')); } }} />
                  </label>
                )}
              </div>
              {quotations.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No quotations uploaded yet</p>
              ) : (
                <div className="space-y-3">
                  {quotations.map((q, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Quotation #{i + 1}</p>
                        <p className="text-xs text-gray-400">{q.createdAt?.split('T')[0]}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${q.status === 'accepted' ? 'bg-green-100 text-green-700' : q.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {q.status}
                        </span>
                        {q.fileUrl && <a href={fullFileUrl(q.fileUrl)} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded-lg text-white" style={{ backgroundColor: BRAND }}>View</a>}
                        {isCompanyUser && q.status === 'initialized' && (
                          <>
                            <button onClick={() => acceptQuotation(q.id)} className="text-xs px-2 py-1 rounded-lg bg-green-500 text-white">Accept</button>
                            <button onClick={() => { setSelectedQuotationId(q.id); setShowRejectModal(true); }} className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white">Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PO TAB */}
          {activeTab === 'po' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Purchase Order</p>
              {detail.poFile ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-gray-700">PO Document</p>
                  <a href={fullFileUrl(detail.poFile)} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: BRAND }}>
                    <MdDownload size={14} /> Download PO
                  </a>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 mb-4">No PO uploaded yet</p>
                  {(isAdmin || isCompanyUser) && (
                    <label className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg text-white cursor-pointer inline-flex mx-auto" style={{ backgroundColor: BRAND }}>
                      <MdUpload size={16} /> Upload PO
                      <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'po')} />
                    </label>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SAMPLE TAB */}
          {activeTab === 'sample' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Sample Image</p>
              {detail.sampleImage ? (
                <div className="space-y-3">
                  <img src={fullFileUrl(detail.sampleImage)} alt="Sample" className="max-w-sm rounded-lg border border-gray-200" />
                  {isAdmin && (
                    <label className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg text-white cursor-pointer w-fit" style={{ backgroundColor: BRAND }}>
                      <MdUpload size={14} /> Replace Sample
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'sample')} />
                    </label>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 mb-4">No sample image uploaded yet</p>
                  {isAdmin && (
                    <label className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg text-white cursor-pointer inline-flex mx-auto" style={{ backgroundColor: BRAND }}>
                      <MdUpload size={16} /> Upload Sample Image
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'sample')} />
                    </label>
                  )}
                </div>
              )}
            </div>
          )}

          {/* DISPATCH TAB */}
          {activeTab === 'dispatch' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Dispatch Details</p>
              {detail.dispatchDetails ? (
                <div className="space-y-3">
                  <InfoRow label="Dispatch Details" value={detail.dispatchDetails} />
                  <InfoRow label="Tracking Number" value={detail.trackingNumber} />
                  {isAdmin && (
                    <button onClick={() => { setDispatchDetails(detail.dispatchDetails); setTrackingNumber(detail.trackingNumber); }} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600">Edit</button>
                  )}
                </div>
              ) : isAdmin ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Dispatch Details</label>
                    <textarea value={dispatchDetails} onChange={e => setDispatchDetails(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-blue-400" rows={3} placeholder="Enter dispatch details, courier name, etc." />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Tracking Number</label>
                    <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-blue-400" placeholder="Enter tracking number" />
                  </div>
                  <button onClick={submitDispatch} className="px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: BRAND }}>
                    Save Dispatch Details
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Dispatch details not yet updated</p>
              )}
            </div>
          )}

          {/* POD TAB */}
          {activeTab === 'pod' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Proof of Delivery</p>
              {detail.podCopy ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-gray-700">POD Document</p>
                  <a href={fullFileUrl(detail.podCopy)} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: BRAND }}>
                    <MdDownload size={14} /> Download POD
                  </a>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 mb-4">No POD uploaded yet</p>
                  {isAdmin && (
                    <label className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg text-white cursor-pointer inline-flex mx-auto" style={{ backgroundColor: BRAND }}>
                      <MdUpload size={16} /> Upload POD
                      <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'pod')} />
                    </label>
                  )}
                </div>
              )}
            </div>
          )}

          {/* FEEDBACK TAB */}
          {activeTab === 'feedback' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Feedback</p>
              {detail.feedback ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Overall Experience</p>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} style={{ color: star <= (detail.feedbackRating || 0) ? '#f59e0b' : '#d1d5db' }}>
                          {star <= (detail.feedbackRating || 0) ? <MdStar size={22} /> : <MdStarBorder size={22} />}
                        </span>
                      ))}
                      <span className="text-sm text-gray-500 ml-1">{detail.feedbackRating}/5</span>
                    </div>
                  </div>
                  {detail.feedbackProductQuality && <div><p className="text-xs text-gray-400">Product Quality</p><p className="text-sm font-medium text-gray-700">{detail.feedbackProductQuality}</p></div>}
                  {detail.feedbackDelivery && <div><p className="text-xs text-gray-400">Delivery Experience</p><p className="text-sm font-medium text-gray-700">{detail.feedbackDelivery}</p></div>}
                  {detail.feedbackRecommend && <div><p className="text-xs text-gray-400">Would Recommend</p><p className="text-sm font-medium text-gray-700">{detail.feedbackRecommend}</p></div>}
                  {detail.feedback && <div><p className="text-xs text-gray-400">Comments</p><p className="text-sm text-gray-700">{detail.feedback}</p></div>}
                </div>
              ) : isCompanyUser ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">1. Overall Experience</p>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} onClick={() => setFeedbackRating(star)} style={{ color: star <= feedbackRating ? '#f59e0b' : '#d1d5db' }}>
                          {star <= feedbackRating ? <MdStar size={28} /> : <MdStarBorder size={28} />}
                        </button>
                      ))}
                      {feedbackRating > 0 && <span className="text-sm text-gray-500 ml-2">{feedbackRating}/5</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">2. Product Quality</p>
                    <div className="flex gap-2 flex-wrap">
                      {['Excellent', 'Good', 'Average', 'Poor'].map(opt => (
                        <button key={opt} onClick={() => setFeedbackProductQuality(opt)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${feedbackProductQuality === opt ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">3. Delivery Experience</p>
                    <div className="flex gap-2">
                      {['Delivered on Time', 'Delayed'].map(opt => (
                        <button key={opt} onClick={() => setFeedbackDelivery(opt)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${feedbackDelivery === opt ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">4. Would you recommend ProDiligix?</p>
                    <div className="flex gap-2">
                      {['Yes', 'No'].map(opt => (
                        <button key={opt} onClick={() => setFeedbackRecommend(opt)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${feedbackRecommend === opt ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">5. Comments or Suggestions (Optional)</p>
                    <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-blue-400" rows={4} placeholder="Share your experience..." />
                  </div>
                  <button onClick={submitFeedback} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: BRAND }}>
                    Submit Feedback
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">No feedback submitted yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <p className="text-sm font-semibold text-gray-700 mb-3">Reject Quotation</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-red-400 mb-4" rows={3} placeholder="Reason for rejection..." />
            <div className="flex gap-2">
              <button onClick={rejectQuotation} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm">Reject</button>
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
