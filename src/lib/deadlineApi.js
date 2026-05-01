import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getDeadlines = async () => {
  const response = await api.get('/deadlines');
  return response.data;
};

export const createDeadline = async (payload) => {
  const response = await api.post('/deadlines', payload);
  return response.data;
};

export const updateDeadline = async (id, payload) => {
  const response = await api.put(`/deadlines/${id}`, payload);
  return response.data;
};

export const deleteDeadline = async (id) => {
  const response = await api.delete(`/deadlines/${id}`);
  return response.data;
};
