import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, AlertCircle } from 'lucide-react';
import { jobPostingsApi } from '../api/jobPostingsApi';
import { card, input, label, h1, subtitle, colors } from '../../../shared/styles/darkTheme';

// ⚠ Defined OUTSIDE the component on purpose.
// Defining a component inside the parent re-creates it on every render →
// React unmounts/remounts the input each keystroke → focus loss.
const Field = ({ lbl, children }) => (
  <div>
    <label style={label}>{lbl}</label>
    {children}
  </div>
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

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const splitCsv = (s) => s.split(',').map(x => x.trim()).filter(Boolean);

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

      <form onSubmit={submit} style={card}>
        <Field lbl="Job Title *">
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
          <Field lbl="Description *">
            <textarea style={{ ...input, minHeight: 140, fontFamily: 'inherit' }}
              placeholder="What this role does, what you'll work on, who you'll work with…"
              value={form.description} onChange={set('description')} required />
          </Field>
        </div>

        <div style={{ marginTop: 16 }}>
          <Field lbl="Requirements (comma-separated)">
            <input style={input} placeholder="5+ years Node, REST APIs, AWS"
              value={form.requirements} onChange={set('requirements')} />
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <Field lbl="Benefits (comma-separated)">
            <input style={input} placeholder="Health insurance, ESOPs, WFH"
              value={form.benefits} onChange={set('benefits')} />
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <Field lbl="Skills required (comma-separated)">
            <input style={input} placeholder="Node.js, PostgreSQL, AWS"
              value={form.skillsRequired} onChange={set('skillsRequired')} />
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <Field lbl="Nice-to-have skills (comma-separated)">
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
