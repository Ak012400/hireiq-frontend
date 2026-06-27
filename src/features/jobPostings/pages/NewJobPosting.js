import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobPostingsApi } from '../api/jobPostingsApi';

// Structured job-posting form — LinkedIn/Indeed compatible field set.
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

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const splitCsv = (s) => s.split(',').map(x => x.trim()).filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      experienceMinYears: Number(form.experienceMinYears) || null,
      experienceMaxYears: Number(form.experienceMaxYears) || null,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
      requirements: splitCsv(form.requirements),
      benefits: splitCsv(form.benefits),
      skillsRequired: splitCsv(form.skillsRequired),
      skillsNiceToHave: splitCsv(form.skillsNiceToHave),
    };
    await jobPostingsApi.create(payload);
    nav('/job-postings');
  };

  return (
    <form onSubmit={submit} className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">New Job Posting</h1>

      <input className="w-full border p-2 rounded" placeholder="Job title" value={form.title} onChange={set('title')} required />
      <div className="grid grid-cols-2 gap-3">
        <input className="border p-2 rounded" placeholder="Company" value={form.company} onChange={set('company')} required />
        <input className="border p-2 rounded" placeholder="Location" value={form.location} onChange={set('location')} required />
        <select className="border p-2 rounded" value={form.employmentType} onChange={set('employmentType')}>
          <option>FullTime</option><option>PartTime</option><option>Contract</option><option>Internship</option><option>Freelance</option>
        </select>
        <select className="border p-2 rounded" value={form.workMode} onChange={set('workMode')}>
          <option>Onsite</option><option>Remote</option><option>Hybrid</option>
        </select>
        <input type="number" className="border p-2 rounded" placeholder="Min experience (years)" value={form.experienceMinYears} onChange={set('experienceMinYears')} />
        <input type="number" className="border p-2 rounded" placeholder="Max experience (years)" value={form.experienceMaxYears} onChange={set('experienceMaxYears')} />
        <input type="number" className="border p-2 rounded" placeholder="Salary min" value={form.salaryMin} onChange={set('salaryMin')} />
        <input type="number" className="border p-2 rounded" placeholder="Salary max" value={form.salaryMax} onChange={set('salaryMax')} />
      </div>

      <textarea className="w-full border p-2 rounded h-32" placeholder="Description" value={form.description} onChange={set('description')} required />

      <input className="w-full border p-2 rounded" placeholder="Requirements (comma separated)" value={form.requirements} onChange={set('requirements')} />
      <input className="w-full border p-2 rounded" placeholder="Benefits (comma separated)" value={form.benefits} onChange={set('benefits')} />
      <input className="w-full border p-2 rounded" placeholder="Skills required (comma separated)" value={form.skillsRequired} onChange={set('skillsRequired')} />
      <input className="w-full border p-2 rounded" placeholder="Nice-to-have skills (comma separated)" value={form.skillsNiceToHave} onChange={set('skillsNiceToHave')} />

      <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded">Save Draft</button>
    </form>
  );
}
