import React, { useState, useEffect } from 'react';
import { MdClose, MdCloudUpload, MdDownload, MdVisibility, MdCheck } from 'react-icons/md';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const statusBadge = {
  initialized: { label: 'Initialized', color: '#6b7280', bg: '#f3f4f6' },
  accepted: { label: 'Accepted', color: '#22c55e', bg: '#dcfce7' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: '#fee2e2' },
};

function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'quotation';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function QuotationFileActions(props) {
  const fileUrl = props.fileUrl;
  if (!fileUrl) {
    return React.createElement('span', { className: 'text-xs text-gray-400' }, 'No file uploaded');
  }
  return (
    <React.Fragment>
      <button
        onClick={function () { window.open(fileUrl, '_blank'); }}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        style={{ color: '#068BC9', backgroundColor: '#e0f2fe' }}
      >
        <MdVisibility size={14} />
        View
      </button>
      <button
        onClick={function () { downloadFile(fileUrl, props.fileName); }}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        style={{ color: '#22c55e', backgroundColor: '#dcfce7' }}
      >
        <MdDownload size={14} />
        Download
      </button>
    </React.Fragment>
  );
}

export default function QuotationDialog(props) {
  const giftingId = props.giftingId;
  const onClose = props.onClose;
  const onStatusChange = props.onStatusChange;

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const user = getCurrentUser();
  const isCrmUser = user && user.role === 'crm_user';
  const isCompanyUser = user && ['company_user', 'company_admin', 'company_crm_user'].indexOf(user.role) !== -1;

  function fetchQuotations() {
    setLoading(true);
    api.get('/api/corporate-giftings/' + giftingId + '/quotations')
      .then(function (res) {
        setQuotations(res.data);
      })
      .catch(function (error) {
        console.error('Failed to fetch quotations:', error);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    fetchQuotations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giftingId]);

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    fetch(API_BASE + '/api/corporate-giftings/' + giftingId + '/quotations', {
      method: 'POST',
      headers: headers,
      body: formData,
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Upload failed');
        return fetchQuotations();
      })
      .then(function () {
        if (onStatusChange) onStatusChange('initialized');
      })
      .catch(function (error) {
        console.error('Failed to upload quotation:', error);
        alert('Failed to upload quotation. Please try again.');
      })
      .finally(function () {
        setUploading(false);
        e.target.value = '';
      });
  }

  function handleAccept(quotationId) {
    api.post('/api/corporate-giftings/' + giftingId + '/quotations/' + quotationId + '/accept')
      .then(function () {
        fetchQuotations();
        if (onStatusChange) onStatusChange('accepted');
      })
      .catch(function (error) {
        console.error('Failed to accept quotation:', error);
        alert('Failed to accept quotation.');
      });
  }

  function submitReject(quotationId) {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    api.post('/api/corporate-giftings/' + giftingId + '/quotations/' + quotationId + '/reject', { reason: rejectReason })
      .then(function () {
        fetchQuotations();
        if (onStatusChange) onStatusChange('rejected');
        setRejectingId(null);
        setRejectReason('');
      })
      .catch(function (error) {
        console.error('Failed to reject quotation:', error);
        alert('Failed to reject quotation.');
      });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Quotations</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <MdClose size={20} className="text-gray-500" />
          </button>
        </div>

        {isCrmUser ? (
          <div className="px-6 pt-4">
            <label
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: uploading ? '#9ca3af' : '#068BC9' }}
            >
              <MdCloudUpload size={18} />
              {uploading ? 'Uploading...' : 'Upload Quotation'}
              <input
                type="file"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
              />
            </label>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading quotations...</p>
          ) : quotations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No quotations yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {quotations.map(function (q) {
                const s = statusBadge[q.status] || statusBadge.initialized;
                const fileUrl = q.fileUrl ? (API_BASE + q.fileUrl) : null;
                const showAcceptReject = isCompanyUser && q.status === 'initialized' && rejectingId !== q.id;
                const showRejectForm = rejectingId === q.id;
                const showRejectReason = q.status === 'rejected' && q.rejectedReason;

                return (
                  <div key={q.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Quotation #{q.id}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{q.file || 'No file attached'}</p>
                      </div>
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ color: s.color, backgroundColor: s.bg }}
                      >
                        {s.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <QuotationFileActions fileUrl={fileUrl} fileName={q.file} />

                      {showAcceptReject ? (
                        <React.Fragment>
                          <button
                            onClick={function () { handleAccept(q.id); }}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ml-auto"
                            style={{ color: '#22c55e', backgroundColor: '#dcfce7' }}
                          >
                            <MdCheck size={14} />
                            Accept
                          </button>
                          <button
                            onClick={function () { setRejectingId(q.id); }}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            style={{ color: '#ef4444', backgroundColor: '#fee2e2' }}
                          >
                            <MdClose size={14} />
                            Reject
                          </button>
                        </React.Fragment>
                      ) : null}
                    </div>

                    {showRejectForm ? (
                      <div className="mt-3 flex flex-col gap-2">
                        <textarea
                          rows={2}
                          value={rejectReason}
                          onChange={function (e) { setRejectReason(e.target.value); }}
                          placeholder="Reason for rejection..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none resize-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={function () { setRejectingId(null); setRejectReason(''); }}
                            className="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={function () { submitReject(q.id); }}
                            className="px-3 py-1.5 rounded-lg text-xs text-white font-medium transition-opacity hover:opacity-90"
                            style={{ backgroundColor: '#ef4444' }}
                          >
                            Confirm Reject
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {showRejectReason ? (
                      <p className="text-xs text-red-500 mt-2">Reason: {q.rejectedReason}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
