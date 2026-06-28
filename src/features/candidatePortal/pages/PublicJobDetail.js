import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicJobsApi } from '../api/candidateApi';

const parseList = (s) => { try { return JSON.parse(s || '[]'); } catch { return []; } };

export default function PublicJobDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => { publicJobsApi.get(id).then(({ data }) => setJob(data)); }, [id]);

  if (!job) return <div className="p-6">Loading…</div>;

  const skills = parseList(job.skillsRequiredJson);
  const niceSkills = parseList(job.skillsNiceToHaveJson);
  const reqs = parseList(job.requirementsJson);
  const benefits = parseList(job.benefitsJson);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={() => nav(-1)} className="text-sm text-gray-500 mb-4">← Back</button>

      <div className="bg-white border rounded-lg p-6 mb-4">
        <h1 className="text-3xl font-bold mb-1">{job.title}</h1>
        <div className="text-gray-600">{job.company} · {job.location} · {job.workMode}</div>
        {job.salaryMin != null && (
          <div className="text-sm text-gray-500 mt-2">
            💰 {job.currency} {job.salaryMin?.toLocaleString()} – {job.salaryMax?.toLocaleString()} · {job.salaryPeriod}
          </div>
        )}
        {job.experienceMinYears != null && (
          <div className="text-sm text-gray-500 mt-1">
            📅 {job.experienceMinYears}–{job.experienceMaxYears} years experience
          </div>
        )}
        <button
          onClick={() => nav(`/jobs/${job.id}/apply`)}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded font-medium">
          Apply Now
        </button>
      </div>

      <Section title="About the role">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
      </Section>

      {reqs.length > 0 && <Section title="Requirements"><Bullets items={reqs} /></Section>}
      {skills.length > 0 && <Section title="Required Skills"><Pills items={skills} color="indigo" /></Section>}
      {niceSkills.length > 0 && <Section title="Nice-to-have"><Pills items={niceSkills} color="gray" /></Section>}
      {benefits.length > 0 && <Section title="Benefits"><Bullets items={benefits} /></Section>}
    </div>
  );
}

const Section = ({ title, children }) => (
  <div className="bg-white border rounded-lg p-6 mb-4">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    {children}
  </div>
);

const Bullets = ({ items }) => (
  <ul className="list-disc pl-5 space-y-1 text-sm">
    {items.map((x, i) => <li key={i}>{x}</li>)}
  </ul>
);

const Pills = ({ items, color = 'indigo' }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((s, i) => (
      <span key={i} className={`text-xs px-2 py-1 rounded ${
        color === 'indigo' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'
      }`}>{s}</span>
    ))}
  </div>
);
