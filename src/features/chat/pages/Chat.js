import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, Trash2 } from 'lucide-react';
import { sendMessage, clearChat, getChatSuggestions } from '../../../shared/services/api';

function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm HireIQ, your AI HR assistant by Arun Kumar. Ask me anything about resumes, career guidance, or candidate screening! 🚀"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setSuggestionsLoading(true);
    try {
      const res = await getChatSuggestions();
      const parsed = res.data.suggestions; // ✅ direct, no parsing
      if (parsed?.length > 0) setSuggestions(parsed);
    } catch {
      setSuggestions([
        "What skills should a Python developer add?",
        "How to transition to Data Science?",
        "What salary for fresher ML Engineer?",
        "How to write a strong resume summary?",
      ]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleSend = async (messageText) => {
    const text = messageText || input;
    if (!text.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    setSuggestions([]); // Clear suggestions on new message
    try {
      const res = await sendMessage(text);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.response
      }]);
      loadSuggestions(); // Load new suggestions after response
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ HireIQ service is currently offline. Please try again later.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const handleClear = async () => {
    try { await clearChat(); } catch {}
    setMessages([{
      role: 'assistant',
      content: "Hi! I'm HireIQ, your AI HR assistant by Arun Kumar. Ask me anything! 🚀"
    }]);
    loadSuggestions();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800' }}>
              HireIQ Chat
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#10b981', boxShadow: '0 0 6px #10b981',
              }} />
              <span style={{ fontSize: '12px', color: '#10b981' }}>Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleClear}
          style={{
            background: 'none', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', cursor: 'pointer',
            padding: '8px 12px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Trash2 size={14} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        background: 'var(--bg-card)', borderRadius: '16px',
        border: '1px solid var(--border)', marginBottom: '16px',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            gap: '10px', alignItems: 'flex-start',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: msg.role === 'user'
                ? 'var(--gradient-1)'
                : 'linear-gradient(135deg, #f59e0b, #ec4899)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              {msg.role === 'user' ? <User size={16} color="white" /> : <Zap size={16} color="white" />}
            </div>
            <div style={{
              maxWidth: '70%', padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              background: msg.role === 'user' ? 'var(--gradient-1)' : 'var(--bg-secondary)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              fontSize: '14px', lineHeight: '1.6',
              color: 'var(--text-primary)', whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={16} color="white" />
            </div>
            <div style={{
              padding: '12px 16px', background: 'var(--bg-secondary)',
              borderRadius: '4px 16px 16px 16px',
              border: '1px solid var(--border)',
              display: 'flex', gap: '4px', alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: 'var(--accent-purple)',
                  animation: `bounce 1.2s ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages[messages.length - 1]?.role === 'assistant' && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {suggestionsLoading
            ? <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Loading suggestions...</span>
            : suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)} // ✅ directly send
                style={{
                  padding: '6px 14px', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: '20px',
                  color: 'var(--text-secondary)', fontSize: '12px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-purple)'; e.currentTarget.style.color = 'var(--accent-purple)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {s}
              </button>
            ))
          }
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Ask HireIQ anything..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          style={{
            flex: 1, padding: '14px 18px', background: 'var(--bg-card)',
            border: '1px solid var(--border-bright)', borderRadius: '12px',
            color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
            fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-bright)'}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary"
          style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          <Send size={18} />
        </button>
      </form>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

export default Chat;