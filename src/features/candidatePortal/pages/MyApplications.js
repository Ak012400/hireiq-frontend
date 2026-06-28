import React, { useEffect, useState } from 'react';
import { applicationsApi } from '../api/candidateApi';
import { card, h1, subtitle, pageHeader, stageBadge, colors } from '../../../shared/styles/darkTheme';

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsApi.mine().then(({ data }) => {
      setApps(data); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, color: colors.textMuted }}>Loading…</div>;

  return (
    <div>
      <div style={pageHeader}>
        <div>
          <h1 style={h1}>My Applications</h1>
          <p style={subtitle}>{apps.length} applications · Track your stage in each pipeline</p>
        </div>
      </div>

      {apps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: colors.textMuted }}>
          You haven't applied to any jobs yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {apps.map(a => (
            <div key={a.id} style={{ ...card, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 16 }}>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                    {a.jobTitle}
                  </div>
                  <div style={{ fontSize: 13, color: colors.textMuted }}>
                    {a.company} · {a.location}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>
                    Applied {new Date(a.createdAt).toLocaleDateString()} ·
                    Last update {new Date(a.lastTransitionAt).toLocaleString()}
                  </div>
                </div>
                <span style={stageBadge(a.currentStage)}>{a.currentStage}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
