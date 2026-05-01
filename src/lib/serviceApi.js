import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getServices = async () => {
  const response = await api.get('/services');
  return response.data;
};

export const createService = async (payload) => {
  const response = await api.post('/services', payload);
  return response.data;
};

export const updateService = async (id, payload) => {
  const response = await api.put(`/services/${id}`, payload);
  return response.data;
};

export const deleteService = async (id) => {
  const response = await api.delete(`/services/${id}`);
  return response.data;
};
