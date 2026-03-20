import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://localhost:7194',
});
//Request interceptor to add token to headers
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
// ✅ sendMessage update
export const sendMessage = (message) => API.post('/api/chat', { message });

// ✅ clearChat add karo
export const clearChat = () => API.delete('/api/chat/clear');
export const getChatSuggestions = () => API.get('/api/chat/suggestions');
export const generatePdf = (htmlContent) =>
  API.post('/api/resume-builder/generate-pdf',
      { htmlContent },
      { responseType: 'blob' } // ✅ PDF binary
  );

// PDF screening
export const screenPdfResume = (formData) =>
  API.post('/api/pdf/screen', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
  });

// PDF AI review
export const reviewPdfResume = (formData) =>
  API.post('/api/pdf/review', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
  });

export default API;
