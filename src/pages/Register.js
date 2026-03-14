import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { Zap, User, Mail, Lock, ArrowRight } from 'lucide-react';

function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'recruiter'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await register(form);
      localStorage.setItem('hireiq_token', res.data.token);
      localStorage.setItem('hireiq_user', JSON.stringify({
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      }));
      navigate('/');
    } catch (err) {
      setError('Registration failed! Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 12px 12px 40px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-bright)',
    borderRadius: '10px', color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-200px', right: '-200px',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-200px', left: '-200px',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '24px', padding: '40px',
        position: 'relative', zIndex: 1,
        boxShadow: '0 0 60px rgba(236,72,153,0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'var(--gradient-2)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(236,72,153,0.3)',
          }}>
            <Zap size={28} color="white" />
          </div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '28px', fontWeight: '800',
            background: 'var(--gradient-2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '6px',
          }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Join HireIQ AI Suite
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '12px',
            color: '#ef4444', fontSize: '13px',
            marginBottom: '20px', textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px',
            }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{
                position: 'absolute', left: '14px',
                top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                type="text" placeholder="Arun Kumar"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-pink)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-bright)'}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px',
            }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute', left: '14px',
                top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                type="email" placeholder="arun@hireiq.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-pink)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-bright)'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px',
            }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: '14px',
                top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                type="password" placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-pink)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-bright)'}
              />
            </div>
          </div>

          {/* Role */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px',
            }}>Role</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              style={{
                width: '100%', padding: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-bright)',
                borderRadius: '10px', color: 'var(--text-primary)',
                fontSize: '14px', outline: 'none',
                fontFamily: 'DM Sans, sans-serif',
                cursor: 'pointer',
              }}
            >
              <option value="recruiter">Recruiter</option>
              <option value="candidate">Candidate</option>
            </select>
          </div>

          <button
            type="submit" disabled={loading}
            className="btn-primary"
            style={{
              width: '100%', justifyContent: 'center',
              padding: '14px',
              background: 'var(--gradient-2)',
            }}
          >
            {loading ? 'Creating...' : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: '24px',
          fontSize: '14px', color: 'var(--text-secondary)',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{
            color: 'var(--accent-pink)',
            textDecoration: 'none', fontWeight: '600',
          }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
