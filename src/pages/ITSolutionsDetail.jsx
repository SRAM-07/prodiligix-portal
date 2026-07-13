import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  MdArrowBack, MdComputer, MdPerson, MdClose
} from 'react-icons/md';

const ticketDetail = {
  id: 'ITS-20260701001',
  company: 'Rapido Technologies Pvt. Ltd.',
  contactPerson: 'Arun Kumar',
  email: 'arun.kumar@rapido.bike',
  phone: '+91 98765 43210',
  serviceType: 'Hardware Setup',
  description: 'Setup 25 laptops with OS and software installation for the new Bangalore office. Includes Windows 11 Pro installation, antivirus setup, and basic software configuration.',
  priority: 'High',
  assignedTo: 'Tech Partner A',
  createdDate: '2026-07-01',
  expectedResolution: '2026-07-05',
  actualResolution: '2026-07-04',
  status: 'Resolved',
  adminNotes: 'All 25 laptops configured successfully. Delivered to client on 4th July.',
};

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
  const [status, setStatus] = useState(ticketDetail.status);
  const [assignedTo, setAssignedTo] = useState(ticketDetail.assignedTo);
  const [expectedResolution, setExpectedResolution] = useState(ticketDetail.expectedResolution);
  const [actualResolution, setActualResolution] = useState(ticketDetail.actualResolution);
  const [adminNotes, setAdminNotes] = useState(ticketDetail.adminNotes);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const navigate = useNavigate();

  const s = statusConfig[status] || statusConfig['Pending'];
  const p = priorityConfig[ticketDetail.priority] || priorityConfig['Medium'];
  const isCancelled = status === 'Cancelled';
  const isResolved = status === 'Resolved';

  const handleCancelSubmit = () => {
    if (!cancelReason.trim()) return;
    setStatus('Cancelled');
    setShowCancelModal(false);
    setCancelReason('');
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
              onClick={() => navigate('/it-solutions')}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MdArrowBack size={18} className="text-gray-500" />
            </button>
            <div>
              <p className="text-gray-400 text-xs">IT Solutions</p>
              <h1 className="text-base font-bold text-gray-800">{ticketDetail.id}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ color: p.color, backgroundColor: p.bg }}>
              {ticketDetail.priority} Priority
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
              { label: 'Company', value: ticketDetail.company },
              { label: 'Service Type', value: ticketDetail.serviceType },
              { label: 'Created Date', value: ticketDetail.createdDate },
              { label: 'Expected Resolution', value: ticketDetail.expectedResolution },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className="text-sm font-semibold text-gray-700">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5">

            {/* Left — Ticket Details */}
            <div className="col-span-2 flex flex-col gap-5">

              {/* Contact Info */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MdPerson size={18} style={{ color: '#068BC9' }} />
                  <h3 className="text-sm font-semibold text-gray-700">Contact Information</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <InfoRow label="Company Name" value={ticketDetail.company} />
                  <InfoRow label="Contact Person" value={ticketDetail.contactPerson} />
                  <InfoRow label="Email" value={ticketDetail.email} />
                  <InfoRow label="Phone" value={ticketDetail.phone} />
                </div>
              </div>

              {/* Ticket Details */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MdComputer size={18} style={{ color: '#068BC9' }} />
                  <h3 className="text-sm font-semibold text-gray-700">Ticket Details</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <InfoRow label="Service Type" value={ticketDetail.serviceType} />
                  <InfoRow label="Priority" value={ticketDetail.priority} />
                  <InfoRow label="Assigned To" value={ticketDetail.assignedTo} />
                  <InfoRow label="Created Date" value={ticketDetail.createdDate} />
                  <InfoRow label="Expected Resolution" value={ticketDetail.expectedResolution} />
                  <InfoRow label="Actual Resolution" value={ticketDetail.actualResolution || 'Pending'} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{ticketDetail.description}</p>
                </div>
              </div>

            </div>

            {/* Right — Admin Panel */}
            <div className="flex flex-col gap-5">

              {/* Admin Actions */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Admin Actions</h3>

                {/* Status */}
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

                {/* Assigned To */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">Assigned To</p>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={e => setAssignedTo(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 outline-none"
                  />
                </div>

                {/* Expected Resolution */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">Expected Resolution Date</p>
                  <input
                    type="date"
                    value={expectedResolution}
                    onChange={e => setExpectedResolution(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 outline-none"
                  />
                </div>

                {/* Actual Resolution — show when resolved */}
                {isResolved && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-1">Actual Resolution Date</p>
                    <input
                      type="date"
                      value={actualResolution}
                      onChange={e => setActualResolution(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 outline-none"
                    />
                  </div>
                )}

                {/* Admin Notes */}
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
                  disabled={isCancelled}
                  className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: '#068BC9' }}>
                  Update
                </button>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Timeline</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Ticket Created', date: ticketDetail.createdDate, done: true },
                    { label: 'Assigned to Tech Partner', date: ticketDetail.createdDate, done: true },
                    { label: 'In Progress', date: '2026-07-02', done: true },
                    { label: 'Resolved', date: ticketDetail.actualResolution, done: !!ticketDetail.actualResolution },
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
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
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