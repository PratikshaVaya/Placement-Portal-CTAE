import { useQuery } from '@tanstack/react-query';
import { fetchCompanyStatsQuery } from '../utils';
import { CiBoxList, CiCircleCheck, CiCircleRemove, CiTimer } from 'react-icons/ci';
import { FiSend, FiUserCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const CompanyDashboardIndex = () => {
  const { data, isLoading } = useQuery(fetchCompanyStatsQuery());

  if (isLoading) {
    return <div className="p-8 animate-pulse text-center font-medium">Loading Dashboard Stats...</div>;
  }

  const { stats, recentApplications } = data || {};
  const statusCounts = stats?.statusCounts || {};

  // Status mapping for unified state system
  const countAPPLIED = statusCounts['APPLIED'] || statusCounts['pending'] || 0;
  const countSHORTLISTED = statusCounts['SHORTLISTED'] || statusCounts['shortlisted'] || 0;
  const countHIRED = statusCounts['HIRED'] || statusCounts['hired'] || 0;
  const countOFFER_SENT = statusCounts['OFFER_SENT'] || 0;
  const countOFFER_ACCEPTED = statusCounts['OFFER_ACCEPTED'] || 0;
  const countREJECTED = statusCounts['REJECTED'] || statusCounts['rejected'] || 0;

  const totalApplications = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const statCards = [
    {
      title: 'Total Applications',
      count: totalApplications,
      icon: <CiBoxList className="text-3xl text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      title: 'Shortlisted',
      count: countSHORTLISTED,
      icon: <CiTimer className="text-3xl text-yellow-600" />,
      bg: 'bg-yellow-50',
    },
    {
      title: 'Offers Sent',
      count: countOFFER_SENT,
      icon: <FiSend className="text-2xl text-purple-600" />,
      bg: 'bg-purple-50',
    },
    {
      title: 'Hired (Accepted)',
      count: countOFFER_ACCEPTED,
      icon: <FiUserCheck className="text-2xl text-green-600" />,
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="p-8 flex flex-col gap-y-8 max-w-7xl mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Recruiter Command Center</h1>
          <p className="text-slate-500 font-medium">Optimize your hiring workflow with real-time analytics.</p>
        </div>
        <div className="flex gap-2">
            <Link to="jobs" className="btn btn-primary btn-sm rounded-lg">View Open Jobs</Link>
            <Link to="jobs/create" className="btn btn-outline btn-sm rounded-lg">+ Post New Job</Link>
        </div>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className={`p-6 rounded-2xl ${card.bg} border border-slate-200 flex items-center justify-between shadow-sm transition-transform hover:scale-105 duration-300`}>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{card.title}</p>
              <h2 className="text-3xl font-black text-slate-800 mt-1">{card.count}</h2>
            </div>
            <div className="p-3 bg-white bg-opacity-60 rounded-xl shadow-inner">
                {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* HIRING PIPELINE */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col">
          <h3 className="font-bold text-xl mb-8 text-slate-800 flex items-center gap-2">
             <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
             Hiring Progress
          </h3>
          <div className="flex flex-col gap-6 flex-1 justify-center">
            {[
              { label: 'Applied', count: countAPPLIED, color: 'bg-blue-500', icon: '📝' },
              { label: 'Shortlisted', count: countSHORTLISTED, color: 'bg-yellow-500', icon: '⏳' },
              { label: 'Hired', count: countHIRED, color: 'bg-cyan-500', icon: '🎯' },
              { label: 'Offer Sent', count: countOFFER_SENT, color: 'bg-purple-500', icon: '💌' },
              { label: 'Offer Accepted', count: countOFFER_ACCEPTED, color: 'bg-green-500', icon: '🤝' },
              { label: 'Rejected', count: countREJECTED, color: 'bg-red-500', icon: '❌' },
            ].map((item) => {
              const total = totalApplications || 1;
              const percent = Math.round((item.count / total) * 100);
              
              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-600 flex items-center gap-1.5">{item.icon} {item.label}</span>
                    <span className="text-slate-400">{item.count} <span className="font-normal">({percent}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full ${item.color} shadow-sm transition-all duration-1000 ease-out`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                Incoming Talent
             </h3>
             <Link to="applications" className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
                View All Talent →
             </Link>
          </div>
          
          <div className="flex flex-col gap-4">
            {recentApplications?.length > 0 ? recentApplications.map((app) => (
              <div key={app._id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-transparent hover:border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-blue-600 text-lg">
                        {app.applicantId?.name?.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        app.status === 'HIRED' || app.status === 'OFFER_ACCEPTED' ? 'bg-green-500' :
                        app.status === 'REJECTED' ? 'bg-red-500' :
                        app.status === 'SHORTLISTED' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-none mb-1">{app.applicantId?.name}</h4>
                    <p className="text-xs font-semibold text-slate-400 capitalize">{app.jobId?.profile || 'No Profile'}</p>
                  </div>
                </div>
                
                <div className="text-right">
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-widest font-black shadow-sm ${
                        app.status === 'OFFER_ACCEPTED' || app.status === 'HIRED' ? 'bg-green-500 text-white' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        app.status === 'OFFER_SENT' ? 'bg-purple-100 text-purple-700' :
                        app.status === 'SHORTLISTED' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {app.status?.replace('_', ' ') || 'APPLIED'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold">{new Date(app.createdAt).toDateString()}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 opacity-50">
                   <CiBoxList className="text-6xl mb-2" />
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
