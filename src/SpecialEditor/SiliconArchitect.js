import React from 'react';

const SiliconArchitect = ({ data, theme }) => {
  const primary = theme?.primaryColor || '#7c3aed';
  const secondary = theme?.secondaryColor || '#06b6d4';
  const font = theme?.fontFamily || 'DM Sans, sans-serif';

  const tagStyle = {
    display: 'inline-block', padding: '3px 10px',
    background: `${primary}25`, color: primary,
    borderRadius: '12px', fontSize: '11px',
    fontWeight: '600', margin: '3px 2px',
    border: `1px solid ${primary}40`,
  };

  return (
    <div style={{ fontFamily: font, background: '#0d1117', minHeight: '297mm', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0d1117 0%, #1a1a2e 100%)`, padding: '36px 40px', borderBottom: `3px solid ${primary}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {data.photo && (
            <img src={data.photo} alt="Profile"
              style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${primary}` }} />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.2rem', fontWeight: '800', color: '#e6edf3', margin: '0 0 4px 0', borderLeft: `5px solid ${primary}`, paddingLeft: '16px' }}>
              {data.name || 'Your Name'}
            </h1>
            <p style={{ color: primary, fontSize: '1.1rem', fontWeight: '600', margin: '0 0 12px 21px' }}>
              {data.role || 'Your Role'}
            </p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginLeft: '21px' }}>
              {data.email && <span style={{ color: '#8b949e', fontSize: '13px' }}>📧 {data.email}</span>}
              {data.phone && <span style={{ color: '#8b949e', fontSize: '13px' }}>📱 {data.phone}</span>}
              {data.linkedin && <span style={{ color: '#8b949e', fontSize: '13px' }}>💼 {data.linkedin}</span>}
              {data.github && <span style={{ color: '#8b949e', fontSize: '13px' }}>🐙 {data.github}</span>}
              {data.location && <span style={{ color: '#8b949e', fontSize: '13px' }}>📍 {data.location}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: 1 }}>

        {/* Left Sidebar */}
        <div style={{ background: '#161b22', borderRight: `1px solid #30363d`, padding: '28px 20px' }}>

          {/* Skills */}
          {data.skills?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: primary, fontFamily: 'Syne, sans-serif', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '16px', height: '2px', background: primary, display: 'inline-block' }} />
                Skills
              </h3>
              <div>{data.skills.map((s, i) => <span key={i} style={tagStyle}>{s}</span>)}</div>
            </div>
          )}

          {/* Education */}
          {data.education?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: primary, fontFamily: 'Syne, sans-serif', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '16px', height: '2px', background: primary, display: 'inline-block' }} />
                Education
              </h3>
              {data.education.map((e, i) => (
                <div key={i} style={{ marginBottom: '14px', paddingLeft: '10px', borderLeft: `2px solid ${primary}40` }}>
                  <div style={{ color: '#e6edf3', fontSize: '13px', fontWeight: '600' }}>{e.degree}</div>
                  <div style={{ color: secondary, fontSize: '11px', marginTop: '2px' }}>{e.school}</div>
                  {e.year && <div style={{ color: '#6e7681', fontSize: '11px' }}>{e.year}</div>}
                  {e.gpa && <div style={{ color: '#6e7681', fontSize: '11px' }}>GPA: {e.gpa}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {data.certifications?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: primary, fontFamily: 'Syne, sans-serif', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '16px', height: '2px', background: primary, display: 'inline-block' }} />
                Certifications
              </h3>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ color: '#8b949e', fontSize: '12px', marginBottom: '6px', paddingLeft: '10px', borderLeft: `2px solid ${primary}40` }}>{c}</div>
              ))}
            </div>
          )}

          {/* Languages */}
          {data.languages?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: primary, fontFamily: 'Syne, sans-serif', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '16px', height: '2px', background: primary, display: 'inline-block' }} />
                Languages
              </h3>
              {data.languages.map((l, i) => <span key={i} style={tagStyle}>{l}</span>)}
            </div>
          )}

          {/* Extra */}
          {data.extra && (
            <div>
              <h3 style={{ color: primary, fontFamily: 'Syne, sans-serif', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '16px', height: '2px', background: primary, display: 'inline-block' }} />
                Additional
              </h3>
              <div style={{ color: '#8b949e', fontSize: '12px', lineHeight: '1.7' }}>{data.extra}</div>
            </div>
          )}
        </div>

        {/* Right Main */}
        <div style={{ background: '#0d1117', padding: '28px 32px' }}>

          {/* Summary */}
          {data.summary && (
            <div style={{ marginBottom: '24px', padding: '16px', background: '#161b22', borderRadius: '8px', borderLeft: `3px solid ${primary}` }}>
              <p style={{ color: '#8b949e', fontSize: '13px', lineHeight: '1.8', margin: 0, fontStyle: 'italic' }}>
                {data.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {data.experience?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: primary, fontFamily: 'Syne, sans-serif', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '20px', height: '2px', background: primary, display: 'inline-block' }} />
                Experience
              </h3>
              {data.experience.map((e, i) => (
                <div key={i} style={{ marginBottom: '18px', paddingBottom: '18px', borderBottom: '1px solid #21262d' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ color: '#e6edf3', fontSize: '14px', fontWeight: '700' }}>{e.title}</div>
                      <div style={{ color: secondary, fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>{e.company}</div>
                    </div>
                    {e.duration && <span style={{ color: '#6e7681', fontSize: '11px', background: '#21262d', padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>{e.duration}</span>}
                  </div>
                  {e.description && <p style={{ color: '#8b949e', fontSize: '12px', lineHeight: '1.7', marginTop: '8px', marginBottom: 0 }}>{e.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {data.projects?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: primary, fontFamily: 'Syne, sans-serif', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '20px', height: '2px', background: primary, display: 'inline-block' }} />
                Projects
              </h3>
              {data.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: '14px', padding: '12px 14px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ color: '#58a6ff', fontSize: '13px', fontWeight: '600' }}>{p.name}</div>
                    {p.tech && <span style={{ color: '#6e7681', fontSize: '11px' }}>{p.tech}</span>}
                  </div>
                  {p.description && <p style={{ color: '#8b949e', fontSize: '12px', lineHeight: '1.7', marginTop: '6px', marginBottom: 0 }}>{p.description}</p>}
                  {p.link && <a href={p.link} style={{ color: secondary, fontSize: '11px', marginTop: '4px', display: 'block' }}>{p.link}</a>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#161b22', borderTop: `1px solid #30363d`, padding: '10px', textAlign: 'center' }}>
        <span style={{ color: '#6e7681', fontSize: '10px' }}>⚡ Generated by HireIQ AI Studio by Arun Kumar</span>
      </div>
    </div>
  );
};

export default SiliconArchitect;