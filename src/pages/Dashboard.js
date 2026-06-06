import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Briefcase, Search, MessageSquare, FileEdit,
  TrendingUp, Zap, ArrowRight, Users, CheckCircle, XCircle,
  Clock, ChevronRight, Video, BarChart2, GraduationCap,
  BookOpen, Star, Target, Award
} from 'lucide-react';
import { getResumes, getJobs, getScreeningResults } from '../services/api';

const STATUS_COLORS = {
  Screened: '#06b6d4', Interview: '#f59e0b', Hired: '#10b981', Rejected: '#ef4444',
};

function StatCard({ icon: Icon, label, value, color, gradient, onClick }) {
  return (
    <div className="card" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', overflow: 'hidden', cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 20px ${color}30` }}>
        <Icon size={22} color="white" />
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>{value}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</div>
      </div>
      <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '100px', height: '100px', background: `radial-gradient(circle,${color}15 0%,transparent 70%)`, pointerEvents: 'none' }} />
    </div>
  );
}

function QuickAction({ icon: Icon, label, desc, path, gradient, badge }) {
  const navigate = useNavigate();
  return (
    <div className="card" onClick={() => navigate(path)} style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
      {badge && (
        <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)' }}>{badge}</span>
      )}
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
        <Icon size={18} color="white" />
      </div>
      <div style={{ fontSize: '15px', fontWeight: '600', fontFamily: 'Syne, sans-serif', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{desc}</div>
      <ArrowRight size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
    </div>
  );
}

function RecentScreeningRow({ result }) {
  const navigate = useNavigate();
  const pct = (result.minilmScore * 100).toFixed(0);
  const statusColor = STATUS_COLORS[result.candidateStatus] || '#06b6d4';
  const matchColor = result.minilmScore >= 0.85 ? '#10b981' : result.minilmScore >= 0.70 ? '#06b6d4' : result.minilmScore >= 0.50 ? '#f59e0b' : '#ef4444';
  return (
    <div onClick={() => navigate('/screening')} style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
      background: 'var(--bg-secondary)', transition: 'all 0.15s', border: '1px solid transparent',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-bright)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'transparent'; }}
    >
      <div style={{ flexShrink: 0 }}>
        {result.shortlisted ? <CheckCircle size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {result.candidateName || 'Candidate'}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {result.jobTitle || 'Unknown Role'}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: matchColor }}>{pct}%</span>
        <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '600', background: `${statusColor}18`, color: statusColor }}>
          {result.candidateStatus || 'Screened'}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Clock size={10} /> {result.createdAt ? new Date(result.createdAt).toLocaleDateString() : ''}
        </span>
      </div>
    </div>
  );
}

// ─── HIRER DASHBOARD ──────────────────────────────────────────────────────────
function HirerDashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ resumes: 0, jobs: 0, screenings: 0, shortlisted: 0 });
  const [recentScreenings, setRecentScreenings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [r, j, s] = await Promise.all([getResumes(), getJobs(), getScreeningResults()]);
        setStats({ resumes: r.data.length, jobs: j.data.length, screenings: s.data.length, shortlisted: s.data.filter(x => x.shortlisted).length });
        setRecentScreenings(s.data.slice(0, 6));
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--gradient-1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800' }}>
              Welcome back, {user.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Your hiring pipeline overview</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard icon={FileText} label="Total Resumes" value={loading ? '...' : stats.resumes} color="#7c3aed" gradient="var(--gradient-1)" onClick={() => navigate('/resumes')} />
        <StatCard icon={Briefcase} label="Job Descriptions" value={loading ? '...' : stats.jobs} color="#06b6d4" gradient="linear-gradient(135deg,#06b6d4,#10b981)" onClick={() => navigate('/jobs')} />
        <StatCard icon={Search} label="Screenings Done" value={loading ? '...' : stats.screenings} color="#ec4899" gradient="var(--gradient-2)" onClick={() => navigate('/screening')} />
        <StatCard icon={Users} label="Shortlisted" value={loading ? '...' : stats.shortlisted} color="#10b981" gradient="var(--gradient-3)" onClick={() => navigate('/screening')} />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '16px' }}>
          <QuickAction icon={FileText} label="Upload Resume" desc="Add candidate" path="/resumes" gradient="var(--gradient-1)" />
          <QuickAction icon={Briefcase} label="Add Job" desc="Create JD" path="/jobs" gradient="linear-gradient(135deg,#06b6d4,#10b981)" />
          <QuickAction icon={Search} label="Screen Candidates" desc="AI-powered screening" path="/screening" gradient="var(--gradient-2)" />
          <QuickAction icon={Video} label="Interview Rooms" desc="Create & manage rooms" path="/interview-rooms" gradient="linear-gradient(135deg,#7c3aed,#ec4899)" badge="NEW" />
          <QuickAction icon={BarChart2} label="Analytics" desc="Hiring insights" path="/analytics" gradient="linear-gradient(135deg,#f59e0b,#ec4899)" badge="NEW" />
          <QuickAction icon={MessageSquare} label="AI Chat" desc="Ask HireIQ anything" path="/chat" gradient="linear-gradient(135deg,#f59e0b,#ec4899)" />
        </div>
      </div>

      {!loading && recentScreenings.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '700' }}>Recent Screenings</h2>
            <button onClick={() => navigate('/screening')} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: '13px', cursor: 'pointer', fontWeight: '600', fontFamily: 'DM Sans, sans-serif' }}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="card" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {recentScreenings.map(r => <RecentScreeningRow key={r.id} result={r} />)}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <TrendingUp size={16} color="var(--accent-purple)" />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Powered by <span style={{ color: 'var(--accent-purple)', fontWeight: '600' }}>Groq Llama-3.3-70B</span> + <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>MiniLM Similarity</span> · Built by <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>Arun Kumar</span>
        </span>
      </div>
    </div>
  );
}

// ─── CANDIDATE DASHBOARD ──────────────────────────────────────────────────────
function CandidateDashboard({ user }) {
  const navigate = useNavigate();

  const tips = [
    'Add quantifiable metrics to your experience — numbers stand out to ATS systems.',
    'Tailor your resume summary for each job description you apply to.',
    'Use strong action verbs: Led, Built, Scaled, Optimized, Delivered.',
    'Keep your resume to 1 page unless you have 5+ years of experience.',
  ];
  const tip = tips[new Date().getDate() % tips.length];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--gradient-3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800' }}>
              Hey, {user.name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Ready to land your next opportunity?</p>
          </div>
        </div>
      </div>

      {/* Tip of the day */}
      <div style={{ marginBottom: '24px', padding: '16px 20px', background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(6,182,212,0.08))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Star size={18} color="var(--accent-green)" fill="var(--accent-green)" style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-green)', marginBottom: '4px', letterSpacing: '0.5px' }}>TIP OF THE DAY</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{tip}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>What do you want to do?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '16px' }}>
          <QuickAction icon={FileEdit} label="Build Resume" desc="AI-powered resume studio" path="/resume-builder" gradient="var(--gradient-3)" />
          <QuickAction icon={BookOpen} label="Browse Jobs" desc="Find matching openings" path="/job-board" gradient="linear-gradient(135deg,#06b6d4,#10b981)" badge="NEW" />
          <QuickAction icon={GraduationCap} label="Mock Interview" desc="Practice with AI interviewer" path="/mock-interview" gradient="var(--gradient-2)" badge="NEW" />
          <QuickAction icon={MessageSquare} label="AI Chat" desc="Career guidance & tips" path="/chat" gradient="linear-gradient(135deg,#f59e0b,#ec4899)" />
          <QuickAction icon={FileScan} label="PDF Tools" desc="Parse & analyze resumes" path="/pdf-tools" gradient="var(--gradient-1)" />
        </div>
      </div>

      {/* Feature Highlights */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>What's coming for you</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { icon: Target, title: 'ATS Resume Score', desc: 'Paste a JD and see exactly how well your resume matches it — before you apply.', color: '#7c3aed', gradient: 'var(--gradient-1)' },
            { icon: Video, title: 'Live Interview Room', desc: 'Get invited to a hirer\'s private interview room with AI assistance and real-time feedback.', color: '#ec4899', gradient: 'var(--gradient-2)' },
            { icon: Award, title: 'Skill Certificates', desc: 'Complete mock interviews to earn AI-verified skill badges you can share on your profile.', color: '#10b981', gradient: 'var(--gradient-3)' },
            { icon: BarChart2, title: 'Application Tracker', desc: 'Track every job you apply to, with status updates and follow-up reminders.', color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#10b981)' },
          ].map(f => (
            <div key={f.title} className="card" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: f.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <f.icon size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'Syne, sans-serif', marginBottom: '4px', color: 'var(--text-primary)' }}>{f.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <TrendingUp size={16} color="var(--accent-green)" />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Powered by <span style={{ color: 'var(--accent-purple)', fontWeight: '600' }}>Groq Llama-3.3-70B</span> · Built by <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>Arun Kumar</span>
        </span>
      </div>
    </div>
  );
}

// ─── Smart Router ─────────────────────────────────────────────────────────────
function Dashboard() {
  const user = JSON.parse(localStorage.getItem('hireiq_user') || '{}');
  const isHirer = user.role === 'recruiter' || user.role === 'hirer';
  return isHirer ? <HirerDashboard user={user} /> : <CandidateDashboard user={user} />;
}

export default Dashboard;
