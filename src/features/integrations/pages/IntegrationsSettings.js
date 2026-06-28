import React, { useEffect, useState } from 'react';
import { Linkedin, Briefcase, Globe, Building2, ExternalLink, Check, AlertTriangle, Save } from 'lucide-react';
import { integrationsApi } from '../api/integrationsApi';
import { card, h1, h2, subtitle, pageHeader, input, label, colors } from '../../../shared/styles/darkTheme';

// Per-board metadata: icon, color, what credentials are needed, and what works today.
const BOARD_META = {
  Indeed: {
    icon: Briefcase, color: '#2164f3',
    description: 'Indeed crawls our public XML feed every 24h. No key required.',
    keyHelp: 'No API key needed. Just submit your feed URL once.',
    feedUrl: '/feeds/indeed.xml',
    fields: [],
    supportsRealPosting: true,
  },
  LinkedIn: {
    icon: Linkedin, color: '#0a66c2',
    description: 'Real LinkedIn Job postings require Talent Solutions partnership. Without it we generate a "Share to LinkedIn" deep-link.',
    keyHelp: 'Get a Client ID + Secret from https://www.linkedin.com/developers/apps → "Create app" → enable the "Sign In with LinkedIn" + "Share on LinkedIn" products.',
    fields: ['apiKey', 'apiSecret'],
    supportsRealPosting: false,
    oauth: true,
  },
  Naukri: {
    icon: Building2, color: '#ff7555',
    description: 'Naukri Job Posting API is partner-only. Until enabled, we generate a Naukri search link.',
    keyHelp: 'Contact partnerships@naukri.com to request REST API access.',
    fields: ['apiKey'],
    supportsRealPosting: false,
  },
  Glassdoor: {
    icon: Globe, color: '#0caa41',
    description: 'Glassdoor partner program required (https://www.glassdoor.com/developer).',
    keyHelp: 'Apply for partner key, then enter here.',
    fields: ['apiKey', 'apiSecret'],
    supportsRealPosting: false,
  },
  Custom: { icon: Globe, color: '#9ca3af', description: 'Custom board — bring your own webhook.', fields: ['apiKey'] },
};

export default function IntegrationsSettings() {
  // Always render these 4 cards even if backend is offline / not yet deployed.
  // Backend status (configured, OAuth done, etc.) is merged in via fetch.
  const DEFAULT_BOARDS = ['Indeed', 'LinkedIn', 'Naukri', 'Glassdoor'].map(board => ({
    board, enabled: false, configured: false, hasOAuth: false,
    supportsPush: board === 'Indeed',
    requiresPartnership: board !== 'Indeed',
    lastUpdated: null,
  }));

  const [boards, setBoards] = useState(DEFAULT_BOARDS);
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState({});      // unsaved key edits per board
  const [apiError, setApiError] = useState(null);

  const refresh = async () => {
    setLoading(true); setApiError(null);
    try {
      const { data } = await integrationsApi.list();
      // Merge backend status into defaults so UI always shows 4 cards
      const byBoard = Object.fromEntries((data || []).map(b => [b.board, b]));
      setBoards(DEFAULT_BOARDS.map(d => ({ ...d, ...(byBoard[d.board] || {}) })));
    } catch (e) {
      setApiError(e?.response?.status === 404
        ? 'Backend hasn\'t been deployed with the integrations API yet — UI works in demo mode for now.'
        : e?.response?.data?.error || e?.message || 'Could not load integrations');
      // Keep defaults so the user sees the cards
    } finally { setLoading(false); }
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const updateDraft = (board, k, v) =>
    setDrafts(d => ({ ...d, [board]: { ...(d[board] || {}), [k]: v } }));

  const save = async (board) => {
    const draft = drafts[board] || {};
    await integrationsApi.upsert(board, {
      board,
      enabled: draft.enabled ?? true,
      apiKey: draft.apiKey,
      apiSecret: draft.apiSecret,
    });
    setDrafts(d => { const c = { ...d }; delete c[board]; return c; });
    refresh();
  };

  const connectLinkedIn = async () => {
    const { data } = await integrationsApi.linkedInOAuthUrl();
    if (data.url) window.location.href = data.url;
    else alert(data.error || 'LinkedIn ClientId not configured');
  };

  return (
    <div>
      <div style={pageHeader}>
        <div>
          <h1 style={h1}>Integrations</h1>
          <p style={subtitle}>Connect each job board where you want HireIQ to publish your jobs</p>
        </div>
      </div>

      {apiError && (
        <div style={{
          display: 'flex', gap: 8, padding: 12, borderRadius: 8, marginBottom: 16,
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
          color: '#fcd34d', fontSize: 13,
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>{apiError}</div>
        </div>
      )}
      {loading && <div style={{ padding: 12, color: colors.textMuted, fontSize: 13 }}>Refreshing status…</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
        {boards.filter(b => b.board !== 'Custom').map(b => {
          const meta = BOARD_META[b.board] || BOARD_META.Custom;
          const Icon = meta.icon;
          const draft = drafts[b.board] || {};
          const apiKeyValue = draft.apiKey ?? '';
          const apiSecretValue = draft.apiSecret ?? '';
          const dirty = Object.keys(draft).length > 0;
          return (
            <div key={b.board} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `${meta.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={22} color={meta.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={h2}>{b.board}</h2>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                    {b.configured ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6ee7b7' }}>
                        <Check size={11} /> Configured
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: colors.textMuted }}>
                        <AlertTriangle size={11} /> Not configured
                      </span>
                    )}
                    {meta.supportsRealPosting ? (
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}>
                        Real posting
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(245,158,11,0.15)', color: '#fcd34d' }}>
                        Share-link only
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
                {meta.description}
              </p>

              {meta.feedUrl && (
                <div style={{
                  padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 12,
                  fontSize: 12, color: colors.textMuted,
                }}>
                  Feed URL:&nbsp;
                  <a href={meta.feedUrl} target="_blank" rel="noreferrer" style={{ color: colors.cyan }}>
                    {window.location.origin.replace('vercel.app', 'onrender.com').replace('hireiq-aipowered', 'hireiq-backend-humv')}{meta.feedUrl}
                    <ExternalLink size={11} style={{ display: 'inline', marginLeft: 4 }} />
                  </a>
                </div>
              )}

              {meta.fields.includes('apiKey') && (
                <div style={{ marginBottom: 10 }}>
                  <label style={label}>API Key / Client ID</label>
                  <input
                    type="password"
                    style={input}
                    placeholder={b.configured ? '••••••••••••••• (saved)' : 'Paste your API key'}
                    value={apiKeyValue}
                    onChange={e => updateDraft(b.board, 'apiKey', e.target.value)} />
                </div>
              )}

              {meta.fields.includes('apiSecret') && (
                <div style={{ marginBottom: 10 }}>
                  <label style={label}>API Secret / Client Secret</label>
                  <input
                    type="password"
                    style={input}
                    placeholder={b.configured ? '••••••••••••••• (saved)' : 'Paste your API secret'}
                    value={apiSecretValue}
                    onChange={e => updateDraft(b.board, 'apiSecret', e.target.value)} />
                </div>
              )}

              <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
                ℹ {meta.keyHelp}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {meta.fields.length > 0 && (
                  <button onClick={() => save(b.board)} className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: 13, opacity: dirty ? 1 : 0.5 }}
                    disabled={!dirty}>
                    <Save size={13} /> Save
                  </button>
                )}
                {meta.oauth && (
                  <button onClick={connectLinkedIn} className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: 13 }}>
                    Connect via OAuth
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
