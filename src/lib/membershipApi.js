import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getMemberships = async () => {
  const response = await api.get('/memberships');
  return response.data;
};

export const createMembership = async (payload) => {
  const response = await api.post('/memberships', payload);
  return response.data;
};

export const updateMembership = async (id, payload) => {
  const response = await api.put(`/memberships/${id}`, payload);
  return response.data;
};

export const deleteMembership = async (id) => {
  const response = await api.delete(`/memberships/${id}`);
  return response.data;
};
