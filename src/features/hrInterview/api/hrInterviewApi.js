import http from '../../../shared/services/http';

export const hrInterviewApi = {
  schedule: (data) => http.post('/api/hr-interviews', data),
  complete: (id, update) => http.post(`/api/hr-interviews/${id}/complete`, update),
};

export const hiringDecisionApi = {
  decide: (data) => http.post('/api/hiring-decisions', data),
  candidateAccepts: (decisionId) => http.post(`/api/hiring-decisions/${decisionId}/accept`),
};
