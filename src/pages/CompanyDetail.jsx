import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdArrowBack, MdBusiness, MdPersonAdd, MdClose } from 'react-icons/md';
import api from '../services/api';

function AddUserDialog({ companyId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', primaryPhone: '', role: 'company_user',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.primaryPhone.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/api/users', { ...form, companyId, isActive: true });
      onSuccess('User added successfully. They can use "Forgot Password" to set their own password.');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800">Add User</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <MdClose size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text" placeholder="First Name"
              value={form.firstName} onChange={e => handleChange('firstName', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
            <input
              type="text" placeholder="Last Name"
              value={form.lastName} onChange={e => handleChange('lastName', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
          </div>
          <input
            type="email" placeholder="Email"
            value={form.email} onChange={e => handleChange('email', e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
          <input
            type="text" placeholder="Phone Number"
            value={form.primaryPhone} onChange={e => handleChange('primaryPhone', e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
          <select
            value={form.role} onChange={e => handleChange('role', e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
            <option value="company_user">Company User</option>
            <option value="company_admin">Company Admin</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: '#068BC9' }}>
            {submitting ? 'Adding...' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyDetail() {
  const { id } = useParams();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [company, setCompany] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [companyRes, usersRes] = await Promise.all([
        api.get(`/api/companies/${id}`),
        api.get(`/api/users/company/${id}`),
      ]);
      setCompany(companyRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch company:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <p className="text-gray-400 text-sm">Loading company...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <p className="text-gray-400 text-sm">Company not found.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 sticky top-0 z-40">
          <button onClick={() => navigate('/companies')} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <MdArrowBack size={20} className="text-gray-500" />
          </button>
          <div>
            <p className="text-gray-400 text-xs">Admin / Companies</p>
            <h1 className="text-base font-bold text-gray-800">{company.businessName}</h1>
          </div>
        </div>

        {toast && (
          <div className="fixed top-20 right-6 z-[200] bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3 max-w-sm">
            <p className="text-sm text-green-600 font-medium">{toast}</p>
          </div>
        )}

        <div className="p-6 max-w-4xl mx-auto">

          {/* Company info card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: '#068BC9' }}>
                <MdBusiness size={22} />
              </div>
              <div>
                <p className="text-base font-bold text-gray-800">{company.businessName}</p>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    color: company.isActive ? '#22c55e' : '#ef4444',
                    backgroundColor: company.isActive ? '#dcfce7' : '#fee2e2'
                  }}>
                  {company.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400">Contact Person</p>
                <p className="text-gray-700">{company.contactPersonName || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Contact Email</p>
                <p className="text-gray-700">{company.contactPersonEmail || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Contact Phone</p>
                <p className="text-gray-700">{company.contactPersonPhonenumber || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Address</p>
                <p className="text-gray-700">{company.address || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">City / State</p>
                <p className="text-gray-700">{company.city || '—'}, {company.state || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Billing Type</p>
                <p className="text-gray-700 capitalize">{company.billingType || '—'}</p>
              </div>
            </div>
          </div>

          {/* Users */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-700">Users ({users.length})</h2>
              <button
                onClick={() => setShowAddUser(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-xs font-medium"
                style={{ backgroundColor: '#22c55e' }}>
                <MdPersonAdd size={16} />
                Add User
              </button>
            </div>

            {users.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No users added yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {users.map((u, i) => (
                  <div key={i} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600 capitalize">
                      {(u.role || '').replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {showAddUser && (
        <AddUserDialog
          companyId={id}
          onClose={() => setShowAddUser(false)}
          onSuccess={(msg) => { setToast(msg); fetchData(); }}
        />
      )}
    </div>
  );
}
