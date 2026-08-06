import { useState, useEffect } from 'react';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';

const SERVICE_NAME_MAP = {
  'Logistic Management Services': 'logistics',
  'Stamp Paper Procurement Management': 'stampPaper',
  'Book Corporate Gifting': 'gifting',
  'Event & Team Outing Management': 'events',
  'IT Solutions': 'itSolutions',
};

export function useCompanyServices() {
  const [enabledServices, setEnabledServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    if (!user?.companyId) {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      try {
        const [mappedRes, servicesRes] = await Promise.all([
          api.get(`/api/company-services/company/${user.companyId}`),
          api.get('/api/company-services/all-services'),
        ]);
        if (mappedRes.data.length === 0) {
          setEnabledServices(['logistics', 'stampPaper', 'gifting', 'events', 'itSolutions']);
        } else {
          const serviceIdToKey = {};
          servicesRes.data.forEach(s => {
            if (SERVICE_NAME_MAP[s.name]) serviceIdToKey[s.id] = SERVICE_NAME_MAP[s.name];
          });
          const keys = mappedRes.data.map(cs => serviceIdToKey[cs.serviceId]).filter(Boolean);
          setEnabledServices(keys);
        }
      } catch {
        setEnabledServices(['logistics', 'stampPaper', 'gifting', 'events', 'itSolutions']);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.companyId]);

  const isEnabled = (serviceKey) => enabledServices.includes(serviceKey);

  return { enabledServices, loading, isEnabled };
}
