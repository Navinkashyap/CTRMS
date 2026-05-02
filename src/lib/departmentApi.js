import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/departments`;

export const getDepartments = async () => {
  const response = await axios.get(API_BASE_URL);
  return response.data;
};

export const createDepartment = async (departmentData) => {
  const response = await axios.post(API_BASE_URL, departmentData);
  return response.data;
};

export const updateDepartment = async (id, departmentData) => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, departmentData);
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};
