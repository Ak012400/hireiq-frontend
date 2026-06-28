import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, AlertCircle, Upload, Sparkles, Wand2, Loader2 } from 'lucide-react';
import { jobPostingsApi, jobPostingAiApi } from '../api/jobPostingsApi';
import { card, input, label, h1, subtitle, colors } from '../../../shared/styles/darkTheme';

// ⚠ Defined OUTSIDE the component on purpose.
// Defining a component inside the parent re-creates it on every render →
// React unmounts/remounts the input each keystroke → focus loss.
const Field = ({ lbl, children, ai }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
      <label style={{ ...label, marginBottom: 0 }}>{lbl}</label>
      {ai}
    </div>
    {children}
  </div>
);

// Tiny ✨ button rendered next to a field — generates content via AI
const AiButton = ({ loading, onClick, title = 'Generate with AI' }) => (
  <button type="button" onClick={onClick} title={title} disabled={loading}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', fontSize: 11, fontWeight: 600,
      background: 'rgba(124,58,237,0.15)', color: '#c4b5fd',
      border: '1px solid rgba(124,58,237,0.3)', borderRadius: 6,
      cursor: loading ? 'wait' : 'pointer',
    }}>
    {loading ? <Loader2 size={11} className="spin" /> : <Sparkles size={11} />}
    {loading ? 'Generating…' : 'AI'}
  </button>
);

// Dark-theme structured job-posting form (LinkedIn/Indeed compatible field set).
export default function NewJobPosting() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: '', company: '', location: '',
    employmentType: 'FullTime', workMode: 'Onsite',
    experienceMinYears: 0, experienceMaxYears: 5,
    salaryMin: '', salaryMax: '', currency: 'INR', salaryPeriod: 'yearly',
    description: '',
    requirements: '', benefits: '', skillsRequired: '', skillsNiceToHave: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [aiBusy, setAiBusy] = useState(null);   // which field/action is busy
  const fileInputRef = useRef(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const splitCsv = (s) => s.split(',').map(x => x.trim()).filter(Boolean);
  const joinList = (arr) => Array.isArray(arr) ? arr.join(', ') : (arr || '');

  // Merge an AI-returned partial draft into form state
  const applyDraft = (d) => {
    if (!d) return;
    setForm(f => ({
      ...f,
      title: d.title || f.title,
      company: d.company || f.company,
      location: d.location || f.location,
      employmentType: d.employmentType || f.employmentType,
      workMode: d.workMode || f.workMode,
      experienceMinYears: d.experienceMinYears ?? f.experienceMinYears,
      experienceMaxYears: d.experienceMaxYears ?? f.experienceMaxYears,
      salaryMin: d.salaryMin ?? f.salaryMin,
      salaryMax: d.salaryMax ?? f.salaryMax,
      currency: d.currency || f.currency,
      description: d.description || f.description,
      requirements: d.requirements ? joinList(d.requirements) : f.requirements,
      benefits: d.benefits ? joinList(d.benefits) : f.benefits,
      skillsRequired: d.skillsRequired ? joinList(d.skillsRequired) : f.skillsRequired,
      skillsNiceToHave: d.skillsNiceToHave ? joinList(d.skillsNiceToHave) : f.skillsNiceToHave,
    }));
  };

  // ── File import ──
  const importFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAiBusy('import'); setError(null);
    try {
      const { data } = await jobPostingAiApi.parseDocument(file);
      applyDraft(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not parse this document');
    } finally {
      setAiBusy(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── AI: single field ──
  const aiFillField = async (field) => {
    setAiBusy(field); setError(null);
    try {
      const { data } = await jobPostingAiApi.generateField(field, {
        title: form.title, description: form.description,
        company: form.company, location: form.location,
      });
      if (!data?.value) return;
      // Parse list-style fields back into csv strings
      if (['requirements', 'benefits', 'skillsRequired', 'skillsNiceToHave'].includes(field)) {
        try {
          const arr = JSON.parse(data.value);
          if (Array.isArray(arr)) { setForm(f => ({ ...f, [field]: joinList(arr) })); return; }
        } catch { /* fall through to raw set */ }
      }
      setForm(f => ({ ...f, [field]: data.value }));
    } catch (err) {
      setError(err?.response?.data?.error || 'AI generation failed');
    } finally { setAiBusy(null); }
  };

  // ── AI: full posting from title ──
  const aiFillAll = async () => {
    if (!form.title.trim()) { alert('Type a job title first'); return; }
    setAiBusy('all'); setError(null);
    try {
      const { data } = await jobPostingAiApi.generateAll(form.title, form.description, form.company);
      applyDraft(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'AI could not generate the posting');
    } finally { setAiBusy(null); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      await jobPostingsApi.create({
        ...form,
        experienceMinYears: Number(form.experienceMinYears) || null,
        experienceMaxYears: Number(form.experienceMaxYears) || null,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        requirements: splitCsv(form.requirements),
        benefits: splitCsv(form.benefits),
        skillsRequired: splitCsv(form.skillsRequired),
        skillsNiceToHave: splitCsv(form.skillsNiceToHave),
      });
      nav('/job-postings');
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Save failed');
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--gradient-1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Briefcase size={18} color="white" />
        </div>
        <div>
          <h1 style={h1}>New Job Posting</h1>
          <p style={subtitle}>Structured fields — auto-pushed to Indeed + LinkedIn share link</p>
        </div>
      </div>

      {error && (
        <div style={{
          display: 'flex', gap: 8, padding: 12, borderRadius: 8, marginBottom: 16,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#fca5a5', fontSize: 13,
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>{error}</div>
        </div>
      )}

      {/* === AI Toolbar === */}
      <div style={{
        ...card, padding: 16, marginBottom: 16,
        background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(236,72,153,0.06))',
        borderColor: 'rgba(124,58,237,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Sparkles size={18} color="#c4b5fd" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
              Skip the typing — let AI do the heavy lifting
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted }}>
              Import an existing JD (PDF/DOCX/XLSX/TXT), or type just a title and click Auto-fill All.
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.xlsx,.xlsm,.csv,.txt"
            onChange={importFile} style={{ display: 'none' }} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={aiBusy === 'import'}
            className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
            {aiBusy === 'import' ? <Loader2 size={13} className="spin" /> : <Upload size={13} />}
            &nbsp;Import JD
          </button>
          <button type="button" onClick={aiFillAll} disabled={aiBusy === 'all'}
            className="btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>
            {aiBusy === 'all' ? <Loader2 size={13} className="spin" /> : <Wand2 size={13} />}
            &nbsp;Auto-fill All from Title
          </button>
        </div>
      </div>

      <form onSubmit={submit} style={card}>
        <Field lbl="Job Title *" ai={<AiButton loading={aiBusy === 'title'} onClick={() => aiFillField('title')} />}>
          <input style={input} placeholder="e.g. Senior Backend Engineer" value={form.title} onChange={set('title')} required />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <Field lbl="Company *">
            <input style={input} placeholder="Acme Corp" value={form.company} onChange={set('company')} required />
          </Field>
          <Field lbl="Location *">
            <input style={input} placeholder="Bengaluru" value={form.location} onChange={set('location')} required />
          </Field>
          <Field lbl="Employment Type">
            <select style={{ ...input, cursor: 'pointer' }} value={form.employmentType} onChange={set('employmentType')}>
              <option>FullTime</option><option>PartTime</option><option>Contract</option>
              <option>Internship</option><option>Freelance</option>
            </select>
          </Field>
          <Field lbl="Work Mode">
            <select style={{ ...input, cursor: 'pointer' }} value={form.workMode} onChange={set('workMode')}>
              <option>Onsite</option><option>Remote</option><option>Hybrid</option>
            </select>
          </Field>
          <Field lbl="Experience min (years)">
            <input type="number" style={input} value={form.experienceMinYears} onChange={set('experienceMinYears')} />
          </Field>
          <Field lbl="Experience max (years)">
            <input type="number" style={input} value={form.experienceMaxYears} onChange={set('experienceMaxYears')} />
          </Field>
          <Field lbl={`Salary min (${form.currency})`}>
            <input type="number" style={input} placeholder="e.g. 1200000" value={form.salaryMin} onChange={set('salaryMin')} />
          </Field>
          <Field lbl={`Salary max (${form.currency})`}>
            <input type="number" style={input} placeholder="e.g. 2000000" value={form.salaryMax} onChange={set('salaryMax')} />
          </Field>
        </div>

        <div style={{ marginTop: 16 }}>
          <Field lbl="Description *" ai={<AiButton loading={aiBusy === 'description'} onClick={() => aiFillField('description')} />}>
            <textarea style={{ ...input, minHeight: 140, fontFamily: 'inherit' }}
              placeholder="What this role does, what you'll work on, who you'll work with…"
              value={form.description} onChange={set('description')} required />
          </Field>
        </div>

        <div style={{ marginTop: 16 }}>
          <Field lbl="Requirements (comma-separated)" ai={<AiButton loading={aiBusy === 'requirements'} onClick={() => aiFillField('requirements')} />}>
            <input style={input} placeholder="5+ years Node, REST APIs, AWS"
              value={form.requirements} onChange={set('requirements')} />
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <Field lbl="Benefits (comma-separated)" ai={<AiButton loading={aiBusy === 'benefits'} onClick={() => aiFillField('benefits')} />}>
            <input style={input} placeholder="Health insurance, ESOPs, WFH"
              value={form.benefits} onChange={set('benefits')} />
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <Field lbl="Skills required (comma-separated)" ai={<AiButton loading={aiBusy === 'skillsRequired'} onClick={() => aiFillField('skillsRequired')} />}>
            <input style={input} placeholder="Node.js, PostgreSQL, AWS"
              value={form.skillsRequired} onChange={set('skillsRequired')} />
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <Field lbl="Nice-to-have skills (comma-separated)" ai={<AiButton loading={aiBusy === 'skillsNiceToHave'} onClick={() => aiFillField('skillsNiceToHave')} />}>
            <input style={input} placeholder="Kubernetes, Terraform, GraphQL"
              value={form.skillsNiceToHave} onChange={set('skillsNiceToHave')} />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => nav('/job-postings')}>
            Cancel
          </button>
        </div>
        <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 10 }}>
          Saved as Draft. Publish it from the Job Postings list to make it live.
        </p>
      </form>
    </div>
  );
}
