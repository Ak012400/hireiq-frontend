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
export const updateCandidateStatus = (id, status) => API.patch(`/api/screening/${id}/status`, { status });

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
  // Custom Resume Fields
  export const getCustomFields = () => API.get('/api/resume-fields');
  export const createCustomField = (data) => API.post('/api/resume-fields', data);
  export const updateCustomField = (id, data) => API.put(`/api/resume-fields/${id}`, data);
  export const deleteCustomField = (id) => API.delete(`/api/resume-fields/${id}`);
  export const generateFieldContent = (prompt) => 
    API.post('/api/chat/generate-field', { prompt });
  // Template Editor APIs
export const getTemplatesList = () => API.get('/api/template-editor/templates');
export const getEditorState = (templateId) => API.get(`/api/template-editor/init/${templateId}`);
export const saveResumeData = (data) => API.post('/api/template-editor/save', data);
export const aiFillResume = (resumeText) => API.post('/api/template-editor/ai-fill', { resumeText });
// ✅ AI Resume Builder — premium flows
export const aiRedesignResume = (formData) =>
  API.post('/api/resume-builder/ai-redesign', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const aiGenerateResume = (data) =>
  API.post('/api/resume-builder/ai-generate', data); // { keywords, targetRole?, name? }
export const coachResume = (data) =>
  API.post('/api/resume-builder/coach', data); // { message, resume, history }

// src/services/api.js

// Add this to your existing exports
export const runBulkScreening = async (data) => {
    // data should look like: { jdId: "guid", resumeIds: ["guid1", "guid2"] }
    const response = await API.post('/api/screening/bulk', data);
    return response.data;
};
export default API;
