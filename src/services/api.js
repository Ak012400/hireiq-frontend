import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5201',
});

// Har request me token add karo
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('hireiq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/api/auth/register', data);
export const login = (data) => API.post('/api/auth/login', data);

// Resumes
export const getResumes = () => API.get('/api/resumes');
export const createResume = (data) => API.post('/api/resumes', data);
export const deleteResume = (id) => API.delete(`/api/resumes/${id}`);

// Jobs
export const getJobs = () => API.get('/api/jobs');
export const createJob = (data) => API.post('/api/jobs', data);
export const deleteJob = (id) => API.delete(`/api/jobs/${id}`);

// Screening
export const runScreening = (data) => API.post('/api/screening/run', data);
export const getScreeningResults = () => API.get('/api/screening/all');

// Chat
export const sendMessage = (data) => API.post('/api/chat', data);

export default API;
