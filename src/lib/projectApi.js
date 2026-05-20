import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getProjects = async () => {
  const response = await api.get('/projects');
  return response.data;
};

export const getProject = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

const sanitizePayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== '' && value != null)
  );

export const createProject = async (payload) => {
  const response = await api.post('/projects', sanitizePayload(payload));
  return response.data;
};

export const updateProject = async (id, payload) => {
  const response = await api.put(`/projects/${id}`, sanitizePayload(payload));
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};
