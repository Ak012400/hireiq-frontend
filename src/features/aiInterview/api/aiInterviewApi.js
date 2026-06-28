import http from '../../../shared/services/http';

export const aiInterviewApi = {
  schedule: (candidateJourneyId, scheduledAtUtc, presetQuestions = []) =>
    http.post('/api/ai-interview/schedule', { candidateJourneyId, scheduledAtUtc, presetQuestions }),
  start: (roomId, journeyId) => http.post('/api/ai-interview/start', { roomId, journeyId }),
  nextQuestion: (sessionId) => http.post(`/api/ai-interview/next-question?sessionId=${sessionId}`),
  submitAnswer: (sessionId, questionId, answerText, startMs, endMs) =>
    http.post('/api/ai-interview/answer', { sessionId, questionId, answerText, startMs, endMs }),
  sendFrame: (sessionId, frameBase64, frameAtMs) =>
    http.post('/api/ai-interview/frame', { sessionId, frameBase64, frameAtMs }),
  end: (sessionId) => http.post(`/api/ai-interview/end?sessionId=${sessionId}`),
  report: (sessionId) => http.get(`/api/ai-interview/${sessionId}/report`),
};

export const mediaApi = {
  liveKitToken: (roomId, identity) =>
    http.post('/api/interview-media/livekit-token', { roomId, identity }),
  /** Upload an audio Blob recorded via MediaRecorder — server transcribes via Whisper. */
  transcribeChunk: (sessionId, questionId, startMs, endMs, audioBlob) => {
    const fd = new FormData();
    fd.append('sessionId', sessionId);
    fd.append('questionId', questionId);
    fd.append('startMs', String(startMs));
    fd.append('endMs', String(endMs));
    fd.append('audio', audioBlob, 'chunk.webm');
    return http.post('/api/interview-media/transcribe-chunk', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
