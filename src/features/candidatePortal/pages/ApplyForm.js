import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../../store/hooks';
import { selectToken } from '../../auth/store/authSlice';
import { publicJobsApi, applicationsApi } from '../api/candidateApi';

// Apply form. Requires login — redirects unauthenticated users to /login?redirect=...
export default function ApplyForm() {
  const { jobId } = useParams();
  const nav = useNavigate();
  const token = useAppSelector(selectToken);
  const [job, setJob] = useState(null);
  const [candidateName, setCandidateName] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      nav(`/login?redirect=/jobs/${jobId}/apply`);
      return;
    }
    publicJobsApi.get(jobId).then(({ data }) => setJob(data));
  }, [jobId, token, nav]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('jobPostingId', jobId);
      fd.append('candidateName', candidateName);
      if (coverLetter) fd.append('coverLetter', coverLetter);
      if (file) fd.append('resume', file);
      await applicationsApi.apply(fd);
      setDone(true);
    } catch (err) {
      alert(err?.response?.data?.error || 'Application failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) return <div className="p-6">Loading…</div>;
  if (done) return (
    <div className="max-w-xl mx-auto p-8 text-center">
      <div className="text-5xl mb-3">✓</div>
      <h1 className="text-2xl font-bold mb-2">Application submitted</h1>
      <p className="text-gray-500 mb-6">We'll review and email you about next steps.</p>
      <button onClick={() => nav('/my-applications')} className="bg-indigo-600 text-white px-6 py-2 rounded">
        View My Applications
      </button>
    </div>
  );

  return (
    <form onSubmit={submit} className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="bg-gray-50 border-l-4 border-indigo-600 p-4 mb-2">
        <div className="font-semibold">{job.title}</div>
        <div className="text-sm text-gray-600">{job.company} · {job.location}</div>
      </div>

      <h1 className="text-2xl font-bold">Apply</h1>

      <input className="w-full border p-2 rounded" placeholder="Full name"
        value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required />

      <div>
        <label className="block text-sm text-gray-600 mb-1">Resume (PDF)</label>
        <input type="file" accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0])} />
      </div>

      <textarea className="w-full border p-2 rounded h-32"
        placeholder="Cover letter (optional)"
        value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />

      <button type="submit" disabled={submitting}
        className="bg-indigo-600 text-white px-6 py-2 rounded disabled:opacity-50">
        {submitting ? 'Submitting…' : 'Submit Application'}
      </button>
    </form>
  );
}
