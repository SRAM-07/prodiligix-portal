import React, { useState } from 'react';
import ClientSidebar from './ClientSidebar';

export default function ClientLayout({ children }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientSidebar expanded={expanded} setExpanded={setExpanded} />
      <div
        className="transition-all duration-300"
        style={{ marginLeft: expanded ? '240px' : '64px' }}
      >
        {children}
      </div>
    </div>
  );
}