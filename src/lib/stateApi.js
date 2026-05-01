import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getStates = async () => {
  const response = await api.get('/states');
  return response.data;
};

export const createState = async (payload) => {
  const response = await api.post('/states', payload);
  return response.data;
};

export const updateState = async (id, payload) => {
  const response = await api.put(`/states/${id}`, payload);
  return response.data;
};

export const deleteState = async (id) => {
  const response = await api.delete(`/states/${id}`);
  return response.data;
};
