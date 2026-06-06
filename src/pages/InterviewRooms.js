import React, { useState, useEffect } from 'react';
import {
  Video, Plus, Copy, Trash2, Clock, User, Briefcase,
  CheckCircle, Calendar, Key, Link, Send, ChevronDown, ChevronUp
} from 'lucide-react';
import { getJobs } from '../services/api';
import { useToast } from '../context/ToastContext';
import API from '../services/api';

const STATUS_STYLES = {
  Scheduled:  { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  Active:     { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  Completed:  { color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
  Cancelled:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

function RoomCard({ room, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const toast = useToast();
  const st = STATUS_STYLES[room.status] || STATUS_STYLES.Scheduled;

  const copyCode = () => {
    navigator.clipboard.writeText(`Room: ${room.roomCode}  PIN: ${room.roomPassword}`);
    toast.success('Room credentials copied!');
  };

  const copyInvite = () => {
    const text = `You've been invited to an interview on HireIQ!\n\nRoom Code: ${room.roomCode}\nPIN: ${room.roomPassword}\nScheduled: ${room.scheduledAt ? new Date(room.scheduledAt).toLocaleString() : 'TBD'}\n\nJoin at: ${window.location.origin}/join-room`;
    navigator.clipboard.writeText(text);
    toast.success('Invite text copied — paste and send to candidate!');
  };

  return (
    <div className="card" style={{ borderLeft: `3px solid ${st.color}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700' }}>{room.candidateName || room.candidateEmail}</span>
            <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', background: st.bg, color: st.color }}>{room.status}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {room.jobTitle && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Briefcase size={11} /> {room.jobTitle}
              </span>
            )}
            {room.scheduledAt && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={11} /> {new Date(room.scheduledAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <div style={{ padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', color: 'var(--accent-cyan)', border: '1px solid var(--border-bright)', letterSpacing: '2px' }}>
            {room.roomCode}
          </div>
          <button onClick={copyCode} style={{ padding: '6px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-cyan)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <Copy size={14} />
          </button>
          <button onClick={() => setExpanded(!expanded)} style={{ padding: '6px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={() => onDelete(room.id)} style={{ padding: '6px 10px', background: 'none', border: '1px solid var(--border-bright)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>ROOM CODE</div>
              <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'monospace', color: 'var(--accent-cyan)', letterSpacing: '3px' }}>{room.roomCode}</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>PIN</div>
              <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'monospace', color: 'var(--accent-pink)', letterSpacing: '3px' }}>{room.roomPassword}</div>
            </div>
          </div>
          {room.presetQuestions?.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>PRESET QUESTIONS FOR AI</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {room.presetQuestions.map((q, i) => (
                  <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--accent-purple)', fontWeight: '700', flexShrink: 0 }}>{i + 1}.</span> {q}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={copyInvite} className="btn-primary" style={{ background: 'var(--gradient-2)', padding: '10px 16px', fontSize: '13px' }}>
              <Send size={14} /> Copy Invite Text
            </button>
            {room.status === 'Scheduled' && (
              <button className="btn-primary" style={{ background: 'var(--gradient-3)', padding: '10px 16px', fontSize: '13px' }}>
                <Video size={14} /> Start Room
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InterviewRooms() {
  const toast = useToast();
  const [rooms, setRooms] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [questions, setQuestions] = useState(['']);
  const [form, setForm] = useState({
    candidateEmail: '', candidateName: '', jobId: '', scheduledAt: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const [j, r] = await Promise.all([getJobs(), API.get('/api/interview-rooms')]);
        setJobs(j.data);
        setRooms(r.data || []);
      } catch { setRooms([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.candidateEmail) { toast.warning('Candidate email required.'); return; }
    setCreating(true);
    try {
      const payload = {
        ...form,
        presetQuestions: questions.filter(q => q.trim()),
      };
      const res = await API.post('/api/interview-rooms', payload);
      setRooms(prev => [res.data, ...prev]);
      toast.success(`Room ${res.data.roomCode} created!`, 'Room Ready');
      setShowForm(false);
      setForm({ candidateEmail: '', candidateName: '', jobId: '', scheduledAt: '' });
      setQuestions(['']);
    } catch { toast.error('Could not create room. Try again.'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/interview-rooms/${id}`);
      setRooms(prev => prev.filter(r => r.id !== id));
      toast.success('Room deleted.');
    } catch { toast.error('Could not delete room.'); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'var(--bg-secondary)',
    border: '1px solid var(--border-bright)', borderRadius: '8px',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>Interview Rooms</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{rooms.length} rooms · AI-powered video interviews</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
          <Plus size={16} /> Create Room
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px', borderColor: 'var(--accent-purple)', background: 'linear-gradient(135deg,rgba(124,58,237,0.04),rgba(236,72,153,0.04))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Video size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700' }}>New Interview Room</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Room code + PIN auto-generated · Invite sent to candidate</p>
            </div>
          </div>

          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Candidate Email *</label>
                <input type="email" placeholder="candidate@email.com" value={form.candidateEmail}
                  onChange={e => setForm({ ...form, candidateEmail: e.target.value })} required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Candidate Name</label>
                <input type="text" placeholder="John Doe" value={form.candidateName}
                  onChange={e => setForm({ ...form, candidateName: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Job Role</label>
                <select value={form.jobId} onChange={e => setForm({ ...form, jobId: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">-- Select Job (optional) --</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Schedule At</label>
                <input type="datetime-local" value={form.scheduledAt}
                  onChange={e => setForm({ ...form, scheduledAt: e.target.value })} style={inputStyle} />
              </div>
            </div>

            {/* Preset Questions for AI */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  AI Preset Questions <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(AI will ask these + follow-ups)</span>
                </label>
                <button type="button" onClick={() => setQuestions(q => [...q, ''])}
                  style={{ fontSize: '12px', color: 'var(--accent-cyan)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  + Add Question
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {questions.map((q, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--accent-purple)', fontWeight: '700', width: '20px', flexShrink: 0 }}>{i + 1}.</span>
                    <input type="text" placeholder={`e.g. "Describe your experience with REST APIs"`}
                      value={q} onChange={e => setQuestions(qs => qs.map((x, j) => j === i ? e.target.value : x))}
                      style={{ ...inputStyle, flex: 1 }} />
                    {questions.length > 1 && (
                      <button type="button" onClick={() => setQuestions(qs => qs.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary" disabled={creating} style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
                {creating ? 'Creating...' : <><Key size={14} /> Generate Room</>}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Rooms List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <Video size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p style={{ fontSize: '14px' }}>No rooms yet — create your first interview room!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rooms.map(room => <RoomCard key={room.id} room={room} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}

export default InterviewRooms;
