import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getClients = async () => {
  const response = await api.get('/clients');
  return response.data;
};

export const getNextMembershipCode = async () => {
  const response = await api.get('/clients/next-membership-code');
  return response.data.membershipCode;
};

export const createClient = async (payload) => {
  const response = await api.post('/clients', payload);
  return response.data;
};

export const updateClient = async (id, payload) => {
  const response = await api.put(`/clients/${id}`, payload);
  return response.data;
};
