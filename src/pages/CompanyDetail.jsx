import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdArrowBack, MdBusiness, MdPersonAdd, MdClose, MdEdit } from 'react-icons/md';
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
            <input type="text" placeholder="First Name" value={form.firstName}
              onChange={e => handleChange('firstName', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
            <input type="text" placeholder="Last Name" value={form.lastName}
              onChange={e => handleChange('lastName', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
          </div>
          <input type="email" placeholder="Email" value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
          <input type="text" placeholder="Phone Number" value={form.primaryPhone}
            onChange={e => handleChange('primaryPhone', e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
          <select value={form.role} onChange={e => handleChange('role', e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
            <option value="company_user">Company User</option>
            <option value="company_admin">Company Admin</option>
            <option value="company_crm_user">Company CRM User</option>
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
  const [showEditCompany, setShowEditCompany] = useState(false);
  const [editForm, setEditForm] = useState({});
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
    // eslint-disable-next-line
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

  const openEdit = () => {
    setEditForm({
      businessName: company.businessName || '',
      contactPersonName: company.contactPersonName || '',
      contactPersonEmail: company.contactPersonEmail || '',
      contactPersonPhonenumber: company.contactPersonPhonenumber || '',
      address: company.address || '',
      city: company.city || '',
      state: company.state || '',
      zipcode: company.zipcode || '',
      billingType: company.billingType || 'wallet',
      isActive: company.isActive ?? true,
    });
    setShowEditCompany(true);
  };

  const handleSaveCompany = async () => {
    try {
      await api.put(`/api/companies/${id}`, editForm);
      setToast('Company updated successfully');
      setShowEditCompany(false);
      fetchData();
    } catch (err) {
      setToast('Failed to update company');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 sticky top-0 z-40">
          <button onClick={() => navigate('/companies')} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <MdArrowBack size={20} className="text-gray-500" />
          </button>
          <div className="flex-1">
            <p className="text-gray-400 text-xs">Admin / Companies</p>
            <h1 className="text-base font-bold text-gray-800">{company.businessName}</h1>
          </div>
          <button onClick={openEdit}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
            <MdEdit size={16} className="text-gray-500" />
            <span className="text-gray-600">Edit Company</span>
          </button>
        </div>

        {toast && (
          <div className="fixed top-20 right-6 z-[200] bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3 max-w-sm">
            <p className="text-sm text-green-600 font-medium">{toast}</p>
          </div>
        )}

        <div className="p-6 max-w-4xl mx-auto">

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

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-700">Users ({users.length})</h2>
              <button onClick={() => setShowAddUser(true)}
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

      {showEditCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Edit Company</h2>
              <button onClick={() => setShowEditCompany(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <MdClose size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Business Name</p>
                <input type="text" value={editForm.businessName}
                  onChange={e => setEditForm(p => ({...p, businessName: e.target.value}))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Contact Person</p>
                  <input type="text" value={editForm.contactPersonName}
                    onChange={e => setEditForm(p => ({...p, contactPersonName: e.target.value}))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Contact Phone</p>
                  <input type="text" value={editForm.contactPersonPhonenumber}
                    onChange={e => setEditForm(p => ({...p, contactPersonPhonenumber: e.target.value}))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Contact Email</p>
                <input type="email" value={editForm.contactPersonEmail}
                  onChange={e => setEditForm(p => ({...p, contactPersonEmail: e.target.value}))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Address</p>
                <input type="text" value={editForm.address}
                  onChange={e => setEditForm(p => ({...p, address: e.target.value}))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">City</p>
                  <input type="text" value={editForm.city}
                    onChange={e => setEditForm(p => ({...p, city: e.target.value}))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">State</p>
                  <input type="text" value={editForm.state}
                    onChange={e => setEditForm(p => ({...p, state: e.target.value}))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Pincode</p>
                  <input type="text" value={editForm.zipcode}
                    onChange={e => setEditForm(p => ({...p, zipcode: e.target.value}))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Billing Type</p>
                <select value={editForm.billingType}
                  onChange={e => setEditForm(p => ({...p, billingType: e.target.value}))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  <option value="wallet">Wallet</option>
                  <option value="po">Purchase Order (PO)</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isActive" checked={editForm.isActive}
                  onChange={e => setEditForm(p => ({...p, isActive: e.target.checked}))}
                  style={{ accentColor: '#068BC9' }} />
                <label htmlFor="isActive" className="text-sm text-gray-600">Active</label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowEditCompany(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSaveCompany}
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: '#068BC9' }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

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