import { useQuery } from '@tanstack/react-query';
import { fetchCompanyStatsQuery } from '../utils';
import { CiBoxList, CiCircleCheck, CiCircleRemove, CiTimer } from 'react-icons/ci';
import { FiSend, FiUserCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const CompanyDashboardIndex = () => {
  const { data, isLoading } = useQuery(fetchCompanyStatsQuery());

  if (isLoading) {
    return <div className="p-8 animate-pulse text-center font-medium text-slate-500">Loading Dashboard Stats...</div>;
  }

  const { stats, recentApplications } = data || {};
  const { 
    totalApplied = 0, 
    totalHired = 0, 
    totalShortlisted = 0, 
    totalRejected = 0, 
    totalOfferSent = 0, 
    totalJobs = 0, 
    openJobs = 0 
  } = stats || {};
  const statusCounts = stats?.statusCounts || {};
  const countOFFER_ACCEPTED = statusCounts['OFFER_ACCEPTED'] || 0;

  const totalApplications = totalApplied;

  const statCards = [
    {
      title: 'Total Applications',
      count: totalApplications,
      icon: <CiBoxList className="text-3xl text-blue-400" />,
      glow: 'shadow-blue-500/20',
      border: 'border-blue-500/20'
    },
    {
      title: 'Shortlisted',
      count: totalShortlisted,
      icon: <CiTimer className="text-3xl text-amber-400" />,
      glow: 'shadow-amber-500/20',
      border: 'border-amber-500/20'
    },
    {
      title: 'Offers Sent',
      count: totalOfferSent,
      icon: <FiSend className="text-2xl text-purple-400" />,
      glow: 'shadow-purple-500/20',
      border: 'border-purple-500/20'
    },
    {
      title: 'Hired (Accepted)',
      count: countOFFER_ACCEPTED,
      icon: <FiUserCheck className="text-2xl text-emerald-400" />,
      glow: 'shadow-emerald-500/20',
      border: 'border-emerald-500/20'
    },
  ];

  return (
    <div className="flex flex-col gap-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">Recruiter Portal</span>
              <div className="h-px w-20 bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
           </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Recruiter Command Center</h1>
          <p className="text-slate-400 font-medium mt-1">Optimize your hiring workflow with real-time analytics.</p>
        </div>
        <div className="flex items-center gap-3">
            <Link to="jobs" className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-all font-bold text-sm shadow-xl">View Open Jobs</Link>
            <Link to="jobs/create" className="px-6 py-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all font-bold text-sm shadow-xl shadow-indigo-500/20">Post New Job</Link>
        </div>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className={`group p-6 rounded-[2.5rem] bg-slate-900/40 backdrop-blur-xl border ${card.border} flex items-center justify-between shadow-2xl transition-all hover:scale-[1.02] hover:bg-slate-800/60 duration-300 relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-12 -mt-12 transition-all group-hover:scale-150`}></div>
            <div className="relative z-10">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{card.title}</p>
              <h2 className="text-4xl font-black text-white mt-1">{card.count}</h2>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner relative z-10 group-hover:scale-110 transition-transform">
                {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* HIRING PIPELINE */}
        <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/5 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -ml-16 -mt-16"></div>
          <h3 className="font-black text-xl mb-8 text-white flex items-center gap-3 relative z-10">
             <div className="w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
             Hiring Progress
          </h3>
          <div className="flex flex-col gap-6 flex-1 justify-center relative z-10">
            {[
              { label: 'Applied', count: totalApplied, color: 'bg-blue-500', glow: 'shadow-blue-500/40', icon: '📝' },
              { label: 'Shortlisted', count: totalShortlisted, color: 'bg-amber-500', glow: 'shadow-amber-500/40', icon: '⏳' },
              { label: 'Hired', count: totalHired, color: 'bg-cyan-500', glow: 'shadow-cyan-500/40', icon: '🎯' },
              { label: 'Offer Sent', count: totalOfferSent, color: 'bg-purple-500', glow: 'shadow-purple-500/40', icon: '💌' },
              { label: 'Offer Accepted', count: countOFFER_ACCEPTED, color: 'bg-emerald-500', glow: 'shadow-emerald-500/40', icon: '🤝' },
              { label: 'Rejected', count: totalRejected, color: 'bg-red-500', glow: 'shadow-red-500/40', icon: '❌' },
            ].map((item) => {
              const total = totalApplications || 1;
              const percent = Math.round((item.count / total) * 100);
              
              return (
                <div key={item.label} className="space-y-3">
                  <div className="flex justify-between text-xs font-black tracking-wide uppercase">
                    <span className="text-slate-400 flex items-center gap-2">{item.icon} {item.label}</span>
                    <span className="text-white bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">{item.count} <span className="text-slate-500 font-bold ml-1">{percent}%</span></span>
                  </div>
                  <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden shadow-inner border border-white/5">
                    <div 
                      className={`h-full rounded-full ${item.color} ${item.glow} shadow-lg transition-all duration-1000 ease-out`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
             <h3 className="font-black text-xl text-white flex items-center gap-3">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                Incoming Talent
             </h3>
             <Link to="applications" className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all uppercase tracking-widest">
                View All Talent
             </Link>
          </div>
          
          <div className="flex flex-col gap-4 relative z-10">
            {recentApplications?.length > 0 ? recentApplications.map((app) => (
              <div key={app._id} className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-3xl transition-all border border-white/5 hover:border-white/10 group/item">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-xl flex items-center justify-center font-black text-indigo-400 text-xl group-hover/item:scale-110 transition-transform">
                        {app.applicantId?.name?.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#0b1120] ${
                        app.status === 'HIRED' || app.status === 'OFFER_ACCEPTED' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                        app.status === 'REJECTED' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                        app.status === 'SHORTLISTED' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                    }`}></div>
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg leading-none mb-1.5">{app.applicantId?.name}</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{app.jobId?.profile || 'No Profile'}</p>
                  </div>
                </div>
                
                <div className="text-right">
                    <span className={`text-[10px] px-3 py-1.5 rounded-xl uppercase tracking-widest font-black shadow-lg ${
                        app.status === 'OFFER_ACCEPTED' || app.status === 'HIRED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        app.status === 'OFFER_SENT' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        app.status === 'SHORTLISTED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                        {app.status?.replace('_', ' ') || 'APPLIED'}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-2.5 font-black uppercase tracking-tighter opacity-60">{new Date(app.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                   <CiBoxList className="text-6xl mb-4 text-slate-700" />
                   <p className="text-slate-500 italic font-medium">No recent applications found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboardIndex;
