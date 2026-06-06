import React, { useState, useEffect } from 'react';
import { Search, Zap, TrendingUp, User, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import { getResumes, getJobs, runScreening, getScreeningResults } from '../services/api';
import { runBulkScreening } from '../services/api'; 

function Screening() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screening, setScreening] = useState(false);
  const [form, setForm] = useState({
    resumeId: '', jdId: '', deepAnalyze: false
  });
  
  // Bulk Screening States
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [bulkResults, setBulkResults] = useState([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [r, j, s] = await Promise.all([
        getResumes(), getJobs(), getScreeningResults()
      ]);
      setResumes(r.data);
      setJobs(j.data);
      setResults(s.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScreen = async (e) => {
    e.preventDefault();
    setScreening(true);
    try {
      await runScreening({
        resumeId: form.resumeId,
        jdId: form.jdId,
        deepAnalyze: form.deepAnalyze,
      });
      fetchData();
      setForm({ resumeId: '', jdId: '', deepAnalyze: false });
    } catch (err) {
      console.error(err);
    } finally {
      setScreening(false);
    }
  };

  const handleResumeToggle = (id) => {
    setSelectedResumes(prev => 
        prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleRunBulkPipeline = async () => {
    // FIX: Replaced 'selectedJd' with 'form.jdId' from your existing state
    if (!form.jdId || selectedResumes.length === 0) {
        alert("Please select a Job Description and at least one Resume.");
        return;
    }

    setIsBulkLoading(true);
    try {
        const data = await runBulkScreening({
            jdId: form.jdId,
            resumeIds: selectedResumes
        });
        setBulkResults(data); 
    } catch (error) {
        console.error("Bulk Pipeline failed", error);
        alert("Error running the AI pipeline.");
    } finally {
        setIsBulkLoading(false);
    }
  };

  const selectStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-bright)',
    borderRadius: '8px', color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer', boxSizing: 'border-box',
  };

  const getMatchColor = (level) => {
    if (level === 'HIGH') return '#10b981';
    if (level === 'MEDIUM') return '#f59e0b';
    return '#ef4444';
  };

  const getScoreGradient = (score) => {
    const pct = score * 100;
    if (pct >= 70) return 'var(--gradient-3)';
    if (pct >= 50) return 'linear-gradient(135deg, #f59e0b, #ec4899)';
    return 'linear-gradient(135deg, #ef4444, #f59e0b)';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '24px', fontWeight: '800', marginBottom: '4px',
        }}>AI Screening</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Match candidates with job descriptions using HireIQ AI
        </p>
      </div>

      {/* Screening Form */}
      <div className="card" style={{
        marginBottom: '32px',
        borderColor: 'var(--accent-pink)',
        background: 'linear-gradient(135deg, rgba(236,72,153,0.05), rgba(124,58,237,0.05))',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '20px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--gradient-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="white" />
          </div>
          <h3 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '16px', fontWeight: '700',
          }}>Run Screening</h3>
        </div>

        <form onSubmit={handleScreen}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px', marginBottom: '16px',
          }}>
            <div>
              <label style={{
                display: 'block', fontSize: '13px',
                color: 'var(--text-secondary)', marginBottom: '8px',
              }}>
                <Briefcase size={12} style={{ marginRight: '6px' }} />
                Select Job
              </label>
              <select
                value={form.jdId}
                onChange={e => setForm({ ...form, jdId: e.target.value })}
                required style={selectStyle}
              >
                <option value="">-- Select Job --</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{
                display: 'block', fontSize: '13px',
                color: 'var(--text-secondary)', marginBottom: '8px',
              }}>
                <User size={12} style={{ marginRight: '6px' }} />
                Select Single Resume
              </label>
              <select
                value={form.resumeId}
                onChange={e => setForm({ ...form, resumeId: e.target.value })}
                style={selectStyle}
              >
                <option value="">-- Select Candidate (Optional for Bulk) --</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.candidateName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deep Analyze Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '10px', marginBottom: '20px',
          }}>
            <input
              type="checkbox"
              id="deepAnalyze"
              checked={form.deepAnalyze}
              onChange={e => setForm({ ...form, deepAnalyze: e.target.checked })}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="deepAnalyze" style={{
              fontSize: '13px', color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}>
              Deep Analysis (HireIQ 7B) —{' '}
              <span style={{ color: 'var(--accent-purple)' }}>
                Detailed report with skill gaps
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={screening || !form.resumeId}
            style={{ background: 'var(--gradient-2)' }}
          >
            {screening ? (
              <>Screening... </>
            ) : (
              <><Search size={16} /> Run Standard Screening</>
            )}
          </button>
        </form>

        {/* FIX: Correctly mapped list for Bulk Selection UI */}
        <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-bright)', paddingTop: '20px' }}>
            <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>
                Or Run Bulk Pipeline (Select Multiple Resumes)
            </h4>
            <div style={{
                maxHeight: '130px', overflowY: 'auto', border: '1px solid var(--border-bright)', 
                borderRadius: '8px', padding: '12px', background: 'var(--bg-secondary)',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'
            }}>
                {resumes.map(r => (
                    <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            checked={selectedResumes.includes(r.id)}
                            onChange={() => handleResumeToggle(r.id)}
                            style={{ cursor: 'pointer' }}
                        />
                        {r.candidateName}
                    </label>
                ))}
            </div>
            <button 
                type="button" 
                onClick={handleRunBulkPipeline}
                disabled={isBulkLoading || selectedResumes.length === 0 || !form.jdId}
                className="btn-primary"
                style={{ background: 'var(--gradient-3)', marginTop: '16px' }}
            >
                {isBulkLoading ? 'Running Bulk Pipeline...' : 'Run Bulk Pipeline'}
            </button>
        </div>
      </div>

      {/* Standard Results */}
      <h2 style={{
        fontFamily: 'Syne, sans-serif',
        fontSize: '18px', fontWeight: '700',
        marginBottom: '16px',
      }}>
        Standard Screening Results ({results.length})
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
          Loading...
        </div>
      ) : results.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          color: 'var(--text-muted)',
        }}>
          <Search size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p>No screenings yet — run your first screening!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {results.map(result => (
            <div key={result.id} className="card">
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {result.shortlisted ? (
                    <CheckCircle size={20} color="#10b981" />
                  ) : (
                    <XCircle size={20} color="#ef4444" />
                  )}
                  <span style={{
                    fontSize: '14px', fontWeight: '600',
                    fontFamily: 'Syne, sans-serif',
                  }}>
                    {result.shortlisted ? 'Shortlisted ✅' : 'Not Shortlisted ❌'}
                  </span>
                </div>
                <span className={`badge badge-${result.matchLevel?.toLowerCase()}`}>
                  {result.matchLevel}
                </span>
              </div>

              {/* Score Bar */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: '6px',
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Match Score
                  </span>
                  <span style={{
                    fontSize: '14px', fontWeight: '700',
                    color: getMatchColor(result.matchLevel),
                  }}>
                    {(result.minilmScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{
                  height: '6px', borderRadius: '3px',
                  background: 'var(--bg-hover)',
                }}>
                  <div style={{
                    height: '100%', borderRadius: '3px',
                    width: `${result.minilmScore * 100}%`,
                    background: getScoreGradient(result.minilmScore),
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>

              {/* Analysis */}
              {result.analysis && (
                <div style={{
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px', fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    marginBottom: '8px', color: 'var(--accent-purple)',
                    fontWeight: '600', fontSize: '12px',
                  }}>
                    <TrendingUp size={12} /> HireIQ Analysis
                  </div>
                  {result.analysis}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bulk Results Leaderboard */}
      {bulkResults.length > 0 && (
        <div className="card" style={{ marginTop: '32px' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
                AI Ranked Leaderboard (Bulk Run)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bulkResults.map((result, index) => (
                    <div key={result.id} style={{
                        padding: '16px',
                        borderLeft: `4px solid ${result.shortlisted ? '#10b981' : '#ef4444'}`,
                        borderRadius: '8px',
                        background: 'var(--bg-secondary)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Rank #{index + 1}</h3>
                            <span style={{
                                padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700',
                                background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'
                            }}>
                                MiniLM Score: {(result.minilmScore * 100).toFixed(1)}%
                            </span>
                        </div>
                        {result.shortlisted ? (
                            <div style={{ marginTop: '12px', padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border-bright)', borderRadius: '8px' }}>
                                <h4 style={{ fontWeight: '700', color: 'var(--accent-purple)', marginBottom: '8px', fontSize: '14px' }}>Groq AI Deep Analysis:</h4>
                                <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.6' }}>{result.analysis}</p>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '8px', fontSize: '13px' }}>
                                Rejected: Score below 70% threshold.
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}

export default Screening;