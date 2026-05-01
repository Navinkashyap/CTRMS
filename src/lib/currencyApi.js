import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getCurrencies = async () => {
  const response = await api.get('/currencies');
  return response.data;
};

export const createCurrency = async (payload) => {
  const response = await api.post('/currencies', payload);
  return response.data;
};

export const updateCurrency = async (id, payload) => {
  const response = await api.put(`/currencies/${id}`, payload);
  return response.data;
};

export const deleteCurrency = async (id) => {
  const response = await api.delete(`/currencies/${id}`);
  return response.data;
};
