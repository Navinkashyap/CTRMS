import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// -> [{ role, actions: [...], menus: [...] }]
export const getRolePermissions = async () => (await axios.get(`${API_URL}/role-permissions`)).data;

// permissions: { "<role name>": ["<action name>", ...] }
export const saveRoleActionPermissions = async (permissions) =>
  (await axios.put(`${API_URL}/role-permissions/actions`, { permissions })).data;

// permissions: { "<role name>": ["<menu name>", ...] }
export const saveRoleMenuPermissions = async (permissions) =>
  (await axios.put(`${API_URL}/role-permissions/menus`, { permissions })).data;
