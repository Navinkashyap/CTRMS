import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const getUsers = async () => (await axios.get(`${API_URL}/users`)).data;
export const getUser = async (id) => (await axios.get(`${API_URL}/users/${id}`)).data;
export const createUser = async (data) => (await axios.post(`${API_URL}/users`, data)).data;
export const updateUser = async (id, data) => (await axios.put(`${API_URL}/users/${id}`, data)).data;
export const deleteUser = async (id) => (await axios.delete(`${API_URL}/users/${id}`)).data;
