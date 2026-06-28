import http from '../../../shared/services/http';

export const jobPostingsApi = {
  list: () => http.get('/api/job-postings'),
  get: (id) => http.get(`/api/job-postings/${id}`),
  create: (data) => http.post('/api/job-postings', data),
  publish: (id) => http.post(`/api/job-postings/${id}/publish`),
  close: (id) => http.post(`/api/job-postings/${id}/close`),
};

export const jobPostingAiApi = {
  /** Upload a JD doc (PDF/DOCX/XLSX/TXT) → AI returns structured JobPostingDraft. */
  parseDocument: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return http.post('/api/job-postings/ai/parse-document', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  /** Generate / rewrite a single field using current form values as context. */
  generateField: (field, context) =>
    http.post('/api/job-postings/ai/generate-field', { field, ...context }),
  /** Magic: from just a title, generate the entire posting. */
  generateAll: (title, description, company) =>
    http.post('/api/job-postings/ai/generate-all', { title, description, company }),
};

