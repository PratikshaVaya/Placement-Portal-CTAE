import { useQuery } from '@tanstack/react-query';
import { fetchCompanyStatsQuery } from '../utils';
import { CiBoxList, CiCircleCheck, CiCircleRemove, CiTimer } from 'react-icons/ci';
import { Link } from 'react-router-dom';

const CompanyDashboardIndex = () => {
  const { data, isLoading } = useQuery(fetchCompanyStatsQuery());

  if (isLoading) {
    return <div className="p-8 animate-pulse text-center">Loading Stats...</div>;
  }

  const { stats, recentApplications } = data || {};
  const statusCounts = stats?.statusCounts || {};

  const statCards = [
    {
      title: 'Total Applications',
      count: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      icon: <CiBoxList className="text-3xl text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      title: 'Shortlisted',
      count: statusCounts['shortlisted'] || 0,
      icon: <CiTimer className="text-3xl text-yellow-600" />,
      bg: 'bg-yellow-50',
    },
    {
      title: 'Hired',
      count: statusCounts['hired'] || 0,
      icon: <CiCircleCheck className="text-3xl text-green-600" />,
      bg: 'bg-green-50',
    },
    {
      title: 'Rejected',
      count: statusCounts['rejected'] || 0,
      icon: <CiCircleRemove className="text-3xl text-red-600" />,
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="p-8 flex flex-col gap-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Recruiter Dashboard</h1>
        <p className="text-slate-500">Monitor your hiring pipeline and recent activity.</p>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className={`p-6 rounded-2xl ${card.bg} border border-opacity-50 flex items-center justify-between shadow-sm`}>
            <div>
              <p className="text-sm text-slate-600 font-medium">{card.title}</p>
              <h2 className="text-3xl font-bold text-slate-800 mt-1">{card.count}</h2>
            </div>
            {card.icon}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* HIRING FUNNEL (Conceptual) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg mb-6 text-slate-800">Hiring Pipeline</h3>
          <div className="flex flex-col gap-4">
            {['pending', 'shortlisted', 'hired'].map((status) => {
              const count = statusCounts[status] || 0;
              const total = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;
              const percent = Math.round((count / total) * 100);
              
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-sm capitalize">
                    <span className="font-medium text-slate-600">{status}</span>
                    <span className="text-slate-500">{count} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        status === 'hired' ? 'bg-green-500' : status === 'shortlisted' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg mb-6 text-slate-800">Recent Applications</h3>
          <div className="flex flex-col gap-4">
            {recentApplications?.length > 0 ? recentApplications.map((app) => (
              <div key={app._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                    {app.applicantId?.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{app.applicantId?.name}</h4>
                    <p className="text-xs text-slate-500">{app.jobId?.profile}</p>
                  </div>
                </div>
                <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-bold ${
                        app.applicationStatus === 'hired' ? 'bg-green-100 text-green-700' :
                        app.applicationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                        app.applicationStatus === 'shortlisted' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {app.applicationStatus}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )) : <p className="text-slate-500 italic text-center py-8">No recent applications.</p>}
          </div>
          {recentApplications?.length > 0 && (
            <Link to="applications" className="block text-center text-sm font-bold text-blue-600 mt-6 hover:underline">
                View All Applications
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboardIndex;
