// Shared inline-style helpers so new pages match the existing dark theme
// without relying on Tailwind compilation. Use these everywhere instead of
// `bg-white`, `text-gray-500`, etc.

export const colors = {
  bg: 'var(--bg-primary)',
  bgCard: 'var(--bg-card)',
  bgInput: 'var(--bg-secondary)',
  border: 'var(--border)',
  borderBright: 'var(--border-bright)',
  text: 'var(--text-primary)',
  textMuted: 'var(--text-muted)',
  textSecondary: 'var(--text-secondary)',
  accent: 'var(--accent-purple)',
  cyan: 'var(--accent-cyan)',
  pink: 'var(--accent-pink)',
  green: 'var(--accent-green)',
  gradient: 'var(--gradient-1)',
};

export const card = {
  background: colors.bgCard,
  border: `1px solid ${colors.border}`,
  borderRadius: 16,
  padding: 24,
  transition: 'all 0.2s',
};

export const input = {
  width: '100%',
  padding: '10px 14px',
  background: colors.bgInput,
  border: `1px solid ${colors.borderBright}`,
  borderRadius: 8,
  color: colors.text,
  fontSize: 14,
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  boxSizing: 'border-box',
  colorScheme: 'dark',  // makes datetime-local + select dropdowns dark
};

export const label = {
  display: 'block',
  fontSize: 13,
  color: colors.textSecondary,
  marginBottom: 6,
};

export const h1 = {
  fontFamily: 'Syne, sans-serif',
  fontSize: 24,
  fontWeight: 800,
  marginBottom: 4,
  color: colors.text,
};

export const h2 = {
  fontFamily: 'Syne, sans-serif',
  fontSize: 18,
  fontWeight: 700,
  color: colors.text,
};

export const subtitle = {
  color: colors.textSecondary,
  fontSize: 14,
};

export const pageHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 24,
};

export const stageBadge = (stage) => {
  const REJECT = ['RejectedByAi', 'RejectedAfterAi', 'RejectedByHr', 'Withdrawn'];
  const TERMINAL_GOOD = ['Hired', 'OfferExtended'];
  let bg = 'rgba(99,102,241,0.15)', color = '#a5b4fc';
  if (REJECT.includes(stage)) { bg = 'rgba(239,68,68,0.15)'; color = '#fca5a5'; }
  else if (TERMINAL_GOOD.includes(stage)) { bg = 'rgba(16,185,129,0.15)'; color = '#6ee7b7'; }
  else if (stage?.includes('Shortlist') || stage?.includes('Passed')) { bg = 'rgba(16,185,129,0.15)'; color = '#6ee7b7'; }
  else if (stage?.includes('Screening')) { bg = 'rgba(6,182,212,0.15)'; color = '#67e8f9'; }
  return {
    padding: '4px 10px', borderRadius: 999,
    fontSize: 11, fontWeight: 700, background: bg, color,
  };
};
