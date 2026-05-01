import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getCities = async () => {
  const response = await api.get('/cities');
  return response.data;
};

export const createCity = async (payload) => {
  const response = await api.post('/cities', payload);
  return response.data;
};

export const updateCity = async (id, payload) => {
  const response = await api.put(`/cities/${id}`, payload);
  return response.data;
};

export const deleteCity = async (id) => {
  const response = await api.delete(`/cities/${id}`);
  return response.data;
};
