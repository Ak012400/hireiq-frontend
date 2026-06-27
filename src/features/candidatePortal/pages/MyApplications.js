import React, { useEffect, useState } from 'react';
import { applicationsApi } from '../api/candidateApi';

const STAGE_COLORS = {
  Applied: 'bg-gray-500',
  ScreeningQueued: 'bg-blue-500',
  ScreeningDone: 'bg-blue-600',
  Shortlisted: 'bg-green-600',
  AiInterviewInvited: 'bg-indigo-600',
  AiInterviewScheduled: 'bg-indigo-700',
  AiInterviewCompleted: 'bg-purple-600',
  AiPassed: 'bg-green-700',
  HrInterviewInvited: 'bg-amber-600',
  HrInterviewScheduled: 'bg-amber-700',
  HrInterviewCompleted: 'bg-purple-700',
  OfferExtended: 'bg-emerald-600',
  Hired: 'bg-emerald-700',
  RejectedByAi: 'bg-red-500',
  RejectedAfterAi: 'bg-red-600',
  RejectedByHr: 'bg-red-700',
  Withdrawn: 'bg-gray-400',
};

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsApi.mine().then(({ data }) => {
      setApps(data); setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Applications</h1>
      {apps.length === 0 && <p className="text-gray-500">You haven't applied to any jobs yet.</p>}
      <ul className="space-y-3">
        {apps.map((a) => (
          <li key={a.id} className="border rounded p-4 flex justify-between items-start">
            <div>
              <div className="font-semibold">{a.jobTitle}</div>
              <div className="text-sm text-gray-600">{a.company} · {a.location}</div>
              <div className="text-xs text-gray-400 mt-1">
                Applied {new Date(a.createdAt).toLocaleDateString()} ·
                Last update {new Date(a.lastTransitionAt).toLocaleString()}
              </div>
            </div>
            <span className={`text-white text-xs px-3 py-1 rounded ${STAGE_COLORS[a.currentStage] || 'bg-gray-500'}`}>
              {a.currentStage}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
