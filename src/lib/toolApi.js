import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getTools = async () => {
  const response = await api.get('/tools');
  return response.data;
};

export const createTool = async (payload) => {
  const response = await api.post('/tools', payload);
  return response.data;
};

export const updateTool = async (id, payload) => {
  const response = await api.put(`/tools/${id}`, payload);
  return response.data;
};

export const deleteTool = async (id) => {
  const response = await api.delete(`/tools/${id}`);
  return response.data;
};
