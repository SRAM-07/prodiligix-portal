import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdArrowBack, MdDownload, MdAttachFile, MdPerson, MdDescription, MdAdminPanelSettings, MdUpload, MdClose } from 'react-icons/md';
import api from '../services/api';

const stampDutyOptions = ['First Party', 'Second Party', 'Both'];
const statusOptions = ['Booked', 'In Printing', 'In Transit', 'Delivered'];

const statusConfig = {
  'Pending': { color: '#f97316', bg: '#ffedd5' },
  'Booked': { color: '#068BC9', bg: '#e0f2fe' },
  'In Printing': { color: '#8b5cf6', bg: '#ede9fe' },
  'In Transit': { color: '#f97316', bg: '#ffedd5' },
  'Delivered': { color: '#22c55e', bg: '#dcfce7' },
  'Cancelled': { color: '#ef4444', bg: '#fee2e2' },
};

export default function StampPaperDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/api/stamp-paper/${id}`);
        setDetail(response.data);
        setStatus(response.data.status);
        setDeliveryDate(response.data.deliveryDate ? response.data.deliveryDate.split('T')[0] : '');
      } catch (error) {
        console.error('Failed to fetch stamp paper detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      const response = await api.patch(`/api/stamp-paper/${id}/status`, { status });
      setDetail(response.data);
      setStatus(response.data.status);
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!cancelReason.trim()) return;
    try {
      const response = await api.patch(`/api/stamp-paper/${id}/cancel`, { reason: cancelReason });
      setDetail(response.data);
      setStatus('Cancelled');
      setShowCancelModal(false);
      setCancelReason('');
    } catch (error) {
      console.error('Failed to cancel:', error);
      alert('Failed to cancel booking');
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );

  if (!detail) return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <p className="text-gray-400 text-sm">Stamp paper booking not found</p>
    </div>
  );

  const isCancelled = status === 'Cancelled';
  const isBooked = status === 'Booked' || status === 'Pending';
  const isDelivered = status === 'Delivered';
  const s = statusConfig[status] || statusConfig['Pending'];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 sticky top-0 z-40">
          <button
            onClick={() => navigate('/stamp-paper')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <MdArrowBack size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <p className="text-gray-400 text-xs">Stamp Paper Procurement</p>
            <h1 className="text-base font-bold text-gray-800">{detail.serviceRequestId}</h1>
          </div>
          <span className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ color: s.color, backgroundColor: s.bg }}>
            {status}
          </span>
        </div>

        <div className="p-6 max-w-5xl mx-auto">

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Denomination</p>
              <p className="text-xl font-bold text-gray-800">₹{detail.denomination}</p>
              <p className="text-xs text-gray-400 mt-0.5">Stamp Paper Value</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Quantity</p>
              <p className="text-xl font-bold text-gray-800">{detail.quantity}</p>
              <p className="text-xs text-gray-400 mt-0.5">Stamp Papers</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Total Charges</p>
              <p className="text-xl font-bold" style={{ color: '#068BC9' }}>₹{detail.totalCharges}</p>
              <p className="text-xs text-gray-400 mt-0.5">Incl. GST</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Request Date</p>
              <p className="text-xl font-bold text-gray-800">
                {detail.createdAt ? detail.createdAt.split('T')[0] : '—'}
              </p>
            </div>
          </div>

          {/* Party Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <MdPerson size={18} style={{ color: '#068BC9' }} />
              <p className="text-sm font-semibold text-gray-700">Party Details</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">First Party Name</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                  <span className="text-sm text-gray-700">{detail.firstPartyName || '—'}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">First Party PAN Number</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                  <span className="text-sm text-gray-700">{detail.firstPartyPan || 'Not provided'}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Second Party Name</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                  <span className="text-sm text-gray-700">{detail.secondPartyName || '—'}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Second Party PAN Number</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                  <span className="text-sm text-gray-700">{detail.secondPartyPan || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stamp Paper Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <MdDescription size={18} style={{ color: '#068BC9' }} />
              <p className="text-sm font-semibold text-gray-700">Stamp Paper Details</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Consideration Value</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                  <span className="text-sm text-gray-700">₹{detail.considerationValue || 0}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Denomination of Stamp Paper</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                  <span className="text-sm text-gray-700">₹{detail.denomination}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 min-h-20">
                  <span className="text-sm text-gray-700 whitespace-pre-line">{detail.description || '—'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Stamp Duty Paid By</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                    <span className="text-sm text-gray-700">{detail.stampDutyPaidBy || '—'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Quantity</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                    <span className="text-sm text-gray-700">{detail.quantity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <MdAdminPanelSettings size={18} style={{ color: '#068BC9' }} />
              <p className="text-sm font-semibold text-gray-700">Admin Section</p>
            </div>

            {/* Charges */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Procurement Charges', value: `₹${detail.procurementCharges || 0}` },
                { label: 'GST on Procurement Fee', value: `₹${detail.gstFee || 0}` },
                { label: 'Total Charges', value: `₹${detail.totalCharges || 0}`, highlight: true },
              ].map((f, i) => (
                <div key={i}>
                  <p className="text-xs text-gray-400 mb-1">{f.label}</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                    <span className="text-sm font-semibold"
                      style={{ color: f.highlight ? '#068BC9' : '#374151' }}>
                      {f.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Status + Delivery Date */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  disabled={isCancelled}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  {statusOptions.map((opt, i) => (
                    <option key={i}>{opt}</option>
                  ))}
                </select>
              </div>
              {isDelivered && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Delivery Date</p>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Upload Stamp Paper */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">Upload Stamp Paper (PDF)</p>
              {detail.scannedCopy ? (
                <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <MdAttachFile size={16} style={{ color: '#068BC9' }} />
                    <span className="text-sm text-gray-600 truncate">Document.pdf</span>
                  </div>
                  <button
                    onClick={() => window.open(detail.scannedCopy, '_blank')}
                    className="p-1 rounded hover:bg-gray-100">
                    <MdDownload size={16} style={{ color: '#068BC9' }} />
                  </button>
                </div>
              ) : (
                <div>
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <MdUpload size={18} style={{ color: '#068BC9' }} />
                    <span className="text-sm text-gray-500">
                      {uploadFile ? uploadFile.name : 'Click to upload PDF'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={e => setUploadFile(e.target.files[0])}
                    />
                  </label>
                  {uploadFile && (
                    <div className="flex items-center justify-between mt-2 bg-blue-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-600">{uploadFile.name}</span>
                      <button onClick={() => setUploadFile(null)}>
                        <MdClose size={14} className="text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pb-4">
            <div>
              {isBooked && !isCancelled && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors">
                  Cancel Request
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/stamp-paper')}
                className="px-6 py-2.5 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                Back
              </button>
              {!isCancelled && (
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="px-6 py-2.5 rounded-lg text-sm text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#068BC9' }}>
                  {updating ? 'Updating...' : 'Update'}
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
              <h3 className="text-sm font-semibold text-red-500">Cancel Stamp Paper Booking</h3>
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