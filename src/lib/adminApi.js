import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Admin accounts are real logins, so these routes require the superadmin token.
const api = axios.create({ baseURL: `${API_URL}/admins` });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getAdmins = async () => (await api.get('/')).data;
export const getAdmin = async (id) => (await api.get(`/${id}`)).data;
export const createAdmin = async (data) => (await api.post('/', data)).data;
export const updateAdmin = async (id, data) => (await api.put(`/${id}`, data)).data;
export const deleteAdmin = async (id) => (await api.delete(`/${id}`)).data;
