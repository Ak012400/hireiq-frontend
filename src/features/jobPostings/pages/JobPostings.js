import React, { useEffect, useState } from 'react';
import { jobPostingsApi } from '../api/jobPostingsApi';
import { Link } from 'react-router-dom';

// Hirer-facing job posting management page.
// Lists drafts + published jobs with quick actions: Publish, Close, View pipeline, Share to LinkedIn.
export default function JobPostings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const { data } = await jobPostingsApi.list();
      setJobs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const publish = async (id) => { await jobPostingsApi.publish(id); refresh(); };
  const close = async (id) => { await jobPostingsApi.close(id); refresh(); };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Job Postings</h1>
        <Link to="/job-postings/new" className="bg-indigo-600 text-white px-4 py-2 rounded">+ New Job</Link>
      </div>

      {jobs.length === 0 && <p className="text-gray-500">No postings yet. Create your first job.</p>}

      <ul className="space-y-3">
        {jobs.map(j => (
          <li key={j.id} className="border rounded p-4 flex justify-between">
            <div>
              <div className="font-semibold">{j.title}</div>
              <div className="text-sm text-gray-500">{j.company} · {j.location} · {j.workMode}</div>
              <div className="text-xs mt-1">
                <span className={`inline-block px-2 py-0.5 rounded text-white ${j.status === 'Published' ? 'bg-green-600' : 'bg-gray-500'}`}>
                  {j.status}
                </span>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {j.status === 'Draft' && <button onClick={() => publish(j.id)} className="text-blue-600">Publish</button>}
              {j.status === 'Published' && (
                <>
                  <a href={j.linkedInShareUrl} target="_blank" rel="noreferrer" className="text-blue-600">Share on LinkedIn</a>
                  <button onClick={() => close(j.id)} className="text-red-600">Close</button>
                </>
              )}
              <Link to={`/pipeline/${j.id}`} className="text-indigo-600">View Pipeline</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
