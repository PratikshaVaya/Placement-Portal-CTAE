import { useState, useRef, useEffect } from 'react';
import { customFetch } from '../utils';
import { toast } from 'react-toastify';
import {
  FiUpload, FiZap, FiDownload, FiCheckCircle, FiAlertCircle,
  FiTarget, FiTrendingUp, FiAward, FiList, FiRefreshCw, FiX
} from 'react-icons/fi';

// ─── Score Ring Component ────────────────────────────────────────────────────
const ScoreRing = ({ score, label, size = 120, color = '#6366f1' }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const textColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="text-center" style={{ marginTop: `-${size / 2 + 14}px` }}>
        <div className="font-black text-3xl" style={{ color: textColor }}>{score}</div>
        <div className="text-xs text-slate-500 font-semibold">/100</div>
      </div>
      <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
};

// ─── Mini Score Bar ──────────────────────────────────────────────────────────
const ScoreBar = ({ label, score }) => {
  const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold text-slate-600">
        <span>{label}</span><span>{score}/100</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

// ─── Tag Chip ────────────────────────────────────────────────────────────────
const Chip = ({ text, variant = 'default' }) => {
  const variants = {
    default: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    danger:  'bg-red-50 text-red-700 border-red-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${variants[variant]}`}>
      {text}
    </span>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const AIResumeAnalyzer = () => {
  const [resumeFile, setResumeFile]       = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing]     = useState(false);
  const [result, setResult]               = useState(null);
  const [resumeText, setResumeText]       = useState('');
  const [activeTab, setActiveTab]         = useState('analysis');
  const [dragOver, setDragOver]           = useState(false);
  const [history, setHistory]             = useState([]);
  const fileInputRef = useRef(null);
  const printRef     = useRef(null);

  // ── File handling ──
  const handleFile = (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'text/plain'];
    const isAllowed = allowed.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.txt');
    if (!isAllowed) { toast.error('Please upload a PDF or TXT file.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB.'); return; }
    setResumeFile(file);
    setResult(null);
  };

  const fetchHistory = async () => {
    try {
      const { data } = await customFetch.get('/ai-resume/history');
      if (data.success) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  // ── Analyze ──
  const handleAnalyze = async () => {
    if (!resumeFile) { toast.error('Please upload your resume first.'); return; }
    setIsAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      if (jobDescription.trim()) formData.append('jobDescription', jobDescription);

      const { data } = await customFetch.post('/ai-resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      setResult(data.analysis);
      setResumeText(data.resumeText || '');
      setActiveTab('analysis');
      toast.success('✨ AI analysis complete!');
      fetchHistory(); // Refresh history
    } catch (err) {
      const msg = err?.response?.data?.message || 'Analysis failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResumeFile(null);
    setJobDescription('');
    setResult(null);
    setResumeText('');
  };

  // ── Render ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 px-4 py-8 print:p-0 print:bg-none print:min-h-0">
      <div className="max-w-5xl mx-auto space-y-8 print:space-y-4">

        {/* ── Header ── */}
        <div className="text-center space-y-3 print:hidden">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
            <FiZap className="text-base" /> AI-Powered
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Resume Analyzer</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Upload your resume and paste a job description. Our AI will analyze the match, highlight gaps, and suggest improvements.
          </p>
        </div>

        {/* ── Upload Section ── */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6 print:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* File Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                Resume <span className="text-red-400">*</span>
              </label>
              <div
                id="resume-dropzone"
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragOver ? 'border-indigo-400 bg-indigo-50' :
                  resumeFile ? 'border-green-400 bg-green-50' :
                  'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  id="resume-file-input"
                />
                {resumeFile ? (
                  <div className="space-y-2">
                    <FiCheckCircle className="text-4xl text-green-500 mx-auto" />
                    <p className="font-bold text-green-700 text-sm">{resumeFile.name}</p>
                    <p className="text-xs text-slate-400">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setResumeFile(null); setResult(null); }}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mx-auto"
                    >
                      <FiX /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <FiUpload className="text-4xl text-slate-300 mx-auto" />
                    <div>
                      <p className="font-bold text-slate-600">Drop your resume here</p>
                      <p className="text-xs text-slate-400 mt-1">PDF or TXT · Max 5MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                Job Description <span className="text-slate-400 font-normal normal-case">(optional)</span>
              </label>
              <textarea
                id="job-description-input"
                rows={8}
                placeholder="Paste the job description here for targeted analysis — required skills, responsibilities, expectations..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent resize-none leading-relaxed"
              />
              {jobDescription && (
                <p className="text-xs text-slate-400">{jobDescription.split(/\s+/).length} words</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="analyze-btn"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resumeFile}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white text-sm shadow-lg transition-all duration-200 ${
                isAnalyzing || !resumeFile
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 hover:shadow-indigo-200 hover:shadow-xl'
              }`}
            >
              {isAnalyzing ? (
                <><span className="animate-spin">⚙️</span> Analyzing with AI...</>
              ) : (
                <><FiZap /> Analyze with AI</>
              )}
            </button>
            {result && (
              <>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-slate-500 bg-slate-50 border border-slate-200 text-sm hover:bg-slate-100 transition-all"
                >
                  <FiRefreshCw /> Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Loading State ── */}
        {isAnalyzing && (
          <div className="bg-white rounded-3xl shadow-xl border border-indigo-100 p-12 text-center">
            <div className="space-y-4">
              <div className="text-5xl animate-bounce">🤖</div>
              <h3 className="text-xl font-bold text-slate-800">AI is analyzing your resume…</h3>
              <p className="text-slate-500 text-sm">Parsing content · Comparing with JD · Generating suggestions</p>
              <div className="flex justify-center gap-2 pt-2">
                {['Parsing', 'Matching', 'Scoring', 'Suggesting'].map((s, i) => (
                  <span key={s} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-semibold"
                    style={{ animationDelay: `${i * 0.2}s`, animation: 'pulse 1.5s infinite' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div id="ai-analysis-results" ref={printRef} className="space-y-6">

            {/* Score Overview */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <ScoreRing score={result.matchScore} label="Match Score" size={140} />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-800 mb-1">Overall Assessment</h2>
                    <p className="text-slate-600 leading-relaxed">{result.summary}</p>
                  </div>
                  {result.atsBadges && (
                    <div className="grid grid-cols-2 gap-3">
                      <ScoreBar label="Formatting" score={result.atsBadges.formattingScore} />
                      <ScoreBar label="Keywords" score={result.atsBadges.keywordScore} />
                      <ScoreBar label="Quantification" score={result.atsBadges.quantificationScore} />
                      <ScoreBar label="Action Verbs" score={result.atsBadges.actionVerbScore} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden print:shadow-none print:border-none print:overflow-visible">
              <div className="flex border-b border-slate-100 overflow-x-auto print:hidden">
                {[
                  { id: 'analysis', label: '📊 Analysis', icon: FiTarget },
                  { id: 'improvements', label: '💡 Improvements', icon: FiTrendingUp },
                  { id: 'keywords', label: '🔑 ATS Keywords', icon: FiAward },
                  { id: 'rewritten', label: '✍️ Rewritten Points', icon: FiList },
                ].map(tab => (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-6 py-4 text-sm font-bold transition-colors ${
                      activeTab === tab.id
                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-8 print:p-0">

                {/* Analysis Tab */}
                <div className={activeTab === 'analysis' ? 'block' : 'hidden print:!block print:mt-8'}>
                  <h2 className="hidden print:!block text-2xl font-black text-slate-800 mb-6 border-b pb-2 border-slate-200">Analysis</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h3 className="font-bold text-green-700 flex items-center gap-2">
                        <FiCheckCircle /> Strengths
                      </h3>
                      <ul className="space-y-2">
                        {(result.strengths || []).map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-bold text-red-700 flex items-center gap-2">
                        <FiAlertCircle /> Missing Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(result.missingSkills || []).map((s, i) => (
                          <Chip key={i} text={s} variant="danger" />
                        ))}
                        {(!result.missingSkills || result.missingSkills.length === 0) && (
                          <p className="text-sm text-slate-400 italic">No critical skills missing!</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-bold text-amber-700 flex items-center gap-2">
                        <FiTrendingUp /> Weak Areas
                      </h3>
                      <ul className="space-y-2">
                        {(result.weakAreas || []).map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Improvements Tab */}
                <div className={activeTab === 'improvements' ? 'block' : 'hidden print:!block print:mt-8'}>
                  <h2 className="hidden print:!block text-2xl font-black text-slate-800 mb-6 border-b pb-2 border-slate-200">Improvements</h2>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 mb-4">
                      Actionable suggestions to improve your resume based on AI analysis:
                    </p>
                    {(result.improvements || []).map((imp, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                        <span className="flex-shrink-0 w-7 h-7 bg-indigo-600 text-white text-xs font-black rounded-full flex items-center justify-center">
                          {i + 1}
                        </span>
                        <p className="text-sm text-slate-700 leading-relaxed">{imp}</p>
                      </div>
                    ))}
                    {result.improvedResumeSections && (
                      <div className="mt-6 p-5 bg-green-50 rounded-2xl border border-green-200 space-y-3">
                        <h4 className="font-bold text-green-800 text-sm uppercase tracking-wider">
                          ✅ Suggested Professional Summary
                        </h4>
                        <p className="text-sm text-slate-700 leading-relaxed italic">
                          "{result.improvedResumeSections.summary}"
                        </p>
                        {result.improvedResumeSections.skills && (
                          <>
                            <h4 className="font-bold text-green-800 text-sm uppercase tracking-wider pt-2">
                              🛠 Enhanced Skills List
                            </h4>
                            <p className="text-sm text-slate-700">{result.improvedResumeSections.skills}</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ATS Keywords Tab */}
                <div className={activeTab === 'keywords' ? 'block' : 'hidden print:!block print:mt-8'}>
                  <h2 className="hidden print:!block text-2xl font-black text-slate-800 mb-6 border-b pb-2 border-slate-200">ATS Keywords</h2>
                  <div className="space-y-5">
                    <p className="text-sm text-slate-500">
                      Include these keywords naturally in your resume to pass ATS filters:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(result.atsKeywords || []).map((kw, i) => (
                        <Chip key={i} text={kw} variant="default" />
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
                      <strong>💡 Pro Tip:</strong> Use these exact keywords in your skills section, experience descriptions, and summary. Don't keyword-stuff — integrate them naturally.
                    </div>
                  </div>
                </div>

                {/* Rewritten Points Tab */}
                <div className={activeTab === 'rewritten' ? 'block' : 'hidden print:!block print:mt-8'}>
                  <h2 className="hidden print:!block text-2xl font-black text-slate-800 mb-6 border-b pb-2 border-slate-200">Rewritten Points</h2>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 mb-4">
                      AI-improved bullet points using strong action verbs and quantification:
                    </p>
                    {(result.rewrittenPoints || []).map((point, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                        <div className="flex items-start gap-2">
                          <span className="text-indigo-500 flex-shrink-0 mt-0.5">▸</span>
                          <p className="text-sm text-slate-700 leading-relaxed">{point}</p>
                        </div>
                      </div>
                    ))}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-800">
                      <strong>📌 Note:</strong> These are rewrites of your existing experience. Review them before using — never add experiences you haven't had.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Download CTA */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl print:hidden">
              <div>
                <h3 className="text-white font-bold text-lg">Ready to improve your resume?</h3>
                <p className="text-indigo-200 text-sm mt-1">Use these suggestions in your Resume Builder to create the perfect resume.</p>
              </div>
              <div className="flex gap-3">
                <a
                  href="/student-dashboard/resume"
                  className="flex items-center gap-2 bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-400 transition-all border border-indigo-400"
                >
                  Open Resume Builder →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── Empty State ── */}
        {!result && !isAnalyzing && (
          <div className="text-center py-12 text-slate-400 space-y-3">
            <div className="text-6xl">📄</div>
            <p className="font-semibold text-slate-500">Upload your resume to get started</p>
            <p className="text-sm">The AI will analyze it and provide personalized feedback</p>
          </div>
        )}

        {/* ── History State ── */}
        {!result && !isAnalyzing && history.length > 0 && (
          <div className="space-y-4 pb-8">
            <h3 className="font-bold text-slate-700 text-lg border-b pb-2">Recent AI Analyses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item, idx) => (
                <div 
                  key={item._id || idx}
                  className="bg-white p-5 rounded-2xl shadow border border-slate-100 hover:shadow-lg hover:border-indigo-300 cursor-pointer transition-all flex flex-col gap-3"
                  onClick={() => {
                    setResult(item.analysisResult);
                    toast.success('Loaded past analysis!');
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-bold text-slate-800 text-sm truncate" title={item.resumeFileName}>{item.resumeFileName}</div>
                    <div className="flex-shrink-0 bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold text-xs">
                      {item.analysisResult?.matchScore}/100
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.analysisResult?.summary}
                  </div>
                  <div className="text-xs font-semibold text-slate-400 mt-auto pt-3 border-t border-slate-50 flex items-center gap-1">
                    🕒 {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIResumeAnalyzer;
