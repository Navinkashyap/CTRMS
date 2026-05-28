import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getInvoices = async () => {
  const response = await api.get('/invoices');
  return response.data;
};

export const getInvoice = async (id) => {
  const response = await api.get(`/invoices/${id}`);
  return response.data;
};

export const getNextInvoiceNumber = async () => {
  const response = await api.get('/invoices/next-number');
  return response.data;
};

const sanitizePayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== '' && value != null)
  );

export const createInvoice = async (payload) => {
  const response = await api.post('/invoices', sanitizePayload(payload));
  return response.data;
};

export const updateInvoice = async (id, payload) => {
  const response = await api.put(`/invoices/${id}`, sanitizePayload(payload));
  return response.data;
};

export const deleteInvoice = async (id) => {
  const response = await api.delete(`/invoices/${id}`);
  return response.data;
};
