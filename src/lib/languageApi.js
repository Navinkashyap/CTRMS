import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getLanguages = async () => {
  const response = await api.get('/languages');
  return response.data;
};

export const createLanguage = async (payload) => {
  const response = await api.post('/languages', payload);
  return response.data;
};

export const updateLanguage = async (id, payload) => {
  const response = await api.put(`/languages/${id}`, payload);
  return response.data;
};

export const deleteLanguage = async (id) => {
  const response = await api.delete(`/languages/${id}`);
  return response.data;
};
