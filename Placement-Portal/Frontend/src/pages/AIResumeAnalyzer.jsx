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
  const textColor = score >= 70 ? '#4ade80' : score >= 40 ? '#fbbf24' : '#f87171';

  return (
    <div className="flex flex-col items-center gap-2 group">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} className="drop-shadow-2xl">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          className="filter drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
        />
      </svg>
      <div className="text-center" style={{ marginTop: `-${size / 2 + 18}px` }}>
        <div className="font-black text-3xl tracking-tighter" style={{ color: textColor }}>{score}</div>
        <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest -mt-1">/100</div>
      </div>
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4 group-hover:text-indigo-400 transition-colors">{label}</div>
    </div>
  );
};

// ─── Mini Score Bar ──────────────────────────────────────────────────────────
const ScoreBar = ({ label, score }) => {
  const color = score >= 70 ? 'from-emerald-500 to-green-400' : score >= 40 ? 'from-amber-500 to-orange-400' : 'from-rose-500 to-red-400';
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
        <span>{label}</span>
        <span className="text-slate-300">{score}%</span>
      </div>
      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5 p-[1px]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-[1.5s] ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

// ─── Tag Chip ────────────────────────────────────────────────────────────────
const Chip = ({ text, variant = 'default' }) => {
  const variants = {
    default: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    danger:  'bg-rose-500/10 text-rose-400 border-rose-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <span className={`inline-block px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest border ${variants[variant]}`}>
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
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const analyze = async () => {
    if (!resumeFile) { toast.warn('Please upload a resume first.'); return; }
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      if (jobDescription) formData.append('jobDescription', jobDescription);

      const { data } = await customFetch.post('/ai-resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        setResult(data.analysis);
        setResumeText(data.resumeText);
        toast.success('Analysis complete!');
        fetchHistory();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed.');
    } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* ── Header ── */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mx-auto">
            <FiZap className="animate-pulse" /> AI-Powered
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">
            Resume <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Analyzer</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Upload your resume and paste a job description. Our AI will analyze the match, highlight gaps, and suggest improvements.
          </p>
        </header>

        {/* ── Inputs Section ── */}
        {!result && !isAnalyzing && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Upload Area */}
            <div 
              className={`relative group rounded-[3rem] border-2 border-dashed transition-all duration-500 bg-slate-900/40 backdrop-blur-xl p-10 flex flex-col items-center justify-center text-center gap-6 ${
                dragOver ? 'border-indigo-500 bg-indigo-500/5' : resumeFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/20'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            >
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl transition-all duration-500 shadow-2xl ${
                resumeFile ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500 group-hover:bg-indigo-500 group-hover:text-white'
              }`}>
                {resumeFile ? <FiCheckCircle /> : <FiUpload />}
              </div>
              
              <div>
                <h3 className="text-xl font-black text-white mb-2">
                  {resumeFile ? 'Resume Uploaded' : 'Drop your resume here'}
                </h3>
                <p className="text-slate-500 text-sm font-medium">
                  {resumeFile ? resumeFile.name : 'PDF or TXT - Max 5MB'}
                </p>
              </div>

              {resumeFile && (
                <button 
                  onClick={() => setResumeFile(null)}
                  className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-slate-500 hover:text-red-400 transition-all"
                >
                  <FiX />
                </button>
              )}

              <input 
                type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {!resumeFile && (
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm hover:bg-white/10 transition-all active:scale-95 shadow-xl"
                >
                  Choose File
                </button>
              )}
            </div>

            {/* JD Area */}
            <div className="rounded-[3rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 p-10 flex flex-col gap-6">
               <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                  <h3 className="text-xl font-black text-white tracking-tight">Target Job Description</h3>
               </div>
               <textarea 
                  className="flex-1 bg-black/20 border border-white/5 rounded-[2rem] p-6 text-slate-300 text-sm focus:outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-600 min-h-[200px]"
                  placeholder="Paste the job description here for targeted analysis — required skills, responsibilities, expectations..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
               />
            </div>
          </div>
        )}

        {/* ── Action Button ── */}
        {!result && !isAnalyzing && (
          <div className="flex justify-center">
             <button 
                onClick={analyze}
                disabled={!resumeFile}
                className={`px-12 py-5 rounded-[2rem] font-black text-lg transition-all flex items-center gap-3 shadow-2xl active:scale-95 ${
                  !resumeFile ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/30'
                }`}
             >
               <FiZap /> Run AI Analysis
             </button>
          </div>
        )}

        {/* ── Loading State ── */}
        {isAnalyzing && (
          <div className="text-center py-20 space-y-8 animate-in fade-in duration-700">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-3xl text-indigo-400">
                <FiZap className="animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Analyzing Your Potential</h3>
              <p className="text-slate-500 font-medium animate-pulse">Running ATS checks, skill matching, and AI rewriting...</p>
            </div>
          </div>
        )}

        {/* ── Result View ── */}
        {result && !isAnalyzing && (
          <div ref={printRef} className="space-y-8 animate-in slide-in-from-bottom duration-1000">
            {/* Summary Card */}
            <div className="rounded-[3rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 p-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="flex justify-between items-start relative z-10 mb-10">
                <div className="flex items-center gap-3">
                   <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                      <FiTrendingUp size={24} />
                   </div>
                   <h2 className="text-2xl font-black text-white tracking-tight">Analysis Overview</h2>
                </div>
                <button 
                  onClick={() => { setResult(null); setResumeFile(null); }}
                  className="px-6 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all font-bold text-xs"
                >
                  Start New
                </button>
              </div>

              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 relative z-10">
                <div className="flex-shrink-0">
                  <ScoreRing score={result.matchScore} label="Overall Match" size={180} />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3">AI Assessment</h3>
                    <p className="text-slate-300 text-lg font-medium leading-relaxed">{result.summary}</p>
                  </div>
                  {result.atsBadges && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <ScoreBar label="Formatting" score={result.atsBadges.formattingScore} />
                      <ScoreBar label="Keywords" score={result.atsBadges.keywordScore} />
                      <ScoreBar label="Quantification" score={result.atsBadges.quantificationScore} />
                      <ScoreBar label="Action Verbs" score={result.atsBadges.actionVerbScore} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto gap-4 p-2 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] no-scrollbar">
                {[
                  { id: 'analysis', label: 'Detailed Analysis', icon: FiTarget },
                  { id: 'improvements', label: 'Key Improvements', icon: FiTrendingUp },
                  { id: 'keywords', label: 'ATS Keywords', icon: FiAward },
                  { id: 'rewritten', label: 'Rewritten Points', icon: FiList },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-8 py-4 rounded-3xl text-sm font-black transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <tab.icon /> {tab.label}
                  </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="rounded-[3rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 p-10 min-h-[400px]">
                
                {/* Analysis Tab */}
                <div className={activeTab === 'analysis' ? 'space-y-10 animate-in fade-in duration-500' : 'hidden'}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><FiCheckCircle /></div>
                         <h3 className="font-black text-white uppercase tracking-widest text-xs">Strengths</h3>
                      </div>
                      <ul className="space-y-3">
                        {(result.strengths || []).map((s, i) => (
                          <li key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-sm text-slate-300">
                            <span className="text-emerald-400 mt-0.5 shrink-0">✓</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center"><FiAlertCircle /></div>
                         <h3 className="font-black text-white uppercase tracking-widest text-xs">Missing Skills</h3>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {(result.missingSkills || []).map((s, i) => (
                          <Chip key={i} text={s} variant="danger" />
                        ))}
                        {(!result.missingSkills || result.missingSkills.length === 0) && (
                          <p className="text-sm text-slate-500 italic p-4 bg-slate-800/20 rounded-2xl w-full text-center">No critical skills missing!</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center"><FiTrendingUp /></div>
                         <h3 className="font-black text-white uppercase tracking-widest text-xs">Weak Areas</h3>
                      </div>
                      <ul className="space-y-3">
                        {(result.weakAreas || []).map((s, i) => (
                          <li key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-sm text-slate-300">
                            <span className="text-amber-400 mt-0.5 shrink-0">⚠</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Improvements Tab */}
                <div className={activeTab === 'improvements' ? 'space-y-8 animate-in fade-in duration-500' : 'hidden'}>
                  <div className="space-y-6">
                    {(result.improvements || []).map((imp, i) => (
                      <div key={i} className="flex items-start gap-5 p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:bg-white/10 transition-all">
                        <span className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white text-sm font-black rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                          {i + 1}
                        </span>
                        <p className="text-slate-300 font-medium leading-relaxed">{imp}</p>
                      </div>
                    ))}
                    {result.improvedResumeSections && (
                      <div className="mt-10 p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><FiZap size={80} /></div>
                        <div className="relative z-10">
                          <h4 className="font-black text-indigo-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                             Suggested Professional Summary
                          </h4>
                          <p className="text-slate-200 text-lg italic leading-relaxed font-medium">
                            "{result.improvedResumeSections.summary}"
                          </p>
                        </div>
                        {result.improvedResumeSections.skills && (
                          <div className="relative z-10 pt-4 border-t border-white/5">
                            <h4 className="font-black text-indigo-400 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                              Enhanced Skills List
                            </h4>
                            <p className="text-slate-300 font-medium">{result.improvedResumeSections.skills}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ATS Keywords Tab */}
                <div className={activeTab === 'keywords' ? 'space-y-8 animate-in fade-in duration-500' : 'hidden'}>
                  <div className="space-y-8">
                    <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] flex items-center gap-4">
                       <div className="text-2xl">💡</div>
                       <p className="text-indigo-200 text-sm font-medium">
                         <strong>Pro Tip:</strong> Include these keywords naturally in your skills section and experience descriptions to pass ATS filters.
                       </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {(result.atsKeywords || []).map((kw, i) => (
                        <span key={i} className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm hover:border-indigo-500/50 transition-all">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rewritten Points Tab */}
                <div className={activeTab === 'rewritten' ? 'space-y-6 animate-in fade-in duration-500' : 'hidden'}>
                  <div className="space-y-4">
                    {(result.rewrittenPoints || []).map((point, i) => (
                      <div key={i} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-all group">
                        <div className="flex items-start gap-4">
                          <span className="text-indigo-500 flex-shrink-0 mt-1"><FiList /></span>
                          <p className="text-slate-300 font-medium leading-relaxed group-hover:text-white transition-colors">{point}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[3rem] p-10 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="relative z-10 text-center sm:text-left">
                <h3 className="text-white font-black text-2xl tracking-tight">Ready to build your perfect resume?</h3>
                <p className="text-indigo-100 font-medium mt-2">Apply these improvements in our builder to stand out.</p>
              </div>
              <a
                href="/student-dashboard/resume"
                className="relative z-10 px-10 py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-xl hover:bg-indigo-50 transition-all active:scale-95"
              >
                Open Resume Builder
              </a>
            </div>
          </div>
        )}

        {/* ── Empty State ── */}
        {!result && !isAnalyzing && (
          <div className="text-center py-20 space-y-6">
            <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-5xl mx-auto opacity-50">📄</div>
            <div className="space-y-2">
              <p className="text-2xl font-black text-white">No analysis yet</p>
              <p className="text-slate-500 font-medium">Upload your resume to get personalized feedback and score.</p>
            </div>
          </div>
        )}

        {/* ── History State ── */}
        {!result && !isAnalyzing && history.length > 0 && (
          <div className="space-y-8 pb-12">
            <div className="flex items-center gap-3">
               <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
               <h3 className="text-xl font-black text-white tracking-tight">Recent Analyses</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item, idx) => (
                <div 
                  key={item._id || idx}
                  className="group bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all duration-500 cursor-pointer shadow-xl flex flex-col gap-6"
                  onClick={() => {
                    setResult(item.analysisResult);
                    toast.success('Analysis loaded!');
                  }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="font-black text-white text-lg truncate leading-tight flex-1" title={item.resumeFileName}>
                      {item.resumeFileName}
                    </div>
                    <div className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest border border-indigo-500/20">
                      {item.analysisResult?.matchScore}/100
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 font-medium line-clamp-3 leading-relaxed">
                    {item.analysisResult?.summary}
                  </p>
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                     <span className="text-indigo-400 text-xs font-black group-hover:translate-x-1 transition-transform">View Report →</span>
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
