import { useDispatch, useSelector } from 'react-redux';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { FiExternalLink } from 'react-icons/fi';
import { Link, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';

import { setCurrentJobs, setJobApply } from '../features/jobs/jobsSlice';
import { useQueryClient } from '@tanstack/react-query';
import { customFetch, fetchJobsQuery, getCompanyWebsite } from '../utils';

const SingleJob = ({ job, status, role }) => {
  const {
    _id,
    profile,
    applicationsCount,
    location,
    company,
    jobPackage,
    keySkills,
    postedBy,
    deadline,
    matchFeature,
    enableEligibilityFilter,
    eligibilityStatus,
    status: jobStatus,
  } = job;

  const { matchScore, matchedSkills, missingSkills } = matchFeature || {};
  const isNotEligible =
    enableEligibilityFilter &&
    eligibilityStatus &&
    eligibilityStatus.isEligible === false;

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const deadlineDiffDays = Math.floor(
    (deadlineDate.setHours(23, 59, 59, 999) - now) / (1000 * 60 * 60 * 24)
  );
  
  const isExpired = deadlineDiffDays < 0 || jobStatus === 'expired';
  const deadlineStatusText = isExpired
    ? 'Expired'
    : deadlineDiffDays <= 1
    ? 'Last day to apply'
    : `${deadlineDiffDays} days left`;
    
  const deadlineBadgeClass = isExpired
    ? 'bg-red-500/10 text-red-500 border-red-500/20'
    : deadlineDiffDays <= 1
    ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
    : deadlineDiffDays === 2
    ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]';

  const { hiredStatus } = useSelector((state) => state.jobState);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return (
    <div className="group relative rounded-[2.5rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 p-7 hover:bg-slate-800/60 transition-all duration-500 shadow-2xl overflow-hidden flex flex-col h-full">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-600/10 transition-all duration-500"></div>
      
      {/* Header with Actions */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex-1 min-w-0 mr-4">
          <Link to={_id} className="block">
            <h3 className="text-2xl font-black text-white tracking-tight leading-tight hover:text-indigo-400 transition-colors truncate">
              {profile}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <a
              className="text-indigo-400 font-bold text-sm hover:underline truncate"
              href={getCompanyWebsite(company.website)}
              target="_blank"
            >
              {company.name}
            </a>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-xs font-medium truncate">{postedBy.name}</span>
          </div>
        </div>

        {role == 'company_admin' && (
          <div className="flex items-center gap-2">
            <Link
              to={`/company-dashboard/edit-job/${_id}`}
              className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 transition-all"
              title={isExpired ? 'Edit to reopen this expired job' : 'Edit job'}
            >
              <FaEdit size={16} />
            </Link>
            {applicationsCount === 0 && (
              <button
                className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                onClick={() => handleDeleteJob({ queryClient, dispatch, id: _id })}
                title="Delete job"
              >
                <MdDelete size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black block mb-1">Location</span>
          <span className="text-slate-200 font-bold text-sm truncate block">{location}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black block mb-1">Package</span>
          <span className="text-emerald-400 font-bold text-sm block">{jobPackage} LPA</span>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Key Skills</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {keySkills.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-lg text-[10px] font-bold text-slate-300 bg-white/5 border border-white/5 group-hover:border-indigo-500/30 transition-all truncate max-w-[120px]"
            >
              {skill}
            </span>
          ))}
          {keySkills.length > 4 && (
            <span className="px-2 py-1 text-[10px] text-slate-500 font-bold">+{keySkills.length - 4} more</span>
          )}
        </div>
      </div>

      {/* Match Score & Eligibility for Students */}
      {role === 'student' && (
        <div className="space-y-4 mb-8 relative z-10 mt-auto">
          {matchFeature && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-xl shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-black">Match Compatibility</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  matchScore === 'N/A' ? 'bg-slate-700 text-slate-400' : 
                  matchScore >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 
                  matchScore >= 40 ? 'bg-orange-500/20 text-orange-400' : 
                  'bg-red-500/20 text-red-400'
                }`}>
                  {matchScore}{matchScore !== 'N/A' ? '%' : ''}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    matchScore === 'N/A' ? 'bg-slate-500' : 
                    matchScore >= 70 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                    matchScore >= 40 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 
                    'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  }`}
                  style={{ width: `${matchScore === 'N/A' ? 0 : matchScore}%` }}
                ></div>
              </div>
            </div>
          )}

          {eligibilityStatus && (
            <div className={`p-4 rounded-2xl border backdrop-blur-xl bg-black/40 shadow-inner ${
              eligibilityStatus.isEligible 
              ? 'border-emerald-500/20 text-emerald-400' 
              : 'border-red-500/20 text-red-400'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase tracking-widest font-black">
                  {eligibilityStatus.isEligible ? '✓ Eligible' : '✕ Ineligible'}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {eligibilityStatus.matchCount}/{eligibilityStatus.totalCriteria} Criteria
                </span>
              </div>
              {!eligibilityStatus.isEligible && (
                 <p className="text-[10px] font-medium text-red-400/80 mt-1 truncate">Check details for missing criteria</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer: Deadline & CTA */}
      <div className="mt-auto relative z-10 pt-6 border-t border-white/5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
             <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Deadline</span>
             <span className="text-slate-300 text-xs font-bold">{new Date(deadline).toLocaleDateString()}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${deadlineBadgeClass}`}>
            {deadlineStatusText}
          </div>
        </div>

        <div className="flex gap-3 mt-2">
          <Link
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-center text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
            to={`${_id}`}
          >
            View Job
          </Link>

          {role == 'student' && (
            status == 'applied' ? (
              <button className="flex-1 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs cursor-default">Applied</button>
            ) : status == 'hired' ? (
              <button className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold text-xs cursor-default shadow-lg shadow-emerald-500/20">Hired</button>
            ) : status == 'rejected' ? (
              <button className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-xs cursor-default">Rejected</button>
            ) : status == 'shortlisted' ? (
              <button className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold text-xs cursor-default shadow-lg shadow-orange-500/20">Shortlisted</button>
            ) : (['OFFER_ACCEPTED', 'OFFER_REJECTED'].includes(hiredStatus)) ? (
              <button className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-500 font-bold text-[10px] cursor-not-allowed opacity-50" disabled>
                Offer Finalized
              </button>
            ) : isNotEligible ? (
              <button className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-[10px] cursor-not-allowed opacity-50" disabled>
                Ineligible
              </button>
            ) : isExpired ? (
              <button className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-[10px] cursor-not-allowed opacity-50" disabled>
                Expired
              </button>
            ) : (
              <button
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition-all active:scale-95 shadow-lg shadow-indigo-500/25"
                onClick={() => {
                  dispatch(
                    setJobApply({
                      jobApply: {
                        jobId: _id,
                        profile,
                        company: company.name,
                      },
                    })
                  );
                  document.getElementById('jobApplicationModal').showModal();
                }}
              >
                Apply Now
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

async function handleDeleteJob({ queryClient, dispatch, id }) {
  try {
    await customFetch.delete(`/company/jobs/${id}`);
    queryClient.removeQueries({ queryKey: ['jobs', 'open'] });
    const { jobs } = await queryClient.fetchQuery(
      fetchJobsQuery({ role: 'company_admin', status: 'open' })
    );
    dispatch(setCurrentJobs({ jobs }));
    toast.success('Job deleted successfully!');
    return redirect('/company-dashboard/');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || 'Failed to delete job!';
    toast.error(errorMessage);
    return error;
  }
}

export default SingleJob;
