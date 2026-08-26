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
  { key: 'event_submitted', label: 'Event Details Submitted', icon: '📋' },
  { key: 'under_review', label: 'Under Review', icon: '🔍' },
  { key: 'quotation_shared', label: 'Quotation Shared', icon: '📄' },
  { key: 'quotation_accepted', label: 'Quotation Accepted', icon: '✅' },
  { key: 'awaiting_po', label: 'Awaiting PO', icon: '📝' },
  { key: 'design_approved', label: 'Design Approved', icon: '🎨' },
  { key: 'under_printing', label: 'Under Printing', icon: '🖨️' },
  { key: 'setup_in_progress', label: 'Setup in Progress', icon: '🔧' },
  { key: 'event_execution', label: 'Event Execution', icon: '🎤' },
  { key: 'completed', label: 'Completed', icon: '🏁' },
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

export default function EventsDetail() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');
  const [completedStepLabel, setCompletedStepLabel] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [respondentName, setRespondentName] = useState('');
  const [designation, setDesignation] = useState('');
  const [planningRating, setPlanningRating] = useState(0);
  const [designRating, setDesignRating] = useState(0);
  const [printingRating, setPrintingRating] = useState(0);
  const [venueRating, setVenueRating] = useState(0);
  const [executionRating, setExecutionRating] = useState(0);
  const [crmRating, setCrmRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [requirementsFulfilled, setRequirementsFulfilled] = useState('');
  const [onSchedule, setOnSchedule] = useState('');
  const [likedMost, setLikedMost] = useState('');
  const [improvements, setImprovements] = useState('');
  const [recommendationScore, setRecommendationScore] = useState('');
  const [testimonialPermission, setTestimonialPermission] = useState('');
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
        api.get(`/api/events/${id}`),
        api.get(`/api/events/${id}/quotations`),
      ]);
      setDetail(detailRes.data);
      setQuotations(quotationsRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateWorkflowStatus = async (status) => {
    try {
      await api.patch(`/api/events/${id}/workflow-status`, { workflowStatus: status });
      const newIndex = WORKFLOW_STEPS.findIndex(s => s.key === status);
      setCompletedStepLabel(WORKFLOW_STEPS[newIndex]?.label);
      setTimeout(() => setCompletedStepLabel(null), 2500);
      fetchDetail();
    } catch { setToast('Failed to update status'); }
  };

  const uploadFile = async (file, type) => {
    const fd = new FormData(); fd.append('file', file);
    setUploading(true);
    try {
      await api.post(`/api/events/${id}/upload-${type}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setToast('File uploaded');
      fetchDetail();
    } catch { setToast('Upload failed'); }
    finally { setUploading(false); }
  };

  const submitFeedback = async () => {
    try {
      await api.post(`/api/events/${id}/feedback`, {
        feedback, feedbackRating, respondentName, designation,
        planningRating, designRating, printingRating, venueRating,
        executionRating, crmRating, timelinessRating, valueRating,
        requirementsFulfilled, onSchedule, likedMost, improvements,
        recommendationScore, testimonialPermission
      });
      setToast('Feedback submitted!');
      fetchDetail();
    } catch { setToast('Failed to submit feedback'); }
  };

  const acceptQuotation = async (qId) => {
    try {
      await api.post(`/api/events/${id}/quotations/${qId}/accept`);
      setToast('Quotation accepted');
      fetchDetail();
    } catch { setToast('Failed to accept'); }
  };

  const rejectQuotation = async () => {
    try {
      await api.post(`/api/events/${id}/quotations/${selectedQuotationId}/reject`, { reason: rejectReason });
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
    { key: 'design', label: 'Design' },
    { key: 'feedback', label: 'Feedback' },
  ];

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  if (!detail) return <div className="flex items-center justify-center h-screen text-gray-400">Not found</div>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SmartSidebar onToggle={setSidebarExpanded} />
      <div className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarExpanded ? '240px' : '64px', transition: 'margin-left 0.3s ease' }}>
        {toast && <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg">{toast}</div>}
        {completedStepLabel && (
          <div style={{ position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)', backgroundColor:'#22c55e', color:'white', borderRadius:'50px', padding:'12px 24px', zIndex:100, display:'flex', alignItems:'center', gap:'10px', boxShadow:'0 8px 24px rgba(34,197,94,0.4)', animation:'slideUp 0.4s ease' }}>
            <span style={{ fontSize:'20px' }}>🎉</span>
            <div>
              <p style={{ fontSize:'11px', opacity:0.85, margin:0 }}>Status Updated</p>
              <p style={{ fontSize:'14px', fontWeight:700, margin:0 }}>{completedStepLabel}</p>
            </div>
            <span style={{ fontSize:'18px' }}>✓</span>
            <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
          </div>
        )}

        <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3">
          <button onClick={() => navigate('/events/list')} className="p-1.5 rounded-lg hover:bg-gray-100">
            <MdArrowBack size={20} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-800">{detail.serviceRequestId}</h1>
            <p className="text-xs text-gray-400">{detail.businessName} · Event Management</p>
          </div>
          <span className="ml-auto text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#e0f2fe', color: BRAND }}>
            {WORKFLOW_STEPS.find(s => s.key === detail.workflowStatus)?.label || detail.workflowStatus || 'Event Submitted'}
          </span>
        </div>

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
                <p className="text-sm font-semibold text-gray-700 mb-4">Event Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Company" value={detail.businessName} />
                  <InfoRow label="Contact Person" value={detail.contactPersonName} />
                  <InfoRow label="Event Type" value={detail.eventType} />
                  <InfoRow label="Event Date" value={detail.eventDate} />
                  <InfoRow label="Participants" value={detail.participants} />
                  <InfoRow label="Duration" value={detail.eventDuration} />
                  <InfoRow label="Location" value={detail.location} />
                  <InfoRow label="Venue" value={detail.venue} />
                  <InfoRow label="Budget" value={detail.budget ? `₹${detail.budget}` : null} />
                  <InfoRow label="Notes" value={detail.eventNotes} />
                </div>
              </div>
            </div>
          )}

          {/* WORKFLOW */}
          {activeTab === 'workflow' && (
            <div>
              {/* Progress header */}
              <div style={{ background:'linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)', borderRadius:'20px', border:'1px solid #bae6fd', padding:'20px 24px', marginBottom:'16px' }}>
                <p style={{ margin:0, fontSize:'11px', fontWeight:700, color:'#0369a1', letterSpacing:'1.5px', textTransform:'uppercase', opacity:0.7 }}>ORDER JOURNEY</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'8px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <span style={{ fontSize:'22px' }}>{WORKFLOW_STEPS[currentStepIndex]?.icon || '📋'}</span>
                    <div>
                      <p style={{ margin:0, fontSize:'18px', fontWeight:800, color:'#0c4a6e' }}>{WORKFLOW_STEPS[currentStepIndex]?.label || 'In Progress'}</p>
                      <p style={{ margin:0, fontSize:'12px', color:'#64748b' }}>{currentStepIndex} of {WORKFLOW_STEPS.length-1} steps completed</p>
                    </div>
                  </div>
                  <span style={{ fontSize:'36px', fontWeight:900, color: currentStepIndex === WORKFLOW_STEPS.length-1 ? '#22c55e' : '#068BC9', opacity:0.85 }}>
                    {Math.round((currentStepIndex/(WORKFLOW_STEPS.length-1))*100)}%
                  </span>
                </div>
                <div style={{ marginTop:'12px', height:'6px', background:'rgba(255,255,255,0.5)', borderRadius:'99px', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:'99px', background: currentStepIndex === WORKFLOW_STEPS.length-1 ? '#22c55e':'#068BC9', width:`${Math.round((currentStepIndex/(WORKFLOW_STEPS.length-1))*100)}%`, transition:'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
                </div>
              </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-6">Workflow Progress</p>
              <div style={{ padding:'8px 4px' }}>
                {(() => {
                  const COLS = 4;
                  const rows = [];
                  for (let r = 0; r < Math.ceil(WORKFLOW_STEPS.length / COLS); r++) {
                    rows.push(WORKFLOW_STEPS.slice(r * COLS, r * COLS + COLS));
                  }
                  return rows.map((rowSteps, rowIdx) => {
                    const isEvenRow = rowIdx % 2 === 0;
                    const displaySteps = isEvenRow ? rowSteps : [...rowSteps].reverse();
                    const globalStartIdx = rowIdx * COLS;
                    return (
                      <div key={rowIdx}>
                        <div style={{ display:'flex', alignItems:'stretch', gap:'0' }}>
                          {displaySteps.map((step, colIdx) => {
                            const i = isEvenRow ? globalStartIdx + colIdx : globalStartIdx + (rowSteps.length - 1 - colIdx);
                            const isDone = allDone ? true : i < currentStepIndex;
                            const isCurrent = i === currentStepIndex && !allDone;
                            const isPending = !isDone && !isCurrent;
                            const isLastStep = i === WORKFLOW_STEPS.length - 1;
                            const isLastInRow = colIdx === displaySteps.length - 1;
                            return (
                              <div key={step.key} style={{ display:'flex', alignItems:'center', flex:1 }}>
                                <div style={{
                                  flex:1,
                                  background: isDone?'#f0fdf4':isCurrent?'#eff6ff':'#f8fafc',
                                  borderRadius:'16px',
                                  border:`2px solid ${isDone?'#86efac':isCurrent?'#93c5fd':'#e2e8f0'}`,
                                  padding:'16px 14px',
                                  display:'flex',
                                  flexDirection:'column',
                                  alignItems:'center',
                                  gap:'10px',
                                  opacity: isPending?0.5:1,
                                  transition:'all 0.3s ease',
                                  boxShadow: isCurrent?'0 4px 14px rgba(6,139,201,0.15)':isDone?'0 2px 8px rgba(34,197,94,0.1)':'none',
                                  minHeight:'140px',
                                  justifyContent:'center'
                                }}>
                                  <div style={{
                                    width:'44px', height:'44px', borderRadius:'50%',
                                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px',
                                    background: isDone?'#22c55e':isCurrent?'#068BC9':'#e2e8f0',
                                    color:'white', fontWeight:800,
                                    boxShadow: isDone?'0 2px 8px rgba(34,197,94,0.3)':isCurrent?'0 4px 14px rgba(6,139,201,0.4)':'none'
                                  }}>
                                    {isDone ? '✓' : <span>{step.icon}</span>}
                                  </div>
                                  <p style={{ margin:0, fontSize:'12px', fontWeight:isCurrent?700:isDone?600:400, color:isDone?'#15803d':isCurrent?'#1e40af':'#94a3b8', textAlign:'center', lineHeight:'1.3' }}>{step.label}</p>
                                  {isCurrent && <p style={{ margin:0, fontSize:'10px', color:'#3b82f6', display:'flex', alignItems:'center', gap:'4px' }}><span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#3b82f6', display:'inline-block' }} /> In progress</p>}
                                  {isCurrent && isAdmin && !isLastStep && (
                                    <button onClick={() => updateWorkflowStatus(WORKFLOW_STEPS[i+1].key)}
                                      style={{ fontSize:'11px', padding:'6px 16px', borderRadius:'8px', color:'white', background:'#068BC9', border:'none', cursor:'pointer', fontWeight:700, width:'100%' }}>
                                      Next →
                                    </button>
                                  )}
                                </div>
                                {!isLastInRow && (
                                  <div style={{ display:'flex', alignItems:'center', padding:'0 6px', flexShrink:0 }}>
                                    {!isEvenRow && <div style={{ width:0, height:0, borderTop:'5px solid transparent', borderBottom:'5px solid transparent', borderRight:`7px solid ${isDone?'#22c55e':'#e2e8f0'}` }} />}
                                    <div style={{ width:'24px', height:'2.5px', background:isDone?'#22c55e':'#e2e8f0', borderRadius:'99px' }} />
                                    {isEvenRow && <div style={{ width:0, height:0, borderTop:'5px solid transparent', borderBottom:'5px solid transparent', borderLeft:`7px solid ${isDone?'#22c55e':'#e2e8f0'}` }} />}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {rowIdx < rows.length - 1 && (
                          <div style={{ display:'flex', justifyContent: isEvenRow ? 'flex-end' : 'flex-start', padding:'0 24px' }}>
                            <div style={{ width:'2.5px', height:'32px', background: (globalStartIdx + COLS - 1) < currentStepIndex ? '#22c55e' : '#e2e8f0', borderRadius:'99px' }} />
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            </div>
          )}

          {/* QUOTATIONS */}
          {activeTab === 'quotations' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">Quotations</p>
                {isAdmin && (
                  <label className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg text-white cursor-pointer" style={{ backgroundColor: BRAND }}>
                    <MdUpload size={14} /> Upload Quotation
                    <input type="file" accept=".pdf" className="hidden" onChange={e => {
                      if (e.target.files[0]) {
                        const fd = new FormData(); fd.append('file', e.target.files[0]);
                        api.post(`/api/events/${id}/quotations/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
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

          {/* PO */}
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

          {/* FEEDBACK */}
          {activeTab === 'design' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">Design</p>
                {isAdmin && (
                  <label className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg text-white cursor-pointer" style={{ backgroundColor: '#068BC9' }}>
                    <MdUpload size={14} /> {detail.designImage ? 'Replace' : 'Upload Design'}
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => {
                      if (e.target.files[0]) {
                        const fd = new FormData(); fd.append('file', e.target.files[0]);
                        api.post(`/api/events/${id}/upload-design`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
                          .then(() => { setToast('Design uploaded'); fetchDetail(); })
                          .catch(() => setToast('Upload failed'));
                      }
                    }} />
                  </label>
                )}
              </div>
              {detail.designImage ? (
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden border border-gray-100">
                    {detail.designImage.match(/\.(jpg|jpeg|png)$/i) ? (
                      <img src={detail.designImage.startsWith('http') ? detail.designImage : `${API_BASE_URL}${detail.designImage}`} alt="Design" style={{ width:'100%', display:'block' }} />
                    ) : (
                      <div className="p-4 bg-gray-50 text-center">
                        <p className="text-sm text-gray-600">Design file uploaded</p>
                      </div>
                    )}
                  </div>
                  <a href={detail.designImage.startsWith('http') ? detail.designImage : `${API_BASE_URL}${detail.designImage}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium border border-gray-200 text-gray-700 hover:bg-gray-50">
                    <MdDownload size={16} /> Download Design
                  </a>
                  {isAdmin && detail.workflowStatus !== 'design_approved' && (
                    <button onClick={() => api.post(`/api/events/${id}/approve-design`).then(() => { setToast('Design approved!'); fetchDetail(); })}
                      className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg text-white font-medium w-full justify-center" style={{ backgroundColor: '#22c55e' }}>
                      ✓ Approve Design
                    </button>
                  )}
                  {detail.workflowStatus === 'design_approved' && (
                    <p className="text-sm text-green-600 font-medium text-center">✓ Design Approved</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 mb-2">No design uploaded yet</p>
                  <p className="text-xs text-gray-300">CRM will upload the approved design here</p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'feedback' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Feedback</p>
              {detail.feedback || detail.feedbackRating ? (
                <div className="space-y-4">
                  {detail.feedbackRespondentName && <div><p className="text-xs text-gray-400">Respondent</p><p className="text-sm font-medium text-gray-700">{detail.feedbackRespondentName} {detail.feedbackDesignation ? `(${detail.feedbackDesignation})` : ''}</p></div>}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Ratings</p>
                    <div className="space-y-2">
                      {[
                        { label: 'Overall Experience', value: detail.feedbackRating },
                        { label: 'Planning & Coordination', value: detail.feedbackPlanningRating },
                        { label: 'Design Quality', value: detail.feedbackDesignRating },
                        { label: 'Printing & Branding', value: detail.feedbackPrintingRating },
                        { label: 'Venue Setup', value: detail.feedbackVenueRating },
                        { label: 'On-Ground Execution', value: detail.feedbackExecutionRating },
                        { label: 'CRM Communication', value: detail.feedbackCrmRating },
                        { label: 'Timeliness', value: detail.feedbackTimelinessRating },
                        { label: 'Value for Money', value: detail.feedbackValueRating },
                      ].filter(r => r.value).map((r, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{r.label}</span>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(star => (
                              <span key={star} style={{ color: star <= r.value ? '#f59e0b' : '#d1d5db' }}>
                                {star <= r.value ? <MdStar size={16} /> : <MdStarBorder size={16} />}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {detail.feedbackRequirementsFulfilled && <div><p className="text-xs text-gray-400">Requirements Fulfilled</p><p className="text-sm font-medium text-gray-700">{detail.feedbackRequirementsFulfilled}</p></div>}
                  {detail.feedbackOnSchedule && <div><p className="text-xs text-gray-400">On Schedule</p><p className="text-sm font-medium text-gray-700">{detail.feedbackOnSchedule}</p></div>}
                  {detail.feedbackLikedMost && <div><p className="text-xs text-gray-400">Liked Most</p><p className="text-sm text-gray-700">{detail.feedbackLikedMost}</p></div>}
                  {detail.feedbackImprovements && <div><p className="text-xs text-gray-400">Improvements</p><p className="text-sm text-gray-700">{detail.feedbackImprovements}</p></div>}
                  {detail.feedback && <div><p className="text-xs text-gray-400">Comments</p><p className="text-sm text-gray-700">{detail.feedback}</p></div>}
                  {detail.feedbackRecommendationScore !== null && <div><p className="text-xs text-gray-400">Recommendation Score</p><p className="text-sm font-medium text-gray-700">{detail.feedbackRecommendationScore}/10</p></div>}
                  {detail.feedbackTestimonialPermission && <div><p className="text-xs text-gray-400">Testimonial Permission</p><p className="text-sm font-medium text-gray-700">{detail.feedbackTestimonialPermission}</p></div>}
                </div>
              ) : isCompanyUser && detail.workflowStatus === 'completed' ? (
                <div className="space-y-6">
                  {/* Client Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block font-medium">Name of Respondent *</label>
                      <input value={respondentName} onChange={e => setRespondentName(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-400" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block font-medium">Designation</label>
                      <input value={designation} onChange={e => setDesignation(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-400" placeholder="Your designation" />
                    </div>
                  </div>

                  {/* Ratings */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-3">Event Ratings (1-5 Stars)</p>
                    <div className="space-y-3">
                      {[
                        { label: 'Overall Event Experience', value: feedbackRating, setter: setFeedbackRating },
                        { label: 'Planning and Coordination', value: planningRating, setter: setPlanningRating },
                        { label: 'Design and Creative Quality', value: designRating, setter: setDesignRating },
                        { label: 'Printing and Branding Quality', value: printingRating, setter: setPrintingRating },
                        { label: 'Venue Setup and Decoration', value: venueRating, setter: setVenueRating },
                        { label: 'On-Ground Execution', value: executionRating, setter: setExecutionRating },
                        { label: 'CRM Communication and Support', value: crmRating, setter: setCrmRating },
                        { label: 'Timeliness and Schedule Management', value: timelinessRating, setter: setTimelinessRating },
                        { label: 'Value for Money', value: valueRating, setter: setValueRating },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 w-64">{item.label}</span>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(star => (
                              <button key={star} onClick={() => item.setter(star)} style={{ color: star <= item.value ? '#f59e0b' : '#d1d5db' }}>
                                {star <= item.value ? <MdStar size={20} /> : <MdStarBorder size={20} />}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-2 font-medium">Were your event requirements fulfilled? *</p>
                      <div className="flex gap-2">
                        {['Yes', 'Partially', 'No'].map(opt => (
                          <button key={opt} onClick={() => setRequirementsFulfilled(opt)}
                            className={`text-xs px-3 py-1.5 rounded-lg border ${requirementsFulfilled === opt ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2 font-medium">Was the event completed on schedule? *</p>
                      <div className="flex gap-2">
                        {['Yes', 'No'].map(opt => (
                          <button key={opt} onClick={() => setOnSchedule(opt)}
                            className={`text-xs px-3 py-1.5 rounded-lg border ${onSchedule === opt ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block font-medium">What did you like most about the event?</label>
                      <textarea value={likedMost} onChange={e => setLikedMost(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-blue-400" rows={3} placeholder="Share what you liked..." />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block font-medium">What areas could be improved?</label>
                      <textarea value={improvements} onChange={e => setImprovements(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-blue-400" rows={3} placeholder="Share improvements..." />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block font-medium">Comments or Suggestions</label>
                      <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-blue-400" rows={3} placeholder="Any additional comments..." />
                    </div>
                  </div>

                  {/* Recommendation Score */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">How likely are you to recommend ProDiligix? (0-10) *</p>
                    <div className="flex gap-1 flex-wrap">
                      {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                        <button key={n} onClick={() => setRecommendationScore(n)}
                          className={`w-9 h-9 rounded-lg text-xs font-medium border ${recommendationScore === n ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 text-gray-600'}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Testimonial Permission */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">May ProDiligix use your feedback as a testimonial?</p>
                    <div className="space-y-1.5">
                      {['Yes, with my name and company name', 'Yes, but anonymously', 'No'].map(opt => (
                        <button key={opt} onClick={() => setTestimonialPermission(opt)}
                          className={`block w-full text-left text-xs px-3 py-2 rounded-lg border ${testimonialPermission === opt ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={submitFeedback} className="w-full py-2.5 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: BRAND }}>
                    Submit Feedback
                  </button>
                </div>
              ) : isCompanyUser ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Feedback will be available once the event is marked as Completed</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">No feedback submitted yet</p>
              )}
            </div>
          )}
        </div>
      </div>

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
