import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Calendar, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { getJobs } from '../../../shared/services/api';
import { useToast } from '../../../shared/context/ToastContext';
import API from '../../../shared/services/api';

function JobBoard() {
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [applied, setApplied] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getJobs();
        setJobs(res.data);
        // Load applied jobs
        const appRes = await API.get('/api/job-applications/mine').catch(() => ({ data: [] }));
        setApplied(new Set(appRes.data.map(a => a.jobId)));
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      await API.post('/api/job-applications', { jobId });
      setApplied(prev => new Set([...prev, jobId]));
      toast.success('Application submitted!', 'Applied');
    } catch (e) {
      if (e.response?.status === 409) toast.warning('You already applied to this job.', 'Already Applied');
      else toast.error('Application failed. Try again.', 'Error');
    } finally { setApplying(null); }
  };

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>Job Board</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{jobs.length} open positions · Apply with AI-enhanced resume</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '480px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search roles, skills..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '11px 11px 11px 40px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '10px', color: 'var(--text-primary)',
            fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent-green)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading jobs...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <Briefcase size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p style={{ fontSize: '14px' }}>{search ? 'No jobs match your search.' : 'No jobs posted yet — check back soon!'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(job => {
            const isApplied = applied.has(job.id);
            return (
              <div key={job.id} className="card" style={{ borderLeft: `3px solid ${isApplied ? '#10b981' : 'var(--accent-cyan)'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Briefcase size={18} color="white" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '2px' }}>{job.title}</h3>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} /> Posted {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {job.content}
                    </p>
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    {isApplied ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '13px', fontWeight: '600' }}>
                        <CheckCircle size={14} /> Applied
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={applying === job.id}
                        className="btn-primary"
                        style={{ background: 'linear-gradient(135deg,#06b6d4,#10b981)', padding: '10px 18px', fontSize: '13px' }}>
                        {applying === job.id ? 'Applying...' : <> Apply <ArrowRight size={14} /></>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JobBoard;
