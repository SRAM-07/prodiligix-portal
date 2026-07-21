import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import {
  MdDashboard, MdLocalShipping, MdDescription,
  MdCardGiftcard, MdEvent, MdComputer,
  MdBarChart, MdUpload, MdLogout
} from 'react-icons/md';

const serviceMenus = {
  dashboard: [
    { icon: <MdDashboard size={20} />, label: 'Overview', path: '/client-dashboard' },
    { icon: <MdLocalShipping size={20} />, label: 'Logistic Management', path: '/client/logistics', section: 'SERVICES' },
    { icon: <MdDescription size={20} />, label: 'Stamp Paper', path: '/stamp-paper' },
    { icon: <MdCardGiftcard size={20} />, label: 'Corporate Gifting', path: '/gifting' },
    { icon: <MdEvent size={20} />, label: 'Event & Team Outing', path: '/events' },
    { icon: <MdComputer size={20} />, label: 'IT Solutions', path: '/it-solutions' },
  ],
  logistics: [
    { icon: <MdDashboard size={20} />, label: 'Overview', path: '/client-dashboard' },
    { icon: <MdLocalShipping size={20} />, label: 'Logistic Management', path: '/client/logistics', section: 'SERVICES' },
    { icon: <MdBarChart size={20} />, label: 'Reports', path: '/client/reports', section: 'TOOLS' },
    { icon: <MdUpload size={20} />, label: 'Bulk Upload', path: '/client/bulk-upload' },
  ],
  stampPaper: [
    { icon: <MdDashboard size={20} />, label: 'Overview', path: '/client-dashboard' },
    { icon: <MdDescription size={20} />, label: 'Stamp Paper', path: '/stamp-paper', section: 'SERVICES' },
    { icon: <MdBarChart size={20} />, label: 'Reports', path: '/client/reports', section: 'TOOLS' },
  ],
  gifting: [
    { icon: <MdDashboard size={20} />, label: 'Overview', path: '/client-dashboard' },
    { icon: <MdCardGiftcard size={20} />, label: 'Corporate Gifting', path: '/gifting', section: 'SERVICES' },
  ],
  events: [
    { icon: <MdDashboard size={20} />, label: 'Overview', path: '/client-dashboard' },
    { icon: <MdEvent size={20} />, label: 'Event & Team Outing', path: '/events', section: 'SERVICES' },
  ],
  itSolutions: [
    { icon: <MdDashboard size={20} />, label: 'Overview', path: '/client-dashboard' },
    { icon: <MdComputer size={20} />, label: 'IT Solutions', path: '/it-solutions', section: 'SERVICES' },
  ],
};

function getMenuForPath(pathname) {
  if (pathname === '/client-dashboard') return serviceMenus.dashboard;
  if (pathname.includes('/client/logistics') || pathname.includes('/client/bulk-upload') || pathname.includes('/client/reports')) return serviceMenus.logistics;
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

      {/* Company info */}
      <div className="px-4 py-4 border-b border-white border-opacity-10 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: '#068BC9' }}>
          R
        </div>
        {expanded && (
          <div className="overflow-hidden">
            <p className="text-white text-xs font-semibold truncate">Rapido .</p>
            <p className="text-gray-400 text-xs truncate">Roppen Transportation...</p>
          </div>
        )}
      </div>

      {/* Dynamic Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
        {menuItems.map((item, i) => (
          <React.Fragment key={i}>
            {item.section && expanded && (
              <p className="text-gray-500 text-xs px-3 pt-3 pb-1 uppercase tracking-wider">
                {item.section}
              </p>
            )}
            <button
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${
                location.pathname === item.path
                  ? 'bg-white bg-opacity-15 text-white'
                  : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
              }`}>
              <span className="flex-shrink-0">{item.icon}</span>
              {expanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          </React.Fragment>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 border-t border-white border-opacity-10 pt-4">
        {expanded && (
          <div className="px-3 mb-3">
            <p className="text-white text-xs font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-gray-400 text-xs capitalize">
              {user?.role?.replace(/_/g, ' ')}
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