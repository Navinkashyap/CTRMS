import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/contacts`;

export const getContacts = async () => {
  const response = await axios.get(API_BASE_URL);
  return response.data;
};

export const createContact = async (contactData) => {
  const response = await axios.post(API_BASE_URL, contactData);
  return response.data;
};

export const updateContact = async (id, contactData) => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, contactData);
  return response.data;
};

export const deleteContact = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const getContact = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  return response.data;
};
