import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getSpecializations = async () => {
  const response = await api.get('/specializations');
  return response.data;
};

export const createSpecialization = async (payload) => {
  const response = await api.post('/specializations', payload);
  return response.data;
};

export const updateSpecialization = async (id, payload) => {
  const response = await api.put(`/specializations/${id}`, payload);
  return response.data;
};

export const deleteSpecialization = async (id) => {
  const response = await api.delete(`/specializations/${id}`);
  return response.data;
};
