import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { aiInterviewApi } from '../../aiInterview/api/aiInterviewApi';

// Hirer-facing report viewer.
// Shows final score, per-agent breakdowns, transcript timeline, raw observations.
export default function InterviewReport() {
  const { sessionId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiInterviewApi.report(sessionId).then(({ data }) => {
      setReport(data); setLoading(false);
    }).catch(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!report) return <div className="p-6 text-red-600">Report not found.</div>;

  const { final, observations, transcript } = report;
  const byAgent = observations.reduce((acc, o) => {
    (acc[o.agent] ||= []).push(o);
    return acc;
  }, {});

  const ScoreBar = ({ label, value }) => (
    <div className="mb-2">
      <div className="flex justify-between text-xs"><span>{label}</span><span>{Math.round(value || 0)}</span></div>
      <div className="bg-gray-200 h-2 rounded">
        <div className="bg-indigo-600 h-2 rounded" style={{ width: `${Math.min(100, value || 0)}%` }} />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">AI Interview Report</h1>
      <div className="text-sm text-gray-500 mb-6">Session {sessionId}</div>

      {/* Overall */}
      <div className="bg-white border rounded p-6 mb-6">
        <div className="flex items-baseline gap-3 mb-3">
          <div className="text-5xl font-bold">{Math.round(final.overallScore)}</div>
          <div className="text-gray-500">/100</div>
          <div className={`ml-auto px-3 py-1 rounded text-white text-sm ${
            final.recommendation === 'PROCEED' ? 'bg-green-600' :
            final.recommendation === 'REJECT' ? 'bg-red-600' : 'bg-amber-600'
          }`}>
            {final.recommendation}
          </div>
        </div>
        <ScoreBar label="Technical" value={final.technicalScore} />
        <ScoreBar label="Communication" value={final.communicationScore} />
        <ScoreBar label="Behavioral (Confidence + Attention + Emotion)" value={final.behavioralScore} />
        <ScoreBar label="Attention" value={final.attentionScore} />
        <ScoreBar label="Confidence" value={final.confidenceScore} />
        <p className="text-sm text-gray-700 mt-4">{final.aggregatedReasoning}</p>
      </div>

      {/* Per-agent observations */}
      <h2 className="text-xl font-semibold mb-3">Agent observations</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {['FastQuestion', 'DeepAnswer', 'VisualBehavior'].map((agent) => (
          <div key={agent} className="bg-white border rounded p-4">
            <div className="font-semibold text-sm mb-2">{agent}</div>
            <div className="text-xs text-gray-500 mb-2">{byAgent[agent]?.length || 0} observations</div>
            {byAgent[agent]?.slice(-3).map((o) => (
              <details key={o.id} className="text-xs mb-2">
                <summary className="cursor-pointer">Turn {o.turnIndex} · {o.latencyMs}ms</summary>
                <pre className="mt-1 bg-gray-50 p-2 rounded overflow-auto text-[10px]">
{o.observationJson}
                </pre>
              </details>
            ))}
          </div>
        ))}
      </div>

      {/* Transcript */}
      <h2 className="text-xl font-semibold mb-3">Transcript</h2>
      <div className="bg-white border rounded p-4 space-y-2 max-h-96 overflow-y-auto">
        {transcript.map((t) => (
          <div key={t.id} className="text-sm">
            <span className={`font-semibold ${t.speaker === 'CANDIDATE' ? 'text-indigo-700' : 'text-gray-500'}`}>
              {t.speaker}:
            </span>{' '}
            <span>{t.text}</span>
            <span className="text-xs text-gray-400 ml-2">[{Math.round(t.startMs/1000)}s]</span>
          </div>
        ))}
      </div>
    </div>
  );
}
