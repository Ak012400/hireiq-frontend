import http from '../../../shared/services/http';

export const pipelineApi = {
  byJob: (jobPostingId) => http.get(`/api/pipeline/by-job/${jobPostingId}`),
  get: (journeyId) => http.get(`/api/pipeline/${journeyId}`),
  transition: (journeyId, toStage, reason) =>
    http.post(`/api/pipeline/${journeyId}/transition`, { toStage, reason }),
};

export const STAGES = [
  'Applied',
  'ScreeningQueued',
  'ScreeningDone',
  'Shortlisted',
  'AiInterviewInvited',
  'AiInterviewScheduled',
  'AiInterviewCompleted',
  'AiPassed',
  'HrInterviewInvited',
  'HrInterviewScheduled',
  'HrInterviewCompleted',
  'OfferExtended',
  'Hired',
];

export const REJECTION_STAGES = ['RejectedByAi', 'RejectedAfterAi', 'RejectedByHr', 'Withdrawn'];
