import api from './api';

export const getShipments = async (companyId) => {
  const response = await api.get(`/api/shipments/company/${companyId}`);
  return response.data;
};

export const getShipmentById = async (id) => {
  const response = await api.get(`/api/shipments/${id}`);
  return response.data;
};

export const createShipment = async (data) => {
  const response = await api.post('/api/shipments', data);
  return response.data;
};

export const updateShipmentStatus = async (id, status) => {
  const response = await api.patch(`/api/shipments/${id}/status`, { status });
  return response.data;
};

export const cancelShipment = async (id, reason) => {
  const response = await api.patch(`/api/shipments/${id}/cancel`, { reason });
  return response.data;
};

export const getShipmentByAwb = async (awb) => {
  const response = await api.get(`/api/shipments/awb/${awb}`);
  return response.data;
};