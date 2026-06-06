import React, { useState, useEffect } from 'react';
import {
  Search, Zap, TrendingUp, User, Briefcase,
  CheckCircle, XCircle, Users, ChevronRight, Award, Clock, Star
} from 'lucide-react';
import {
  getResumes, getJobs, runScreening,
  getScreeningResults, runBulkScreening, updateCandidateStatus
} from '../services/api';
import { useToast } from '../context/ToastContext';

const STATUS_OPTIONS = ['Screened', 'Interview', 'Hired', 'Rejected'];
const STATUS_STYLES = {
  Screened:  { bg: 'rgba(6,182,212,0.12)',  color: '#06b6d4', icon: '🔍' },
  Interview: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', icon: '📅' },
  Hired:     { bg: 'rgba(16,185,129,0.12)', color: '#10b981', icon: '🎉' },
  Rejected:  { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', icon: '❌' },
};
const MATCH_COLOR = { EXCELLENT: '#10b981', HIGH: '#06b6d4', MEDIUM: '#f59e0b', LOW: '#ef4444' };

function ScoreBar({ score }) {
  const pct = (score * 100).toFixed(1);
  const color = score >= 0.85 ? '#10b981' : score >= 0.70 ? '#06b6d4' : score >= 0.50 ? '#f59e0b' : '#ef4444';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>MiniLM Match</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color }}>{pct}%</span>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-hover)' }}>
        <div style={{ height: '100%', borderRadius: '3px', width: `${pct}%`, background: color, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function StatusBadge({ status, screeningId, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const style = STATUS_STYLES[status] || STATUS_STYLES.Screened;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '4px 10px', borderRadius: '20px',
        background: style.bg, color: style.color,
        border: `1px solid ${style.color}40`,
        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        {style.icon} {status}
        <ChevronRight size={10} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: '4px',
          background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
          borderRadius: '10px', overflow: 'hidden', zIndex: 50,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)', minWidth: '140px',
        }}>
          {STATUS_OPTIONS.map(s => {
            const st = STATUS_STYLES[s];
            return (
              <button key={s} onClick={() => { onStatusChange(screeningId, s); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', padding: '9px 14px',
                background: s === status ? st.bg : 'none',
                border: 'none', color: st.color,
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'DM Sans, sans-serif',
              }}
                onMouseEnter={e => { if (s !== status) e.currentTarget.style.background = st.bg; }}
                onMouseLeave={e => { if (s !== status) e.currentTarget.style.background = 'none'; }}
              >
                {st.icon} {s}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ScreeningCard({ result, onStatusChange, rank }) {
  const matchColor = MATCH_COLOR[result.matchLevel] || '#9ca3af';
  return (
    <div className="card" style={{ borderLeft: `3px solid ${result.shortlisted ? matchColor : '#374151'}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {rank != null && (
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: rank === 0 ? 'var(--gradient-3)' : rank === 1 ? 'linear-gradient(135deg,#f59e0b,#ec4899)' : 'var(--bg-hover)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '700', color: 'white',
            }}>
              {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`}
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700' }}>
                {result.candidateName || 'Unknown Candidate'}
              </span>
              {result.shortlisted ? <CheckCircle size={15} color="#10b981" /> : <XCircle size={15} color="#ef4444" />}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={11} /> {result.jobTitle || 'Unknown Role'}
              <span>·</span>
              <Clock size={11} /> {result.createdAt ? new Date(result.createdAt).toLocaleDateString() : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
          <span style={{
            padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700',
            background: `${matchColor}20`, color: matchColor, border: `1px solid ${matchColor}40`,
          }}>{result.matchLevel}</span>
          <StatusBadge status={result.candidateStatus || 'Screened'} screeningId={result.id} onStatusChange={onStatusChange} />
        </div>
      </div>
      <div style={{ marginBottom: result.analysis ? '12px' : 0 }}>
        <ScoreBar score={parseFloat(result.minilmScore)} />
      </div>
      {result.analysis && (
        <div style={{
          padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px',
          fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--accent-purple)', fontWeight: '600', fontSize: '12px' }}>
            <TrendingUp size={12} /> HireIQ Deep Analysis
          </div>
          {result.analysis}
        </div>
      )}
      {!result.shortlisted && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '8px' }}>
          Score below 70% threshold — auto-rejected from shortlist.
        </div>
      )}
    </div>
  );
}

function Screening() {
  const toast = useToast();
  const [tab, setTab] = useState('single');
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ resumeId: '', jdId: '', deepAnalyze: false });
  const [screening, setScreening] = useState(false);
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [bulkJobId, setBulkJobId] = useState('');
  const [bulkResults, setBulkResults] = useState([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [r, j, s] = await Promise.all([getResumes(), getJobs(), getScreeningResults()]);
      setResumes(r.data); setJobs(j.data); setResults(s.data);
    } catch { toast.error('Failed to load data. Please refresh.'); }
    finally { setLoading(false); }
  };

  const handleScreen = async (e) => {
    e.preventDefault();
    setScreening(true);
    try {
      await runScreening({ resumeId: form.resumeId, jdId: form.jdId, deepAnalyze: form.deepAnalyze });
      toast.success('Screening complete!', 'Done');
      await fetchData();
      setForm({ resumeId: '', jdId: '', deepAnalyze: false });
      setTab('results');
    } catch { toast.error('Screening failed. Check that the ML service is running.', 'Error'); }
    finally { setScreening(false); }
  };

  const handleRunBulk = async () => {
    if (!bulkJobId) { toast.warning('Select a job first.', 'Missing field'); return; }
    if (selectedResumes.length === 0) { toast.warning('Select at least one resume.', 'Missing field'); return; }
    setIsBulkLoading(true);
    try {
      const data = await runBulkScreening({ jdId: bulkJobId, resumeIds: selectedResumes });
      setBulkResults(data);
      toast.success(`${data.length} candidates ranked!`, 'Bulk pipeline done');
      setTab('results');
      await fetchData();
    } catch { toast.error('Bulk pipeline failed. Try again.', 'Error'); }
    finally { setIsBulkLoading(false); }
  };

  const handleStatusChange = async (screeningId, newStatus) => {
    try {
      await updateCandidateStatus(screeningId, newStatus);
      setResults(prev => prev.map(r => r.id === screeningId ? { ...r, candidateStatus: newStatus } : r));
      setBulkResults(prev => prev.map(r => r.id === screeningId ? { ...r, candidateStatus: newStatus } : r));
      toast.success(`Status → "${newStatus}"`, 'Updated');
    } catch { toast.error('Could not update status.', 'Error'); }
  };

  const selectStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)',
    borderRadius: '8px', color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer', boxSizing: 'border-box',
  };

  const shortlisted = results.filter(r => r.shortlisted).length;
  const tabs = [
    { id: 'single',  label: 'Single Screen', icon: <User size={14} /> },
    { id: 'bulk',    label: 'Bulk Pipeline', icon: <Users size={14} /> },
    { id: 'results', label: `Results (${results.length})`, icon: <Award size={14} /> },
  ];

  const Spinner = () => (
    <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  );

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>AI Screening</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{shortlisted} shortlisted · {results.length} total screenings</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg-card)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 18px', borderRadius: '9px', border: 'none',
            fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            background: tab === t.id ? 'var(--gradient-2)' : 'none',
            color: tab === t.id ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Single */}
      {tab === 'single' && (
        <div className="card" style={{ borderColor: 'var(--accent-pink)', background: 'linear-gradient(135deg,rgba(236,72,153,0.04),rgba(124,58,237,0.04))', maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gradient-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700' }}>Single Resume Screening</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>MiniLM fast score + optional Groq deep analysis</p>
            </div>
          </div>
          <form onSubmit={handleScreen}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Job Description</label>
                <select value={form.jdId} onChange={e => setForm({ ...form, jdId: e.target.value })} required style={selectStyle}>
                  <option value="">-- Select Job --</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Candidate Resume</label>
                <select value={form.resumeId} onChange={e => setForm({ ...form, resumeId: e.target.value })} required style={selectStyle}>
                  <option value="">-- Select Candidate --</option>
                  {resumes.map(r => <option key={r.id} value={r.id}>{r.candidateName}</option>)}
                </select>
              </div>
            </div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', cursor: 'pointer',
              padding: '12px', borderRadius: '8px', transition: 'all 0.2s',
              background: form.deepAnalyze ? 'rgba(124,58,237,0.08)' : 'var(--bg-secondary)',
              border: `1px solid ${form.deepAnalyze ? 'var(--accent-purple)' : 'var(--border)'}`,
            }}>
              <input type="checkbox" checked={form.deepAnalyze} onChange={e => setForm({ ...form, deepAnalyze: e.target.checked })}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-purple)' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Deep Analysis (Groq Llama-3)</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Strengths, skill gaps & recommendation — only runs if score ≥ 70%</div>
              </div>
            </label>
            <button type="submit" className="btn-primary" disabled={screening}
              style={{ background: 'var(--gradient-2)', width: '100%', justifyContent: 'center', padding: '13px' }}>
              {screening ? <><Spinner /> Screening...</> : <><Search size={16} /> Run Screening</>}
            </button>
          </form>
        </div>
      )}

      {/* Bulk */}
      {tab === 'bulk' && (
        <div className="card" style={{ borderColor: 'var(--accent-cyan)', background: 'linear-gradient(135deg,rgba(6,182,212,0.04),rgba(16,185,129,0.04))', maxWidth: '720px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gradient-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700' }}>Bulk Screening Pipeline</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Parallel MiniLM → Groq deep analysis for top candidates → ranked leaderboard</p>
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Target Job</label>
            <select value={bulkJobId} onChange={e => setBulkJobId(e.target.value)} style={selectStyle}>
              <option value="">-- Select Job --</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Candidates ({selectedResumes.length} selected)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setSelectedResumes(resumes.map(r => r.id))}
                  style={{ fontSize: '11px', color: 'var(--accent-cyan)', background: 'none', border: 'none', cursor: 'pointer' }}>Select all</button>
                <button type="button" onClick={() => setSelectedResumes([])}
                  style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
              </div>
            </div>
            <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-bright)', borderRadius: '10px', padding: '10px', background: 'var(--bg-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {resumes.map(r => (
                <label key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer',
                  padding: '7px 10px', borderRadius: '7px', color: 'var(--text-primary)', transition: 'all 0.15s',
                  background: selectedResumes.includes(r.id) ? 'rgba(6,182,212,0.1)' : 'transparent',
                  border: `1px solid ${selectedResumes.includes(r.id) ? 'var(--accent-cyan)' : 'transparent'}`,
                }}>
                  <input type="checkbox" checked={selectedResumes.includes(r.id)}
                    onChange={() => setSelectedResumes(prev => prev.includes(r.id) ? prev.filter(x => x !== r.id) : [...prev, r.id])}
                    style={{ cursor: 'pointer', accentColor: 'var(--accent-cyan)' }} />
                  {r.candidateName}
                </label>
              ))}
            </div>
          </div>
          <button onClick={handleRunBulk} disabled={isBulkLoading || selectedResumes.length === 0 || !bulkJobId}
            className="btn-primary" style={{
              background: 'var(--gradient-3)', width: '100%', justifyContent: 'center', padding: '13px',
              opacity: (isBulkLoading || selectedResumes.length === 0 || !bulkJobId) ? 0.6 : 1,
            }}>
            {isBulkLoading ? <><Spinner /> Running Pipeline...</> : <><Zap size={16} /> Run Bulk Pipeline ({selectedResumes.length} candidates)</>}
          </button>
        </div>
      )}

      {/* Results */}
      {tab === 'results' && (
        <div>
          {bulkResults.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Star size={18} color="var(--accent-orange)" fill="var(--accent-orange)" />
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '700' }}>
                  Latest Bulk Run — {bulkResults.filter(r => r.shortlisted).length}/{bulkResults.length} Shortlisted
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bulkResults.map((result, idx) => (
                  <ScreeningCard key={result.id} result={result} rank={idx} onStatusChange={handleStatusChange} />
                ))}
              </div>
              <div style={{ height: '1px', background: 'var(--border)', margin: '24px 0' }} />
            </div>
          )}
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>All Screenings ({results.length})</h2>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1,2,3].map(i => <div key={i} className="card" style={{ height: '90px', animation: 'pulse 1.5s infinite' }} />)}
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <Search size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p style={{ fontSize: '14px' }}>No screenings yet — run your first one!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.map(result => <ScreeningCard key={result.id} result={result} onStatusChange={handleStatusChange} />)}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

export default Screening;
