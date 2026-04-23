import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getVendors = async () => {
  const response = await api.get('/vendors');
  return response.data;
};

export const getVendorById = async (id) => {
  const response = await api.get(`/vendors/${id}`);
  return response.data;
};

export const createVendor = async (payload) => {
  const response = await api.post('/vendors', payload);
  return response.data;
};

export const updateVendor = async (id, payload) => {
  const response = await api.put(`/vendors/${id}`, payload);
  return response.data;
};

export const deleteVendor = async (id) => {
  const response = await api.delete(`/vendors/${id}`);
  return response.data;
};
