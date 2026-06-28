import React, { useState, useEffect } from 'react';
import {
  Video, Plus, Copy, Trash2, Briefcase, Calendar, Key, Send,
  ChevronDown, ChevronUp, AlertCircle, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../shared/context/ToastContext';
import API from '../../../shared/services/api';
import { jobPostingsApi } from '../../jobPostings/api/jobPostingsApi';

// Status colors
const STATUS_STYLES = {
  Scheduled: { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  Active:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  Completed: { color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
  Cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

// Convert datetime-local string ("2026-07-01T10:00") → UTC ISO ("2026-07-01T04:30:00.000Z" assuming IST).
// Without this conversion, backend stores LOCAL time as UTC and the email shows wrong slot.
const localToUtcIso = (localStr) => {
  if (!localStr) return null;
  const d = new Date(localStr);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

function RoomCard({ room, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const toast = useToast();
  const st = STATUS_STYLES[room.status] || STATUS_STYLES.Scheduled;

  const copyCode = () => {
    navigator.clipboard.writeText(`Room: ${room.roomCode}  PIN: ${room.roomPassword}`);
    toast.success('Room credentials copied');
  };
  const copyInvite = () => {
    const url = `${window.location.origin}/ai-interview/${room.id}/${room.candidateJourneyId ?? ''}`;
    const text =
`You're invited to an AI interview on HireIQ.

Room Code: ${room.roomCode}
PIN:       ${room.roomPassword}
Schedule:  ${room.scheduledAt ? new Date(room.scheduledAt).toLocaleString() : 'TBD'}

Join: ${url}`;
    navigator.clipboard.writeText(text);
    toast.success('Invite text copied');
  };

  return (
    <div className="card" style={{ borderLeft: `3px solid ${st.color}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700 }}>
              {room.candidateName || room.candidateEmail}
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: st.bg, color: st.color
            }}>{room.status}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {room.jobTitle && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Briefcase size={11} /> {room.jobTitle}
              </span>
            )}
            {room.scheduledAt && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={11} /> {new Date(room.scheduledAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <div style={{
            padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: 8,
            fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--accent-cyan)',
            border: '1px solid var(--border-bright)', letterSpacing: 2
          }}>
            {room.roomCode}
          </div>
          <button onClick={copyCode} className="icon-btn"><Copy size={14} /></button>
          <button onClick={() => setExpanded(!expanded)} className="icon-btn">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={() => onDelete(room.id)} className="icon-btn icon-btn-danger">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <Stat label="ROOM CODE" value={room.roomCode} color="var(--accent-cyan)" />
            <Stat label="PIN" value={room.roomPassword} color="var(--accent-pink)" />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={copyInvite} className="btn-primary"
              style={{ background: 'var(--gradient-2)', padding: '10px 16px', fontSize: 13 }}>
              <Send size={14} /> Copy Invite
            </button>
            <Link to={`/ai-interview/${room.id}/${room.candidateJourneyId ?? ''}`}
              className="btn-primary"
              style={{ background: 'var(--gradient-3)', padding: '10px 16px', fontSize: 13, textDecoration: 'none' }}>
              <Video size={14} /> Start Room
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const Stat = ({ label, value, color }) => (
  <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color, letterSpacing: 3 }}>{value}</div>
  </div>
);

function InterviewRooms() {
  const toast = useToast();
  const [rooms, setRooms] = useState([]);
  const [jobs, setJobs] = useState([]);     // structured job_postings (new)
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState(null);
  const [questions, setQuestions] = useState(['']);
  const [form, setForm] = useState({
    candidateEmail: '', candidateName: '', jobId: '', scheduledAt: '',
  });

  const refresh = async () => {
    setLoading(true);
    try {
      // Prefer new job_postings; fall back gracefully if empty
      const [postingsRes, roomsRes] = await Promise.all([
        jobPostingsApi.list().catch(() => ({ data: [] })),
        API.get('/api/interview-rooms').catch(() => ({ data: [] })),
      ]);
      setJobs(postingsRes.data || []);
      setRooms(roomsRes.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!form.candidateEmail.trim()) {
      setFormError('Candidate email is required.');
      return;
    }

    setCreating(true);
    try {
      // ⚠ Critical: jobId must be null (not "") for JSON deserialization to nullable Guid
      const payload = {
        candidateEmail: form.candidateEmail.trim(),
        candidateName: form.candidateName.trim() || null,
        jobId: form.jobId || null,
        scheduledAt: localToUtcIso(form.scheduledAt),
        presetQuestions: questions.map(q => q.trim()).filter(Boolean),
      };

      const res = await API.post('/api/interview-rooms', payload);
      setRooms(prev => [res.data, ...prev]);
      toast.success(`Room ${res.data.roomCode} created · email sent`);
      setShowForm(false);
      setForm({ candidateEmail: '', candidateName: '', jobId: '', scheduledAt: '' });
      setQuestions(['']);
    } catch (err) {
      const msg = err?.response?.data?.error
        ?? err?.response?.data?.title
        ?? err?.message
        ?? 'Unknown error';
      setFormError(`Backend rejected: ${msg}`);
      toast.error('Could not create room');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await API.delete(`/api/interview-rooms/${id}`);
      setRooms(prev => prev.filter(r => r.id !== id));
      toast.success('Room deleted');
    } catch { toast.error('Delete failed'); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'var(--bg-secondary)',
    border: '1px solid var(--border-bright)', borderRadius: 8,
    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
    colorScheme: 'dark',   // ⚠ makes datetime-local picker readable in dark theme
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            Interview Rooms
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {rooms.length} rooms · AI-powered video interviews
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}
          style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
          <Plus size={16} /> Create Room
        </button>
      </div>

      {showForm && (
        <div className="card" style={{
          marginBottom: 24, borderColor: 'var(--accent-purple)',
          background: 'linear-gradient(135deg,rgba(124,58,237,0.04),rgba(236,72,153,0.04))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Video size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700 }}>
                New Interview Room
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Room code + PIN auto-generated · Invite email sent
              </p>
            </div>
          </div>

          {formError && (
            <div style={{
              display: 'flex', gap: 8, padding: 12, borderRadius: 8, marginBottom: 16,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', fontSize: 13,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>{formError}</div>
            </div>
          )}

          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <Field label="Candidate Email *">
                <input type="email" required
                  placeholder="candidate@email.com"
                  value={form.candidateEmail}
                  onChange={e => setForm({ ...form, candidateEmail: e.target.value })}
                  style={inputStyle} />
              </Field>
              <Field label="Candidate Name">
                <input type="text" placeholder="Jane Doe"
                  value={form.candidateName}
                  onChange={e => setForm({ ...form, candidateName: e.target.value })}
                  style={inputStyle} />
              </Field>
              <Field label="Job Role (optional)">
                <select value={form.jobId}
                  onChange={e => setForm({ ...form, jobId: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">— Select a published job —</option>
                  {jobs.filter(j => j.status === 'Published').map(j =>
                    <option key={j.id} value={j.id}>{j.title} · {j.company}</option>
                  )}
                </select>
                {jobs.length === 0 && (
                  <Link to="/job-postings/new" style={{
                    fontSize: 11, color: 'var(--accent-cyan)', display: 'inline-flex',
                    alignItems: 'center', gap: 4, marginTop: 4
                  }}>
                    <ExternalLink size={11} /> No jobs yet — create one
                  </Link>
                )}
              </Field>
              <Field label="Schedule At (your local time)">
                <input type="datetime-local" value={form.scheduledAt}
                  onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                  style={inputStyle} />
                {form.scheduledAt && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Stored as UTC: {localToUtcIso(form.scheduledAt) || 'invalid'}
                  </div>
                )}
              </Field>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  AI Preset Questions
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (AI will ask these + follow-ups)</span>
                </label>
                <button type="button" onClick={() => setQuestions(q => [...q, ''])}
                  style={{ fontSize: 12, color: 'var(--accent-cyan)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  + Add Question
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {questions.map((q, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--accent-purple)', fontWeight: 700, width: 20, flexShrink: 0 }}>
                      {i + 1}.
                    </span>
                    <input type="text"
                      placeholder='e.g. "Describe your experience with REST APIs"'
                      value={q}
                      onChange={e => setQuestions(qs => qs.map((x, j) => j === i ? e.target.value : x))}
                      style={{ ...inputStyle, flex: 1 }} />
                    {questions.length > 1 && (
                      <button type="button"
                        onClick={() => setQuestions(qs => qs.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn-primary" disabled={creating}
                style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
                {creating ? 'Creating…' : <><Key size={14} /> Generate Room</>}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading rooms…</div>
      ) : rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <Video size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>No rooms yet — create your first interview room.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rooms.map(room => <RoomCard key={room.id} room={room} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}

const Field = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
      {label}
    </label>
    {children}
  </div>
);

export default InterviewRooms;
