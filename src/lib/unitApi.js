import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const getUnits = async () => {
  const response = await axios.get(`${API_URL}/units`);
  return response.data;
};

export const createUnit = async (data) => {
  const response = await axios.post(`${API_URL}/units`, data);
  return response.data;
};

export const updateUnit = async (id, data) => {
  const response = await axios.put(`${API_URL}/units/${id}`, data);
  return response.data;
};

export const deleteUnit = async (id) => {
  const response = await axios.delete(`${API_URL}/units/${id}`);
  return response.data;
};
