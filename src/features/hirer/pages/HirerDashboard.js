import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobPostingsApi } from '../../jobPostings/api/jobPostingsApi';
import { pipelineApi, STAGES, REJECTION_STAGES } from '../../pipeline/api/pipelineApi';

// Hirer overview — funnel metrics across all jobs.
export default function HirerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [allJourneys, setAllJourneys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: js } = await jobPostingsApi.list();
      setJobs(js);
      const journeysPerJob = await Promise.all(
        js.filter(j => j.status === 'Published').map(j => pipelineApi.byJob(j.id).then(r => r.data).catch(() => []))
      );
      setAllJourneys(journeysPerJob.flat());
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  const counts = {};
  for (const s of [...STAGES, ...REJECTION_STAGES]) counts[s] = 0;
  for (const j of allJourneys) counts[j.currentStage] = (counts[j.currentStage] || 0) + 1;

  const total = allJourneys.length;
  const hired = counts['Hired'] || 0;
  const inProgress = total - hired - REJECTION_STAGES.reduce((s, r) => s + (counts[r] || 0), 0);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Recruiter Dashboard</h1>

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Kpi label="Active Jobs" value={jobs.filter(j => j.status === 'Published').length} />
        <Kpi label="Applications" value={total} />
        <Kpi label="In Pipeline" value={inProgress} />
        <Kpi label="Hired" value={hired} />
      </div>

      {/* Funnel */}
      <h2 className="text-lg font-semibold mb-3">Pipeline Funnel</h2>
      <div className="space-y-2 mb-8">
        {STAGES.map(s => (
          <div key={s} className="flex items-center gap-3">
            <div className="w-44 text-sm">{s}</div>
            <div className="flex-1 bg-gray-100 rounded h-5 relative">
              <div className="bg-indigo-600 h-5 rounded"
                style={{ width: total > 0 ? `${(counts[s] / total) * 100}%` : '0%' }} />
            </div>
            <div className="w-12 text-right text-sm">{counts[s]}</div>
          </div>
        ))}
      </div>

      {/* Jobs */}
      <h2 className="text-lg font-semibold mb-3">Recent Jobs</h2>
      <ul className="space-y-2">
        {jobs.slice(0, 8).map(j => (
          <li key={j.id} className="border rounded p-3 flex justify-between">
            <div>
              <div className="font-medium">{j.title}</div>
              <div className="text-xs text-gray-500">{j.company} · {j.status}</div>
            </div>
            <Link to={`/pipeline/${j.id}`} className="text-indigo-600 text-sm">View pipeline →</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Kpi = ({ label, value }) => (
  <div className="bg-white border rounded p-4">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-3xl font-bold mt-1">{value}</div>
  </div>
);
