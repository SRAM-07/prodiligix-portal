import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdBusiness, MdAdd, MdSearch, MdRefresh } from 'react-icons/md';
import api from '../services/api';

export default function Companies() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/api/companies');
      setCompanies(res.data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filtered = companies.filter(c =>
    (c.businessName || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <p className="text-gray-400 text-sm">Loading companies...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <div>
            <p className="text-gray-400 text-xs">Admin</p>
            <h1 className="text-base font-bold text-gray-800">Companies</h1>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <MdSearch size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or city..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="bg-transparent text-sm outline-none w-56 text-gray-600"
            />
          </div>
        </div>

        <div className="p-5">

          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/companies/new')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#22c55e' }}>
              <MdAdd size={18} />
              Add Company
            </button>
            <span className="text-sm text-gray-500">({filtered.length})</span>
            <button onClick={fetchCompanies} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MdRefresh size={18} className="text-gray-400" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Company Name', 'Contact Person', 'City', 'State', 'Billing Type', 'Active', 'Created Date'].map((col, i) => (
                    <th key={i} className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                      No companies found
                    </td>
                  </tr>
                ) : (
                  filtered.map((c, i) => (
                    <tr
                      key={i}
                      onClick={() => navigate(`/companies/${c.id}`)}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-4 py-3 text-sm font-bold whitespace-nowrap" style={{ color: '#068BC9' }}>
                        <div className="flex items-center gap-2">
                          <MdBusiness size={16} />
                          {c.businessName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{c.contactPersonName || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{c.city || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{c.state || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap capitalize">{c.billingType || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{
                            color: c.isActive ? '#22c55e' : '#ef4444',
                            backgroundColor: c.isActive ? '#dcfce7' : '#fee2e2'
                          }}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {c.createdAt ? c.createdAt.split('T')[0] : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
