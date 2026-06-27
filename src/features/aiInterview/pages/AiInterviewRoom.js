import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { aiInterviewApi } from '../api/aiInterviewApi';

// AI Interview Room — candidate-facing.
// 1. Starts session on mount
// 2. Pulls next question from /next-question
// 3. Captures webcam + sends frame every 5s for visual agent
// 4. Captures answer via SpeechRecognition (browser STT — replace with Whisper for prod)
// 5. Submits answer → orchestrator queues deep analysis in background
// 6. On End → /end returns final scores
export default function AiInterviewRoom() {
  const { roomId, journeyId } = useParams();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [history, setHistory] = useState([]);
  const [answer, setAnswer] = useState('');
  const [recording, setRecording] = useState(false);
  const [finalScore, setFinalScore] = useState(null);

  // ── Init session + webcam ──
  useEffect(() => {
    (async () => {
      const { data } = await aiInterviewApi.start(roomId, journeyId);
      setSessionId(data.sessionId);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      await fetchNextQuestion(data.sessionId);
    })();
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

  // ── Browser SpeechRecognition for transcript (MVP). Prod: stream audio → Whisper ──
  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported. Type your answer instead.'); return; }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-IN';
    r.onresult = (e) => {
      const text = Array.from(e.results).map(x => x[0].transcript).join(' ');
      setAnswer(text);
    };
    r.onend = () => setRecording(false);
    recognitionRef.current = r;
    r.start();
    setRecording(true);
  };

  const stopRecording = async () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const submitAnswer = async () => {
    if (!question || !answer.trim()) return;
    const start = Date.now() - 30000;
    await aiInterviewApi.submitAnswer(sessionId, question.questionId, answer, start, Date.now());
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
