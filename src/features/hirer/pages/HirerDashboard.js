import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Activity, CheckCircle } from 'lucide-react';
import { jobPostingsApi } from '../../jobPostings/api/jobPostingsApi';
import { pipelineApi, STAGES, REJECTION_STAGES } from '../../pipeline/api/pipelineApi';
import { card, h1, h2, subtitle, pageHeader, colors } from '../../../shared/styles/darkTheme';

export default function HirerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [allJourneys, setAllJourneys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: js } = await jobPostingsApi.list();
        setJobs(js);
        const journeys = await Promise.all(
          js.filter(j => j.status === 'Published').map(j => pipelineApi.byJob(j.id).then(r => r.data).catch(() => []))
        );
        setAllJourneys(journeys.flat());
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div style={{ padding: 40, color: colors.textMuted }}>Loading…</div>;

  const counts = {};
  for (const s of [...STAGES, ...REJECTION_STAGES]) counts[s] = 0;
  for (const j of allJourneys) counts[j.currentStage] = (counts[j.currentStage] || 0) + 1;
  const total = allJourneys.length;
  const hired = counts['Hired'] || 0;
  const rejected = REJECTION_STAGES.reduce((s, r) => s + (counts[r] || 0), 0);
  const inProgress = total - hired - rejected;
  const activeJobs = jobs.filter(j => j.status === 'Published').length;

  return (
    <div>
      <div style={pageHeader}>
        <div>
          <h1 style={h1}>Recruiter Hub</h1>
          <p style={subtitle}>Top-level view of every job + every candidate journey</p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <Kpi icon={Briefcase} label="Active Jobs" value={activeJobs} color="var(--accent-cyan)" />
        <Kpi icon={Users} label="Applications" value={total} color="var(--accent-purple)" />
        <Kpi icon={Activity} label="In Pipeline" value={inProgress} color="var(--accent-pink)" />
        <Kpi icon={CheckCircle} label="Hired" value={hired} color="var(--accent-green)" />
      </div>

      {/* Funnel */}
      <div style={{ ...card, marginBottom: 24 }}>
        <h2 style={{ ...h2, marginBottom: 16 }}>Pipeline Funnel</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {STAGES.map(s => {
            const pct = total > 0 ? (counts[s] / total) * 100 : 0;
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 180, fontSize: 13, color: colors.textSecondary }}>{s}</div>
                <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 6, height: 18, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: 'var(--gradient-1)',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <div style={{ width: 40, textAlign: 'right', fontSize: 13, color: colors.text, fontWeight: 600 }}>
                  {counts[s]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Jobs */}
      <div style={card}>
        <h2 style={{ ...h2, marginBottom: 16 }}>Recent Jobs</h2>
        {jobs.length === 0 ? (
          <div style={{ color: colors.textMuted, fontSize: 14 }}>
            No jobs yet — <Link to="/job-postings/new" style={{ color: colors.cyan }}>create your first posting</Link>.
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {jobs.slice(0, 8).map(j => (
              <li key={j.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 12, background: 'var(--bg-secondary)', borderRadius: 8,
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: colors.text }}>{j.title}</div>
                  <div style={{ fontSize: 12, color: colors.textMuted }}>{j.company} · {j.status}</div>
                </div>
                <Link to={`/pipeline/${j.id}`} style={{ color: colors.cyan, fontSize: 13, textDecoration: 'none' }}>
                  View Pipeline →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const Kpi = ({ icon: Icon, label, value, color }) => (
  <div style={card}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    </div>
    <div style={{ fontSize: 32, fontWeight: 800, color: colors.text, fontFamily: 'Syne, sans-serif' }}>{value}</div>
  </div>
);
