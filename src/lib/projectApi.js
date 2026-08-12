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

// Reference/working files are managed by their own endpoints rather than the
// project payload, so uploads and removals take effect immediately.
export const uploadProjectFiles = async (id, filesByField) => {
  const form = new FormData();
  for (const [field, files] of Object.entries(filesByField)) {
    Array.from(files || []).forEach((file) => form.append(field, file));
  }
  const response = await api.post(`/projects/${id}/files`, form);
  return response.data;
};

export const deleteProjectFile = async (id, field, index) => {
  const response = await api.delete(`/projects/${id}/files/${field}/${index}`);
  return response.data;
};

// Uploaded files live at /uploads on the API host, which sits one level above
// the /api base the client is configured with.
export const projectFileHref = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/api\/?$/, '');
  return `${base}${url}`;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};
