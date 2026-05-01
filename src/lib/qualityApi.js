import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getQualities = async () => {
  const response = await api.get('/qualities');
  return response.data;
};

export const createQuality = async (payload) => {
  const response = await api.post('/qualities', payload);
  return response.data;
};

export const updateQuality = async (id, payload) => {
  const response = await api.put(`/qualities/${id}`, payload);
  return response.data;
};

export const deleteQuality = async (id) => {
  const response = await api.delete(`/qualities/${id}`);
  return response.data;
};
