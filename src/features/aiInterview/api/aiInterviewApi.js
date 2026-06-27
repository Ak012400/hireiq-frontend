import http from '../../../shared/services/http';

export const aiInterviewApi = {
  start: (roomId, journeyId) => http.post('/api/ai-interview/start', { roomId, journeyId }),
  nextQuestion: (sessionId) => http.post(`/api/ai-interview/next-question?sessionId=${sessionId}`),
  submitAnswer: (sessionId, questionId, answerText, startMs, endMs) =>
    http.post('/api/ai-interview/answer', { sessionId, questionId, answerText, startMs, endMs }),
  sendFrame: (sessionId, frameBase64, frameAtMs) =>
    http.post('/api/ai-interview/frame', { sessionId, frameBase64, frameAtMs }),
  end: (sessionId) => http.post(`/api/ai-interview/end?sessionId=${sessionId}`),
  report: (sessionId) => http.get(`/api/ai-interview/${sessionId}/report`),
};
