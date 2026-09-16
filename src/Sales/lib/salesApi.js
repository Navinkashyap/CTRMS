import axios from "axios";

// Same backend, same login/token as the rest of the admin app — these just
// hit the /api/sales/* routes, which are gated by auth + per-account
// permission flags (see Backend/src/routes/salesRoutes.js).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const salesApi = axios.create({ baseURL: `${API_BASE_URL}/sales` });

salesApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Clients */
export const getClients = async (params = {}) => (await salesApi.get("/clients", { params })).data;
export const getClient = async (id) => (await salesApi.get(`/clients/${id}`)).data;
export const createClient = async (payload) => (await salesApi.post("/clients", payload)).data;
export const updateClient = async (id, payload) => (await salesApi.put(`/clients/${id}`, payload)).data;

/* Contacts */
export const getContacts = async (params = {}) => (await salesApi.get("/contacts", { params })).data;
export const getContact = async (id) => (await salesApi.get(`/contacts/${id}`)).data;
export const createContact = async (payload) => (await salesApi.post("/contacts", payload)).data;
export const updateContact = async (id, payload) => (await salesApi.put(`/contacts/${id}`, payload)).data;

/* Projects */
export const getProjects = async (params = {}) => (await salesApi.get("/projects", { params })).data;
export const getProject = async (id) => (await salesApi.get(`/projects/${id}`)).data;
export const createProject = async (payload) => (await salesApi.post("/projects", payload)).data;

/* Sales Manager accounts (admin only) */
export const getSalesUsers = async () => (await salesApi.get("/users")).data;
export const getSalesUser = async (id) => (await salesApi.get(`/users/${id}`)).data;
export const createSalesUser = async (payload) => (await salesApi.post("/users", payload)).data;
export const updateSalesUser = async (id, payload) => (await salesApi.put(`/users/${id}`, payload)).data;
export const deleteSalesUser = async (id) => (await salesApi.delete(`/users/${id}`)).data;

/* Dashboard */
export const getSalesSummary = async () => (await salesApi.get("/dashboard/summary")).data;

export default salesApi;
