import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const getRoles = async () => (await axios.get(`${API_URL}/roles`)).data;
export const getRole = async (id) => (await axios.get(`${API_URL}/roles/${id}`)).data;
export const createRole = async (data) => (await axios.post(`${API_URL}/roles`, data)).data;
export const updateRole = async (id, data) => (await axios.put(`${API_URL}/roles/${id}`, data)).data;
export const deleteRole = async (id) => (await axios.delete(`${API_URL}/roles/${id}`)).data;
