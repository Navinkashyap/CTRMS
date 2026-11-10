import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const getActions = async () => (await axios.get(`${API_URL}/actions`)).data;
export const getAction = async (id) => (await axios.get(`${API_URL}/actions/${id}`)).data;
export const createAction = async (data) => (await axios.post(`${API_URL}/actions`, data)).data;
export const updateAction = async (id, data) => (await axios.put(`${API_URL}/actions/${id}`, data)).data;
export const deleteAction = async (id) => (await axios.delete(`${API_URL}/actions/${id}`)).data;
