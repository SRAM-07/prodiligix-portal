import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ClientSidebar from './ClientSidebar';
import { getCurrentUser } from '../services/authService';

const ADMIN_ROLES = ['super_admin', 'crm_user'];

export default function SmartSidebar({ onToggle }) {
  const user = getCurrentUser();
  const isAdmin = user && ADMIN_ROLES.includes(user.role);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (onToggle) onToggle(expanded);
  }, [expanded, onToggle]);

  if (isAdmin) {
    return <Sidebar onToggle={onToggle} />;
  }

  return <ClientSidebar expanded={expanded} setExpanded={setExpanded} />;
}