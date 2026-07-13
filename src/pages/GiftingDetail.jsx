import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  MdArrowBack, MdDownload, MdUpload, MdCheckCircle, MdCancel,
  MdHistory, MdClose
} from 'react-icons/md';

const giftingDetail = {
  id: 'CG-20260701001',
  companyName: 'Rapido Technologies Pvt. Ltd.',
  contactPerson: 'Ankit Sharma',
  designation: 'HR Manager',
  email: 'ankit.sharma@rapido.bike',
  phone: '+91 98765 43210',
  purposeOfGifting: 'Employee Appreciation',
  estimatedQuantity: '100-200',
  deliveryType: 'Bulk Delivery to One Location',
  preferredItems: ['Custom Apparel (T-shirts, Hoodies)', 'Drinkware (Mugs, Bottles)'],
  itemBrands: {
    'Custom Apparel (T-shirts, Hoodies)': ['Nike', 'Puma'],
    'Drinkware (Mugs, Bottles)': ['Milton', 'Others'],
  },
  brandingRequirements: ['Logo Printed', 'Custom Sleeves'],
  logoPrintedOptions: ['Embroidery', 'Screen printing'],
  additionalServices: ['Warehousing', 'Custom Kit Building'],
  specificNotes: 'Please ensure all items are packed in eco-friendly boxes.',
  requiredDeliveryDate: '2026-07-20',
  expectedDeliveryDate: '2026-07-18',
  actualDeliveryDate: '',
  podCopy: null,
  quotationStatus: 'initialized',
  createdAt: '2026-07-01',
};

const quotationHistory = [
  {
    id: 1,
    quotationNumber: 'QTN-001',
    fileName: 'Quotation_CG001_v1.pdf',
    fileUrl: '#',
    status: 'rejected',
    rejectionReason: 'Price too high, please revise.',
  },
  {
    id: 2,
    quotationNumber: 'QTN-002',
    fileName: 'Quotation_CG001_v2.pdf',
    fileUrl: '#',
    status: 'initialized',
    rejectionReason: '',
  },
];

const statusConfig = {
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

export default function GiftingDetail() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);
  const [quotations, setQuotations] = useState(quotationHistory);
  const navigate = useNavigate();

  const detail = giftingDetail;

  const handleAccept = (quotationId) => {
    setQuotations(prev =>
      prev.map(q => q.id === quotationId ? { ...q, status: 'accepted' } : q)
    );
  };

  const handleRejectClick = (quotationId) => {
    setSelectedQuotationId(quotationId);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) return;
    setQuotations(prev =>
      prev.map(q => q.id === selectedQuotationId
        ? { ...q, status: 'rejected', rejectionReason: rejectReason }
        : q)
    );
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedQuotationId(null);
  };

  const overallStatus = statusConfig[detail.quotationStatus] || statusConfig.pending;

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
              onClick={() => navigate('/gifting')}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MdArrowBack size={18} className="text-gray-500" />
            </button>
            <div>
              <p className="text-gray-400 text-xs">Corporate Gifting</p>
              <h1 className="text-base font-bold text-gray-800">{detail.id}</h1>
            </div>
          </div>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ color: overallStatus.color, backgroundColor: overallStatus.bg }}>
            {overallStatus.label}
          </span>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Company', value: detail.companyName },
              { label: 'Contact Person', value: detail.contactPerson },
              { label: 'Required Delivery', value: detail.requiredDeliveryDate },
              { label: 'Expected Delivery', value: detail.expectedDeliveryDate || 'Pending' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className="text-sm font-semibold text-gray-700">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5">

            {/* Left — Request Details */}
            <div className="col-span-2 flex flex-col gap-5">

              {/* Contact & Company Info */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Contact Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <InfoRow label="Company Name" value={detail.companyName} />
                  <InfoRow label="Contact Person" value={detail.contactPerson} />
                  <InfoRow label="Designation" value={detail.designation} />
                  <InfoRow label="Email" value={detail.email} />
                  <InfoRow label="Phone" value={detail.phone} />
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

                {/* Preferred Items & Brands */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Preferred Items & Brands</p>
                  <div className="flex flex-col gap-1.5">
                    {detail.preferredItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: '#068BC9' }} />
                        <span className="text-sm text-gray-700">
                          {item}
                          {detail.itemBrands[item] && (
                            <span className="text-xs text-gray-400 ml-1">
                              (Brands: {detail.itemBrands[item].join(', ')})
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Branding */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Branding Requirements</p>
                  <div className="flex flex-wrap gap-2">
                    {detail.brandingRequirements.map((b, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                        {b}
                        {b === 'Logo Printed' && detail.logoPrintedOptions.length > 0 && (
                          <span className="text-gray-400 ml-1">({detail.logoPrintedOptions.join(', ')})</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Additional Services */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Additional Services</p>
                  <div className="flex flex-wrap gap-2">
                    {detail.additionalServices.map((s, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes */}
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
                        <th className="text-left text-xs text-gray-400 font-medium pb-2">Quotation #</th>
                        <th className="text-left text-xs text-gray-400 font-medium pb-2">File</th>
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
                            <td className="py-3 text-sm text-gray-700">{q.quotationNumber}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{q.fileName}</span>
                                <button className="p-1 rounded hover:bg-gray-100">
                                  <MdDownload size={14} style={{ color: '#068BC9' }} />
                                </button>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="text-xs font-medium px-2 py-1 rounded-full"
                                style={{ color: s.color, backgroundColor: s.bg }}>
                                {s.label}
                              </span>
                            </td>
                            <td className="py-3 text-xs text-gray-500">{q.rejectionReason || '—'}</td>
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
                                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
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

              {/* POD File */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">POD File</h3>
                {detail.podCopy ? (
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#068BC9' }}>
                    <MdDownload size={16} />
                    Download POD
                  </button>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-3">No POD file uploaded yet.</p>
                )}
              </div>

              {/* CRM Admin Section */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Admin Actions</h3>

                {/* Upload Quotation */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Upload Quotation</p>
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors">
                    <MdUpload size={16} />
                    Upload PDF
                  </button>
                </div>

                {/* Expected Delivery Date */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Set Expected Delivery Date</p>
                  <input
                    type="date"
                    defaultValue={detail.expectedDeliveryDate}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-blue-300"
                  />
                </div>

                {/* Update Button */}
                <button
                  className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#068BC9' }}>
                  Update
                </button>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Timeline</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Request Created', date: detail.createdAt, done: true },
                    { label: 'Quotation Uploaded', date: '2026-07-03', done: true },
                    { label: 'Quotation Accepted', date: '', done: false },
                    { label: 'Delivered', date: '', done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                          style={{ backgroundColor: step.done ? '#068BC9' : '#e5e7eb' }} />
                        {i < 3 && <div className="w-0.5 h-6" style={{ backgroundColor: '#e5e7eb' }} />}
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