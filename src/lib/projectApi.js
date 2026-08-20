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

// Uploaded files now live in a private S3 bucket, so an absolute URL is not
// fetchable on its own — it goes through /api/files/view, which redirects to a
// short-lived signed link. Older relative /uploads paths still resolve against
// the API host, which sits one level above the configured /api base.
export const projectFileHref = (url) => {
  if (!url) return '';
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
  if (/^https?:\/\//i.test(url)) {
    return `${apiBase}/files/view?url=${encodeURIComponent(url)}`;
  }
  return `${apiBase.replace(/\/api\/?$/, '')}${url}`;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};
