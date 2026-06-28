import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { aiInterviewApi, mediaApi } from '../api/aiInterviewApi';
import ConsentGate from '../../candidatePortal/components/ConsentGate';

// Wrap the actual room in a consent gate — GDPR / India IT Act requirement.
export default function AiInterviewRoomWithConsent() {
  const { journeyId } = useParams();
  return (
    <ConsentGate kind="AiInterviewRecording" relatedEntityId={journeyId}>
      <AiInterviewRoomInner />
    </ConsentGate>
  );
}

// AI Interview Room — candidate-facing (rendered after consent).
// 1. Starts session on mount
// 2. Pulls next question from /next-question
// 3. Captures webcam + sends frame every 5s for visual agent
// 4. Captures answer via SpeechRecognition (browser STT — Whisper available server-side for prod audio uploads)
// 5. Submits answer → orchestrator queues deep analysis in background
// 6. On End → /end returns final scores
function AiInterviewRoomInner() {
  const { roomId, journeyId } = useParams();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);
  const liveKitRoomRef = useRef(null);
  const localStreamRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [history, setHistory] = useState([]);
  const [answer, setAnswer] = useState('');
  const [recording, setRecording] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [livekitStatus, setLiveKitStatus] = useState('not-connected');  // not-connected | connecting | connected | disabled

  // ── Init session + webcam (+ optional LiveKit) ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await aiInterviewApi.start(roomId, journeyId);
      if (cancelled) return;
      setSessionId(data.sessionId);

      // 1) Always grab local stream first — backend visual + audio capture rely on it
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
      localStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      // 2) Optionally try to upgrade to a LiveKit room (proper WebRTC + server-side recording).
      //    Backend returns { token: null } if LiveKit not configured — falls back gracefully.
      try {
        setLiveKitStatus('connecting');
        const { data: tok } = await mediaApi.liveKitToken(roomId, `candidate-${journeyId}`);
        if (!tok.token || !tok.url) {
          setLiveKitStatus('disabled');
        } else {
          const { Room, RoomEvent } = await import('livekit-client');
          const room = new Room({ adaptiveStream: true, dynacast: true });
          room.on(RoomEvent.Disconnected, () => setLiveKitStatus('not-connected'));
          await room.connect(tok.url, tok.token);
          // Publish local camera + mic into the LiveKit room (server-side recording / multi-party)
          await room.localParticipant.enableCameraAndMicrophone();
          liveKitRoomRef.current = room;
          setLiveKitStatus('connected');
        }
      } catch (e) {
        console.warn('LiveKit unavailable, continuing with local stream only:', e);
        setLiveKitStatus('disabled');
      }

      await fetchNextQuestion(data.sessionId);
    })();
    return () => {
      cancelled = true;
      try { liveKitRoomRef.current?.disconnect(); } catch {}
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [roomId, journeyId]);

  // ── Frame capture every 5s for Visual agent ──
  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;
      const c = canvasRef.current;
      c.width = 320; c.height = 240;
      const ctx = c.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, c.width, c.height);
      const dataUrl = c.toDataURL('image/jpeg', 0.7);
      const base64 = dataUrl.split(',')[1];
      aiInterviewApi.sendFrame(sessionId, base64, Date.now()).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const fetchNextQuestion = async (sid) => {
    const { data } = await aiInterviewApi.nextQuestion(sid);
    setQuestion(data);
    setAnswer('');
  };

  // ── MediaRecorder-based recording: captures audio Blob → uploaded to backend → Whisper transcribes ──
  // recognitionRef is now a MediaRecorder; we keep the name for minimal-diff.
  const mediaChunksRef = useRef([]);
  const recordStartRef = useRef(0);

  const startRecording = async () => {
    try {
      const stream = videoRef.current?.srcObject;
      if (!stream) { alert('Camera/mic not ready'); return; }
      const audioStream = new MediaStream(stream.getAudioTracks());
      const mr = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });
      mediaChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) mediaChunksRef.current.push(e.data); };
      mr.start();
      recognitionRef.current = mr;
      recordStartRef.current = Date.now();
      setRecording(true);
    } catch (e) {
      alert('Failed to start recording: ' + e.message);
    }
  };

  const stopRecording = () => new Promise((resolve) => {
    const mr = recognitionRef.current;
    if (!mr) return resolve(null);
    mr.onstop = () => {
      const blob = new Blob(mediaChunksRef.current, { type: 'audio/webm' });
      setRecording(false);
      resolve(blob);
    };
    mr.stop();
  });

  const submitAnswer = async () => {
    if (!question) return;
    const startMs = recordStartRef.current || (Date.now() - 30000);
    const endMs = Date.now();

    // If recording is active, stop + upload audio to Whisper; transcript persisted server-side.
    if (recording) {
      const blob = await stopRecording();
      if (blob && blob.size > 0) {
        try {
          const { data } = await mediaApi.transcribeChunk(sessionId, question.questionId, startMs, endMs, blob);
          setAnswer(data.text || answer);
          setHistory([...history, { q: question.questionText, a: data.text || answer }]);
          await fetchNextQuestion(sessionId);
          return;
        } catch (e) {
          // Fall through to typed-answer submission
        }
      }
    }

    // Typed answer fallback
    if (!answer.trim()) return;
    await aiInterviewApi.submitAnswer(sessionId, question.questionId, answer, startMs, endMs);
    setHistory([...history, { q: question.questionText, a: answer }]);
    await fetchNextQuestion(sessionId);
  };

  const endInterview = async () => {
    const { data } = await aiInterviewApi.end(sessionId);
    setFinalScore(data);
  };

  if (finalScore) return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Interview complete</h1>
      <div className="bg-white border rounded p-6">
        <div className="text-3xl font-bold">{Math.round(finalScore.overallScore)}/100</div>
        <div className="mt-2 text-sm text-gray-600">Recommendation: <b>{finalScore.recommendation}</b></div>
        <div className="mt-4 text-sm">{finalScore.aggregatedReasoning}</div>
      </div>
    </div>
  );

  return (
    <div className="p-6 grid grid-cols-2 gap-6 h-screen">
      <div>
        <video ref={videoRef} autoPlay muted className="w-full bg-black rounded" />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className="mt-2 text-xs flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${
            livekitStatus === 'connected' ? 'bg-green-500' :
            livekitStatus === 'connecting' ? 'bg-amber-500 animate-pulse' :
            livekitStatus === 'disabled' ? 'bg-gray-400' : 'bg-red-500'
          }`} />
          LiveKit: {livekitStatus}
          {livekitStatus === 'disabled' && (
            <span className="text-gray-400">(local recording only — set LiveKit env vars to enable)</span>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 mb-3">
          <div className="text-xs text-gray-500">Question {question?.order}</div>
          <div className="text-lg">{question?.questionText || 'Loading…'}</div>
        </div>
        <textarea
          className="border rounded p-3 flex-1 mb-3"
          placeholder="Your answer (speech-to-text or type)…"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)} />
        <div className="flex gap-2">
          {!recording
            ? <button onClick={startRecording} className="bg-red-600 text-white px-4 py-2 rounded">🎙 Start Recording</button>
            : <button onClick={stopRecording} className="bg-gray-700 text-white px-4 py-2 rounded">⏹ Stop</button>}
          <button onClick={submitAnswer} className="bg-indigo-600 text-white px-4 py-2 rounded">Submit & Next →</button>
          <button onClick={endInterview} className="ml-auto text-red-600">End Interview</button>
        </div>
      </div>
    </div>
  );
}
