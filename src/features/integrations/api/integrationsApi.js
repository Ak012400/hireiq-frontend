import http from '../../../shared/services/http';

export const integrationsApi = {
  list: () => http.get('/api/integrations'),
  upsert: (board, data) => http.put(`/api/integrations/${board}`, data),
  linkedInOAuthUrl: () => http.get('/api/integrations/linkedin/oauth-url'),
};
