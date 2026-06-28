import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { pipelineApi, STAGES, REJECTION_STAGES } from '../api/pipelineApi';
import { aiInterviewApi } from '../../aiInterview/api/aiInterviewApi';

// Kanban view: columns = pipeline stages, cards = candidate journeys.
// Hirer can drag-stage a candidate (or click "Move to ▾" select).
export default function CandidatePipeline() {
  const { jobId } = useParams();
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const { data } = await pipelineApi.byJob(jobId);
      setJourneys(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, [jobId]);

  const move = async (journeyId, toStage) => {
    try {
      await pipelineApi.transition(journeyId, toStage);
      refresh();
    } catch (e) {
      alert(e?.response?.data?.error || 'Transition failed');
    }
  };

  const scheduleAiInterview = async (journeyId) => {
    const whenStr = prompt('Schedule AI interview at (UTC, e.g. 2026-07-01T10:00)');
    if (!whenStr) return;
    try {
      await aiInterviewApi.schedule(journeyId, new Date(whenStr).toISOString());
      alert('Interview scheduled and invite email queued.');
      refresh();
    } catch (e) {
      alert(e?.response?.data?.error || 'Scheduling failed');
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  const grouped = STAGES.reduce((acc, s) => ({ ...acc, [s]: [] }), {});
  for (const j of journeys) (grouped[j.currentStage] ||= []).push(j);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Candidate Pipeline</h1>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <div key={stage} className="min-w-[240px] bg-gray-50 rounded p-3">
            <div className="font-semibold text-sm mb-2">{stage} ({grouped[stage]?.length || 0})</div>
            <div className="space-y-2">
              {(grouped[stage] || []).map(j => (
                <div key={j.id} className="bg-white border rounded p-3 shadow-sm">
                  <div className="font-medium text-sm">{j.applicantName}</div>
                  <div className="text-xs text-gray-500">{j.applicantEmail}</div>
                  {j.currentStage === 'Shortlisted' && (
                    <button onClick={() => scheduleAiInterview(j.id)}
                      className="w-full mt-2 text-xs bg-indigo-600 text-white py-1 rounded">
                      Schedule AI Interview
                    </button>
                  )}
                  <select
                    className="text-xs mt-2 border rounded w-full"
                    value=""
                    onChange={(e) => e.target.value && move(j.id, e.target.value)}>
                    <option value="">Move to…</option>
                    {[...STAGES, ...REJECTION_STAGES].filter(s => s !== j.currentStage).map(s =>
                      <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
