import React, { useEffect, useState } from 'react';
import { consentApi } from '../api/candidateApi';

/**
 * Blocks rendering of children until candidate explicitly consents.
 * Used before AI Interview Room to satisfy GDPR / India IT Act.
 */
export default function ConsentGate({ kind, relatedEntityId, children, title, body }) {
  const [checked, setChecked] = useState(false);
  const [granted, setGranted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    consentApi.check(kind, relatedEntityId).then(({ data }) => {
      setGranted(data.granted);
      setChecked(true);
    });
  }, [kind, relatedEntityId]);

  const grant = async () => {
    setBusy(true);
    try {
      await consentApi.grant(kind, relatedEntityId);
      setGranted(true);
    } finally { setBusy(false); }
  };

  if (!checked) return <div className="p-6">Checking consent…</div>;
  if (granted) return children;

  return (
    <div className="max-w-xl mx-auto p-8 mt-12 bg-white border rounded shadow">
      <h2 className="text-xl font-bold mb-3">{title || 'Consent required'}</h2>
      <div className="text-sm text-gray-700 space-y-3 mb-6">
        {body || (
          <>
            <p>
              This interview will use your camera and microphone. We record:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Video + audio of the session</li>
              <li>A transcript of your spoken answers</li>
              <li>AI-generated scores for technical, communication and engagement</li>
            </ul>
            <p>
              The recording and AI analysis are visible only to the hiring team and used solely
              for hiring decisions. You can withdraw consent any time by emailing us.
            </p>
          </>
        )}
      </div>
      <button onClick={grant} disabled={busy}
        className="bg-indigo-600 text-white px-6 py-2 rounded disabled:opacity-50">
        {busy ? 'Saving…' : 'I consent — start interview'}
      </button>
    </div>
  );
}
