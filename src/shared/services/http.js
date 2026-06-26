// Thin axios instance — the Redux/feature layer wraps this for typed calls.
// shared/services/api.js holds the legacy endpoint helpers; new features should
// import this and define their own thunks under features/<area>/api/.
import axios from 'axios';

export const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://localhost:7194',
  timeout: 60000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('hireiq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('hireiq_token');
      localStorage.removeItem('hireiq_user');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(err);
  }
);

export default http;
