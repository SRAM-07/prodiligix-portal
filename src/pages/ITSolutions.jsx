import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdFilterList, MdRefresh, MdSearch, MdClose, MdVisibility } from 'react-icons/md';

const itData = [
  {
    id: 'ITS-20260701001',
    company: 'Rapido Technologies Pvt. Ltd.',
    contactPerson: 'Arun Kumar',
    serviceType: 'Hardware Setup',
    description: 'Setup 25 laptops with OS and software installation',
    priority: 'High',
    assignedTo: 'Tech Partner A',
    createdDate: '2026-07-01',
    expectedResolution: '2026-07-05',
    actualResolution: '2026-07-04',
    status: 'Resolved',
  },
  {
    id: 'ITS-20260701002',
    company: 'Coca-Cola India Pvt. Ltd.',
    contactPerson: 'Meera Nair',
    serviceType: 'Network Setup',
    description: 'Configure office WiFi and LAN for new floor',
    priority: 'Medium',
    assignedTo: 'Tech Partner B',
    createdDate: '2026-07-02',
    expectedResolution: '2026-07-08',
    actualResolution: '',
    status: 'In Progress',
  },
  {
    id: 'ITS-20260701003',
    company: 'Infosys Limited',
    contactPerson: 'Suresh Babu',
    serviceType: 'Software Procurement',
    description: 'Procure 100 Microsoft Office licenses',
    priority: 'Low',
    assignedTo: 'Tech Partner A',
    createdDate: '2026-07-03',
    expectedResolution: '2026-07-10',
    actualResolution: '',
    status: 'Pending',
  },
  {
    id: 'ITS-20260701004',
    company: 'Wipro Technologies',
    contactPerson: 'Divya Rao',
    serviceType: 'IT Support',
    description: 'Monthly IT support contract for 200 employees',
    priority: 'High',
    assignedTo: 'Tech Partner C',
    createdDate: '2026-07-04',
    expectedResolution: '2026-07-31',
    actualResolution: '',
    status: 'In Progress',
  },
  {
    id: 'ITS-20260701005',
    company: 'HCL Technologies',
    contactPerson: 'Ramesh Iyer',
    serviceType: 'CCTV Installation',
    description: 'Install 20 CCTV cameras across 3 floors',
    priority: 'Medium',
    assignedTo: 'Tech Partner B',
    createdDate: '2026-07-05',
    expectedResolution: '2026-07-12',
    actualResolution: '2026-07-11',
    status: 'Resolved',
  },
];

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

const filterOptions = ['Latest', 'Since Date', 'Date Range', 'Status', 'Priority', 'Company', 'Reset / Show All'];

export default function ITSolutions() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Latest');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const filtered = itData.filter(o =>
    o.id.toLowerCase().includes(searchText.toLowerCase()) ||
    o.company.toLowerCase().includes(searchText.toLowerCase()) ||
    o.serviceType.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <div>
            <p className="text-gray-400 text-xs">Services</p>
            <h1 className="text-base font-bold text-gray-800">IT Solutions</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <MdSearch size={16} className="text-gray-400"/>
              <input
                type="text"
                placeholder="Search by ID, Company or Service..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="bg-transparent text-sm outline-none w-56 text-gray-600"
              />
              {searchText && (
                <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => setSearchText('')}/>
              )}
            </div>
          </div>
        </div>

        <div className="p-5">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-800">{itData.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Resolved</p>
              <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
                {itData.filter(i => i.status === 'Resolved').length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">In Progress</p>
              <p className="text-2xl font-bold" style={{ color: '#3b82f6' }}>
                {itData.filter(i => i.status === 'In Progress').length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 mb-1">Pending</p>
              <p className="text-2xl font-bold" style={{ color: '#f97316' }}>
                {itData.filter(i => i.status === 'Pending').length}
              </p>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: '#068BC9' }}>
                <MdFilterList size={18}/>
                Add Filter
                <span className="ml-1">{showFilter ? '▲' : '▼'}</span>
              </button>
              {showFilter && (
                <div className="absolute top-10 left-0 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-2 w-52">
                  <p className="text-xs text-gray-400 px-4 py-1 font-medium uppercase tracking-wider">Select Filter Type</p>
                  {filterOptions.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => { setActiveFilter(opt); setShowFilter(false); }}
                      className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 text-sm"
                      style={{ color: opt === 'Reset / Show All' ? '#ef4444' : '#374151' }}>
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-xs font-medium" style={{ color: '#068BC9' }}>
                {activeFilter}: {filtered.length}
              </span>
              <MdClose size={14} className="text-gray-400 cursor-pointer" onClick={() => setActiveFilter('Latest')}/>
            </div>

            <span className="text-sm text-gray-500">({filtered.length})</span>

            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MdRefresh size={18} className="text-gray-400"/>
            </button>

            <div className="ml-auto">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <MdSearch size={14} className="text-gray-400"/>
                <input
                  type="text"
                  placeholder="Service Request ID or Company Name"
                  className="bg-transparent text-xs outline-none w-52 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Ticket ID</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Company Name</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Contact Person</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Service Type</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Description</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Priority</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Assigned To</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Created Date</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Expected Resolution</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Actual Resolution</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket, i) => {
                  const s = statusConfig[ticket.status] || statusConfig['Pending'];
                  const p = priorityConfig[ticket.priority] || priorityConfig['Medium'];
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap cursor-pointer hover:underline"
                        style={{ color: '#068BC9' }}
                        onClick={() => navigate('/it-solutions/detail')}>
                        {ticket.id}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{ticket.company}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{ticket.contactPerson}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{ticket.serviceType}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{ticket.description}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ color: p.color, backgroundColor: p.bg }}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{ticket.assignedTo}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{ticket.createdDate}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{ticket.expectedResolution}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{ticket.actualResolution || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ color: s.color, backgroundColor: s.bg }}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => navigate('/it-solutions/detail')}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                          style={{ color: '#068BC9', backgroundColor: '#e0f2fe' }}>
                          <MdVisibility size={14}/>
                          View
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
    </div>
  );
}