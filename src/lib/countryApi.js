import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getCountries = async () => {
  const response = await api.get('/countries');
  return response.data;
};

export const createCountry = async (payload) => {
  const response = await api.post('/countries', payload);
  return response.data;
};

export const updateCountry = async (id, payload) => {
  const response = await api.put(`/countries/${id}`, payload);
  return response.data;
};

export const deleteCountry = async (id) => {
  const response = await api.delete(`/countries/${id}`);
  return response.data;
};
