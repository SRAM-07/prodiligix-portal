import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { MdRefresh, MdCheck, MdClose } from 'react-icons/md';
import api from '../services/api';

const serviceIcons = {
  'Logistic Management Services': '🚚',
  'Stamp Paper Procurement Management': '📄',
  'Book Corporate Gifting': '🎁',
  'Event & Team Outing Management': '🎉',
  'IT Solutions': '💻',
};

export default function MapCompanyServices() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [mappedServices, setMappedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/api/companies');
      setCompanies(res.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get('/api/company-services/all-services');
      setServices(res.data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  };

  const fetchMappedServices = async (companyId) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/company-services/company/${companyId}`);
      setMappedServices(res.data.map(cs => cs.serviceId));
    } catch (err) {
      console.error('Failed to fetch mapped services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedCompany) fetchMappedServices(selectedCompany);
  }, [selectedCompany]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const isMapped = (serviceId) => mappedServices.includes(serviceId);

  const handleToggle = async (serviceId) => {
    if (!selectedCompany) return;
    try {
      if (isMapped(serviceId)) {
        await api.delete(`/api/company-services/company/${selectedCompany}/service/${serviceId}`);
        setMappedServices(prev => prev.filter(id => id !== serviceId));
        setToast('Service removed');
      } else {
        await api.post(`/api/company-services/company/${selectedCompany}/service/${serviceId}`);
        setMappedServices(prev => [...prev, serviceId]);
        setToast('Service mapped');
      }
    } catch (err) {
      setToast('Failed to update service mapping');
    }
  };

  const selectedCompanyName = companies.find(c => c.id === parseInt(selectedCompany))?.businessName || '';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onToggle={setSidebarExpanded} />

      <div className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '240px' : '64px' }}>

        <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
          <div>
            <p className="text-gray-400 text-xs">Admin</p>
            <h1 className="text-base font-bold text-gray-800">Map Company Services</h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
              <option value="">Select Company</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.businessName}</option>
              ))}
            </select>
            {selectedCompany && (
              <button onClick={() => fetchMappedServices(selectedCompany)}
                className="p-1.5 rounded-lg hover:bg-gray-100">
                <MdRefresh size={18} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {toast && (
          <div className="fixed top-20 right-6 z-[200] bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3">
            <p className="text-sm text-green-600 font-medium">{toast}</p>
          </div>
        )}

        <div className="p-5">
          {!selectedCompany ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              Select a company to manage its services
            </div>
          ) : loading ? (
            <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-5">
                Toggle services for <strong>{selectedCompanyName}</strong> — enabled services will be accessible to this company's users.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {services.map(service => {
                  const mapped = isMapped(service.id);
                  return (
                    <div key={service.id}
                      className="bg-white rounded-xl border shadow-sm p-5 flex items-center justify-between cursor-pointer transition-all"
                      style={{ borderColor: mapped ? '#068BC9' : '#e5e7eb' }}
                      onClick={() => handleToggle(service.id)}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: mapped ? '#e0f2fe' : '#f3f4f6' }}>
                          {serviceIcons[service.name] || '⚙️'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{service.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {mapped ? 'Enabled for this company' : 'Not enabled'}
                          </p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: mapped ? '#068BC9' : '#f3f4f6'
                        }}>
                        {mapped
                          ? <MdCheck size={20} className="text-white" />
                          : <MdClose size={20} className="text-gray-400" />
                        }
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-400">
                  <strong>{mappedServices.length}</strong> of <strong>{services.length}</strong> services enabled for {selectedCompanyName}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}