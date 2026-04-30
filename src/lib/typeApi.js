import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getTypes = async () => {
  const response = await api.get('/types');
  return response.data;
};

export const createType = async (payload) => {
  const response = await api.post('/types', payload);
  return response.data;
};

export const updateType = async (id, payload) => {
  const response = await api.put(`/types/${id}`, payload);
  return response.data;
};

export const deleteType = async (id) => {
  const response = await api.delete(`/types/${id}`);
  return response.data;
};
