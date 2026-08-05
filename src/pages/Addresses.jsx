import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { MdSearch, MdClose, MdAdd, MdEdit, MdDelete, MdLocationOn, MdRefresh } from 'react-icons/md';
import api from '../services/api';
import AddAddressDialog from '../components/AddAddressDialog';
import EditAddressDialog from '../components/EditAddressDialog';

export default function Addresses() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(null);
  const [editAddress, setEditAddress] = useState(null);
  const [toast, setToast] = useState('');
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = selectedCompany
        ? await api.get(`/api/addresses/company/${selectedCompany}`)
        : await api.get('/api/addresses');
      setAddresses(res.data);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
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
    fetchAddresses();
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [selectedCompany]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/api/addresses/${id}`);
      setToast('Address deleted successfully');
      fetchAddresses();
    } catch (err) {
      setToast('Failed to delete address');
    }
  };

  const filtered = addresses.filter(a => {
    const matchesSearch =
      (a.facilityName || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (a.city || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (a.zipcode || '').includes(searchText);
    const matchesType = !typeFilter || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type) => {
    if (type === 'pickup') return { color: '#068BC9', bg: '#e0f2fe' };
    if (type === 'delivery') return { color: '#22c55e', bg: '#dcfce7' };
    return { color: '#9ca3af', bg: '#f3f4f6' };
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <div>
            <p className="text-gray-400 text-xs">Resources</p>
            <h1 className="text-base font-bold text-gray-800">Addresses</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <MdSearch size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, city or pincode..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="bg-transparent text-sm outline-none w-48 text-gray-600"
              />
              {searchText && <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => setSearchText('')} />}
            </div>
            <button
              onClick={() => setShowAddDialog('pickup')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#068BC9' }}>
              <MdAdd size={18} />
              Add Address
            </button>
          </div>
        </div>

        {toast && (
          <div className="fixed top-20 right-6 z-[200] bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3">
            <p className="text-sm text-green-600 font-medium">{toast}</p>
          </div>
        )}

        <div className="p-5">

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Total Addresses', value: addresses.length, color: '#068BC9' },
              { label: 'Pickup', value: addresses.filter(a => a.type === 'pickup').length, color: '#0ea5e9' },
              { label: 'Delivery', value: addresses.filter(a => a.type === 'delivery').length, color: '#22c55e' },
              { label: 'Companies', value: new Set(addresses.map(a => a.companyId)).size, color: '#8b5cf6' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
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

            <div className="flex gap-2">
              {['', 'pickup', 'delivery'].map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: typeFilter === t ? '#068BC9' : '#f3f4f6',
                    color: typeFilter === t ? '#fff' : '#6b7280'
                  }}>
                  {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <button onClick={fetchAddresses} className="p-1.5 rounded-lg hover:bg-gray-100">
              <MdRefresh size={18} className="text-gray-400" />
            </button>

            <span className="text-sm text-gray-400">({filtered.length})</span>
          </div>

          {/* Address cards */}
          {loading ? (
            <div className="text-center py-20 text-gray-400 text-sm">Loading addresses...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">No addresses found</div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filtered.map(addr => {
                const tc = getTypeColor(addr.type);
                return (
                  <div key={addr.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: tc.bg }}>
                          <MdLocationOn size={16} style={{ color: tc.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{addr.facilityName}</p>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                            style={{ color: tc.color, backgroundColor: tc.bg }}>
                            {addr.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditAddress(addr)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                          <MdEdit size={15} className="text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(addr.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          <MdDelete size={15} className="text-red-400" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>{addr.address}</p>
                      <p>{addr.city}, {addr.state} — {addr.zipcode}</p>
                      <p className="text-gray-400 mt-2">{addr.contactPersonName} · {addr.contactPersonPhonenumber}</p>
                      {addr.contactPersonEmail && <p className="text-gray-400">{addr.contactPersonEmail}</p>}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                      <p className="text-xs text-gray-400">Company ID: {addr.companyId}</p>
                      <p className="text-xs text-gray-400">#{addr.id}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add buttons at bottom */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAddDialog('pickup')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={{ color: '#068BC9', borderColor: '#068BC9' }}>
              <MdAdd size={16} /> Add Pickup Address
            </button>
            <button
              onClick={() => setShowAddDialog('delivery')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={{ color: '#22c55e', borderColor: '#22c55e' }}>
              <MdAdd size={16} /> Add Delivery Address
            </button>
          </div>

        </div>
      </div>

      {showAddDialog && (
        <AddAddressDialog
          type={showAddDialog}
          companyId={selectedCompany || undefined}
          onClose={() => setShowAddDialog(null)}
          onSuccess={() => {
            setToast('Address added successfully');
            fetchAddresses();
            setShowAddDialog(null);
          }}
        />
      )}

      {editAddress && (
        <EditAddressDialog
          address={editAddress}
          onClose={() => setEditAddress(null)}
          onSuccess={() => {
            setToast('Address updated successfully');
            fetchAddresses();
            setEditAddress(null);
          }}
        />
      )}

    </div>
  );
}