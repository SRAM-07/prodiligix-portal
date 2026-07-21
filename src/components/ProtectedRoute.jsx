import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = getCurrentUser();

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Role check — if allowedRoles specified, check if user has permission
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Wrong role — redirect to their correct dashboard
    if (user.role === 'super_admin' || user.role === 'crm_user') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/client-dashboard" replace />;
    }
  }

  return children;
}