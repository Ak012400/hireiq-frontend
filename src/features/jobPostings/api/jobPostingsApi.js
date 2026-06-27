import http from '../../../shared/services/http';

export const jobPostingsApi = {
  list: () => http.get('/api/job-postings'),
  get: (id) => http.get(`/api/job-postings/${id}`),
  create: (data) => http.post('/api/job-postings', data),
  publish: (id) => http.post(`/api/job-postings/${id}/publish`),
  close: (id) => http.post(`/api/job-postings/${id}/close`),
};
