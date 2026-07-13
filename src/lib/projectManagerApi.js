import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getProjectManagers = async () => {
  const response = await api.get('/project-managers');
  return response.data;
};

export const searchProjectManagers = async (query) => {
  const response = await api.get('/project-managers/search', { params: { q: query } });
  return response.data;
};

export const getProjectManagerById = async (id) => {
  const response = await api.get(`/project-managers/${id}`);
  return response.data;
};

export const createProjectManager = async (payload) => {
  const response = await api.post('/project-managers', payload);
  return response.data;
};

export const updateProjectManager = async (id, payload) => {
  const response = await api.put(`/project-managers/${id}`, payload);
  return response.data;
};

export const deleteProjectManager = async (id) => {
  const response = await api.delete(`/project-managers/${id}`);
  return response.data;
};
