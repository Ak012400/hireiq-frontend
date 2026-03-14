import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Briefcase, Search, MessageSquare,
  FileEdit, TrendingUp, Zap, ArrowRight, Users
} from 'lucide-react';
import { getResumes, getJobs, getScreeningResults } from '../services/api';

function StatCard({ icon: Icon, label, value, color, gradient }) {
  return (
    <div className="card" style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: gradient, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 0 20px ${color}30`,
      }}>
        <Icon size={22} color="white" />
      </div>
      <div>
        <div style={{
          fontSize: '28px', fontWeight: '800',
          fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)',
        }}>{value}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {label}
        </div>
      </div>
      <div style={{
        position: 'absolute', right: '-20px', top: '-20px',
        width: '100px', height: '100px',
        background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
    </div>
  );
}

function QuickAction({ icon: Icon, label, desc, path, gradient }) {
  const navigate = useNavigate();
  return (
    <div
      className="card"
      onClick={() => navigate(path)}
      style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: gradient, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: '12px',
      }}>
        <Icon size={18} color="white" />
      </div>
      <div style={{
        fontSize: '15px', fontWeight: '600',
        fontFamily: 'Syne, sans-serif',
        marginBottom: '4px',
      }}>{label}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        {desc}
      </div>
      <ArrowRight
        size={16}
        style={{
          position: 'absolute', right: '16px', top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
        }}
      />
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    resumes: 0, jobs: 0, screenings: 0, shortlisted: 0
  });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('hireiq_user') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [r, j, s] = await Promise.all([
          getResumes(), getJobs(), getScreeningResults()
        ]);
        setStats({
          resumes: r.data.length,
          jobs: j.data.length,
          screenings: s.data.length,
          shortlisted: s.data.filter(x => x.shortlisted).length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'var(--gradient-1)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={20} color="white" />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '24px', fontWeight: '800',
            }}>
              Welcome back, {user.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Here's your HireIQ overview
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '32px',
      }}>
        <StatCard
          icon={FileText} label="Total Resumes"
          value={loading ? '...' : stats.resumes}
          color="#7c3aed" gradient="var(--gradient-1)"
        />
        <StatCard
          icon={Briefcase} label="Job Descriptions"
          value={loading ? '...' : stats.jobs}
          color="#06b6d4" gradient="linear-gradient(135deg, #06b6d4, #10b981)"
        />
        <StatCard
          icon={Search} label="Screenings Done"
          value={loading ? '...' : stats.screenings}
          color="#ec4899" gradient="var(--gradient-2)"
        />
        <StatCard
          icon={Users} label="Shortlisted"
          value={loading ? '...' : stats.shortlisted}
          color="#10b981" gradient="var(--gradient-3)"
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '18px', fontWeight: '700',
          marginBottom: '16px', color: 'var(--text-primary)',
        }}>Quick Actions</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          <QuickAction
            icon={FileText} label="Upload Resume"
            desc="Add new candidate resume"
            path="/resumes" gradient="var(--gradient-1)"
          />
          <QuickAction
            icon={Briefcase} label="Add Job"
            desc="Create job description"
            path="/jobs"
            gradient="linear-gradient(135deg, #06b6d4, #10b981)"
          />
          <QuickAction
            icon={Search} label="Screen Candidates"
            desc="AI-powered screening"
            path="/screening" gradient="var(--gradient-2)"
          />
          <QuickAction
            icon={MessageSquare} label="AI Chat"
            desc="Ask HireIQ anything"
            path="/chat"
            gradient="linear-gradient(135deg, #f59e0b, #ec4899)"
          />
          <QuickAction
            icon={FileEdit} label="Build Resume"
            desc="Generate PDF resume"
            path="/resume-builder" gradient="var(--gradient-3)"
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '40px', padding: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center',
        gap: '10px',
      }}>
        <TrendingUp size={16} color="var(--accent-purple)" />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Powered by{' '}
          <span style={{ color: 'var(--accent-purple)', fontWeight: '600' }}>
            HireIQ 7B
          </span>
          {' '}— Fine-tuned Qwen2.5 with GRPO RL by{' '}
          <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>
            Arun Kumar
          </span>
        </span>
      </div>
    </div>
  );
}

export default Dashboard;
