import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SmartSidebar from '../components/SmartSidebar';
import { MdArrowBack, MdDownload, MdUpload, MdStar, MdStarBorder } from 'react-icons/md';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';

const ADMIN_ROLES = ['super_admin', 'crm_user'];
const COMPANY_ROLES = ['company_user', 'company_admin', 'company_crm_user'];
const BRAND = '#068BC9';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const fullFileUrl = (path) => path ? (path.startsWith('http') ? path : `${API_BASE_URL}${path}`) : null;

const WORKFLOW_STEPS = [
  { key: 'requirement_submitted', label: 'Requirement Submitted', icon: '📋' },
  { key: 'under_review', label: 'Under Review', icon: '🔍' },
  { key: 'quotation_shared', label: 'Quotation Shared', icon: '📄' },
  { key: 'quotation_accepted', label: 'Quotation Accepted', icon: '✅' },
  { key: 'awaiting_po', label: 'Awaiting PO', icon: '📝' },
  { key: 'sample_approved', label: 'Sample Approved', icon: '🎨' },
  { key: 'production', label: 'Production', icon: '🏭' },
  { key: 'quality_check', label: 'Quality Check', icon: '🔬' },
  { key: 'dispatched', label: 'Dispatched', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '📦' },
  { key: 'feedback_received', label: 'Feedback Received', icon: '⭐' },
];

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
  const [completedStepLabel, setCompletedStepLabel] = useState(null);
  const [animatedStep, setAnimatedStep] = useState(null);
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

  useEffect(() => { fetchDetail(); }, [id]);
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
      const newIndex = WORKFLOW_STEPS.findIndex(s => s.key === status);
      setAnimatedStep(newIndex);
      setCompletedStepLabel(WORKFLOW_STEPS[newIndex]?.label);
      setTimeout(() => { setAnimatedStep(null); setCompletedStepLabel(null); }, 2500);
      fetchDetail();
    } catch { setToast('Failed to update status'); }
  };

  const uploadFile = async (file, type) => {
    const fd = new FormData(); fd.append('file', file);
    setUploading(true);
    try {
      await api.post(`/api/corporate-giftings/${id}/upload-${type}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setToast('File uploaded');
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
    } catch { setToast('Failed to accept'); }
  };

  const rejectQuotation = async () => {
    try {
      await api.post(`/api/corporate-giftings/${id}/quotations/${selectedQuotationId}/reject`, { reason: rejectReason });
      setToast('Quotation rejected');
      setShowRejectModal(false);
      fetchDetail();
    } catch { setToast('Failed to reject'); }
  };

  const currentStepIndex = detail ? WORKFLOW_STEPS.findIndex(s => s.key === detail.workflowStatus) : 0;
  const allDone = detail?.workflowStatus === 'feedback_received';

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
      <div className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarExpanded ? '240px' : '64px', transition: 'margin-left 0.3s ease' }}>
        {toast && <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">{toast}</div>}

        {/* Step completion animation */}
        {completedStepLabel && (
          <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#22c55e', color: 'white', borderRadius: '50px', padding: '12px 24px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 24px rgba(34,197,94,0.4)', animation: 'slideUp 0.4s ease' }}>
            <span style={{ fontSize: '20px' }}>🎉</span>
            <div>
              <p style={{ fontSize: '11px', opacity: 0.85, margin: 0 }}>Status Updated</p>
              <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{completedStepLabel}</p>
            </div>
            <span style={{ fontSize: '18px' }}>✓</span>
            <style>{`@keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3">
          <button onClick={() => navigate('/gifting/list')} className="p-1.5 rounded-lg hover:bg-gray-100">
            <MdArrowBack size={20} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-800">{detail.serviceRequestId}</h1>
            <p className="text-xs text-gray-400">{detail.companyName} · Corporate Gifting</p>
          </div>
          <span className="ml-auto text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: allDone ? '#dcfce7' : '#e0f2fe', color: allDone ? '#16a34a' : BRAND }}>
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

          {/* DETAILS */}
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

          {/* WORKFLOW */}
          {activeTab === 'workflow' && (
            <div>
              <style>{`
                @keyframes glowPulse { 0%,100%{box-shadow:0 0 0 0 rgba(6,139,201,0.5);} 50%{box-shadow:0 0 0 10px rgba(6,139,201,0);} }
                @keyframes popIn { 0%{transform:scale(0.5);opacity:0;} 70%{transform:scale(1.15);} 100%{transform:scale(1);opacity:1;} }
                .node-active { animation: glowPulse 2s ease-in-out infinite; }
                .node-done { animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
              `}</style>

              {/* Hero card */}
              <div style={{ borderRadius:'20px', padding:'20px 24px', marginBottom:'20px', background: allDone?'#f0fdf4':'#eff6ff', border:`1.5px solid ${allDone?'#86efac':'#bfdbfe'}`, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:-20, right:-20, width:120, height:120, borderRadius:'50%', background: allDone?'rgba(34,197,94,0.08)':'rgba(6,139,201,0.08)' }} />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ margin:0, fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color: allDone?'#16a34a':'#2563eb' }}>Order Journey</p>
                    <p style={{ margin:'6px 0 4px', fontSize:'20px', fontWeight:900, color: allDone?'#15803d':'#1e40af' }}>
                      {WORKFLOW_STEPS.find(s=>s.key===detail.workflowStatus)?.icon} {WORKFLOW_STEPS.find(s=>s.key===detail.workflowStatus)?.label}
                    </p>
                    <p style={{ margin:0, fontSize:'12px', color:'#64748b' }}>{currentStepIndex} of {WORKFLOW_STEPS.length-1} steps completed</p>
                  </div>
                  <div style={{ fontSize:'42px', fontWeight:900, color: allDone?'#16a34a':'#1e40af' }}>
                    {Math.round((currentStepIndex/(WORKFLOW_STEPS.length-1))*100)}%
                  </div>
                </div>
                <div style={{ marginTop:'14px', height:'6px', background: allDone?'rgba(34,197,94,0.2)':'rgba(6,139,201,0.15)', borderRadius:'99px', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:'99px', background: allDone?'#22c55e':'#068BC9', width:`${Math.round((currentStepIndex/(WORKFLOW_STEPS.length-1))*100)}%`, transition:'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
                </div>
              </div>

              {/* Vertical timeline */}
              <div style={{ background:'white', borderRadius:'20px', border:'1px solid #f1f5f9', padding:'24px 20px' }}>
                {WORKFLOW_STEPS.map((step, i) => {
                  const isDone = allDone ? true : i < currentStepIndex;
                  const isCurrent = i === currentStepIndex && !allDone;
                  const isPending = !isDone && !isCurrent;
                  const isLast = i === WORKFLOW_STEPS.length - 1;
                  return (
                    <div key={step.key} style={{ display:'flex', gap:'16px' }}>
                      {/* Left: node + connector line */}
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                        <div className={isDone?'node-done':isCurrent?'node-active':''} style={{
                          width:'44px', height:'44px', borderRadius:'50%',
                          display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px',
                          background: isDone?'#22c55e':isCurrent?'#068BC9':'#f8fafc',
                          border:`2.5px solid ${isDone?'#86efac':isCurrent?'#93c5fd':'#e2e8f0'}`,
                          opacity: isPending?0.35:1,
                          flexShrink:0,
                          transition:'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                          boxShadow: isDone?'0 2px 8px rgba(34,197,94,0.3)':isCurrent?'0 4px 14px rgba(6,139,201,0.4)':'none'
                        }}>
                          {isDone ? <span style={{color:'white',fontWeight:800,fontSize:'16px'}}>✓</span> : <span>{step.icon}</span>}
                        </div>
                        {/* Connecting line */}
                        {!isLast && (
                          <div style={{
                            width:'2.5px', flex:1, minHeight:'24px',
                            margin:'4px 0',
                            borderRadius:'99px',
                            background: isDone?'#22c55e':'#e5e7eb',
                            transition:'background 0.5s ease'
                          }} />
                        )}
                      </div>

                      {/* Right: label + button */}
                      <div style={{ flex:1, paddingTop:'10px', paddingBottom: isLast?0:'16px' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <div>
                            <p style={{ margin:0, fontSize:'13px', fontWeight: isCurrent?700:isDone?500:400, color: isDone?'#15803d':isCurrent?'#1e40af':'#94a3b8', transition:'color 0.3s ease' }}>{step.label}</p>
                            {isCurrent && <p style={{ margin:'3px 0 0', fontSize:'11px', color:'#3b82f6', display:'flex', alignItems:'center', gap:'4px' }}>
                              <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#3b82f6', display:'inline-block' }} /> In progress
                            </p>}
                            {isDone && i === currentStepIndex-1 && !allDone && <p style={{ margin:'3px 0 0', fontSize:'11px', color:'#22c55e' }}>Just completed ✨</p>}
                          </div>
                          {isCurrent && isAdmin && i < WORKFLOW_STEPS.length-1 && (
                            <button onClick={() => updateWorkflowStatus(WORKFLOW_STEPS[i+1].key)}
                              style={{ fontSize:'11px', padding:'6px 14px', borderRadius:'9px', color:'white', background:'#068BC9', border:'none', cursor:'pointer', fontWeight:700, boxShadow:'0 2px 8px rgba(6,139,201,0.35)', whiteSpace:'nowrap', flexShrink:0 }}>
                              Next →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'quotations' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">Quotations</p>
                {isAdmin && (
                  <label className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg text-white cursor-pointer" style={{ backgroundColor: BRAND }}>
                    <MdUpload size={14} /> Upload Quotation
                    <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={e => {
                      if (e.target.files[0]) {
                        const fd = new FormData(); fd.append('file', e.target.files[0]);
                        api.post(`/api/corporate-giftings/${id}/quotations`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
                          .then(() => { setToast('Quotation uploaded'); fetchDetail(); })
                          .catch(() => setToast('Upload failed'));
                      }
                    }} />
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
                        <p className="text-sm font-medium text-gray-700">Quotation #{quotations.length - i}</p>
                        <p className="text-xs text-gray-400">{q.createdAt?.split('T')[0]}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${q.status === 'accepted' ? 'bg-green-100 text-green-700' : q.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{q.status}</span>
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

          {/* PO */}
          {activeTab === 'po' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Purchase Order</p>
              {detail.poFile ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-gray-700">PO Document</p>
                  <a href={fullFileUrl(detail.poFile)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: BRAND }}>
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

          {/* SAMPLE */}
          {activeTab === 'sample' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">Sample Image</p>
                {isAdmin && (
                  <label className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg text-white cursor-pointer" style={{ backgroundColor: BRAND }}>
                    <MdUpload size={14} /> {detail.sampleImage ? 'Replace' : 'Upload Sample'}
                    <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'sample')} />
                  </label>
                )}
              </div>
              {detail.sampleImage ? (
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden border border-gray-200" style={{ maxWidth: '480px' }}>
                    <img src={fullFileUrl(detail.sampleImage)} alt="Sample" style={{ width: '100%', display: 'block' }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={fullFileUrl(detail.sampleImage)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium border border-gray-200 text-gray-700 hover:bg-gray-50">
                      <MdDownload size={16} /> Download Sample
                    </a>
                    {isCompanyUser && (
                      <button onClick={() => updateWorkflowStatus('sample_approved')} className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: '#22c55e' }}>
                        ✓ Approve Sample
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-400 mb-2">No sample image uploaded yet</p>
                  <p className="text-xs text-gray-300">CRM will upload the approved sample image here</p>
                </div>
              )}
            </div>
          )}

          {/* DISPATCH */}
          {activeTab === 'dispatch' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Dispatch Details</p>
              {detail.dispatchDetails ? (
                <div className="space-y-3">
                  <InfoRow label="Dispatch Details" value={detail.dispatchDetails} />
                  <InfoRow label="Tracking Number" value={detail.trackingNumber} />
                </div>
              ) : isAdmin ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Dispatch Details</label>
                    <textarea value={dispatchDetails} onChange={e => setDispatchDetails(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-blue-400" rows={3} placeholder="Enter dispatch details..." />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Tracking Number</label>
                    <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-blue-400" placeholder="Enter tracking number" />
                  </div>
                  <button onClick={submitDispatch} className="px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: BRAND }}>Save Dispatch Details</button>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Dispatch details not yet updated</p>
              )}
            </div>
          )}

          {/* POD */}
          {activeTab === 'pod' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Proof of Delivery</p>
              {detail.podCopy ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-gray-700">POD Document</p>
                  <a href={fullFileUrl(detail.podCopy)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: BRAND }}>
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

          {/* FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Feedback</p>
              {detail.feedback ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400">Overall Experience</p>
                    <div className="flex items-center gap-1 mt-1">
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
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">2. Product Quality</p>
                    <div className="flex gap-2 flex-wrap">
                      {['Excellent', 'Good', 'Average', 'Poor'].map(opt => (
                        <button key={opt} onClick={() => setFeedbackProductQuality(opt)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${feedbackProductQuality === opt ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}>{opt}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">3. Delivery Experience</p>
                    <div className="flex gap-2">
                      {['Delivered on Time', 'Delayed'].map(opt => (
                        <button key={opt} onClick={() => setFeedbackDelivery(opt)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${feedbackDelivery === opt ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}>{opt}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">4. Would you recommend ProDiligix?</p>
                    <div className="flex gap-2">
                      {['Yes', 'No'].map(opt => (
                        <button key={opt} onClick={() => setFeedbackRecommend(opt)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${feedbackRecommend === opt ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}>{opt}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">5. Comments or Suggestions (Optional)</p>
                    <textarea value={feedback} onChange={e => setFeedback(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-blue-400" rows={4} placeholder="Share your experience..." />
                  </div>
                  <button onClick={submitFeedback} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: BRAND }}>Submit Feedback</button>
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
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-red-400 mb-4" rows={3} placeholder="Reason for rejection..." />
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
