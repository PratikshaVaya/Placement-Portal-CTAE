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
            title="On-Campus" 
            value={stats.onCampusPlaced || 0} 
            icon={<FaBriefcase />} 
            iconColor="text-indigo-400" 
            glowColor="shadow-indigo-500/20" 
          />
          <StatCard 
            title="Off-Campus" 
            value={stats.offCampusPlaced || 0} 
            icon={<FaBuilding />} 
            iconColor="text-pink-400" 
            glowColor="shadow-pink-500/20" 
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
                  There are <strong className="text-white font-bold">{stats.totalCandidatesHired || 0}</strong> unique students placed (On-Campus: {stats.onCampusPlaced}, Off-Campus: {stats.offCampusPlaced}).
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
        
        {/* Placed Students Detailed List */}
        <div className="p-8 rounded-[3rem] bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden mt-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-white tracking-tight">Recent Placements</h3>
            </div>
            <span className="px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-slate-400">
              {stats.placedStudents?.length || 0} Total Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Package</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.placedStudents?.map((student, idx) => (
                  <tr key={idx} className="group bg-white/5 hover:bg-white/10 transition-colors">
                    <td className="px-6 py-4 rounded-l-2xl border-l border-y border-white/5 font-black text-white">{student.studentName}</td>
                    <td className="px-6 py-4 border-y border-white/5 text-slate-400 font-bold">{student.rollNo}</td>
                    <td className="px-6 py-4 border-y border-white/5">
                      <span className="text-indigo-400 font-black">{student.companyName}</span>
                    </td>
                    <td className="px-6 py-4 border-y border-white/5 font-black text-emerald-400">
                      {student.package > 100 ? (student.package / 100000).toFixed(2) : student.package} LPA
                    </td>
                    <td className="px-6 py-4 border-y border-white/5">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        student.type === 'On-Campus' 
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                        : 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                      }`}>
                        {student.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 rounded-r-2xl border-r border-y border-white/5 text-right text-slate-500 font-bold text-xs">
                      {new Date(student.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {(!stats.placedStudents || stats.placedStudents.length === 0) && (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-slate-500 font-bold">No placement records found yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default AdminAnalytics;
