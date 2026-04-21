import { useLoaderData } from 'react-router-dom';
import { useState } from 'react';
import { fetchSingleCompany } from '../../utils';
import defaultAvatar from '../../assets/default-avatar.jpg';
import { CompanyAdminCard } from '../../Components';

export const loader = (queryClient, store) => {
  return async function ({ params }) {
    const companyId = params.companyId;
    try {
      const { company } = await queryClient.ensureQueryData(
        fetchSingleCompany(companyId)
      );
      return { company };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch company!';
      console.log(error);
      toast.error(errorMessage);
      return error;
    }
  };
};

const SingleCompany = () => {
  const { company } = useLoaderData();
  const [activeSection, setActiveSection] = useState('jobs');

  if (!company)
    return <h3 className="p-8 text-2xl capitalize">no company found</h3>;

  const {
    photo,
    name,
    about,
    jobsPosted,
    openingsCreated,
    candidatesHired,
    admins,
    jobs = [],
    hiredCandidates = [],
  } = company;

  return (
    <div className="flex flex-col gap-8 text-slate-200">
      {/* HEADER SECTION */}
      <div className="p-6 md:p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <img
              src={photo || defaultAvatar}
              alt={`${name} company logo`}
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-slate-900 shadow-2xl"
            />
          </div>
          
          <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{name}</h1>
              <div className="h-1 w-20 bg-indigo-500 rounded-full mt-2 mx-auto md:mx-0 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">About the Company</span>
              <p className="text-slate-300 text-lg leading-relaxed">{about}</p>
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Jobs Posted', value: jobsPosted, color: 'from-blue-500 to-cyan-400' },
          { label: 'Openings Created', value: openingsCreated, color: 'from-purple-500 to-pink-400' },
          { label: 'Candidates Hired', value: candidatesHired, color: 'from-emerald-500 to-teal-400' },
        ].map((stat, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg text-center group hover:bg-white/[0.08] transition-all">
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <div className={`text-4xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* ACTION SECTIONS / TABS */}
      <div className="flex flex-col gap-6">
        <div className="flex gap-4 border-b border-white/10 pb-4">
          <button
            type="button"
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeSection === 'jobs' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setActiveSection('jobs')}
          >
            Jobs Posted
          </button>
          <button
            type="button"
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeSection === 'hired' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setActiveSection('hired')}
          >
            Candidates Hired
          </button>
        </div>

        {activeSection === 'jobs' && (
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6">Job History</h3>
            {jobs.length ? (
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900 custom-scrollbar">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 sticky top-0 z-10 backdrop-blur-sm">
                    <tr>
                      <th className="px-4 py-4 font-medium">Job Title</th>
                      <th className="px-4 py-4 font-medium">Package (LPA)</th>
                      <th className="px-4 py-4 font-medium">Deadline</th>
                      <th className="px-4 py-4 font-medium text-center">Applicants</th>
                      <th className="px-4 py-4 font-medium text-center">Hired</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {jobs.map((job) => (
                      <tr key={job._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 font-medium text-white">{job.profile}</td>
                        <td className="px-4 py-4">
                          <span className="text-emerald-400 font-bold">{typeof job.jobPackage === 'number' ? `${job.jobPackage} LPA` : 'N/A'}</span>
                        </td>
                        <td className="px-4 py-4">{new Date(job.deadline).toLocaleDateString()}</td>
                        <td className="px-4 py-4 text-center">
                          <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{job.applicantsCount || 0}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{job.hiredCount || 0}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-slate-500 italic">No jobs posted by this company yet.</p>
              </div>
            )}
          </div>
        )}

        {activeSection === 'hired' && (
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6">Placed Candidates</h3>
            {hiredCandidates.length ? (
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900 custom-scrollbar">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 sticky top-0 z-10 backdrop-blur-sm">
                    <tr>
                      <th className="px-4 py-4 font-medium">Name</th>
                      <th className="px-4 py-4 font-medium">Program</th>
                      <th className="px-4 py-4 font-medium">Job Role</th>
                      <th className="px-4 py-4 font-medium">Package</th>
                      <th className="px-4 py-4 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {hiredCandidates.map((student, index) => (
                      <tr key={`${student.studentId || index}-${student.jobRole}`} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 font-medium text-white">{student.name}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span>{student.course || 'N/A'}</span>
                            <span className="text-[10px] text-slate-500">{student.branch || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">{student.jobRole || 'N/A'}</td>
                        <td className="px-4 py-4 text-emerald-400 font-bold">
                          {typeof student.package === 'number' ? `${student.package} LPA` : 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            student.status === 'OFFER_ACCEPTED' || student.status === 'HIRED' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : student.status === 'OFFER_REJECTED' 
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {student.status?.replace('_', ' ') || 'PLACED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-slate-500 italic">No hired candidates available for this company.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADMINS SECTION */}
      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-6">Administrative Contacts</h3>
        {admins?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {admins.map((admin) => (
              <CompanyAdminCard key={admin._id} admin={admin} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 italic">
            No active administrators found for this company.
          </div>
        )}
      </div>
    </div>
  );
};
export default SingleCompany;
