import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SmartSidebar from '../components/SmartSidebar';
import { MdArrowBack } from 'react-icons/md';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';

const serviceTypes = [
  'Hardware Request',
  'Software Access',
  'Network Issue',
  'Email/Account Setup',
  'System Maintenance',
  'Other',
];

export default function ITSolutionForm() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [form, setForm] = useState({
    contactPersonName: user
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
      : '',
    email: user?.email || '',
    primaryPhone: '',
    serviceType: '',
    description: '',
  });

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (
      !form.contactPersonName ||
      !form.email ||
      !form.primaryPhone ||
      !form.serviceType
    ) {
      alert('Please fill all required fields');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/api/it-solutions', {
        companyId: user?.companyId || 1,
        userId: user?.id,
        contactPersonName: form.contactPersonName,
        email: form.email,
        primaryPhone: form.primaryPhone,
        serviceType: form.serviceType,
        description: form.description,
      });

      alert('IT Solution request submitted successfully!');
      navigate('/it-solutions');
    } catch (error) {
      console.error('Failed to submit IT solution request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SmartSidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}
      >
        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 sticky top-0 z-40">
          <button
            onClick={() => navigate('/it-solutions')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MdArrowBack size={20} className="text-gray-600" />
          </button>

          <div>
            <p className="text-gray-400 text-xs">IT Solutions</p>
            <h1 className="text-base font-bold text-gray-800">
              New Request
            </h1>
          </div>
        </div>

        {/* Background Wrapper */}
        <div
          className="relative min-h-screen overflow-hidden"
          style={{ backgroundColor: '#F7FBFF' }}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/it-solutions-bg.png')",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left bottom',
              backgroundSize: 'contain',
              opacity: 0.22,
              pointerEvents: 'none',
            }}
          />

          {/* Content */}
          <div className="relative z-10 p-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">

              <div>
                <p className="text-xs text-gray-400 mb-1">
                  Contact Person Name <span className="text-red-400">*</span>
                </p>
                <input
                  type="text"
                  value={form.contactPersonName}
                  onChange={(e) =>
                    handleChange('contactPersonName', e.target.value)
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    Email <span className="text-red-400">*</span>
                  </p>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none"
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    Phone <span className="text-red-400">*</span>
                  </p>
                  <input
                    type="text"
                    value={form.primaryPhone}
                    onChange={(e) =>
                      handleChange('primaryPhone', e.target.value)
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">
                  Service Type <span className="text-red-400">*</span>
                </p>

                <select
                  value={form.serviceType}
                  onChange={(e) =>
                    handleChange('serviceType', e.target.value)
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none"
                >
                  <option value="">Select Service Type</option>
                  {serviceTypes.map((type, index) => (
                    <option key={index}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Description</p>

                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    handleChange('description', e.target.value)
                  }
                  placeholder="Describe the issue or request in detail..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => navigate('/it-solutions')}
                  className="px-6 py-2.5 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-2.5 rounded-lg text-sm text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#068BC9' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}