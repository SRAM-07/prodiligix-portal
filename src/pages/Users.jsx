import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { MdSearch, MdClose, MdAdd, MdEdit, MdPerson, MdRefresh, MdDelete } from 'react-icons/md';
import api from '../services/api';

const ROLES = ['company_admin', 'company_user', 'company_crm_user'];

const roleColors = {
  'company_admin': { color: '#7c3aed', bg: '#ede9fe' },
  'company_user': { color: '#068BC9', bg: '#e0f2fe' },
  'company_crm_user': { color: '#0d9488', bg: '#ccfbf1' },
  'super_admin': { color: '#ef4444', bg: '#fee2e2' },
};

export default function Users() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdPassword, setCreatedPassword] = useState('');
  const [error, setError] = useState('');

  const emptyForm = {
    companyId: '',
    firstName: '',
    lastName: '',
    email: '',
    primaryPhone: '',
    role: 'company_user',
    isActive: true,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = selectedCompany
        ? await api.get(`/api/users/company/${selectedCompany}`)
        : await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/api/companies');
      setCompanies(res.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [selectedCompany]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const openAdd = () => {
    setEditUser(null);
    setForm({ ...emptyForm, companyId: selectedCompany || '' });
    setError('');
    setShowDialog(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({
      companyId: user.companyId || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      primaryPhone: user.primaryPhone || '',
      role: user.role || 'company_user',
      isActive: user.isActive ?? true,
    });
    setError('');
    setShowDialog(true);
  };

  const validate = () => {
    if (!form.companyId) return 'Company is required';
    if (!form.firstName.trim()) return 'First name is required';
    if (!form.lastName.trim()) return 'Last name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!form.primaryPhone.trim()) return 'Phone is required';
    if (!form.role) return 'Role is required';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setSubmitting(true);
    setError('');
    try {
      const payload = { ...form, companyId: parseInt(form.companyId) };
      if (editUser) {
        await api.put(`/api/users/${editUser.id}`, payload);
        setToast('User updated successfully');
      } else {
        const res = await api.post('/api/users', payload);
        const tempPass = res.data.tempPassword;
        setCreatedPassword(tempPass || '');
        setToast('User created successfully');
      }
      setShowDialog(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.firstName} ${user.lastName}? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/users/${user.id}`);
      setToast('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setToast('Failed to delete user');
    }
  };

  const filtered = users.filter(u => {
    const name = `${u.firstName} ${u.lastName}`.toLowerCase();
    return name.includes(searchText.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchText.toLowerCase());
  });

  const getCompanyName = (companyId) =>
    companies.find(c => c.id === companyId)?.businessName || `Company ${companyId}`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <div>
            <p className="text-gray-400 text-xs">Admin</p>
            <h1 className="text-base font-bold text-gray-800">Users</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <MdSearch size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="bg-transparent text-sm outline-none w-48 text-gray-600"
              />
              {searchText && <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => setSearchText('')} />}
            </div>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#068BC9' }}>
              <MdAdd size={18} /> Add User
            </button>
          </div>
        </div>

        {toast && (
          <div className="fixed top-20 right-6 z-[200] bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3">
            <p className="text-sm text-green-600 font-medium">{toast}</p>
          </div>
        )}

        <div className="p-5">
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Total Users', value: users.length, color: '#068BC9' },
              { label: 'Active', value: users.filter(u => u.isActive).length, color: '#22c55e' },
              { label: 'Inactive', value: users.filter(u => !u.isActive).length, color: '#ef4444' },
              { label: 'Companies', value: new Set(users.map(u => u.companyId)).size, color: '#8b5cf6' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <select
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
              <option value="">All Companies</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.businessName}</option>
              ))}
            </select>
            <button onClick={fetchUsers} className="p-1.5 rounded-lg hover:bg-gray-100">
              <MdRefresh size={18} className="text-gray-400" />
            </button>
            <span className="text-sm text-gray-400">({filtered.length})</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['User', 'Email', 'Phone', 'Company', 'Role', 'Status', 'Actions'].map((col, i) => (
                    <th key={i} className="text-left text-xs text-gray-400 font-medium px-5 py-3">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No users found</td></tr>
                ) : filtered.map((user, i) => {
                  const rc = roleColors[user.role] || { color: '#9ca3af', bg: '#f3f4f6' };
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#e0f2fe' }}>
                            <MdPerson size={16} style={{ color: '#068BC9' }} />
                          </div>
                          <p className="text-sm font-medium text-gray-700">{user.firstName} {user.lastName}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-600">{user.email}</td>
                      <td className="px-5 py-3 text-xs text-gray-600">{user.primaryPhone || '—'}</td>
                      <td className="px-5 py-3 text-xs text-gray-600">{getCompanyName(user.companyId)}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium px-2 py-1 rounded-full capitalize"
                          style={{ color: rc.color, backgroundColor: rc.bg }}>
                          {user.role?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{
                            color: user.isActive ? '#22c55e' : '#ef4444',
                            backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2'
                          }}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => openEdit(user)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                          <MdEdit size={15} className="text-gray-400" />
                        </button>
                        <button onClick={() => handleDelete(user)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          <MdDelete size={15} className="text-red-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-gray-800 mb-4">
              {editUser ? 'Edit User' : 'Add New User'}
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Company <span className="text-red-400">*</span></p>
                <select value={form.companyId} onChange={e => setForm(prev => ({ ...prev, companyId: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  <option value="">Select Company</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">First Name <span className="text-red-400">*</span></p>
                  <input type="text" value={form.firstName} onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Last Name <span className="text-red-400">*</span></p>
                  <input type="text" value={form.lastName} onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Email <span className="text-red-400">*</span></p>
                <input type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Phone <span className="text-red-400">*</span></p>
                <input type="text" maxLength={10} value={form.primaryPhone} onChange={e => setForm(prev => ({ ...prev, primaryPhone: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Role <span className="text-red-400">*</span></p>
                <select value={form.role} onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none">
                  {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isActive" checked={form.isActive}
                  onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  style={{ accentColor: '#068BC9' }} />
                <label htmlFor="isActive" className="text-sm text-gray-600">Active</label>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowDialog(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: '#068BC9' }}>
                {submitting ? 'Saving...' : editUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {createdPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#dcfce7' }}>
              <MdPerson size={24} style={{ color: '#22c55e' }} />
            </div>
            <h2 className="text-base font-bold text-gray-800 mb-2">User Created!</h2>
            <p className="text-xs text-gray-400 mb-4">Share this temporary password with the user. They can change it after logging in.</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4">
              <p className="text-xs text-gray-400 mb-1">Temporary Password</p>
              <p className="text-lg font-bold text-gray-800 font-mono">{createdPassword}</p>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(createdPassword); setCreatedPassword(''); }}
              className="w-full py-2.5 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#068BC9' }}>
              Copy & Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}