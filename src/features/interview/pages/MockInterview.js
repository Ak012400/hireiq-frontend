import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, Play, Square, RotateCcw,
  Zap, Award, ChevronRight, GraduationCap, Clock
} from 'lucide-react';
import API from '../../../shared/services/api';
import { useToast } from '../../../shared/context/ToastContext';

const STAGES = { setup: 'setup', active: 'active', finished: 'finished' };

function ScoreRing({ score, label, color }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--bg-hover)" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 36 36)"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x="36" y="40" textAnchor="middle" fill={color} fontSize="14" fontWeight="800" fontFamily="Syne, sans-serif">
          {Math.round(score)}
        </text>
      </svg>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

function MockInterview() {
  const toast = useToast();
  const [stage, setStage] = useState(STAGES.setup);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [report, setReport] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    let timer;
    if (stage === STAGES.active && startTime) {
      timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    }
    return () => clearInterval(timer);
  }, [stage, startTime]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95; utter.pitch = 1; utter.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') && v.lang === 'en-US') || voices[0];
    if (preferred) utter.voice = preferred;
    window.speechSynthesis.speak(utter);
  };

  const startInterview = async () => {
    if (!jobTitle.trim()) { toast.warning('Enter the job title first.'); return; }
    setLoading(true);
    try {
      const res = await API.post('/api/mock-interview/start', { jobTitle, jobDescription });
      const firstQ = res.data.question;
      const sid = res.data.sessionId;
      setSessionId(sid);
      setMessages([{ role: 'ai', content: firstQ }]);
      setQuestionCount(1);
      setStage(STAGES.active);
      setStartTime(Date.now());
      speak(firstQ);
    } catch { toast.error('Could not start interview. Check if backend is running.'); }
    finally { setLoading(false); }
  };

  const sendAnswer = async (text) => {
    const answer = text || input;
    if (!answer.trim() || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: answer }]);
    setLoading(true);

    try {
      const MAX_QUESTIONS = 6;
      const isLast = questionCount >= MAX_QUESTIONS;
      const res = await API.post('/api/mock-interview/answer', {
        sessionId, answer, isLast, jobTitle,
      });

      if (isLast || res.data.finished) {
        setMessages(prev => [...prev, { role: 'ai', content: '✅ Interview complete! Generating your report...' }]);
        setReport(res.data.report);
        setStage(STAGES.finished);
      } else {
        const nextQ = res.data.nextQuestion;
        setMessages(prev => [...prev, { role: 'ai', content: nextQ }]);
        setQuestionCount(q => q + 1);
        speak(nextQ);
      }
    } catch { toast.error('Error processing answer. Try again.'); }
    finally { setLoading(false); }
  };

  const toggleListen = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.warning('Voice input not supported in this browser. Use Chrome.', 'Browser Support');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR();
      rec.continuous = false; rec.interimResults = false; rec.lang = 'en-US';
      rec.onresult = (e) => { setInput(e.results[0][0].transcript); setListening(false); };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
      rec.start();
      setListening(true);
    }
  };

  const reset = () => {
    window.speechSynthesis.cancel();
    setStage(STAGES.setup); setMessages([]); setInput('');
    setReport(null); setSessionId(null); setQuestionCount(0);
    setElapsed(0); setStartTime(null); setJobTitle(''); setJobDescription('');
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'var(--bg-secondary)',
    border: '1px solid var(--border-bright)', borderRadius: '8px',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
  };

  // ── SETUP ─────────────────────────────────────────────────────────────────
  if (stage === STAGES.setup) return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>AI Mock Interview</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Practice with an AI interviewer — voice + text, real evaluation</p>
      </div>

      <div style={{ maxWidth: '560px' }}>
        <div className="card" style={{ borderColor: 'var(--accent-purple)', background: 'linear-gradient(135deg,rgba(124,58,237,0.04),rgba(236,72,153,0.04))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gradient-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700' }}>Set Up Your Interview</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>AI will ask 6 tailored questions + evaluate your answers</p>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Target Role *</label>
            <input type="text" placeholder="e.g. Senior Python Developer" value={jobTitle}
              onChange={e => setJobTitle(e.target.value)} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-bright)'} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Job Description <span style={{ color: 'var(--text-muted)' }}>(optional — makes questions more targeted)</span>
            </label>
            <textarea rows={4} placeholder="Paste the JD here..." value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-bright)'} />
          </div>

          {/* What to expect */}
          <div style={{ marginBottom: '24px', padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>WHAT TO EXPECT</div>
            {['6 role-specific questions (technical + behavioral)', 'Voice input via microphone or type your answers', 'AI evaluates each answer in real time', 'Final report with scores: Technical, Communication, Confidence'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <ChevronRight size={12} color="var(--accent-purple)" /> {t}
              </div>
            ))}
          </div>

          <button onClick={startInterview} disabled={loading || !jobTitle.trim()} className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', background: 'var(--gradient-2)', opacity: !jobTitle.trim() ? 0.6 : 1 }}>
            {loading ? 'Starting...' : <><Play size={16} /> Start Interview</>}
          </button>
        </div>
      </div>
    </div>
  );

  // ── FINISHED ──────────────────────────────────────────────────────────────
  if (stage === STAGES.finished && report) return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>Interview Complete 🎉</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Role: {jobTitle} · Duration: {fmt(elapsed)}</p>
      </div>

      {/* Score Cards */}
      <div className="card" style={{ marginBottom: '20px', borderColor: 'var(--accent-green)' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={18} color="var(--accent-green)" /> Your Scores
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
          <ScoreRing score={report.technicalScore || 0} label="Technical" color="#7c3aed" />
          <ScoreRing score={report.communicationScore || 0} label="Communication" color="#06b6d4" />
          <ScoreRing score={report.confidenceScore || 0} label="Confidence" color="#f59e0b" />
          <ScoreRing score={report.overallScore || 0} label="Overall" color="#10b981" />
        </div>
      </div>

      {/* Strengths & Improvements (structured) */}
      {(report.strengths?.length > 0 || report.improvements?.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="card">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#10b981' }}>
              ✓ Strengths
            </h3>
            {(report.strengths || []).map((s, i) => (
              <div key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <span style={{ color: '#10b981', flexShrink: 0 }}>•</span><span>{s}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#f59e0b' }}>
              ↗ Areas to Improve
            </h3>
            {(report.improvements || []).map((s, i) => (
              <div key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0 }}>•</span><span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full AI Report */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--accent-purple)' }}>
          HireIQ AI Evaluation
        </h3>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
          {report.evaluation || 'No evaluation available.'}
        </div>
      </div>

      <button onClick={reset} className="btn-primary" style={{ background: 'var(--gradient-2)' }}>
        <RotateCcw size={16} /> Practice Again
      </button>
    </div>
  );

  // ── ACTIVE INTERVIEW ──────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800' }}>Mock Interview</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{jobTitle} · Q{questionCount}/6</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> {fmt(elapsed)}
          </span>
          <div style={{ height: '6px', width: '120px', borderRadius: '3px', background: 'var(--bg-hover)' }}>
            <div style={{ height: '100%', borderRadius: '3px', width: `${(questionCount / 6) * 100}%`, background: 'var(--gradient-2)', transition: 'width 0.4s' }} />
          </div>
          <button onClick={reset} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}>
            End
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
              background: msg.role === 'user' ? 'var(--gradient-2)' : 'var(--gradient-1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
            }}>
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div style={{
              maxWidth: '72%', padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              background: msg.role === 'user' ? 'var(--gradient-2)' : 'var(--bg-secondary)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🤖</div>
            <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '4px 16px 16px 16px', border: '1px solid var(--border)', display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-purple)', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={toggleListen} style={{
          width: '46px', height: '46px', borderRadius: '12px', border: 'none', cursor: 'pointer',
          background: listening ? '#ef4444' : 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: listening ? '0 0 16px rgba(239,68,68,0.4)' : 'none', flexShrink: 0, transition: 'all 0.2s',
          border: `1px solid ${listening ? '#ef4444' : 'var(--border-bright)'}`,
        }}>
          {listening ? <MicOff size={18} color="white" /> : <Mic size={18} color="var(--text-secondary)" />}
        </button>
        <input type="text" placeholder={listening ? '🎤 Listening...' : 'Type your answer or use the microphone...'}
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendAnswer()}
          disabled={loading}
          style={{ flex: 1, padding: '12px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-bright)'} />
        <button onClick={() => sendAnswer()} disabled={loading || !input.trim()} className="btn-primary"
          style={{ padding: '12px 20px', background: 'var(--gradient-2)', opacity: loading || !input.trim() ? 0.5 : 1 }}>
          <Zap size={18} />
        </button>
      </div>

      <style>{`
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  );
}

export default MockInterview;
