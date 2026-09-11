import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getMotherTongues = async () => {
  const response = await api.get('/mother-tongues');
  return response.data;
};

export const createMotherTongue = async (payload) => {
  const response = await api.post('/mother-tongues', payload);
  return response.data;
};

export const updateMotherTongue = async (id, payload) => {
  const response = await api.put(`/mother-tongues/${id}`, payload);
  return response.data;
};

export const deleteMotherTongue = async (id) => {
  const response = await api.delete(`/mother-tongues/${id}`);
  return response.data;
};
