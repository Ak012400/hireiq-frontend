import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publicJobsApi } from '../api/candidateApi';

// Public no-auth job browser. Apply CTA forces login (handled by ApplyForm route).
export default function PublicJobBoard() {
  const nav = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await publicJobsApi.browse({ q, location });
      setJobs(data.results);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Find your next role</h1>
        <p className="text-gray-500">Browse open positions from companies using HireIQ.</p>
      </div>

      <div className="flex gap-2 mb-4">
        <input className="border p-2 rounded flex-1" placeholder="Search title / skills"
          value={q} onChange={(e) => setQ(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Location"
          value={location} onChange={(e) => setLocation(e.target.value)} />
        <button onClick={fetch} className="bg-indigo-600 text-white px-4 rounded">Search</button>
      </div>

      <div className="text-sm text-gray-500 mb-3">{loading ? 'Loading…' : `${total} jobs`}</div>

      <ul className="space-y-3">
        {jobs.map((j) => (
          <li key={j.id} className="border rounded p-4 hover:shadow-sm flex justify-between items-start">
            <div>
              <div className="font-semibold text-lg">{j.title}</div>
              <div className="text-sm text-gray-600">{j.company} · {j.location} · {j.workMode} · {j.employmentType}</div>
              {j.salaryMin && (
                <div className="text-xs text-gray-500 mt-1">
                  {j.currency} {j.salaryMin?.toLocaleString()} – {j.salaryMax?.toLocaleString()}
                </div>
              )}
            </div>
            <button
              onClick={() => nav(`/jobs/${j.id}/apply`)}
              className="bg-indigo-600 text-white px-4 py-2 rounded">
              Apply
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
