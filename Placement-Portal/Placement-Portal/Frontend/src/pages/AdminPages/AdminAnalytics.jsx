import { customFetch } from '../../utils';
import { useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaUserGraduate, 
  FaBuilding, 
  FaBriefcase, 
  FaUserCheck, 
  FaRupeeSign, 
  FaTrophy,
  FaChartPie
} from 'react-icons/fa';

export const loader = (queryClient) => async () => {
  try {
    const { data } = await customFetch.get('/admin/stats');
    return { stats: data.stats };
  } catch (error) {
    const errorMessage = error?.response?.data?.message || 'Failed to fetch stats!';
    toast.error(errorMessage);
    return null;
  }
};

const StatCard = ({ title, value, icon, iconColor, glowColor }) => {
  return (
    <div className={`p-5 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 hover:-translate-y-1 hover:shadow-2xl hover:${glowColor} transition-all duration-300 relative overflow-hidden group`}>
      {/* Background soft glow on hover */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-current ${iconColor}`}></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-white/5 border border-white/10 shadow-inner ${iconColor} text-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const AdminAnalytics = () => {
  const { stats } = useLoaderData() || { stats: {} };

  // Calculate total across all departments to derive percentages
  const totalDepPlacements = stats.departmentPlacements?.reduce((acc, curr) => acc + curr.value, 0) || 1;

  // Modern gradient bar colors
  const barColors = [
    'from-blue-500 to-cyan-400',
    'from-purple-500 to-pink-400',
    'from-emerald-500 to-teal-400',
    'from-yellow-500 to-orange-400',
    'from-rose-500 to-red-400',
    'from-indigo-500 to-blue-400',
  ];

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Admin Analytics</h1>
        <p className="text-slate-400 text-base md:text-lg">Real-time placement insights across departments</p>
      </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard 
            title="Students" 
            value={stats.totalStudents || 0} 
            icon={<FaUserGraduate />} 
            iconColor="text-blue-400" 
            glowColor="shadow-blue-500/20" 
          />
          <StatCard 
            title="Companies" 
            value={stats.totalCompanies || 0} 
            icon={<FaBuilding />} 
            iconColor="text-purple-400" 
            glowColor="shadow-purple-500/20" 
          />
          <StatCard 
            title="Jobs" 
            value={stats.totalJobsPosted || 0} 
            icon={<FaBriefcase />} 
            iconColor="text-emerald-400" 
            glowColor="shadow-emerald-500/20" 
          />
          <StatCard 
            title="Placements" 
            value={stats.totalCandidatesHired || 0} 
            icon={<FaUserCheck />} 
            iconColor="text-yellow-400" 
            glowColor="shadow-yellow-500/20" 
          />
          <StatCard 
            title="Avg Package" 
            value={stats.avgPackage ? `${stats.avgPackage} LPA` : 'N/A'} 
            icon={<FaRupeeSign />} 
            iconColor="text-cyan-400" 
            glowColor="shadow-cyan-500/20" 
          />
          <StatCard 
            title="Highest Pkg" 
            value={stats.highestPackage ? `${stats.highestPackage} LPA` : 'N/A'} 
            icon={<FaTrophy />} 
            iconColor="text-rose-400" 
            glowColor="shadow-rose-500/20" 
          />
        </div>

        {/* Detailed Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Department-wise Placement Breakdown */}
          <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 flex flex-col h-full">
            <h3 className="text-xl md:text-2xl font-semibold text-white mb-8 tracking-wide">
              Department Placements
            </h3>
            
            {stats.departmentPlacements?.length > 0 ? (
              <div className="flex flex-col gap-6 flex-grow justify-center">
                {stats.departmentPlacements.map((dept, index) => {
                  const percentage = Math.round((dept.value / totalDepPlacements) * 100) || 0;
                  const progressColor = barColors[index % barColors.length];
                  
                  return (
                    <div key={dept.name} className="flex flex-col gap-2">
                      <div className="flex justify-between items-end text-sm">
                        <span className="font-medium text-slate-300">{dept.name}</span>
                        <span className="font-bold text-white">
                          {dept.value} <span className="text-slate-500 font-normal">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-800/60 rounded-full h-2.5 overflow-hidden border border-white/5">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${progressColor} shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center">
                <p className="text-slate-500 italic">No departmental placement data available yet.</p>
              </div>
            )}
          </div>

          {/* Quick Insights */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg border border-white/10 flex flex-col h-full">
            <h3 className="text-xl md:text-2xl font-semibold text-white mb-8 flex items-center gap-3 tracking-wide">
              <span className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
                <FaChartPie className="text-xl" />
              </span>
              Quick Insights
            </h3>
            
            <ul className="flex flex-col gap-5 text-base md:text-lg text-slate-300 flex-grow justify-center">
              <li className="flex items-start gap-4">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)] flex-shrink-0"></div>
                <p>
                  You have <strong className="text-white font-bold">{stats.totalCompanies || 0}</strong> registered partner companies.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] flex-shrink-0"></div>
                <p>
                  A total of <strong className="text-white font-bold">{stats.totalJobsPosted || 0}</strong> job openings have been listed so far.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)] flex-shrink-0"></div>
                <p>
                  There are currently <strong className="text-white font-bold">{stats.totalCandidatesHired || 0}</strong> successful hires across all branches.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] flex-shrink-0"></div>
                <p>
                  The average recruitment package stands at an impressive <strong className="text-white font-bold">{stats.avgPackage || 0} LPA</strong>.
                </p>
              </li>
            </ul>
          </div>
          
        </div>
      </div>
  );
};

export default AdminAnalytics;
