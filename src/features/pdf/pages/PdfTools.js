import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, Search, FileText, Zap, TrendingUp,
  CheckCircle, XCircle, Eye, Sparkles, Send,
  Link, User, Download, X, MessageSquare, Image
} from 'lucide-react';
import { getJobs, screenPdfResume, reviewPdfResume, generateFieldContent,generatePdf} from '../../../shared/services/api';

// ── Review Card Component ─────────────────────────────────────────────────
function ReviewCard({ result, jdUsed }) {
  if (!result || result.error) return (
    <div style={{ color: '#ef4444', padding: '20px', textAlign: 'center' }}>
      {result?.error || 'No result'}
    </div>
  );
  const text = result.review || '';
  const scoreMatch = text.match(/(\d{1,3})\s*(?:\/\s*100|out of 100)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
  const scoreColor = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ padding: '4px' }}>
      {score && (
        <div style={{
          background: `linear-gradient(135deg, ${scoreColor}20, ${scoreColor}05)`,
          border: `1px solid ${scoreColor}40`,
          borderRadius: '12px', padding: '20px',
          textAlign: 'center', marginBottom: '16px',
        }}>
          <div style={{ fontSize: '48px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: scoreColor }}>
            {score}<span style={{ fontSize: '20px' }}>/100</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {jdUsed ? 'Job Match Score' : 'Resume Quality Score'}
          </div>
          <div style={{ marginTop: '12px', height: '8px', borderRadius: '4px', background: 'var(--bg-hover)' }}>
            <div style={{
              height: '100%', borderRadius: '4px',
              width: `${score}%`, background: scoreColor,
              transition: 'width 1s ease',
            }} />
          </div>
        </div>
      )}
      <div style={{
        fontSize: '13px', lineHeight: '1.9', color: 'var(--text-secondary)',
        whiteSpace: 'pre-wrap', padding: '16px',
        background: 'var(--bg-secondary)', borderRadius: '10px',
        border: '1px solid var(--border)',
      }}>
        {text}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
function PdfTools() {
  const [activeTab, setActiveTab] = useState('screen');
  const [jobs, setJobs] = useState([]);

  // Screen state
  const [screenFile, setScreenFile] = useState(null);
  const [screenJdId, setScreenJdId] = useState('');
  const [screenLoading, setScreenLoading] = useState(false);
  const [screenResult, setScreenResult] = useState(null);

  // Review state
  const [reviewFile, setReviewFile] = useState(null);
  const [reviewJdId, setReviewJdId] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);

  // Studio state
  const [studioFile, setStudioFile] = useState(null);
  const [studioText, setStudioText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
//Quick chips for studio
// Chat ke saath ye bhi add karo
  const setQuickChips =[
    'Improve my summary', 'Make experience impactful', 'Add better skills',
    'Add photo to resume', 'Make it ATS friendly', 'Add certifications section'
  ];
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Persist studio state across overlay open/close
  const studioStateRef = useRef({ text: '', html: '' });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getJobs().then(res => setJobs(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // ── Photo handler ──
  const handlePhotoFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setPhotoPreview(ev.target.result); setPhotoUrl(''); };
    reader.readAsDataURL(file);
  };

  // ── Build HTML resume ──
  const buildResumeHtml = async (text, instruction, photo) => {
    // ✅ Photo prompt mein nahi — placeholder use karo
    const prompt = `You are a world-class resume designer and senior front-end developer with 15+ years of experience creating award-winning resumes for Fortune 500 executives.

    TASK: Generate a COMPLETE, PIXEL-PERFECT, PROFESSIONAL HTML resume. This is your masterpiece.
    
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    RESUME CONTENT (use ALL of this data):
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ${text}
    
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ${instruction
      ? `🎨 DESIGN DIRECTIVE (HIGHEST PRIORITY):
    "${instruction}"
    → Build the ENTIRE resume around this directive.
    → IGNORE any previous design. Start 100% fresh.
    → This overrides ALL default choices below.`
      : `🎨 DESIGN DIRECTIVE:
    → Choose a unique, stunning design you've never made before.
    → Surprise with creativity — dark, minimal, bold, gradient, whatever fits best.`
    }
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    ATS COMPLIANCE (NON-NEGOTIABLE):
    ✅ All text must be real selectable text — NO images of text
    ✅ Use standard section headings: Summary, Experience, Education, Skills, Projects
    ✅ No tables, no text boxes — use divs with proper HTML structure
    ✅ All fonts must be web-safe or Google Fonts
    ✅ Contact info must be plain text (email, phone)
    ✅ Skills must be listed as individual text items
    ✅ Dates must be clearly visible for each experience/education entry
    
    DESIGN FREEDOM (go wild within professional bounds):
    🎨 Colors: ANY cohesive palette — dark navy, emerald, crimson, midnight, slate, any gradient
    🎨 Layout: 2-column, 3-column, full-width, card-based, timeline — your choice
    🎨 Typography: Mix heading/body fonts creatively
    🎨 Accents: Borders, gradients, subtle patterns, icons, dividers
    🎨 Spacing: Generous whitespace for premium feel
    🎨 Skills: Pills, tags, progress bars, dot ratings, listed — creative but readable
    
    MANDATORY SECTIONS (include ALL, use actual content from resume):
    1. Header — Name (large, bold), Role/Title, Contact (email, phone, links)
    2. Profile Photo — use: <img id="resume-photo" src="PHOTO_PLACEHOLDER" style="width:90px;height:90px;border-radius:50%;object-fit:cover;flex-shrink:0;" />
    3. Professional Summary — compelling paragraph
    4. Skills — visual representation
    5. Experience — with company, role, dates, bullet points of achievements
    6. Education — degree, institution, year, GPA if available
    7. Projects — name, description, technologies used
    8. Any additional sections found in content (certifications, languages, etc.)
    
    TECHNICAL REQUIREMENTS:
    📌 Single HTML file — all CSS inside <style> tag, no external CSS files
    📌 Google Fonts allowed via @import url(...)
    📌 min-height: 100vh, proper page structure
    📌 No JavaScript needed
    📌 Print-friendly — looks good on A4 paper
    📌 Footer MUST contain: <div style="text-align:center;padding:12px;font-size:10px;opacity:0.6;">⚡ Generated by HireIQ AI Studio by Arun Kumar</div>
    
    CRITICAL OUTPUT RULES:
    🚫 NO markdown
    🚫 NO backticks  
    🚫 NO explanation text
    🚫 NO comments before or after HTML
    ✅ Start DIRECTLY with <!DOCTYPE html>
    ✅ End DIRECTLY with </html>
    ✅ Nothing before <!DOCTYPE, nothing after </html>`;
  
    const res = await generateFieldContent(prompt);
    let html = res.data.result?.trim() || '';
  
    // ✅ Photo baad mein inject karo — Groq ke bahar
    if (html && photo) {
      html = html.replace('PHOTO_PLACEHOLDER', photo);
    } else if (html) {
      // No photo — placeholder avatar
      html = html.replace(
        'src="PHOTO_PLACEHOLDER"',
        `src="" onerror="this.style.display='none'" style="display:none"`
      );
    }
  
    return html;
  };

  // ── Studio PDF upload ──
  const handleStudioUpload = async (file) => {
    if (!file) return;
    setStudioFile(file);
    setExtracting(true);
    setChatMessages([]);
    setHtmlPreview('');
    try {
      const formData = new FormData();
      formData.append('resumeFile', file);
      const res = await reviewPdfResume(formData);
      const text = res.data.extractedText || '';
      setStudioText(text);
      studioStateRef.current.text = text;
  
      // ✅ Pehle sirf HTML generate karo
      const html = await buildResumeHtml(text, '', photoPreview || photoUrl);
      setHtmlPreview(html);
      studioStateRef.current.html = html;
  
      setChatMessages([{
        role: 'assistant',
        content: `✅ Resume loaded & preview generated!\n\nYou can ask me to:\n• "Improve my professional summary"\n• "Make experience section more impactful"\n• "Add more relevant skills"\n• "Rewrite projects with better metrics"\n• "Generate full resume with photo"\n• "Make it ATS friendly"`,
      }]);
      setChatOpen(true);
  
      // ✅ Chips 3 second baad — rate limit avoid
      setTimeout(() => {
        generateFieldContent(
          `Suggest 6 short resume improvement chips. Resume: ${text.substring(0, 300)}. Return ONLY JSON array of 6 strings, max 4 words each. No markdown.`
        )
          .then(r => {
            let raw = r.data.result?.trim() || '';
            raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
            const chips = JSON.parse(raw);
            if (Array.isArray(chips) && chips.length > 0) setQuickChips(chips);
          })
          .catch(() => {});
      }, 3000);
  
    } catch {
      setChatMessages([{
        role: 'assistant',
        content: '✅ Resume loaded! Ask me to edit any section or say "generate resume" for a fresh HTML version.',
      }]);
      setChatOpen(true);
    } finally {
      setExtracting(false);
    }
  };

  // ── AI Studio chat ──
  const handleStudioChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);
  
    try {
      const photo = photoPreview || photoUrl; // ✅ sirf ek baar
      const currentText = studioStateRef.current.text || studioText;
      const isPhotoRequest = /update photo|add photo|include photo|photo me add|profile photo/i.test(userMsg);
      const isGenerateRequest = /generate|create|build|full resume|html|regenerate/i.test(userMsg);
  
      if (isPhotoRequest) {
        if (!photo) {
          setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: '📸 Please upload or paste a photo URL first using the photo section above, then ask me to add it.',
          }]);
          return; // ✅ finally setChatLoading(false) handle karega
        }
        const html = await buildResumeHtml(currentText, 'Include the provided profile photo prominently in the resume sidebar', photo);
        if (html) { setHtmlPreview(html); studioStateRef.current.html = html; }
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: '✅ Photo added to your resume! Check the preview →',
          type: 'success',
        }]);
  
      } else if (isGenerateRequest) {
        const html = await buildResumeHtml(currentText, userMsg, photo);
        if (html) { setHtmlPreview(html); studioStateRef.current.html = html; }
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: '✅ Resume regenerated! Preview updated on the right →\n\nAsk me to make any further changes!',
          type: 'success',
        }]);
  
      } else {
        const editPrompt = `You are an expert resume editor.
  
  Current Resume Content:
  ${currentText}
  
  User Request: ${userMsg}
  
  Respond in EXACTLY this format:
  SECTION: [which section you edited]
  BEFORE: [original 1-2 lines from that section]
  AFTER: [your improved version of that section, complete and detailed]
  SUMMARY: [one line explaining what you improved and why]`;
  
        const res = await generateFieldContent(editPrompt);
        const improved = res.data.result?.trim();
  
        if (improved) {
          const sectionMatch = improved.match(/SECTION:\s*(.*)/i);
          const afterMatch = improved.match(/AFTER:\s*([\s\S]*?)(?:SUMMARY:|$)/i);
          const summaryMatch = improved.match(/SUMMARY:\s*(.*)/i);
  
          const section = sectionMatch?.[1]?.trim() || 'Section';
          const improvedText = afterMatch?.[1]?.trim() || improved;
          const summary = summaryMatch?.[1]?.trim() || '';
  
          const updatedText = currentText + `\n\n[AI EDIT - ${section}]:\n${improvedText}`;
          setStudioText(updatedText);
          studioStateRef.current.text = updatedText;
  
          const html = await buildResumeHtml(updatedText, '', photo);
          if (html) { setHtmlPreview(html); studioStateRef.current.html = html; }
  
          setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: `✅ **${section}** updated!\n\n📝 ${summary}\n\n**New content:**\n─────────────\n${improvedText}\n─────────────\n\n↗️ Preview updated on the right!`,
            type: 'edit',
          }]);
        }
      }
    } catch {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Something went wrong. Please try again.',
      }]);
    } finally {
      setChatLoading(false); // ✅ sab cases handle karta hai
    }
  };

  // ── Download HTML ──
  const handleDownloadHtml = () => {
    const html = studioStateRef.current.html || htmlPreview;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume_ai_studio.html';
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleDownloadPdf = async () => {
    try {
      const html = studioStateRef.current.html || htmlPreview;
      const res = await generatePdf(html);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume_ai_studio.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback to HTML
      handleDownloadHtml();
    }
  };

  // ── Helpers ──
  const getMatchColor = (level) => {
    if (level === 'HIGH') return '#10b981';
    if (level === 'MEDIUM') return '#f59e0b';
    return '#ef4444';
  };

  const selectStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)',
    borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px',
    outline: 'none', fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer', boxSizing: 'border-box',
  };

  const FileUploadBox = ({ file, inputId, onUpload, setFile }) => (
    <div onClick={() => document.getElementById(inputId).click()}
      style={{
        border: `2px dashed ${file ? 'var(--accent-purple)' : 'var(--border-bright)'}`,
        borderRadius: '12px', padding: '28px', textAlign: 'center', cursor: 'pointer',
        background: file ? 'rgba(124,58,237,0.05)' : 'var(--bg-secondary)', transition: 'all 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-purple)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = file ? 'var(--accent-purple)' : 'var(--border-bright)'}>
      <input id={inputId} type="file" accept=".pdf" style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files[0];
          if (setFile) setFile(f);
          if (onUpload) onUpload(f);
        }} />
      {file ? (
        <>
          <FileText size={28} color="var(--accent-purple)" style={{ marginBottom: '8px' }} />
          <p style={{ fontSize: '14px', color: 'var(--accent-purple)', fontWeight: '600' }}>{file.name}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{(file.size / 1024).toFixed(1)} KB</p>
        </>
      ) : (
        <>
          <Upload size={28} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Click to upload PDF</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>PDF files only</p>
        </>
      )}
    </div>
  );

  const tabs = [
    { key: 'screen', label: 'Screen', icon: <Search size={14} /> },
    { key: 'review', label: 'AI Review', icon: <Eye size={14} /> },
    { key: 'studio', label: 'AI Studio', icon: <Sparkles size={14} /> },
  ];

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
          PDF Tools
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Screen, review, and AI-edit resumes
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '600',
            border: 'none', transition: 'all 0.2s',
            background: activeTab === tab.key ? 'var(--gradient-2)' : 'var(--bg-card)',
            color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
            boxShadow: activeTab === tab.key ? '0 4px 15px rgba(124,58,237,0.3)' : 'none',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Screen ────────────────────────────────────────── */}
      {activeTab === 'screen' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card" style={{ borderColor: 'var(--accent-pink)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gradient-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={18} color="white" />
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700' }}>Screen PDF Resume</h3>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!screenFile || !screenJdId) return;
              setScreenLoading(true); setScreenResult(null);
              try {
                const fd = new FormData();
                fd.append('resumeFile', screenFile);
                fd.append('jdId', screenJdId);
                const res = await screenPdfResume(fd);
                setScreenResult(res.data);
              } catch { setScreenResult({ error: 'Screening failed. Please try again.' }); }
              finally { setScreenLoading(false); }
            }}>
              <div style={{ marginBottom: '16px' }}>
                <FileUploadBox file={screenFile} setFile={setScreenFile} inputId="screen-pdf" />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                  <Zap size={12} style={{ marginRight: '6px' }} />
                  Select Job Description
                </label>
                <select value={screenJdId} onChange={e => setScreenJdId(e.target.value)} required style={selectStyle}>
                  <option value="">-- Select Job --</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary" disabled={screenLoading || !screenFile}
                style={{ width: '100%', justifyContent: 'center', padding: '14px', background: 'var(--gradient-2)' }}>
                {screenLoading ? 'Screening...' : <><Search size={16} /> Screen Resume</>}
              </button>
            </form>
          </div>

          <div className="card">
            {!screenResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
                <Search size={40} style={{ marginBottom: '12px', opacity: 0.2 }} />
                <p style={{ fontSize: '14px' }}>Upload PDF and select job to screen</p>
              </div>
            ) : screenResult.error ? (
              <div style={{ color: '#ef4444', padding: '20px', textAlign: 'center' }}>{screenResult.error}</div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  {screenResult.shortlisted ? <CheckCircle size={28} color="#10b981" /> : <XCircle size={28} color="#ef4444" />}
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '800' }}>
                      {screenResult.shortlisted ? 'Shortlisted ✅' : 'Not Shortlisted ❌'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Match: <span style={{ color: getMatchColor(screenResult.matchLevel), fontWeight: '600' }}>{screenResult.matchLevel}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Match Score</span>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: getMatchColor(screenResult.matchLevel) }}>
                    {(screenResult.score * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ height: '10px', borderRadius: '5px', background: 'var(--bg-hover)' }}>
                  <div style={{
                    height: '100%', borderRadius: '5px',
                    width: `${screenResult.score * 100}%`,
                    background: screenResult.score >= 0.7 ? 'var(--gradient-3)' : screenResult.score >= 0.5 ? 'linear-gradient(135deg,#f59e0b,#ec4899)' : 'linear-gradient(135deg,#ef4444,#f59e0b)',
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 2: Review ────────────────────────────────────────── */}
      {activeTab === 'review' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px' }}>
          <div className="card" style={{ borderColor: 'var(--accent-cyan)', alignSelf: 'start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Eye size={18} color="white" />
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700' }}>AI Resume Review</h3>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!reviewFile) return;
              setReviewLoading(true); setReviewResult(null);
              try {
                const fd = new FormData();
                fd.append('resumeFile', reviewFile);
                if (reviewJdId) fd.append('jdId', reviewJdId);
                const res = await reviewPdfResume(fd);
                setReviewResult(res.data);
              } catch { setReviewResult({ error: 'Review failed. Please try again.' }); }
              finally { setReviewLoading(false); }
            }}>
              <div style={{ marginBottom: '16px' }}>
                <FileUploadBox file={reviewFile} setFile={setReviewFile} inputId="review-pdf" />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                  Job Description <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                </label>
                <select value={reviewJdId} onChange={e => setReviewJdId(e.target.value)} style={selectStyle}>
                  <option value="">-- Generic Review --</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Select JD for job-specific match analysis
                </p>
              </div>
              <button type="submit" className="btn-primary" disabled={reviewLoading || !reviewFile}
                style={{ width: '100%', justifyContent: 'center', padding: '14px', background: 'linear-gradient(135deg,#06b6d4,#10b981)' }}>
                {reviewLoading ? 'Reviewing...' : <><TrendingUp size={16} /> Review Resume</>}
              </button>
            </form>
          </div>

          <div className="card" style={{ overflowY: 'auto', maxHeight: '600px' }}>
            {!reviewResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: 'var(--text-muted)' }}>
                <Eye size={48} style={{ marginBottom: '12px', opacity: 0.2 }} />
                <p style={{ fontSize: '14px' }}>Upload PDF to get AI review</p>
                <p style={{ fontSize: '12px', marginTop: '6px', opacity: 0.6 }}>Add a JD for job-specific analysis</p>
              </div>
            ) : (
              <ReviewCard result={reviewResult} jdUsed={!!reviewJdId} />
            )}
          </div>
        </div>
      )}

      {/* ── Tab 3: AI Studio ─────────────────────────────────────── */}
      {activeTab === 'studio' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>

          {/* Left Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Upload Card */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.05))',
              borderColor: 'var(--accent-purple)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} color="white" />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700' }}>AI Resume Studio</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Upload → AI edits → Live preview</p>
                </div>
              </div>
              <FileUploadBox file={studioFile} inputId="studio-pdf" onUpload={handleStudioUpload} />
              {extracting && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '10px', background: 'rgba(124,58,237,0.1)', borderRadius: '8px' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-purple)', animation: `bounce 1.2s ${i * 0.2}s infinite`, display: 'inline-block' }} />
                  ))}
                  <span style={{ fontSize: '12px', color: 'var(--accent-purple)' }}>Reading & generating preview...</span>
                </div>
              )}
            </div>

            {/* Photo Card */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Image size={16} color="var(--accent-cyan)" />
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: '700' }}>Profile Photo</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>optional</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Link size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="url" placeholder="Paste photo URL..."
                    value={photoUrl}
                    onChange={e => { setPhotoUrl(e.target.value); setPhotoPreview(''); }}
                    style={{ width: '100%', padding: '8px 8px 8px 28px', background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
                </div>
                <button type="button" onClick={() => document.getElementById('photo-upload').click()}
                  style={{ padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                  <Upload size={12} /> Upload
                </button>
                <input id="photo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoFile} />
              </div>

              {(photoPreview || photoUrl) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(124,58,237,0.08)', borderRadius: '8px', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <img src={photoPreview || photoUrl} alt="Profile"
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-purple)' }}
                    onError={e => e.target.style.display = 'none'} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>Photo set ✓</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Will be included in resume</p>
                  </div>
                  <button type="button" onClick={() => { setPhotoUrl(''); setPhotoPreview(''); }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <User size={28} color="var(--text-muted)" style={{ opacity: 0.3 }} />
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No photo — resume will use placeholder</p>
                </div>
              )}
            </div>

            {/* Open Chat Button */}
            {studioFile && (
              <button onClick={() => setChatOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  padding: '14px', background: 'var(--gradient-1)',
                  border: 'none', borderRadius: '12px', cursor: 'pointer',
                  fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', color: 'white',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.4)', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <MessageSquare size={18} /> Open AI Chat Editor
                {chatMessages.length > 0 && (
                  <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '10px', padding: '2px 8px', fontSize: '12px' }}>
                    {chatMessages.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Right — Live Preview */}
          <div className="card" style={{ padding: '0', overflow: 'hidden', minHeight: '600px' }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.05), transparent)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={16} color="var(--accent-purple)" />
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: '700' }}>Live Preview</span>
                {(extracting || chatLoading) && (
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginLeft: '8px' }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent-purple)', animation: `bounce 1.2s ${i * 0.2}s infinite`, display: 'inline-block' }} />
                    ))}
                    <span style={{ fontSize: '11px', color: 'var(--accent-purple)', marginLeft: '4px' }}>
                      {extracting ? 'Generating...' : 'AI editing...'}
                    </span>
                  </div>
                )}
              </div>
                {htmlPreview && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleDownloadHtml} className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--gradient-3)' }}>
                        <Download size={14} /> HTML
                    </button>
                    <button onClick={handleDownloadPdf} className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--gradient-1)' }}>
                        <Download size={14} /> PDF
                    </button>
                    </div>
                )}
            </div>
            {!htmlPreview ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '500px', color: 'var(--text-muted)' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Sparkles size={40} style={{ opacity: 0.4 }} color="var(--accent-purple)" />
                </div>
                <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Upload your PDF to start</p>
                <p style={{ fontSize: '13px', opacity: 0.6 }}>AI will auto-generate a beautiful preview</p>
              </div>
            ) : (
              <iframe srcDoc={htmlPreview}
                style={{ width: '100%', height: '700px', border: 'none', background: 'white' }}
                title="AI Studio Preview" />
            )}
          </div>
        </div>
      )}

      {/* ── Chat Overlay — Full Screen ───────────────────────────── */}
      {chatOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'grid',
          gridTemplateColumns: '420px 1fr',
          backdropFilter: 'blur(6px)',
        }}>
          {/* LEFT — Chat Panel */}
          <div style={{
            background: 'var(--bg-card)',
            borderRight: '1px solid rgba(124,58,237,0.3)',
            display: 'flex', flexDirection: 'column',
            height: '100vh', overflow: 'hidden',
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '20px', background: 'var(--gradient-1)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '800', color: 'white' }}>
                    AI Resume Editor
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                    Edits reflect in preview instantly →
                  </div>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: '8px', alignItems: 'flex-end',
                }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Sparkles size={12} color="white" />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '85%', padding: '12px 14px',
                    borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    background: msg.role === 'user'
                      ? 'var(--gradient-1)'
                      : msg.type === 'edit'
                      ? 'rgba(16,185,129,0.08)'
                      : msg.type === 'success'
                      ? 'rgba(124,58,237,0.08)'
                      : 'var(--bg-secondary)',
                    border: msg.role === 'user'
                      ? 'none'
                      : msg.type === 'edit'
                      ? '1px solid rgba(16,185,129,0.3)'
                      : msg.type === 'success'
                      ? '1px solid rgba(124,58,237,0.3)'
                      : '1px solid var(--border)',
                    fontSize: '13px', lineHeight: '1.7',
                    color: 'var(--text-primary)', whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={12} color="white" />
                  </div>
                  <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '4px 16px 16px 16px', border: '1px solid var(--border)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-purple)', animation: `bounce 1.2s ${i * 0.2}s infinite`, display: 'inline-block' }} />
                    ))}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>Editing resume...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Photo Upload in Overlay */}
<div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    
    {/* Current photo preview */}
    {(photoPreview || photoUrl) ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, padding: '6px 10px', background: 'rgba(124,58,237,0.08)', borderRadius: '8px', border: '1px solid rgba(124,58,237,0.2)' }}>
        <img src={photoPreview || photoUrl} alt="Profile"
          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-purple)' }}
          onError={e => e.target.style.display = 'none'} />
        <span style={{ fontSize: '11px', color: 'var(--accent-purple)', fontWeight: '600' }}>Photo set ✓</span>
        <button type="button" onClick={() => { setPhotoUrl(''); setPhotoPreview(''); }}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}>
          <X size={12} />
        </button>
      </div>
    ) : (
      <div style={{ flex: 1, display: 'flex', gap: '6px' }}>
        {/* URL input */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Link size={11} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="url" placeholder="Paste photo URL..."
            value={photoUrl}
            onChange={e => { setPhotoUrl(e.target.value); setPhotoPreview(''); }}
            style={{
              width: '100%', padding: '7px 7px 7px 26px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '11px',
              outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
            }} />
        </div>

        {/* File upload button */}
        <button type="button" onClick={() => document.getElementById('overlay-photo-upload').click()}
          style={{
            padding: '7px 10px', background: 'var(--bg-secondary)',
            border: '1px solid var(--border-bright)', borderRadius: '8px',
            color: 'var(--text-secondary)', cursor: 'pointer',
            fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px',
            whiteSpace: 'nowrap',
          }}>
          <Upload size={11} /> Photo
        </button>
      </div>
    )}

    <input id="overlay-photo-upload" type="file" accept="image/*"
      style={{ display: 'none' }} onChange={handlePhotoFile} />
  </div>

  {/* Add photo hint */}
  {(photoPreview || photoUrl) && (
    <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
      Say "update photo in resume" to add it
    </p>
  )}
</div>

            {/* Quick Chips */}
            <div style={{ padding: '10px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              {[
                'Improve my summary',
                'Make experience impactful',
                'Add better skills',
                'Generate full resume',
                'Add photo to resume',
                'Make it ATS friendly',
              ].map(s => (
                <button key={s} onClick={() => setChatInput(s)}
                  style={{
                    padding: '5px 12px', background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)', borderRadius: '20px',
                    color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-purple)'; e.currentTarget.style.color = 'var(--accent-purple)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', flexShrink: 0 }}>
              <input type="text"
                placeholder="Tell AI what to edit or improve..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleStudioChat()}
                disabled={chatLoading}
                style={{
                  flex: 1, padding: '12px 16px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)',
                  borderRadius: '12px', color: 'var(--text-primary)', fontSize: '14px',
                  outline: 'none', fontFamily: 'DM Sans, sans-serif',
                }} />
              <button onClick={handleStudioChat} disabled={!chatInput.trim() || chatLoading}
                style={{
                  padding: '12px 16px', background: 'var(--gradient-1)',
                  border: 'none', borderRadius: '12px', cursor: 'pointer',
                  opacity: !chatInput.trim() || chatLoading ? 0.5 : 1,
                  display: 'flex', alignItems: 'center',
                }}>
                <Send size={18} color="white" />
              </button>
            </div>
          </div>

          {/* RIGHT — Live Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f5f5' }}>
            <div style={{
              padding: '14px 20px', background: 'var(--bg-card)',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={16} color="var(--accent-purple)" />
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: '700' }}>
                  Live Preview
                </span>
                {chatLoading && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-purple)', marginLeft: '4px' }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-purple)', animation: `bounce 1.2s ${i * 0.2}s infinite`, display: 'inline-block' }} />
                    ))}
                    updating...
                  </span>
                )}
              </div>
                {htmlPreview && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleDownloadHtml} className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--gradient-3)' }}>
                        <Download size={14} /> HTML
                    </button>
                    <button onClick={handleDownloadPdf} className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--gradient-1)' }}>
                        <Download size={14} /> PDF
                    </button>
                    </div>
                )}
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
              {htmlPreview ? (
                <iframe
                  srcDoc={htmlPreview}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Live Resume Preview"
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                  <Sparkles size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                  <p style={{ fontSize: '16px' }}>Generating preview...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

export default PdfTools;