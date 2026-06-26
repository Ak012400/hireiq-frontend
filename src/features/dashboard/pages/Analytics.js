import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, CheckCircle, XCircle, Target } from 'lucide-react';
import { getJobs, getScreeningResults, getResumes } from '../../../shared/services/api';

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: '700', color, flexShrink: 0 }}>{value}</span>
      </div>
      <div style={{ height: '8px', borderRadius: '4px', background: 'var(--bg-hover)' }}>
        <div style={{ height: '100%', borderRadius: '4px', width: `${pct}%`, background: color, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

function ScoreHistogram({ results }) {
  const buckets = [
    { label: '0–30%',  min: 0,    max: 0.3,  color: '#ef4444' },
    { label: '30–50%', min: 0.3,  max: 0.5,  color: '#f59e0b' },
    { label: '50–70%', min: 0.5,  max: 0.7,  color: '#f59e0b' },
    { label: '70–85%', min: 0.7,  max: 0.85, color: '#06b6d4' },
    { label: '85–100%',min: 0.85, max: 1.01, color: '#10b981' },
  ];

  const counts = buckets.map(b => ({
    ...b,
    count: results.filter(r => r.minilmScore >= b.min && r.minilmScore < b.max).length,
  }));
  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', marginBottom: '8px' }}>
        {counts.map(b => (
          <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: b.color }}>{b.count}</span>
            <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: b.color, height: `${(b.count / maxCount) * 100}%`, minHeight: b.count > 0 ? '4px' : '0', transition: 'height 0.8s ease', opacity: 0.85 }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {counts.map(b => (
          <div key={b.label} style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>{b.label}</div>
        ))}
      </div>
    </div>
  );
}

function FunnelBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const width = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: '700', color }}>{count} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({pct}%)</span></span>
      </div>
      <div style={{ height: '10px', borderRadius: '5px', background: 'var(--bg-hover)' }}>
        <div style={{ height: '100%', borderRadius: '5px', width: `${width}%`, background: color, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

function Analytics() {
  const [results, setResults] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [r, j, s] = await Promise.all([getResumes(), getJobs(), getScreeningResults()]);
        setResumes(r.data); setJobs(j.data); setResults(s.data);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const shortlisted = results.filter(r => r.shortlisted);
  const interviewed = results.filter(r => r.candidateStatus === 'Interview');
  const hired = results.filter(r => r.candidateStatus === 'Hired');
  const rejected = results.filter(r => !r.shortlisted || r.candidateStatus === 'Rejected');

  // Resumes per job
  const resumesPerJob = jobs.map(j => ({
    title: j.title,
    count: results.filter(r => r.jdId === j.id).length,
  })).sort((a, b) => b.count - a.count).slice(0, 6);
  const maxResumesPerJob = Math.max(...resumesPerJob.map(x => x.count), 1);

  const avgScore = results.length > 0
    ? (results.reduce((s, r) => s + parseFloat(r.minilmScore || 0), 0) / results.length * 100).toFixed(1)
    : '—';

  const topCandidate = [...results].sort((a, b) => b.minilmScore - a.minilmScore)[0];

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Loading analytics...</div>;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Hiring pipeline insights across {results.length} screenings</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Screenings', value: results.length, color: '#ec4899', gradient: 'var(--gradient-2)', icon: Target },
          { label: 'Shortlisted', value: shortlisted.length, color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#10b981)', icon: CheckCircle },
          { label: 'Avg Match Score', value: `${avgScore}%`, color: '#7c3aed', gradient: 'var(--gradient-1)', icon: TrendingUp },
          { label: 'Hired', value: hired.length, color: '#10b981', gradient: 'var(--gradient-3)', icon: Users },
          { label: 'Rejection Rate', value: results.length > 0 ? `${Math.round((rejected.length / results.length) * 100)}%` : '—', color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#ec4899)', icon: XCircle },
        ].map(k => (
          <div key={k.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: k.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Syne, sans-serif' }}>{k.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{k.label}</div>
            </div>
            <div style={{ position: 'absolute', right: '-10px', top: '-10px', width: '70px', height: '70px', background: `radial-gradient(circle,${k.color}15 0%,transparent 70%)`, pointerEvents: 'none' }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Hiring Funnel */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={16} color="var(--accent-purple)" /> Hiring Funnel
          </h3>
          {results.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No screenings yet.</p>
            : <>
              <FunnelBar label="Screened" count={results.length} total={results.length} color="#7c3aed" />
              <FunnelBar label="Shortlisted (≥70%)" count={shortlisted.length} total={results.length} color="#06b6d4" />
              <FunnelBar label="Interview Stage" count={interviewed.length} total={results.length} color="#f59e0b" />
              <FunnelBar label="Hired" count={hired.length} total={results.length} color="#10b981" />
            </>
          }
        </div>

        {/* Score Distribution */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="var(--accent-cyan)" /> Score Distribution
          </h3>
          {results.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No screenings yet.</p>
            : <ScoreHistogram results={results} />
          }
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Resumes per Job */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="var(--accent-pink)" /> Applicants per Role
          </h3>
          {resumesPerJob.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No data yet.</p>
            : resumesPerJob.map(j => <MiniBar key={j.title} label={j.title} value={j.count} max={maxResumesPerJob} color="var(--accent-pink)" />)
          }
        </div>

        {/* Top Candidates */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} color="var(--accent-green)" /> Top Candidates
          </h3>
          {results.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No screenings yet.</p>
            : [...results]
                .sort((a, b) => b.minilmScore - a.minilmScore)
                .slice(0, 5)
                .map((r, i) => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? 'var(--gradient-3)' : i === 1 ? 'linear-gradient(135deg,#f59e0b,#ec4899)' : 'var(--bg-hover)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: '700', color: 'white',
                    }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.candidateName || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.jobTitle || '—'}</div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', flexShrink: 0 }}>
                      {(r.minilmScore * 100).toFixed(0)}%
                    </span>
                  </div>
                ))
          }
        </div>
      </div>
    </div>
  );
}

export default Analytics;
