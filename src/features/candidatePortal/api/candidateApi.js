import http from '../../../shared/services/http';

export const publicJobsApi = {
  browse: (params = {}) => http.get('/api/public/jobs', { params }),
  get: (id) => http.get(`/api/public/jobs/${id}`),
};

export const applicationsApi = {
  apply: (formData) => http.post('/api/applications/apply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  mine: () => http.get('/api/applications/mine'),
};

export const consentApi = {
  grant: (kind, relatedEntityId) =>
    http.post('/api/consent', { kind, relatedEntityId, policyVersion: '1.0' }),
  check: (kind, relatedEntityId) =>
    http.get('/api/consent/check', { params: { kind, relatedEntityId } }),
};
