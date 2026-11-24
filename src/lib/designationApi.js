import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/designations`;

const LOCAL_STORAGE_KEY = 'admin_master_designations';

export const INITIAL_DEFAULT_DESIGNATIONS = [
  { _id: 'desig_1', name: 'Software Developer', description: 'Core software engineering and application development', status: 'Active' },
  { _id: 'desig_2', name: 'Project Manager', description: 'Manages localization workflows and client project lifecycles', status: 'Active' },
  { _id: 'desig_3', name: 'Procurement Lead', description: 'Vendor onboarding, procurement, and contract management', status: 'Active' },
  { _id: 'desig_4', name: 'Localization Specialist', description: 'Linguistic verification and translation memory management', status: 'Active' },
  { _id: 'desig_5', name: 'Quality Analyst', description: 'QA compliance and translation accuracy auditing', status: 'Active' },
  { _id: 'desig_6', name: 'Account Manager', description: 'Corporate client relationships and sales retention', status: 'Active' },
  { _id: 'desig_7', name: 'Director', description: 'Executive strategic leadership and operational governance', status: 'Active' },
];

const getLocalDesignations = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse local designations', e);
  }
  // Initialize with defaults if empty
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEFAULT_DESIGNATIONS));
  } catch (_) {}
  return INITIAL_DEFAULT_DESIGNATIONS;
};

const saveLocalDesignations = (items) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save local designations', e);
  }
};

export const getDesignations = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    if (Array.isArray(response.data) && response.data.length > 0) {
      saveLocalDesignations(response.data);
      return response.data;
    }
    // If backend returns empty array, sync defaults
    const local = getLocalDesignations();
    return local;
  } catch (err) {
    console.warn("Backend designation API unavailable, using local store:", err?.message);
    return getLocalDesignations();
  }
};

export const createDesignation = async (designationData) => {
  try {
    const response = await axios.post(API_BASE_URL, designationData);
    const created = response.data;
    const current = getLocalDesignations();
    const updated = [created, ...current.filter((d) => d._id !== created._id)];
    saveLocalDesignations(updated);
    return created;
  } catch (err) {
    console.warn("Backend designation creation fallback to local:", err?.message);
    const current = getLocalDesignations();
    const newEntry = {
      _id: 'desig_' + Date.now(),
      name: designationData.name.trim(),
      description: (designationData.description || '').trim(),
      status: designationData.status || 'Active',
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...current];
    saveLocalDesignations(updated);
    return newEntry;
  }
};

export const updateDesignation = async (id, designationData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, designationData);
    const updatedItem = response.data;
    const current = getLocalDesignations();
    const updated = current.map((d) => (d._id === id ? { ...d, ...updatedItem } : d));
    saveLocalDesignations(updated);
    return updatedItem;
  } catch (err) {
    console.warn("Backend designation update fallback to local:", err?.message);
    const current = getLocalDesignations();
    const updated = current.map((d) => (d._id === id ? { ...d, ...designationData } : d));
    saveLocalDesignations(updated);
    return { _id: id, ...designationData };
  }
};

export const deleteDesignation = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    const current = getLocalDesignations();
    const updated = current.filter((d) => d._id !== id);
    saveLocalDesignations(updated);
    return response.data;
  } catch (err) {
    console.warn("Backend designation delete fallback to local:", err?.message);
    const current = getLocalDesignations();
    const updated = current.filter((d) => d._id !== id);
    saveLocalDesignations(updated);
    return { message: "Deleted from local store" };
  }
};

