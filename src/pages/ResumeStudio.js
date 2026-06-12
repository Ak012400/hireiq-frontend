import React, { useState, useRef, useEffect } from 'react';
import { FileEdit, MessageSquare, FileScan, Layout as LayoutIcon, Send, Upload, Download, Sparkles, Check, Bot, User } from 'lucide-react';
import ResumeBuilder from './ResumeBuilder';
import PdfTools from './PdfTools';
import TemplateStudio from '../SpecialEditor/TemplateStudio';
import { TEMPLATES } from '../templates/resumeTemplates';
import { aiRedesignResume, coachResume, generatePdf } from '../services/api';

// ════════════════════════ AI COACH ROOM ════════════════════════
// Chat with AI on the left, live resume preview on the right.
// AI suggestions come with one-click Apply buttons.

const EMPTY_RESUME = {
  name: '', role: '', email: '', phone: '', linkedin: '', github: '',
  summary: '', skills: [], experience: [], education: [], projects: [], extra: '',
};

// "Title — Company: description" / "Name: description" line parsers
const parseExpLine = (line) => {
  const m = line.match(/^(.*?)\s+—\s+(.*?):\s*(.*)$/);
  if (m) return { title: m[1].trim(), company: m[2].trim(), description: m[3].trim() };
  const m2 = line.match(/^(.*?):\s*(.*)$/);
  if (m2) return { title: m2[1].trim(), company: '', description: m2[2].trim() };
  return { title: line.trim(), company: '', description: '' };
};
const parseProjLine = (line) => {
  const m = line.match(/^(.*?):\s*(.*)$/);
  if (m) return { name: m[1].trim(), description: m[2].trim() };
  return { name: line.trim(), description: '' };
};
const parseEduLine = (line) => {
  const m = line.match(/^(.*?)\s+—\s+(.*)$/);
  if (m) return { degree: m[1].trim(), school: m[2].trim() };
  return { degree: line.trim(), school: '' };
};

function CoachRoom() {
  const user = JSON.parse(localStorage.getItem('hireiq_user') || '{}');
  const [resume, setResume] = useState({ ...EMPTY_RESUME, name: user.name || '', email: user.email || '' });
  const [seeded, setSeeded] = useState(false);
  const [template, setTemplate] = useState('slate-sidebar');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resumeFile', file);
      const res = await aiRedesignResume(fd);
      setResume({ ...EMPTY_RESUME, ...res.data });
      setSeeded(true);
      setMessages([{ role: 'assistant', content: `I've loaded and improved your resume, ${res.data.name || 'there'}! 🎉 Check the preview on the right. Ask me anything — "make my summary stronger", "add leadership points", "tailor this for a fintech role"…`, updates: [] }]);
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const startBlank = () => {
    setSeeded(true);
    setMessages([{ role: 'assistant', content: `Hi ${user.name || 'there'}! 👋 I'm your Resume Coach. Tell me about yourself — your role, experience, skills — and I'll build your resume section by section. Watch it come alive on the right!`, updates: [] }]);
  };

  const applyUpdate = (u) => {
    setResume(prev => {
      const next = { ...prev };
      const lines = u.content.split('\n').map(l => l.trim()).filter(Boolean);
      switch (u.section.toLowerCase()) {
        case 'summary': next.summary = u.content; break;
        case 'role': next.role = u.content; break;
        case 'extra': next.extra = u.content; break;
        case 'skills': next.skills = u.content.split(',').map(s => s.trim()).filter(Boolean); break;
        case 'experience': next.experience = lines.map(parseExpLine); break;
        case 'projects': next.projects = lines.map(parseProjLine); break;
        case 'education': next.education = lines.map(parseEduLine); break;
        default: break;
      }
      return next;
    });
  };

  const send = async () => {
    const msg = input.trim();
    if (!msg || busy) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: msg, updates: [] }];
    setMessages(newMessages);
    setBusy(true);
    try {
      const res = await coachResume({
        message: msg,
        resume,
        history: newMessages.slice(-6).map(m => ({ role: m.role, content: m.content })),
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, updates: res.data.updates || [] }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: err.response?.data?.error || 'Sorry, I had trouble responding. Try again.', updates: [] }]);
    } finally {
      setBusy(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const html = TEMPLATES[template].render(resume);
      const res = await generatePdf(html);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(resume.name || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('PDF download failed — is the backend running?');
    }
  };

  // ── Empty state ──
  if (!seeded) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '420px', gap: '18px' }}>
      <Bot size={52} color="var(--accent-purple)" style={{ opacity: 0.7 }} />
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800' }}>AI Resume Coach</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', maxWidth: '420px' }}>
        Chat with AI while your resume updates live next to the conversation. Every suggestion comes with a one-click Apply button.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <input ref={fileRef} type="file" accept="application/pdf" onChange={handleUpload} style={{ display: 'none' }} />
        <button className="btn-primary" disabled={uploading} onClick={() => fileRef.current?.click()}
          style={{ padding: '12px 22px', background: 'var(--gradient-2)', opacity: uploading ? 0.6 : 1 }}>
          <Upload size={15} /> {uploading ? 'AI is reading…' : 'Upload my resume'}
        </button>
        <button className="btn-primary" onClick={startBlank}
          style={{ padding: '12px 22px', background: 'var(--gradient-3)' }}>
          <Sparkles size={15} /> Start from scratch
        </button>
      </div>
    </div>
  );

  // ── Coach + live preview ──
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: 'calc(100vh - 210px)', minHeight: '480px' }}>
      {/* Chat panel */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bot size={16} color="var(--accent-purple)" />
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: '700' }}>Resume Coach</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((m, i) => (
            <div key={i}>
              <div style={{
                display: 'flex', gap: '8px', alignItems: 'flex-start',
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                  background: m.role === 'user' ? 'var(--gradient-3)' : 'var(--gradient-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {m.role === 'user' ? <User size={13} color="white" /> : <Bot size={13} color="white" />}
                </div>
                <div style={{
                  maxWidth: '82%', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', lineHeight: '1.7',
                  background: m.role === 'user' ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                  color: 'var(--text-primary)', border: '1px solid var(--border)',
                }}>
                  {m.content}
                </div>
              </div>
              {/* Suggestion cards */}
              {m.updates?.length > 0 && (
                <div style={{ marginLeft: '34px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {m.updates.map((u, j) => (
                    <div key={j} style={{
                      padding: '10px 12px', borderRadius: '10px',
                      background: 'var(--bg-secondary)', border: '1px dashed var(--accent-purple)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '1px' }}>{u.section}</span>
                          <div style={{ fontSize: '12.5px', fontWeight: '600', marginTop: '2px' }}>{u.title}</div>
                        </div>
                        <button onClick={() => applyUpdate(u)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                            padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: 'var(--gradient-2)', color: 'white', fontSize: '12px', fontWeight: '600',
                          }}>
                          <Check size={12} /> Apply
                        </button>
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px', maxHeight: '60px', overflow: 'hidden', whiteSpace: 'pre-wrap' }}>
                        {u.content.length > 180 ? u.content.slice(0, 180) + '…' : u.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {busy && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px', marginLeft: '34px' }}>
              <Bot size={13} /> Coach is thinking…
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
          <input type="text" value={input} placeholder='Try: "make my summary stronger" or "tailor for fintech"'
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            style={{
              flex: 1, padding: '11px 14px', background: 'var(--bg-secondary)',
              border: '1px solid var(--border-bright)', borderRadius: '10px',
              color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
            }} />
          <button onClick={send} disabled={busy || !input.trim()}
            style={{
              padding: '11px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: 'var(--gradient-2)', color: 'white', opacity: (busy || !input.trim()) ? 0.5 : 1,
            }}>
            <Send size={15} />
          </button>
        </div>
      </div>

      {/* Live preview panel */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <select value={template} onChange={e => setTemplate(e.target.value)}
            style={{
              padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none', cursor: 'pointer',
            }}>
            {Object.entries(TEMPLATES).map(([key, t]) => (
              <option key={key} value={key}>{t.preview} {t.name}{t.premium ? ' ✨' : ''}</option>
            ))}
          </select>
          <button onClick={downloadPdf} className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '12px', background: 'var(--gradient-3)' }}>
            <Download size={13} /> PDF
          </button>
        </div>
        <iframe srcDoc={TEMPLATES[template].render(resume)} title="Live Resume"
          style={{ flex: 1, width: '100%', border: 'none', background: 'white' }} />
      </div>
    </div>
  );
}

// ════════════════════════ STUDIO SHELL ════════════════════════

const TABS = [
  { key: 'builder',  label: 'Builder',     icon: FileEdit,      desc: 'AI + manual resume builder' },
  { key: 'coach',    label: 'AI Coach',    icon: MessageSquare, desc: 'Chat — live resume editing', badge: 'NEW' },
  { key: 'enhancer', label: 'Enhancer',    icon: FileScan,      desc: 'ATS score & AI review' },
  { key: 'templates',label: 'Templates',   icon: LayoutIcon,    desc: 'Template editor' },
];

function ResumeStudio() {
  const [tab, setTab] = useState('builder');

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
          Resume Studio
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Build, coach, enhance & export — everything resume in one place
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '10px', cursor: 'pointer',
              background: tab === t.key ? 'var(--gradient-2)' : 'var(--bg-secondary)',
              border: tab === t.key ? 'none' : '1px solid var(--border)',
              color: tab === t.key ? 'white' : 'var(--text-secondary)',
              fontSize: '13px', fontWeight: '600', fontFamily: 'DM Sans, sans-serif',
            }}>
            <t.icon size={15} />
            {t.label}
            {t.badge && tab !== t.key && (
              <span style={{ fontSize: '9px', fontWeight: '700', color: '#f59e0b' }}>✨ {t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'builder' && <ResumeBuilder />}
      {tab === 'coach' && <CoachRoom />}
      {tab === 'enhancer' && <PdfTools />}
      {tab === 'templates' && <TemplateStudio />}
    </div>
  );
}

export default ResumeStudio;
