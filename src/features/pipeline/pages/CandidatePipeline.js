import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { pipelineApi, STAGES, REJECTION_STAGES } from '../api/pipelineApi';
import { aiInterviewApi } from '../../aiInterview/api/aiInterviewApi';
import { h1, subtitle, pageHeader, colors, stageBadge } from '../../../shared/styles/darkTheme';

// Dark-theme kanban: columns = pipeline stages, cards = candidate journeys.
export default function CandidatePipeline() {
  const { jobId } = useParams();
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try { const { data } = await pipelineApi.byJob(jobId); setJourneys(data); }
    finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, [jobId]);

  const move = async (journeyId, toStage) => {
    try { await pipelineApi.transition(journeyId, toStage); refresh(); }
    catch (e) { alert(e?.response?.data?.error || 'Transition failed'); }
  };

  const scheduleAi = async (journeyId) => {
    const whenStr = prompt('Schedule AI interview at (your local time, e.g. 2026-07-01 10:00)');
    if (!whenStr) return;
    const date = new Date(whenStr);
    if (isNaN(date.getTime())) { alert('Invalid date'); return; }
    try {
      await aiInterviewApi.schedule(journeyId, date.toISOString());
      alert('Interview scheduled · invite email sent');
      refresh();
    } catch (e) {
      alert(e?.response?.data?.error || 'Scheduling failed');
    }
  };

  if (loading) return <div style={{ padding: 40, color: colors.textMuted }}>Loading…</div>;

  const grouped = STAGES.reduce((acc, s) => ({ ...acc, [s]: [] }), {});
  for (const j of journeys) (grouped[j.currentStage] ||= []).push(j);

  return (
    <div>
      <div style={pageHeader}>
        <div>
          <h1 style={h1}>Candidate Pipeline</h1>
          <p style={subtitle}>{journeys.length} candidates · Drag forward through stages</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12 }}>
        {STAGES.map(stage => (
          <div key={stage} style={{
            minWidth: 260, background: 'var(--bg-secondary)', borderRadius: 12, padding: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {stage}
              </span>
              <span style={{ fontSize: 11, color: colors.textMuted, background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 10 }}>
                {grouped[stage]?.length || 0}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(grouped[stage] || []).map(j => (
                <div key={j.id} style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8, padding: 12,
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: colors.text }}>{j.applicantName}</div>
                  <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{j.applicantEmail}</div>
                  {stage === 'Shortlisted' && (
                    <button onClick={() => scheduleAi(j.id)} className="btn-primary"
                      style={{ width: '100%', marginTop: 8, padding: '6px 10px', fontSize: 12 }}>
                      <Calendar size={12} /> Schedule AI Interview
                    </button>
                  )}
                  <select
                    value=""
                    onChange={(e) => e.target.value && move(j.id, e.target.value)}
                    style={{
                      width: '100%', marginTop: 8, padding: '6px 8px',
                      background: 'var(--bg-secondary)', color: colors.text,
                      border: `1px solid ${colors.borderBright}`, borderRadius: 6,
                      fontSize: 12, cursor: 'pointer', colorScheme: 'dark',
                    }}>
                    <option value="">Move to…</option>
                    {[...STAGES, ...REJECTION_STAGES].filter(s => s !== j.currentStage).map(s =>
                      <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
              {(grouped[stage] || []).length === 0 && (
                <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', padding: 12 }}>—</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
