import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import api from '../services/api';
import {
  MdDashboard, MdLocalShipping, MdDescription,
  MdCardGiftcard, MdEvent, MdComputer,
  MdBarChart, MdUpload, MdLogout
, MdReceiptLong, MdArticle } from 'react-icons/md';

const serviceMenus = {
  dashboard: [
    { icon: <MdDashboard size={20} />, label: 'Overview', path: '/client-dashboard' },
    { icon: <MdLocalShipping size={20} />, label: 'Logistic Management', path: '/client/logistics', section: 'SERVICES' },
    { icon: <MdDescription size={20} />, label: 'Stamp Paper', path: '/stamp-paper' },
    { icon: <MdCardGiftcard size={20} />, label: 'Corporate Gifting', path: '/gifting' },
    { icon: <MdEvent size={20} />, label: 'Event & Team Outing', path: '/events' },
    { icon: <MdComputer size={20} />, label: 'IT Solutions', path: '/it-solutions' },
    { icon: <MdReceiptLong size={20} />, label: 'Wallet Ledger', path: '/wallet/ledger', section: 'FINANCE' },
    { icon: <MdArticle size={20} />, label: 'Invoices', path: '/client/invoices' },
  ],
  logistics: [
    { icon: <MdDashboard size={20} />, label: 'Overview', path: '/client-dashboard' },
    { icon: <MdLocalShipping size={20} />, label: 'Logistic Management', path: '/client/logistics', section: 'SERVICES' },
    { icon: <MdBarChart size={20} />, label: 'Reports', path: '/client/reports?tab=logistics', section: 'TOOLS' },
    { icon: <MdUpload size={20} />, label: 'Bulk Upload', path: '/client/bulk-upload' },
  ],
  stampPaper: [
    { icon: <MdDashboard size={20} />, label: 'Overview', path: '/client-dashboard' },
    { icon: <MdDescription size={20} />, label: 'Stamp Paper', path: '/stamp-paper', section: 'SERVICES' },
    { icon: <MdBarChart size={20} />, label: 'Reports', path: '/client/reports?tab=stamp', section: 'TOOLS' },
  ],
  gifting: [
    { icon: <MdDashboard size={20} />, label: 'Overview', path: '/client-dashboard' },
    { icon: <MdCardGiftcard size={20} />, label: 'Corporate Gifting', path: '/gifting', section: 'SERVICES' },
    { icon: <MdBarChart size={20} />, label: 'Reports', path: '/client/reports?tab=gifting', section: 'TOOLS' },
  ],
  events: [
    { icon: <MdDashboard size={20} />, label: 'Overview', path: '/client-dashboard' },
    { icon: <MdEvent size={20} />, label: 'Event & Team Outing', path: '/events', section: 'SERVICES' },
    { icon: <MdBarChart size={20} />, label: 'Reports', path: '/client/reports?tab=events', section: 'TOOLS' },
  ],
  itSolutions: [
    { icon: <MdDashboard size={20} />, label: 'Overview', path: '/client-dashboard' },
    { icon: <MdComputer size={20} />, label: 'IT Solutions', path: '/it-solutions', section: 'SERVICES' },
    { icon: <MdBarChart size={20} />, label: 'Reports', path: '/client/reports?tab=it', section: 'TOOLS' },
  ],
};

function getMenuForPath(pathname) {
  if (pathname === '/client-dashboard') return serviceMenus.dashboard;
  if (pathname.includes('/client/logistics') || pathname.includes('/client/bulk-upload')) return serviceMenus.logistics;
  if (pathname.includes('/client/reports')) {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'stamp') return serviceMenus.stampPaper;
    if (tab === 'gifting') return serviceMenus.gifting;
    if (tab === 'events') return serviceMenus.events;
    if (tab === 'it') return serviceMenus.itSolutions;
    return serviceMenus.logistics;
  }
  if (pathname.includes('/stamp-paper')) return serviceMenus.stampPaper;
  if (pathname.includes('/gifting')) return serviceMenus.gifting;
  if (pathname.includes('/events')) return serviceMenus.events;
  if (pathname.includes('/it-solutions')) return serviceMenus.itSolutions;
  return serviceMenus.dashboard;
}

export default function ClientSidebar({ expanded, setExpanded }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    if (user?.companyId) {
      api.get(`/api/companies/${user.companyId}`)
        .then(res => setCompanyName(res.data.businessName || ''))
        .catch(() => {});
    }
  }, [user?.companyId]);

  const menuItems = getMenuForPath(location.pathname);

  return (
    <div
      className="fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300"
      style={{
        width: expanded ? '240px' : '64px',
        backgroundColor: '#0a1e35',
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}>

      <div className="px-4 py-4 border-b border-white border-opacity-10 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: '#068BC9' }}>
          {companyName ? companyName.charAt(0).toUpperCase() : 'C'}
        </div>
        {expanded && (
          <div className="overflow-hidden">
            <p className="text-white text-xs font-semibold truncate">{companyName || 'Loading...'}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
        {menuItems.filter(item => !(user?.role === 'company_admin' && item.path === '/client/bulk-upload')).map((item, i) => (
          <React.Fragment key={i}>
            {item.section && expanded && (
              <p className="text-gray-500 text-xs px-3 pt-3 pb-1 uppercase tracking-wider">
                {item.section}
              </p>
            )}
            <button
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${
                location.pathname + location.search === item.path
                  ? 'bg-white bg-opacity-15 text-white'
                  : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
              }`}>
              <span className="flex-shrink-0">{item.icon}</span>
              {expanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          </React.Fragment>
        ))}
      </nav>

      <div className="px-2 pb-4 border-t border-white border-opacity-10 pt-4">
        {expanded && (
          <div className="px-3 mb-3">
            <p className="text-white text-xs font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-gray-400 text-xs capitalize">
              {user?.role?.replace(/\_/g, ' ')}
            </p>
          </div>
        )}
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white hover:bg-opacity-10 transition-colors w-full text-left">
          <MdLogout size={20} className="flex-shrink-0" />
          {expanded && <span className="text-sm whitespace-nowrap">Sign Out</span>}
        </button>
        {expanded && (
          <p className="text-gray-600 text-xs px-3 mt-3">Version 1.0.0</p>
        )}
      </div>
    </div>
  );
}