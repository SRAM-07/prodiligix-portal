import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MdDashboard, 
  MdLocalShipping, 
  MdDescription, 
  MdCardGiftcard,
  MdEvent,
  MdComputer,
  MdCalculate,
  MdBarChart,
  MdLogout,
  MdPerson,
  MdUploadFile
} from 'react-icons/md';

const menuSections = [
  {
    label: 'MAIN',
    items: [
      { icon: <MdDashboard size={20}/>, label: 'Dashboard', path: '/dashboard' },
    ]
  },
  {
    label: 'SERVICES',
    items: [
      { icon: <MdLocalShipping size={20}/>, label: 'Logistics Management', path: '/logistics' },
      { icon: <MdDescription size={20}/>, label: 'Stamp Paper', path: '/stamp-paper' },
      { icon: <MdCardGiftcard size={20}/>, label: 'Corporate Gifting', path: '/gifting' },
      { icon: <MdEvent size={20}/>, label: 'Event & Team Outing', path: '/events' },
      { icon: <MdComputer size={20}/>, label: 'IT Solutions', path: '/it-solutions' },
    ]
  },
  {
    label: 'TOOLS',
    items: [
      { icon: <MdCalculate size={20}/>, label: 'Rate Calculator', path: '/rate-calculator' },
      { icon: <MdBarChart size={20}/>, label: 'Reports', path: '/reports' },
       { icon: <MdUploadFile size={20}/>, label: 'Bulk Upload', path: '/client/bulk-upload' },
    ]
  }
];

function ProfileMenu({ expanded, navigate }) {
  const [open, setOpen] = useState(false);

  React.useEffect(() => {
    if(!expanded) setOpen(false);
  },[expanded]);

  return (
    <div className="relative">

      {/* Popup */}
      {open && (
        <div
          className="absolute bottom-14 left-3 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
          style={{ width: '200px' }}>

          {/* Profile info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: '#068BC9' }}>
                SR
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Sriram M</p>
                <p className="text-xs text-gray-400">Technical Lead</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <div className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors">
              <MdPerson size={16} className="text-gray-400"/>
              <span className="text-sm text-gray-600">My Profile</span>
            </div>
            <div
              onClick={() => { setOpen(false); navigate('/'); }}
              className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-red-50 transition-colors">
              <MdLogout size={16} className="text-red-400"/>
              <span className="text-sm text-red-500 font-medium">Sign Out</span>
            </div>
          </div>
        </div>
      )}

      {/* Avatar button */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center px-4 py-3 cursor-pointer"
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: '#068BC9' }}>
          SR
        </div>
        {expanded && (
          <div className="ml-3 overflow-hidden whitespace-nowrap flex-1">
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Sriram M</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>Technical Lead</p>
          </div>
        )}
        {expanded && (
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>
            {open ? '▼' : '▲'}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({ onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMouseEnter = () => { setExpanded(true); onToggle(true); };
  const handleMouseLeave = () => { setExpanded(false); onToggle(false); };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex flex-col h-screen fixed left-0 top-0 z-50 overflow-hidden"
      style={{
        width: expanded ? '240px' : '64px',
        backgroundColor: '#0a1e35',
        transition: 'width 0.25s ease',
        boxShadow: expanded ? '6px 0 24px rgba(0,0,0,0.4)' : 'none'
      }}>

      {/* Logo area */}
      <div
        className="flex items-center px-4 border-b flex-shrink-0"
        style={{ height: '64px', borderColor: 'rgba(255,255,255,0.07)' }}>
        <img
          src="/logo.png"
          alt="ProDiligix"
          className="object-contain flex-shrink-0"
          style={{ 
            height: '38px', 
            width: '38px',
            filter: 'brightness(0) invert(1)',
            transition: 'all 0.25s ease'
          }}
        />
        {expanded && (
          <div className="ml-3 overflow-hidden whitespace-nowrap">
            <p className="font-bold text-base" style={{ color: '#22A8DD' }}>ProDiligix</p>
            <p className="text-xs tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px' }}>
              Operations Portal
            </p>
          </div>
        )}
      </div>

      {/* Menu sections */}
      <nav className="flex-1 overflow-hidden py-2">
        {menuSections.map((section, sIndex) => (
          <div key={sIndex}>

            {/* Section label */}
            {expanded && (
              <div className="px-4 pt-4 pb-1">
                <p style={{
                  color: 'rgba(255,255,255,0.25)',
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  fontWeight: '600'
                }}>
                  {section.label}
                </p>
              </div>
            )}

            {/* Divider when collapsed */}
            {!expanded && sIndex > 0 && (
              <div className="mx-4 my-2"
                style={{ height: '1px', background: 'rgba(255,255,255,0.07)' }}/>
            )}

            {/* Menu items */}
            {section.items.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="flex items-center cursor-pointer mx-2 my-0.5"
                  style={{
                    height: '42px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'rgba(34,168,221,0.15)' : 'transparent',
                    padding: '0 10px',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}>

                  {/* Active indicator */}
                  <div style={{
                    width: '3px',
                    height: '18px',
                    borderRadius: '2px',
                    backgroundColor: isActive ? '#22A8DD' : 'transparent',
                    marginRight: '10px',
                    flexShrink: 0,
                    transition: 'background 0.15s ease'
                  }}/>

                  <div style={{ color: isActive ? '#22A8DD' : 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
                    {item.icon}
                  </div>

                  {expanded && (
                    <span
                      className="whitespace-nowrap overflow-hidden"
                      style={{
                        color: isActive ? '#22A8DD' : 'rgba(255,255,255,0.7)',
                        fontSize: '13px',
                        marginLeft: '10px',
                        letterSpacing: '0.02em'
                      }}>
                      {item.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Decorative pattern */}
      <div
        className="absolute bottom-16 left-0 w-full pointer-events-none"
        style={{ height: '180px', opacity: 0.6 }}>
        <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <polygon points="0,180 0,100 60,60 120,90 180,30 240,50 240,180" fill="rgba(255,255,255,0.02)"/>
          <polygon points="0,180 0,130 80,80 160,110 240,70 240,180" fill="rgba(255,255,255,0.025)"/>
          <polygon points="0,180 0,155 100,120 180,140 240,115 240,180" fill="rgba(255,255,255,0.03)"/>
        </svg>
      </div>

      {/* Profile menu at bottom */}
      <div
        className="border-t flex-shrink-0 relative z-10"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <ProfileMenu expanded={expanded} navigate={navigate}/>
      </div>

    </div>
  );
}