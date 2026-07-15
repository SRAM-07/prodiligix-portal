import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdArrowBack, MdComputer, MdPerson, MdClose } from 'react-icons/md';
import api from '../services/api';

const statusOptions = ['Pending', 'In Progress', 'Resolved', 'Cancelled'];

const statusConfig = {
  'Resolved': { color: '#22c55e', bg: '#dcfce7' },
  'In Progress': { color: '#3b82f6', bg: '#eff6ff' },
  'Pending': { color: '#f97316', bg: '#ffedd5' },
  'Cancelled': { color: '#ef4444', bg: '#fee2e2' },
};

const priorityConfig = {
  'High': { color: '#ef4444', bg: '#fee2e2' },
  'Medium': { color: '#f97316', bg: '#ffedd5' },
  'Low': { color: '#22c55e', bg: '#dcfce7' },
};

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-700">{value || '—'}</span>
    </div>
  );
}

export default function ITSolutionsDetail() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/api/it-solutions/${id}`);
        setDetail(response.data);
        setStatus(response.data.status);
        setAssignedTo(response.data.assignedTo || '');
        setAdminNotes(response.data.adminNotes || '');
      } catch (error) {
        console.error('Failed to fetch IT solution detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const response = await api.put(`/api/it-solutions/${id}`, {
        status,
        assignedTo,
        adminNotes,
      });
      setDetail(response.data);
      alert('Updated successfully!');
    } catch (error) {
      console.error('Failed to update:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!cancelReason.trim()) return;
    try {
      const response = await api.patch(`/api/it-solutions/${id}/cancel`, { reason: cancelReason });
      setDetail(response.data);
      setStatus('Cancelled');
      setShowCancelModal(false);
      setCancelReason('');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel');
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );

  if (!detail) return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <p className="text-gray-400 text-sm">Request not found</p>
    </div>
  );

  const isCancelled = status === 'Cancelled';
  const isResolved = status === 'Resolved';
  const s = statusConfig[status] || statusConfig['Pending'];
  const p = priorityConfig[detail.priority] || priorityConfig['Medium'];

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
              onClick={() => navigate('/it-solutions')}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MdArrowBack size={18} className="text-gray-500" />
            </button>
            <div>
              <p className="text-gray-400 text-xs">IT Solutions</p>
              <h1 className="text-base font-bold text-gray-800">{detail.serviceRequestId}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ color: p.color, backgroundColor: p.bg }}>
              {detail.priority} Priority
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ color: s.color, backgroundColor: s.bg }}>
              {status}
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Service Type', value: detail.serviceType },
              { label: 'Priority', value: detail.priority },
              { label: 'Created Date', value: detail.createdAt ? detail.createdAt.split('T')[0] : '—' },
              { label: 'Assigned To', value: detail.assignedTo || 'Unassigned' },
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
                <div className="flex items-center gap-2 mb-4">
                  <MdPerson size={18} style={{ color: '#068BC9' }} />
                  <h3 className="text-sm font-semibold text-gray-700">Contact Information</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <InfoRow label="Contact Person" value={detail.contactPersonName} />
                  <InfoRow label="Email" value={detail.email} />
                  <InfoRow label="Phone" value={detail.primaryPhone} />
                </div>
              </div>

              {/* Ticket Details */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MdComputer size={18} style={{ color: '#068BC9' }} />
                  <h3 className="text-sm font-semibold text-gray-700">Ticket Details</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <InfoRow label="Service Type" value={detail.serviceType} />
                  <InfoRow label="Priority" value={detail.priority} />
                  <InfoRow label="Assigned To" value={detail.assignedTo || 'Unassigned'} />
                  <InfoRow label="Created Date" value={detail.createdAt ? detail.createdAt.split('T')[0] : '—'} />
                  <InfoRow label="Expected Resolution" value={detail.expectedResolutionDate ? detail.expectedResolutionDate.split('T')[0] : '—'} />
                  <InfoRow label="Actual Resolution" value={detail.actualResolutionDate ? detail.actualResolutionDate.split('T')[0] : 'Pending'} />
                </div>
                {detail.description && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{detail.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right — Admin Panel */}
            <div className="flex flex-col gap-5">

              {/* Admin Actions */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Admin Actions</h3>

                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    disabled={isCancelled}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 outline-none">
                    {statusOptions.map((opt, i) => (
                      <option key={i}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">Assigned To</p>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={e => setAssignedTo(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 outline-none"
                  />
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">Admin Notes</p>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none resize-none"
                    placeholder="Add notes..."
                  />
                </div>

                <button
                  onClick={handleUpdate}
                  disabled={isCancelled || updating}
                  className="w-full py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-40"
                  style={{ backgroundColor: '#068BC9' }}>
                  {updating ? 'Updating...' : 'Update'}
                </button>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Timeline</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Ticket Created', date: detail.createdAt ? detail.createdAt.split('T')[0] : '', done: true },
                    { label: 'Assigned', date: '', done: !!detail.assignedTo },
                    { label: 'In Progress', date: '', done: ['In Progress', 'Resolved'].includes(status) },
                    { label: 'Resolved', date: detail.actualResolutionDate ? detail.actualResolutionDate.split('T')[0] : '', done: isResolved },
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

              {/* Cancel */}
              {!isCancelled && !isResolved && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-2.5 rounded-lg text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors">
                  Cancel Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-red-500">Cancel Ticket</h3>
              <button onClick={() => setShowCancelModal(false)}>
                <MdClose size={18} className="text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">Please provide a cancellation reason (mandatory)</p>
            <textarea
              rows={4}
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-blue-300 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                Close
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={!cancelReason.trim()}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-40"
                style={{ backgroundColor: '#ef4444' }}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}