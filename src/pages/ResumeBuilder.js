import React, { useState, useEffect } from 'react';
import { FileEdit, Zap, Download, Eye, Briefcase, Code, GraduationCap, FolderOpen, Phone, Plus, Trash2, Sparkles, Award } from 'lucide-react';
import { generatePdf, getCustomFields, createCustomField, deleteCustomField, generateFieldContent } from '../services/api';
function ResumeBuilder() {
  const user = JSON.parse(localStorage.getItem('hireiq_user') || '{}');

  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: '',
    role: '',
    summary: '',
    experience: '',
    skills: '',
    education: '',
    projects: '',
  });

  const [customFields, setCustomFields] = useState([]);
  const [newField, setNewField] = useState({ fieldName: '', fieldValue: '', fieldType: 'text' });
  const [addingField, setAddingField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldLoading, setFieldLoading] = useState({});
  const [htmlPreview, setHtmlPreview] = useState('');
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    loadCustomFields();
  }, []);

  const loadCustomFields = async () => {
    try {
      const res = await getCustomFields();
      setCustomFields(res.data);
    } catch {
      setCustomFields([]);
    }
  };

  const handleAiGenerate = async (fieldKey) => {
    setFieldLoading(prev => ({ ...prev, [fieldKey]: true }));
    try {
      // ✅ Existing form data context mein do
      const context = `
  User context:
  - Name: ${form.name || 'Not provided'}
  - Role: ${form.role || 'Not provided'}
  - Experience: ${form.experience || 'Not provided'}
  - Skills: ${form.skills || 'Not provided'}
  - Education: ${form.education || 'Not provided'}
  - Projects: ${form.projects || 'Not provided'}
  - Summary: ${form.summary || 'Not provided'}
  `.trim();
  
      const prompts = {
        role: `${context}\n\nBased on this person's background, suggest ONE specific professional job role title for their resume. Return ONLY the role title.`,
        summary: `${context}\n\nWrite a personalized 2-3 line professional summary for this person's resume using their actual background. Return ONLY the summary text.`,
        experience: `${context}\n\nWrite a professional 3-4 line work experience description using this person's actual role and skills. Return ONLY the experience text.`,
        skills: `${context}\n\nBased on this person's role and experience, suggest 10 relevant technical skills as comma separated values. Return ONLY the comma separated list.`,
        education: `${context}\n\nWrite a professional education entry for this person. Return ONLY the education text like: B.Tech Computer Science — University 2024, CGPA 8.5`,
        projects: `${context}\n\nWrite a 3-4 line description of a relevant project for this person based on their skills and role. Return ONLY the project description.`,
      };
  
      const res = await generateFieldContent(prompts[fieldKey]);
      const text = res.data.result?.trim();
      if (text) setForm(prev => ({ ...prev, [fieldKey]: text }));
    } catch {
      // ignore
    } finally {
      setFieldLoading(prev => ({ ...prev, [fieldKey]: false }));
    }
  };

  const AiButton = ({ fieldKey }) => (
    <button
      type="button"
      onClick={() => handleAiGenerate(fieldKey)}
      disabled={fieldLoading[fieldKey]}
      title="Generate with AI"
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        background: 'none', border: '1px solid var(--accent-green)',
        borderRadius: '6px', padding: '3px 8px',
        cursor: fieldLoading[fieldKey] ? 'not-allowed' : 'pointer',
        color: 'var(--accent-green)', fontSize: '11px',
        transition: 'all 0.2s', opacity: fieldLoading[fieldKey] ? 0.6 : 1,
        fontFamily: 'DM Sans, sans-serif',
      }}
      onMouseEnter={e => {
        if (!fieldLoading[fieldKey]) {
          e.currentTarget.style.background = 'var(--accent-green)';
          e.currentTarget.style.color = 'white';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'none';
        e.currentTarget.style.color = 'var(--accent-green)';
      }}
    >
      {fieldLoading[fieldKey]
        ? [0, 1, 2].map(i => (
            <span key={i} style={{
              width: '4px', height: '4px', borderRadius: '50%',
              background: 'var(--accent-green)',
              animation: `bounce 1.2s ${i * 0.2}s infinite`,
              display: 'inline-block'
            }} />
          ))
        : <><Sparkles size={10} /> AI</>
      }
    </button>
  );

  const handleAddField = async () => {
    if (!newField.fieldName.trim() || !newField.fieldValue.trim()) return;
    try {
      const res = await createCustomField({
        fieldName: newField.fieldName,
        fieldValue: newField.fieldValue,
        fieldType: newField.fieldType,
        order: customFields.length
      });
      setCustomFields(prev => [...prev, res.data]);
      setNewField({ fieldName: '', fieldValue: '', fieldType: 'text' });
      setAddingField(false);
    } catch {
      // ignore
    }
  };

  const handleDeleteField = async (id) => {
    try {
      await deleteCustomField(id);
      setCustomFields(prev => prev.filter(f => f.id !== id));
    } catch {
      // ignore
    }
  };

  const generateDemoHtml = (data, fields) => {
    const customSections = fields.map(f => `
      <div class="section-title">${f.fieldName}</div>
      <p style="font-size:13px; color:#555; line-height:1.6;">${f.fieldValue}</p>
    `).join('');

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', sans-serif; color: #333; }
  .header { background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 30px 40px; }
  .name { font-size: 32px; font-weight: 700; letter-spacing: 2px; }
  .role { font-size: 16px; color: #a8b2d8; margin-top: 6px; }
  .contact { margin-top: 10px; font-size: 13px; color: #8892b0; }
  .contact span { margin-right: 20px; }
  .summary-bar { background: #f0f4ff; padding: 14px 40px; border-left: 4px solid #1a1a2e; font-size: 13px; color: #444; line-height: 1.7; font-style: italic; }
  .body { display: flex; }
  .sidebar { width: 32%; background: #f8f9fa; padding: 25px 20px; }
  .main { width: 68%; padding: 25px 30px; }
  .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #1a1a2e; border-bottom: 2px solid #1a1a2e; padding-bottom: 5px; margin-bottom: 12px; margin-top: 20px; }
  .section-title:first-child { margin-top: 0; }
  .skill-tag { display: inline-block; background: #EBF5FB; color: #1a1a2e; padding: 4px 12px; border-radius: 15px; margin: 3px 2px; font-size: 12px; }
  li { margin-bottom: 5px; font-size: 13px; line-height: 1.6; }
  .footer { text-align: center; padding: 10px; font-size: 10px; color: #bbb; border-top: 1px solid #eee; }
</style>
</head>
<body>
<div class="header">
  <div class="name">${data.name.toUpperCase()}</div>
  <div class="role">${data.role}</div>
  <div class="contact">
    <span>📧 ${data.email || 'email@example.com'}</span>
    <span>📱 ${data.phone || '+91-XXXXX-XXXXX'}</span>
  </div>
</div>
${data.summary ? `<div class="summary-bar">${data.summary}</div>` : ''}
<div class="body">
  <div class="sidebar">
    <div class="section-title">Skills</div>
    ${data.skills.split(',').map(s => `<span class="skill-tag">${s.trim()}</span>`).join('')}
    <div class="section-title">Education</div>
    <p style="font-size:13px; line-height:1.6;">${data.education}</p>
  </div>
  <div class="main">
    <div class="section-title">Experience</div>
    <p style="font-size:13px; color:#555; line-height:1.6;">${data.experience}</p>
    <div class="section-title">Projects</div>
    <p style="font-size:13px; color:#555; line-height:1.6;">${data.projects}</p>
    ${customSections}
  </div>
</div>
<div class="footer">⚡ Generated by HireIQ — AI Resume Suite by Arun Kumar</div>
</body>
</html>`;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await generatePdf(generateDemoHtml(form, customFields));
      setHtmlPreview(generateDemoHtml(form, customFields));
      setGenerated(true);
    } catch {
      setHtmlPreview(generateDemoHtml(form, customFields));
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlPreview], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.name.replace(' ', '_')}_Resume.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-bright)',
    borderRadius: '8px', color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  const labelRow = (icon, text, fieldKey = null) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        {icon}{text}
      </label>
      {fieldKey && <AiButton fieldKey={fieldKey} />}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
          Resume Builder
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          AI-powered professional resume generation
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Form */}
        <div className="card" style={{ borderColor: 'var(--accent-green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--gradient-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileEdit size={18} color="white" />
            </div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700' }}>Your Details</h3>
          </div>

          <form onSubmit={handleGenerate}>

            {/* Personal Details — NO AI buttons */}
            <div style={{
              marginBottom: '16px', padding: '14px',
              background: 'var(--bg-secondary)', borderRadius: '10px',
              border: '1px solid var(--border)'
            }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Personal Info — auto-loaded
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Full Name</label>
                  <input type="text" value={form.name} readOnly
                    style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Email</label>
                  <input type="email" value={form.email} readOnly
                    style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                  <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Phone (manual)
                </label>
                <input type="text" placeholder="+91-98XXX-XXXXX" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-bright)'} />
              </div>
            </div>

            {/* Job Role — AI */}
            <div style={{ marginBottom: '12px' }}>
              {labelRow(<Briefcase size={12} />, 'Job Role', 'role')}
              <input type="text" placeholder="Python Developer" value={form.role} required
                onChange={e => setForm({ ...form, role: e.target.value })} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-bright)'} />
            </div>

            {/* Professional Summary — AI */}
            <div style={{ marginBottom: '12px' }}>
              {labelRow(<Award size={12} />, 'Professional Summary', 'summary')}
              <textarea placeholder="A brief professional summary highlighting your expertise, achievements and career goals..."
                value={form.summary} rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                onChange={e => setForm({ ...form, summary: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--accent-green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-bright)'} />
            </div>

            {/* Experience — AI */}
            <div style={{ marginBottom: '12px' }}>
              {labelRow(<Briefcase size={12} />, 'Experience', 'experience')}
              <textarea placeholder="2 years at HCLTech — Python, Django, Microsoft Fabric..."
                value={form.experience} rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                onChange={e => setForm({ ...form, experience: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--accent-green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-bright)'} />
            </div>

            {/* Skills — AI */}
            <div style={{ marginBottom: '12px' }}>
              {labelRow(<Code size={12} />, 'Skills (comma separated)', 'skills')}
              <input type="text" placeholder="Python, Django, SQL, REST APIs, Git, Docker"
                value={form.skills} required style={inputStyle}
                onChange={e => setForm({ ...form, skills: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--accent-green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-bright)'} />
            </div>

            {/* Education — AI */}
            <div style={{ marginBottom: '12px' }}>
              {labelRow(<GraduationCap size={12} />, 'Education', 'education')}
              <input type="text" placeholder="B.Tech CS — NIT Patna 2024, CGPA 8.5"
                value={form.education} style={inputStyle}
                onChange={e => setForm({ ...form, education: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--accent-green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-bright)'} />
            </div>

            {/* Projects — AI */}
            <div style={{ marginBottom: '20px' }}>
              {labelRow(<FolderOpen size={12} />, 'Projects', 'projects')}
              <textarea placeholder="HireIQ AI Resume Suite — React, .NET, Python, ML..."
                value={form.projects} rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                onChange={e => setForm({ ...form, projects: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'var(--accent-green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-bright)'} />
            </div>

            {/* Custom Sections */}
            <div style={{
              marginBottom: '20px', padding: '16px',
              background: 'var(--bg-secondary)', borderRadius: '10px',
              border: '1px dashed var(--border-bright)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  Custom Sections
                </span>
                <button type="button" onClick={() => setAddingField(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    background: 'none', border: '1px solid var(--accent-green)',
                    color: 'var(--accent-green)', borderRadius: '6px',
                    padding: '4px 10px', fontSize: '12px', cursor: 'pointer'
                  }}>
                  <Plus size={12} /> Add Field
                </button>
              </div>

              {customFields.map(f => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  marginBottom: '8px', padding: '10px',
                  background: 'var(--bg-card)', borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: '600', marginBottom: '2px' }}>
                      {f.fieldName}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {f.fieldValue}
                    </div>
                  </div>
                  <button type="button" onClick={() => handleDeleteField(f.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', flexShrink: 0 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {addingField && (
                <div style={{
                  marginTop: '10px', padding: '12px',
                  background: 'var(--bg-card)', borderRadius: '8px',
                  border: '1px solid var(--accent-green)'
                }}>
                  <input type="text" placeholder="Section name (e.g. Certifications)"
                    value={newField.fieldName}
                    onChange={e => setNewField({ ...newField, fieldName: e.target.value })}
                    style={{ ...inputStyle, marginBottom: '8px' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-green)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-bright)'} />
                  <textarea placeholder="Section content..."
                    value={newField.fieldValue} rows={2}
                    onChange={e => setNewField({ ...newField, fieldValue: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical', marginBottom: '8px' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-green)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-bright)'} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={handleAddField}
                      style={{
                        flex: 1, padding: '8px', background: 'var(--gradient-3)',
                        border: 'none', borderRadius: '6px', color: 'white',
                        fontSize: '13px', cursor: 'pointer', fontWeight: '600'
                      }}>
                      Save Field
                    </button>
                    <button type="button"
                      onClick={() => { setAddingField(false); setNewField({ fieldName: '', fieldValue: '', fieldType: 'text' }); }}
                      style={{
                        padding: '8px 14px', background: 'none',
                        border: '1px solid var(--border)', borderRadius: '6px',
                        color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer'
                      }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {customFields.length === 0 && !addingField && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Add custom sections like Certifications, Languages, Achievements
                </p>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', background: 'var(--gradient-3)' }}>
              {loading ? 'Generating...' : <><Zap size={16} /> Generate Resume</>}
            </button>
          </form>
        </div>

        {/* Preview */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={16} color="var(--accent-green)" />
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: '700' }}>Preview</span>
            </div>
            {generated && (
              <button onClick={handleDownload} className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--gradient-3)' }}>
                <Download size={14} /> Download HTML
              </button>
            )}
          </div>

          {!generated ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '500px', color: 'var(--text-muted)',
            }}>
              <FileEdit size={48} style={{ marginBottom: '12px', opacity: 0.2 }} />
              <p style={{ fontSize: '14px' }}>Fill the form and click Generate!</p>
            </div>
          ) : (
            <iframe srcDoc={htmlPreview}
              style={{ width: '100%', height: '600px', border: 'none', background: 'white' }}
              title="Resume Preview" />
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}

export default ResumeBuilder;