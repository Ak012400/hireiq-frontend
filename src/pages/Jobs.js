import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, Calendar, Search } from 'lucide-react';
import { getJobs, createJob, deleteJob } from '../services/api';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res = await getJobs();
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createJob(form);
      setForm({ title: '', content: '' });
      setShowForm(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await deleteJob(id);
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-bright)',
    borderRadius: '8px', color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    boxSizing: 'border-box',
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '24px',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '24px', fontWeight: '800', marginBottom: '4px',
          }}>Job Descriptions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {jobs.length} jobs in database
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{ background: 'linear-gradient(135deg, #06b6d4, #10b981)' }}
        >
          <Plus size={16} /> Add Job
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card" style={{
          marginBottom: '24px',
          borderColor: 'var(--accent-cyan)',
        }}>
          <h3 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '16px', fontWeight: '700',
            marginBottom: '16px', color: 'var(--accent-cyan)',
          }}>New Job Description</h3>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '13px',
                color: 'var(--text-secondary)', marginBottom: '8px',
              }}>Job Title</label>
              <input
                type="text"
                placeholder="Senior Python Developer"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '13px',
                color: 'var(--text-secondary)', marginBottom: '8px',
              }}>Job Description</label>
              <textarea
                placeholder="We are looking for a Python developer with 3+ years experience in Django, SQL, REST APIs..."
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                required rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{ background: 'linear-gradient(135deg, #06b6d4, #10b981)' }}
              >
                {saving ? 'Saving...' : <><Plus size={14} /> Save Job</>}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForm(false)}
              >Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={16} style={{
          position: 'absolute', left: '14px',
          top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
        }} />
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '10px 10px 10px 40px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px', color: 'var(--text-primary)',
            fontSize: '14px', outline: 'none',
            fontFamily: 'DM Sans, sans-serif',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Jobs List */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          color: 'var(--text-muted)',
        }}>
          <Briefcase size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p>No jobs found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(job => (
            <div key={job.id} className="card" style={{
              display: 'flex', alignItems: 'flex-start', gap: '16px',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4, #10b981)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}>
                <Briefcase size={20} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '15px', fontWeight: '600',
                  fontFamily: 'Syne, sans-serif', marginBottom: '4px',
                }}>{job.title}</div>
                <div style={{
                  fontSize: '13px', color: 'var(--text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', marginBottom: '8px',
                }}>{job.content}</div>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '6px', color: 'var(--text-muted)', fontSize: '12px',
                }}>
                  <Calendar size={12} />
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete(job.id)}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  padding: '8px', borderRadius: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Jobs;
