import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Briefcase, Search,
  MessageSquare, FileEdit, LogOut, Menu, X, Zap,
  Video, BarChart2,
  GraduationCap, BookOpen, Bell,
  Building2, ListTodo, Send, ClipboardList, Plug
} from 'lucide-react';

const HIRER_NAV = [
  { path: '/hirer',            icon: LayoutDashboard, label: 'Recruiter Hub',   badge: 'NEW' },
  { path: '/job-postings',     icon: Building2,       label: 'Job Postings',    badge: 'NEW' },
  { path: '/resumes',          icon: FileText,        label: 'Resumes' },
  { path: '/jobs',             icon: Briefcase,       label: 'Jobs (legacy)' },
  { path: '/screening',        icon: Search,          label: 'Screening' },
  { path: '/interview-rooms',  icon: Video,           label: 'Interview Rooms' },
  { path: '/analytics',        icon: BarChart2,       label: 'Analytics' },
  { path: '/chat',             icon: MessageSquare,   label: 'AI Chat' },
  { path: '/resume-studio',    icon: FileEdit,        label: 'Resume Studio' },
  { path: '/integrations',     icon: Plug,            label: 'Integrations',    badge: 'NEW' },
];

const CANDIDATE_NAV = [
  { path: '/',                 icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/browse',           icon: BookOpen,        label: 'Browse Jobs',     badge: 'NEW' },
  { path: '/my-applications',  icon: ClipboardList,   label: 'My Applications', badge: 'NEW' },
  { path: '/resume-studio',    icon: FileEdit,        label: 'Resume Studio' },
  { path: '/mock-interview',   icon: GraduationCap,   label: 'Mock Interview' },
  { path: '/chat',             icon: MessageSquare,   label: 'AI Chat' },
];

function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('hireiq_user') || '{}');
  const isHirer = user.role === 'recruiter' || user.role === 'hirer';
  const navItems = isHirer ? HIRER_NAV : CANDIDATE_NAV;

  const roleLabel = isHirer ? 'Hirer' : 'Job Seeker';
  const roleColor = isHirer ? 'var(--accent-purple)' : 'var(--accent-green)';
  const roleGradient = isHirer ? 'var(--gradient-1)' : 'var(--gradient-3)';

  const handleLogout = () => {
    localStorage.removeItem('hireiq_token');
    localStorage.removeItem('hireiq_user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '70px' : '240px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed', height: '100vh',
        zIndex: 100, overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '70px' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: roleGradient, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="white" />
              </div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '18px', background: roleGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  HireIQ
                </div>
                <div style={{ fontSize: '10px', color: roleColor, fontWeight: '600' }}>{roleLabel}</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{ width: '32px', height: '32px', background: roleGradient, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <Zap size={18} color="white" />
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', borderRadius: '6px', flexShrink: 0 }}>
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '10px',
                marginBottom: '2px', textDecoration: 'none',
                color: isActive ? 'white' : 'var(--text-secondary)',
                background: isActive ? roleGradient : 'transparent',
                transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden',
                position: 'relative',
              })}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <>
                  <span style={{ fontSize: '14px', fontWeight: '500', flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      fontSize: '9px', fontWeight: '700', padding: '2px 5px',
                      borderRadius: '4px', background: 'rgba(6,182,212,0.2)',
                      color: 'var(--accent-cyan)', letterSpacing: '0.5px',
                    }}>{item.badge}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          {!collapsed && (
            <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-hover)', marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{user.name || 'User'}</div>
              <div style={{ fontSize: '10px', color: roleColor, fontWeight: '600', marginTop: '2px' }}>{roleLabel}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{user.email || ''}</div>
            </div>
          )}
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 12px', borderRadius: '10px', background: 'none',
            border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
            transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1, marginLeft: collapsed ? '70px' : '240px',
        transition: 'margin-left 0.3s ease',
        padding: '32px', minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
