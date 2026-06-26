import http from '../../../shared/services/http';

export const authApi = {
  login: (data) => http.post('/api/auth/login', data),
  register: (data) => http.post('/api/auth/register', data),
};
