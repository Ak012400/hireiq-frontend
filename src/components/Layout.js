import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Briefcase,
  Search, MessageSquare, FileEdit, LogOut,
  Menu, X, Zap, FileScan, Layout as LayoutIcon  // ✅ Layout import fix
} from 'lucide-react';


const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/resumes', icon: FileText, label: 'Resumes' },
  { path: '/jobs', icon: Briefcase, label: 'Jobs' },
  { path: '/screening', icon: Search, label: 'Screening' },
  { path: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { path: '/resume-builder', icon: FileEdit, label: 'Resume Builder' },
  { path: '/pdf-tools', icon: FileScan, label: 'PDF Tools' },
  { path: 'template-studio', icon: LayoutIcon, label: 'Template Studio' }, // ✅ component ref, JSX nahi
];

function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('hireiq_user') || '{}');

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
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '70px',
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px',
                background: 'var(--gradient-1)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Zap size={18} color="white" />
              </div>
              <div>
                <div style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: '800', fontSize: '18px',
                  background: 'var(--gradient-1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>HireIQ</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>AI Resume Suite</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: '32px', height: '32px',
              background: 'var(--gradient-1)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto'
            }}>
              <Zap size={18} color="white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-secondary)', cursor: 'pointer',
              padding: '4px', borderRadius: '6px',
              display: 'flex', alignItems: 'center',
              position: collapsed ? 'absolute' : 'relative',
              right: collapsed ? '-40px' : 'auto',
            }}
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '10px',
                marginBottom: '4px',
                textDecoration: 'none',
                color: isActive ? 'white' : 'var(--text-secondary)',
                background: isActive ? 'var(--gradient-1)' : 'transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              })}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{
          padding: '12px 8px',
          borderTop: '1px solid var(--border)',
        }}>
          {!collapsed && (
            <div style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'var(--bg-hover)',
              marginBottom: '8px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {user.name || 'User'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {user.email || ''}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: collapsed ? '70px' : '240px',
        transition: 'margin-left 0.3s ease',
        padding: '32px',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
