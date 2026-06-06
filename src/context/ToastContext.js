import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

const COLORS = {
  success: '#10b981',
  error: '#ef4444',
  info: '#06b6d4',
  warning: '#f59e0b',
};

function ToastItem({ toast, onRemove }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 16px',
        background: '#1e1e2a',
        border: `1px solid ${COLORS[toast.type]}40`,
        borderLeft: `3px solid ${COLORS[toast.type]}`,
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        minWidth: '280px',
        maxWidth: '380px',
        animation: 'slideIn 0.25s ease',
        cursor: 'pointer',
      }}
      onClick={() => onRemove(toast.id)}
    >
      <span style={{ fontSize: '16px', flexShrink: 0 }}>{ICONS[toast.type]}</span>
      <div style={{ flex: 1 }}>
        {toast.title && (
          <div style={{
            fontSize: '13px', fontWeight: '600',
            color: '#f1f0ff', marginBottom: '2px',
            fontFamily: 'Syne, sans-serif',
          }}>
            {toast.title}
          </div>
        )}
        <div style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.4' }}>
          {toast.message}
        </div>
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, title, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (message, title) => addToast('success', message, title),
    error: (message, title) => addToast('error', message, title, 6000),
    info: (message, title) => addToast('info', message, title),
    warning: (message, title) => addToast('warning', message, title, 5000),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 9999,
      }}>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
