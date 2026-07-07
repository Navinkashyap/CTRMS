import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getEvaluations = async () => {
  const response = await api.get('/evaluations');
  return response.data;
};

export const getEvaluationsByVendor = async (vendorId) => {
  const response = await api.get(`/evaluations/vendor/${vendorId}`);
  return response.data;
};

export const getEvaluationById = async (id) => {
  const response = await api.get(`/evaluations/${id}`);
  return response.data;
};

export const createEvaluation = async (payload) => {
  const response = await api.post('/evaluations', payload);
  return response.data;
};

export const updateEvaluation = async (id, payload) => {
  const response = await api.put(`/evaluations/${id}`, payload);
  return response.data;
};

export const deleteEvaluation = async (id) => {
  const response = await api.delete(`/evaluations/${id}`);
  return response.data;
};
