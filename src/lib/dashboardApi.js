import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

export const getDashboardData = async (range) => {
  const response = await api.get('/dashboard', { params: { range } });
  return response.data;
};

export const getChartData = async (metric, range) => {
  const response = await api.get('/dashboard/chart', { params: { metric, range } });
  return response.data;
};
