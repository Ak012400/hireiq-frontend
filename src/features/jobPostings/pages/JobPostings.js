import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2, ExternalLink, Users } from 'lucide-react';
import { jobPostingsApi } from '../api/jobPostingsApi';
import { card, h1, subtitle, pageHeader, colors } from '../../../shared/styles/darkTheme';

const STATUS_STYLES = {
  Draft:     { color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' },
  Published: { color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  Closed:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  Archived:  { color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

export default function JobPostings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try { const { data } = await jobPostingsApi.list(); setJobs(data); }
    finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);

  const publish = async (id) => { await jobPostingsApi.publish(id); refresh(); };
  const close = async (id) => { await jobPostingsApi.close(id); refresh(); };

  return (
    <div>
      <div style={pageHeader}>
        <div>
          <h1 style={h1}>Job Postings</h1>
          <p style={subtitle}>{jobs.length} postings · Manage publishing + view pipeline</p>
        </div>
        <Link to="/job-postings/new" className="btn-primary">
          <Plus size={16} /> New Job
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: colors.textMuted }}>Loading…</div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: colors.textMuted }}>
          <Building2 size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>No postings yet. Create your first structured job.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {jobs.map(j => {
            const st = STATUS_STYLES[j.status] || STATUS_STYLES.Draft;
            return (
              <div key={j.id} style={{ ...card, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: colors.text }}>
                        {j.title}
                      </span>
                      <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color }}>
                        {j.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: colors.textMuted }}>
                      {j.company} · {j.location} · {j.workMode} · {j.employmentType}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {j.status === 'Draft' && (
                      <button onClick={() => publish(j.id)} className="btn-primary"
                        style={{ padding: '8px 14px', fontSize: 13 }}>Publish</button>
                    )}
                    {j.status === 'Published' && (
                      <>
                        <a href={j.linkedInShareUrl} target="_blank" rel="noreferrer"
                          className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                          <ExternalLink size={13} /> LinkedIn
                        </a>
                        <button onClick={() => close(j.id)} className="btn-secondary"
                          style={{ padding: '8px 14px', fontSize: 13, color: '#fca5a5' }}>Close</button>
                      </>
                    )}
                    <Link to={`/pipeline/${j.id}`} className="btn-secondary"
                      style={{ padding: '8px 14px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                      <Users size={13} /> Pipeline
                    </Link>
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
