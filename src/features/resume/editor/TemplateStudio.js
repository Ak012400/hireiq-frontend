import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, Save, Download, Zap, Plus, Trash2,
  Eye, Edit3, Palette, User, Briefcase, BookOpen,
  Code, Award, Globe, MoreHorizontal, Sparkles
} from 'lucide-react';
import TemplateRenderer from './TemplateRenderer';
import { getTemplatesList, getEditorState, saveResumeData, aiFillResume, generateFieldContent, generatePdf } from '../services/api';

// ── Default Data ──────────────────────────────────────
const DEFAULT_DATA = {
  name: '', role: '', email: '', phone: '',
  linkedin: '', github: '', location: '',
  summary: '',
  skills: ['React', '.NET Core', 'PostgreSQL'],
  experience: [{ title: '', company: '', duration: '', description: '' }],
  education: [{ degree: '', school: '', year: '', gpa: '' }],
  projects: [{ name: '', description: '', tech: '', link: '' }],
  certifications: [],
  languages: [],
  extra: '',
  photo: '',
};

const DEFAULT_THEME = {
  primaryColor: '#7c3aed',
  secondaryColor: '#06b6d4',
  fontFamily: 'DM Sans, sans-serif',
};

// ── AI Button ─────────────────────────────────────────
function AiBtn({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading}
      title="AI Generate"
      style={{
        padding: '4px 8px', background: loading ? 'rgba(124,58,237,0.3)' : 'var(--gradient-1)',
        border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: '4px',
        fontSize: '11px', fontWeight: '600', color: 'white', whiteSpace: 'nowrap',
        flexShrink: 0,
      }}>
      <Sparkles size={10} />
      {loading ? '...' : 'AI'}
    </button>
  );
}

// ── Input with AI ─────────────────────────────────────
function FieldRow({ label, value, onChange, onAI, aiLoading, placeholder, type = 'text' }) {
  const inputStyle = {
    flex: 1, padding: '8px 10px',
    background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)',
    borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px',
    outline: 'none', fontFamily: 'DM Sans, sans-serif',
  };
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '5px' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '6px', alignItems: type === 'textarea' ? 'flex-start' : 'center' }}>
        {type === 'textarea' ? (
          <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
        ) : (
          <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={inputStyle} />
        )}
        {onAI && <AiBtn onClick={onAI} loading={aiLoading} />}
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────
function SectionHeader({ icon, title, onAdd, addLabel }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{title}</span>
      </div>
      {onAdd && (
        <button onClick={onAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '6px', color: 'var(--accent-purple)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
          <Plus size={10} /> {addLabel || 'Add'}
        </button>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────
export default function TemplateStudio() {
  const [step, setStep] = useState('select');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [data, setData] = useState(DEFAULT_DATA);
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [activeTab, setActiveTab] = useState('basics');
  const [saving, setSaving] = useState(false);
  const [aiLoadingField, setAiLoadingField] = useState(null);
  const [aiPasteText, setAiPasteText] = useState('');
  const [aiPasteLoading, setAiPasteLoading] = useState(false);

  useEffect(() => {
    getTemplatesList().then(r => setTemplates(r.data)).catch(() => {});
  }, []);

  const update = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  const aiGenerate = async (fieldKey, prompt) => {
    setAiLoadingField(fieldKey);
    try {
      const res = await generateFieldContent(prompt);
      const text = res.data.result?.trim() || '';
      if (fieldKey.includes('.')) {
        // nested field like experience.0.description
        const [arr, idx, key] = fieldKey.split('.');
        const newArr = [...data[arr]];
        newArr[parseInt(idx)] = { ...newArr[parseInt(idx)], [key]: text };
        update(arr, newArr);
      } else {
        update(fieldKey, text);
      }
    } catch {}
    setAiLoadingField(null);
  };

  const handleSelectTemplate = async (tmpl) => {
    setSelectedTemplate(tmpl);
    try {
      const res = await getEditorState(tmpl.id);
      if (res.data?.ResumeData) setData(prev => ({ ...prev, ...res.data.ResumeData }));
    } catch {}
    setStep('editor');
  };

  const handleSave = async () => {
    setSaving(true);
    try { await saveResumeData({ templateId: selectedTemplate?.id, sections: [data] }); }
    catch {}
    setSaving(false);
  };

  const handleAiPasteFill = async () => {
    if (!aiPasteText.trim()) return;
    setAiPasteLoading(true);
    try {
      const res = await aiFillResume(aiPasteText);
      const parsed = JSON.parse(res.data.data);
      setData(prev => ({ ...prev, ...parsed }));
      setActiveTab('basics');
    } catch {}
    setAiPasteLoading(false);
  };

  const handleDownloadPdf = async () => {
    try {
      const iframe = document.getElementById('studio-preview');
      if (!iframe) return;
      const html = iframe.contentDocument.documentElement.outerHTML;
      const res = await generatePdf(html);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'resume.pdf'; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  // ── Array helpers ──
  const addItem = (key, empty) => update(key, [...(data[key] || []), empty]);
  const removeItem = (key, idx) => update(key, data[key].filter((_, i) => i !== idx));
  const updateItem = (key, idx, field, val) => {
    const arr = [...data[key]];
    arr[idx] = { ...arr[idx], [field]: val };
    update(key, arr);
  };

  const inputStyle = {
    width: '100%', padding: '8px 10px', boxSizing: 'border-box',
    background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)',
    borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px',
    outline: 'none', fontFamily: 'DM Sans, sans-serif',
  };

  const tabs = [
    { key: 'basics', label: 'Basics', icon: <User size={12} /> },
    { key: 'experience', label: 'Experience', icon: <Briefcase size={12} /> },
    { key: 'education', label: 'Education', icon: <BookOpen size={12} /> },
    { key: 'projects', label: 'Projects', icon: <Code size={12} /> },
    { key: 'extra', label: 'More', icon: <MoreHorizontal size={12} /> },
    { key: 'theme', label: 'Theme', icon: <Palette size={12} /> },
    { key: 'ai', label: '✨ AI Fill', icon: <Zap size={12} /> },
  ];

  // ══════════════════════════════════════════════════
  // STEP 1 — Template Select
  // ══════════════════════════════════════════════════
  if (step === 'select') return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>Template Studio</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Choose a professional template to start</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {templates.map(tmpl => (
          <div key={tmpl.id} className="card" onClick={() => handleSelectTemplate(tmpl)}
            style={{ cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--accent-purple)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = ''; }}>
            {tmpl.isPremium && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'linear-gradient(135deg,#f59e0b,#ec4899)', color: 'white', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px' }}>PRO</div>
            )}
            <div style={{ height: '160px', borderRadius: '10px', marginBottom: '16px', background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
              <Sparkles size={32} color="var(--accent-purple)" style={{ opacity: 0.5 }} />
            </div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>{tmpl.name}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{tmpl.description}</p>
            <span style={{ fontSize: '11px', padding: '3px 10px', background: 'rgba(124,58,237,0.1)', color: 'var(--accent-purple)', borderRadius: '10px', fontWeight: '600' }}>{tmpl.category}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════
  // STEP 2 — Editor
  // ══════════════════════════════════════════════════
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', height: 'calc(100vh - 80px)', gap: '0' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '14px 16px', background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <button onClick={() => setStep('select')}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white', display: 'flex' }}>
            <ChevronLeft size={16} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: '800', color: 'white' }}>{selectedTemplate?.name}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>All fields have AI ✨ buttons</div>
          </div>
          <button onClick={handleSave} disabled={saving}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600' }}>
            <Save size={13} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg-secondary)' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '10px 12px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                fontSize: '11px', fontWeight: '600', fontFamily: 'DM Sans, sans-serif',
                background: activeTab === tab.key ? 'rgba(124,58,237,0.1)' : 'transparent',
                color: activeTab === tab.key ? 'var(--accent-purple)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.key ? '2px solid var(--accent-purple)' : '2px solid transparent',
              }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

          {/* ── BASICS ── */}
          {activeTab === 'basics' && (
            <div>
              <FieldRow label="Full Name" value={data.name} onChange={v => update('name', v)} placeholder="Arun Kumar"
                onAI={() => aiGenerate('name', 'Generate a professional full name for a resume.')}
                aiLoading={aiLoadingField === 'name'} />
              <FieldRow label="Role / Title" value={data.role} onChange={v => update('role', v)} placeholder="Full Stack Developer"
                onAI={() => aiGenerate('role', `Generate a professional job title for someone with these skills: ${data.skills?.join(', ')}`)}
                aiLoading={aiLoadingField === 'role'} />
              <FieldRow label="Email" value={data.email} onChange={v => update('email', v)} placeholder="email@example.com" />
              <FieldRow label="Phone" value={data.phone} onChange={v => update('phone', v)} placeholder="+91-XXXXX-XXXXX" />
              <FieldRow label="LinkedIn" value={data.linkedin} onChange={v => update('linkedin', v)} placeholder="linkedin.com/in/username" />
              <FieldRow label="GitHub" value={data.github} onChange={v => update('github', v)} placeholder="github.com/username" />
              <FieldRow label="Location" value={data.location} onChange={v => update('location', v)} placeholder="City, State" />
              <FieldRow label="Professional Summary" value={data.summary} onChange={v => update('summary', v)}
                placeholder="Write a compelling summary..." type="textarea"
                onAI={() => aiGenerate('summary', `Write a compelling 3-sentence professional summary for a ${data.role || 'developer'} with these skills: ${data.skills?.join(', ')}. Make it ATS-friendly and impactful.`)}
                aiLoading={aiLoadingField === 'summary'} />
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Skills</label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input style={{ flex: 1, padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                    value={data.skills?.join(', ') || ''} placeholder="React, Node.js, Python..."
                    onChange={e => update('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
                  <AiBtn loading={aiLoadingField === 'skills'}
                    onClick={() => aiGenerate('skills', `List 10 top skills for a ${data.role || 'software developer'} as comma separated values only. No explanation.`)} />
                </div>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Comma separated</p>
              </div>
            </div>
          )}

          {/* ── EXPERIENCE ── */}
          {activeTab === 'experience' && (
            <div>
              <SectionHeader icon={<Briefcase size={14} color="var(--accent-purple)" />} title="Work Experience"
                onAdd={() => addItem('experience', { title: '', company: '', duration: '', description: '' })}
                addLabel="Add Job" />
              {(data.experience || []).map((exp, i) => (
                <div key={i} style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', marginBottom: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-purple)' }}>Job #{i + 1}</span>
                    <button onClick={() => removeItem('experience', i)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                      <Trash2 size={10} /> Remove
                    </button>
                  </div>
                  <FieldRow label="Job Title" value={exp.title} onChange={v => updateItem('experience', i, 'title', v)} placeholder="Software Engineer"
                    onAI={() => aiGenerate(`experience.${i}.title`, `Generate a professional job title for a ${data.role || 'developer'} role.`)}
                    aiLoading={aiLoadingField === `experience.${i}.title`} />
                  <FieldRow label="Company" value={exp.company} onChange={v => updateItem('experience', i, 'company', v)} placeholder="Company Name" />
                  <FieldRow label="Duration" value={exp.duration} onChange={v => updateItem('experience', i, 'duration', v)} placeholder="Jan 2024 - Present" />
                  <FieldRow label="Description" value={exp.description} onChange={v => updateItem('experience', i, 'description', v)}
                    placeholder="Describe your achievements..." type="textarea"
                    onAI={() => aiGenerate(`experience.${i}.description`, `Write 3 impactful bullet points for a ${exp.title || 'developer'} at ${exp.company || 'a tech company'}. Use action verbs and include metrics. Return as a single paragraph.`)}
                    aiLoading={aiLoadingField === `experience.${i}.description`} />
                </div>
              ))}
            </div>
          )}

          {/* ── EDUCATION ── */}
          {activeTab === 'education' && (
            <div>
              <SectionHeader icon={<BookOpen size={14} color="var(--accent-purple)" />} title="Education"
                onAdd={() => addItem('education', { degree: '', school: '', year: '', gpa: '' })}
                addLabel="Add Degree" />
              {(data.education || []).map((edu, i) => (
                <div key={i} style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', marginBottom: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-purple)' }}>Degree #{i + 1}</span>
                    <button onClick={() => removeItem('education', i)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                      <Trash2 size={10} /> Remove
                    </button>
                  </div>
                  <FieldRow label="Degree" value={edu.degree} onChange={v => updateItem('education', i, 'degree', v)} placeholder="B.Tech Computer Science"
                    onAI={() => aiGenerate(`education.${i}.degree`, 'Generate a degree name for a computer science student.')}
                    aiLoading={aiLoadingField === `education.${i}.degree`} />
                  <FieldRow label="School / University" value={edu.school} onChange={v => updateItem('education', i, 'school', v)} placeholder="IIT Delhi, 2024" />
                  <FieldRow label="Year" value={edu.year} onChange={v => updateItem('education', i, 'year', v)} placeholder="2020 - 2024" />
                  <FieldRow label="GPA / CGPA" value={edu.gpa} onChange={v => updateItem('education', i, 'gpa', v)} placeholder="8.5 / 10" />
                </div>
              ))}
            </div>
          )}

          {/* ── PROJECTS ── */}
          {activeTab === 'projects' && (
            <div>
              <SectionHeader icon={<Code size={14} color="var(--accent-purple)" />} title="Projects"
                onAdd={() => addItem('projects', { name: '', description: '', tech: '', link: '' })}
                addLabel="Add Project" />
              {(data.projects || []).map((proj, i) => (
                <div key={i} style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', marginBottom: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-purple)' }}>Project #{i + 1}</span>
                    <button onClick={() => removeItem('projects', i)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                      <Trash2 size={10} /> Remove
                    </button>
                  </div>
                  <FieldRow label="Project Name" value={proj.name} onChange={v => updateItem('projects', i, 'name', v)} placeholder="HireIQ AI Suite"
                    onAI={() => aiGenerate(`projects.${i}.name`, `Generate a creative project name for a ${data.role || 'developer'}.`)}
                    aiLoading={aiLoadingField === `projects.${i}.name`} />
                  <FieldRow label="Tech Stack" value={proj.tech} onChange={v => updateItem('projects', i, 'tech', v)} placeholder="React, .NET Core, PostgreSQL" />
                  <FieldRow label="Description" value={proj.description} onChange={v => updateItem('projects', i, 'description', v)}
                    placeholder="What did you build?" type="textarea"
                    onAI={() => aiGenerate(`projects.${i}.description`, `Write a 2-sentence project description for "${proj.name || 'a software project'}" built with ${proj.tech || 'modern technologies'}. Highlight impact and technical complexity.`)}
                    aiLoading={aiLoadingField === `projects.${i}.description`} />
                  <FieldRow label="Link (optional)" value={proj.link} onChange={v => updateItem('projects', i, 'link', v)} placeholder="github.com/..." />
                </div>
              ))}
            </div>
          )}

          {/* ── MORE ── */}
          {activeTab === 'extra' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <SectionHeader icon={<Award size={14} color="var(--accent-purple)" />} title="Certifications"
                  onAdd={() => addItem('certifications', '')} addLabel="Add" />
                {(data.certifications || []).map((cert, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                    <input value={cert} onChange={e => { const arr = [...data.certifications]; arr[i] = e.target.value; update('certifications', arr); }}
                      placeholder="AWS Certified Developer..."
                      style={{ flex: 1, padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                    <AiBtn loading={aiLoadingField === `cert.${i}`}
                      onClick={() => aiGenerate(`certifications`, `List 5 popular certifications for a ${data.role || 'developer'} as comma separated values only.`)} />
                    <button onClick={() => removeItem('certifications', i)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <SectionHeader icon={<Globe size={14} color="var(--accent-purple)" />} title="Languages"
                  onAdd={() => addItem('languages', '')} addLabel="Add" />
                {(data.languages || []).map((lang, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                    <input value={lang} onChange={e => { const arr = [...data.languages]; arr[i] = e.target.value; update('languages', arr); }}
                      placeholder="English (Native)..."
                      style={{ flex: 1, padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                    <button onClick={() => removeItem('languages', i)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <FieldRow label="Additional Info" value={data.extra} onChange={v => update('extra', v)}
                placeholder="Hobbies, volunteering, awards..." type="textarea"
                onAI={() => aiGenerate('extra', `Write a brief additional info section for a ${data.role || 'developer'} resume. Include interests and soft skills.`)}
                aiLoading={aiLoadingField === 'extra'} />
            </div>
          )}

          {/* ── THEME ── */}
          {activeTab === 'theme' && (
            <div>
              <SectionHeader icon={<Palette size={14} color="var(--accent-purple)" />} title="Theme & Colors" />
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Primary Color</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="color" value={theme.primaryColor}
                    onChange={e => setTheme(p => ({ ...p, primaryColor: e.target.value }))}
                    style={{ width: '48px', height: '40px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', background: 'none' }} />
                  <input value={theme.primaryColor} onChange={e => setTheme(p => ({ ...p, primaryColor: e.target.value }))}
                    style={{ flex: 1, padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Secondary Color</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="color" value={theme.secondaryColor}
                    onChange={e => setTheme(p => ({ ...p, secondaryColor: e.target.value }))}
                    style={{ width: '48px', height: '40px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', background: 'none' }} />
                  <input value={theme.secondaryColor} onChange={e => setTheme(p => ({ ...p, secondaryColor: e.target.value }))}
                    style={{ flex: 1, padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Font</label>
                <select value={theme.fontFamily} onChange={e => setTheme(p => ({ ...p, fontFamily: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}>
                  <option value="DM Sans, sans-serif">DM Sans</option>
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Poppins, sans-serif">Poppins</option>
                  <option value="Lato, sans-serif">Lato</option>
                  <option value="JetBrains Mono, monospace">JetBrains Mono</option>
                </select>
              </div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '10px' }}>Quick Presets</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { name: 'Purple', p: '#7c3aed', s: '#06b6d4' },
                  { name: 'Navy', p: '#1e3a5f', s: '#c9a84c' },
                  { name: 'Green', p: '#059669', s: '#0284c7' },
                  { name: 'Rose', p: '#e11d48', s: '#7c3aed' },
                  { name: 'Dark', p: '#374151', s: '#6b7280' },
                  { name: 'Cyan', p: '#0891b2', s: '#7c3aed' },
                ].map(preset => (
                  <button key={preset.name}
                    onClick={() => setTheme(p => ({ ...p, primaryColor: preset.p, secondaryColor: preset.s }))}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', background: preset.p, color: 'white' }}>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── AI FILL ── */}
          {activeTab === 'ai' && (
            <div>
              <div style={{ padding: '12px', background: 'rgba(124,58,237,0.08)', borderRadius: '10px', border: '1px solid rgba(124,58,237,0.2)', marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  ✨ Paste your existing resume text — AI will extract all sections and auto-fill the template instantly!
                </p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Paste Resume Text</label>
                <textarea value={aiPasteText} onChange={e => setAiPasteText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  style={{ width: '100%', minHeight: '220px', padding: '10px 12px', boxSizing: 'border-box', background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical' }} />
              </div>
              <button onClick={handleAiPasteFill} disabled={aiPasteLoading || !aiPasteText.trim()}
                style={{ width: '100%', padding: '12px', background: 'var(--gradient-1)', border: 'none', borderRadius: '10px', cursor: 'pointer', color: 'white', fontSize: '14px', fontWeight: '700', fontFamily: 'Syne, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: aiPasteLoading || !aiPasteText.trim() ? 0.6 : 1 }}>
                <Zap size={16} /> {aiPasteLoading ? 'AI Filling All Sections...' : 'AI Auto Fill Everything'}
              </button>
            </div>
          )}
        </div>

        {/* Download Button */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button onClick={handleDownloadPdf}
            style={{ width: '100%', padding: '12px', background: 'var(--gradient-2)', border: 'none', borderRadius: '10px', cursor: 'pointer', color: 'white', fontSize: '14px', fontWeight: '700', fontFamily: 'Syne, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* ── RIGHT — LIVE PREVIEW ── */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <Eye size={14} color="var(--accent-purple)" />
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: '700' }}>Live Preview</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>Updates as you type</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{ width: '210mm', background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            <TemplateRenderer templateId={selectedTemplate?.id} data={data} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}