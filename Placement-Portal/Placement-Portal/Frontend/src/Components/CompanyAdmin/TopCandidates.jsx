import { useQuery } from '@tanstack/react-query';
import { fetchTopCandidatesQuery } from '../../utils';
import { CiUser } from 'react-icons/ci';
import { FaHatWizard, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useRef } from 'react';

const TopCandidates = ({ jobId }) => {
  const { data, isLoading, isError } = useQuery(fetchTopCandidatesQuery(jobId));
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="mt-12 animate-in fade-in duration-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FaHatWizard className="text-xl animate-pulse" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">AI Recommended <span className="text-purple-400">Top Candidates</span></h3>
        </div>
        <div className="flex gap-6 overflow-x-hidden pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[320px] h-48 bg-slate-900/40 backdrop-blur-xl border border-white/5 animate-pulse rounded-[2rem]"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data?.candidates?.length) {
    return (
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FaHatWizard className="text-xl" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">AI Recommended <span className="text-purple-400">Top Candidates</span></h3>
        </div>
        <div className="p-8 rounded-[2rem] border border-dashed border-white/10 bg-white/5 text-center">
          <p className="text-slate-500 font-medium">No top matches found for this specific job profile yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 relative group/section">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <FaHatWizard className="text-xl animate-bounce" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">AI Recommended <span className="text-purple-400">Top Candidates</span></h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Intelligent skill matching & ranking</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
          >
            <FaChevronLeft size={14} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
          >
            <FaChevronRight size={14} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide scroll-smooth snap-x snap-mandatory"
      >
        {data.candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="min-w-[320px] snap-center bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 shadow-2xl transition-all duration-500 p-6 rounded-[2.5rem] relative overflow-hidden group"
          >
            {/* Glossy Match Badge */}
            <div className="absolute top-0 right-0 p-1">
               <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-[10px] px-4 py-2 rounded-bl-[1.5rem] rounded-tr-[1.5rem] font-black tracking-widest shadow-xl">
                {candidate.matchScore}% Match
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-6 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                <CiUser className="text-3xl" />
              </div>
              <div>
                <h4 className="font-black text-white text-lg tracking-tight line-clamp-1">{candidate.name}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{candidate.department}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Academic CGPA</span>
                <span className="font-black text-white text-sm">{candidate.cgpa}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="text-[10px] font-bold bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-slate-300">
                    {skill}
                  </span>
                ))}
                {candidate.skills.length > 3 && (
                  <span className="text-[10px] text-slate-600 font-bold self-center">+{candidate.skills.length - 3}</span>
                )}
              </div>
            </div>

            <div className="pt-4 mt-auto">
              {candidate.isApplied ? (
                <div className="w-full py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] text-center shadow-inner">
                  Already Applied
                </div>
              ) : (
                <div className="w-full py-3 rounded-2xl bg-slate-800/40 border border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] text-center italic">
                  Not Applied yet
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default TopCandidates;

