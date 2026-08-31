import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdLock } from 'react-icons/md';
import ClientLayout from './ClientLayout';

const BRAND = '#068BC9';

export default function ServiceNotAvailable({ serviceName = 'This service' }) {
  const navigate = useNavigate();
  return (
    <ClientLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e0f2fe' }}>
          <MdLock size={32} style={{ color: BRAND }} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Access Restricted</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          <span className="font-medium">{serviceName}</span> is not enabled for your account.
          Please contact ProDiligix to get access.
        </p>
        <button
          onClick={() => navigate('/client-dashboard')}
          className="mt-2 px-5 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ backgroundColor: BRAND }}>
          Back to Dashboard
        </button>
      </div>
    </ClientLayout>
  );
}
