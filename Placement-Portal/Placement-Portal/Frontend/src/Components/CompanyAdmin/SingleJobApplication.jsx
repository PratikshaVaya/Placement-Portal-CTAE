import { Link } from 'react-router-dom';
import { customFetch, getFileUrl } from '../../utils';
import { toast } from 'react-toastify';
import { FiExternalLink, FiSend, FiUpload } from 'react-icons/fi';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import OfferUploadModal from '../OfferUploadModal';
import ApplicationFilterPanel from './ApplicationFilterPanel';

const SingleJobApplication = ({
  jobId,
  profile,
  keySkills,
  openingsCount,
  deadline,
  applications,
}) => {
  let pending = [],
    shortlisted = [],
    hired = [],
    rejected = [];

  for (let item of applications) {
    const status = item._id.status;
    switch (status) {
      case 'APPLIED':
      case 'pending': // backward compatibility
        pending = item.applications;
        break;
      case 'SHORTLISTED':
      case 'shortlisted':
        shortlisted = item.applications;
        break;
      case 'HIRED':
      case 'OFFER_SENT':
      case 'OFFER_ACCEPTED':
      case 'OFFER_REJECTED':
      case 'hired':
        hired = [...hired, ...item.applications];
        break;
      case 'REJECTED':
      case 'rejected':
        rejected = item.applications;
        break;
    }
  }

  const [filters, setFilters] = useState({});
  const queryClient = useQueryClient();

  const handleAction = async (applicationId, action) => {
    const url = `/company/applications/${applicationId}/action/${action}`;
    try {
      const { data } = await customFetch.patch(url);
      const message = data?.message || 'successfully performed action!';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['single-job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (error) {
      console.log(error);
      const errorMessage =
        error?.response?.data?.message || 'Failed to perform action!';
      toast.error(errorMessage);
    }
  };

  const handleBulkAction = async (ids, action) => {
    try {
      const { data } = await customFetch.patch('/company/applications/bulk-action', { ids, action });
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['single-job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (error) {
       toast.error(error?.response?.data?.message || 'Bulk action failed');
    }
  }

  const handleSendOffer = async (applicationId) => {
    try {
      const { data } = await customFetch.post('/company/offer/send', { applicationId });
      toast.success(data.message || 'Offer sent!');
      queryClient.invalidateQueries({ queryKey: ['single-job-applications'] });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send offer');
    }
  };

  const calculateMatchScore = (app) => {
    const studentSkills = (app.applicantSkills || []).map(s => s.toLowerCase().trim());
    const jobSkills = (keySkills || []).map(s => s.toLowerCase().trim());
    
    let skillScore = 0;
    if (jobSkills.length > 0) {
      const matchedSkills = jobSkills.filter(skill => 
        studentSkills.some(s => s.includes(skill) || skill.includes(s))
      );
      skillScore = matchedSkills.length / jobSkills.length;
    }

    const cgpa = app.applicantCGPA || 0;
    const matchScore = (skillScore * 0.5) + (cgpa / 10 * 0.3) + (0.2); 
    return Math.round(matchScore * 100);
  };

  // Client-side filtering and sorting function
  const applyClientFilters = (applications, currentFilters, jobType) => {
    if (!applications || !currentFilters) return applications;

    let filtered = applications.map(app => ({
        ...app,
        matchScore: calculateMatchScore(app)
    }));

    filtered = filtered.filter((app) => {
      // Search filter (name, email, skills)
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        const matchName = app.applicantName?.toLowerCase().includes(searchLower);
        const matchEmail = app.applicantEmail?.toLowerCase().includes(searchLower);
        const matchSkills = app.applicantSkills?.toLowerCase().includes(searchLower);
        if (!matchName && !matchEmail && !matchSkills) return false;
      }

      // Resume filter
      if (currentFilters.hasResume !== 'all' && currentFilters.hasResume !== undefined && currentFilters.hasResume !== '') {
        const hasResume = !!app.resume;
        const filterHasResume = currentFilters.hasResume === 'true';
        if (hasResume !== filterHasResume) return false;
      }

      // Branch filter
      if (currentFilters.branch) {
        if (app.applicantBranch !== currentFilters.branch) return false;
      }

      // Skills filter
      if (currentFilters.skills) {
        const skillsLower = currentFilters.skills.toLowerCase().split(',').map(s => s.trim());
        const applicantSkills = (app.applicantSkills || '').toLowerCase();
        const hasAllSkills = skillsLower.every(skill => applicantSkills.includes(skill));
        if (!hasAllSkills) return false;
      }

      // Academic Filters
      if (currentFilters.minCGPA && (app.applicantCGPA || 0) < parseFloat(currentFilters.minCGPA)) return false;
      if (currentFilters.min10thPercentage && (app.applicant10thPercentage || 0) < parseFloat(currentFilters.min10thPercentage)) return false;
      if (currentFilters.min12thPercentage && (app.applicant12thPercentage || 0) < parseFloat(currentFilters.min12thPercentage)) return false;
      if (currentFilters.minGraduationPercentage && (app.applicantGraduationPercentage || 0) < parseFloat(currentFilters.minGraduationPercentage)) return false;

      return true;
    });

    // Sort result
    if (currentFilters.isSmartFilter && jobType === 'pending') {
        filtered.sort((a, b) => b.matchScore - a.matchScore);
        return filtered.slice(0, 10);
    }

    if (currentFilters.sortBy) {
      filtered.sort((a, b) => {
        switch (currentFilters.sortBy) {
          case 'highest-cgpa':
            return (b.applicantCGPA || 0) - (a.applicantCGPA || 0);
          case 'highest-graduation':
            return (b.applicantGraduationPercentage || 0) - (a.applicantGraduationPercentage || 0);
          case 'recently-applied':
          default:
            return new Date(b.appliedAt) - new Date(a.appliedAt);
        }
      });
    }

    return filtered;
  };

  const courseOptions = useSelector((state) => state.courseOptions);

  // Dynamic branches from course options
  const dynamicBranches = Array.from(new Set(
    Object.values(courseOptions).flatMap(course => 
      course.departments?.map(d => d.departmentName) || []
    )
  )).sort();

  const allBranches = dynamicBranches.length > 0 ? dynamicBranches : ['CSE', 'IT', 'ECE', 'Mechanical', 'Civil', 'Electrical'];

  return (
    <>
    <div className="flex flex-col gap-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-indigo-500/10"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-1.5 h-6 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Managing Applications For</span>
            </div>
            <Link
              to={`/company-dashboard/jobs/${jobId}`}
              className="text-3xl font-black text-white tracking-tight hover:text-indigo-400 transition-colors flex items-center gap-3"
            >
              {profile} <FiExternalLink className="text-xl opacity-50" />
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Deadline</span>
              <span className="text-slate-200 text-sm font-bold">{new Date(deadline).toLocaleDateString()}</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Openings</span>
              <span className="text-slate-200 text-sm font-bold">{openingsCount} Positions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <ApplicationFilterPanel
        onFiltersChange={setFilters}
        branches={allBranches}
      />

      <div role="tablist" className="tabs tabs-lifted bg-slate-900/20 p-2 rounded-[2rem] border border-white/5 backdrop-blur-md">
        <TabContent
          jobId={jobId}
          jobType="pending"
          label="APPLIED"
          arr={applyClientFilters(pending, filters, 'pending')}
          originalLength={pending.length}
          onAction={handleAction}
          onBulkAction={handleBulkAction}
          isSmart={!!filters.isSmartFilter}
        />
        <TabContent
          jobId={jobId}
          jobType="shortlisted"
          label="SHORTLISTED"
          arr={applyClientFilters(shortlisted, filters, 'shortlisted')}
          originalLength={shortlisted.length}
          onAction={handleAction}
        />
        <TabContent
          jobId={jobId}
          jobType="hired"
          label="HIRED / OFFERS"
          arr={applyClientFilters(hired, filters, 'hired')}
          originalLength={hired.length}
          onAction={handleAction}
          onSendOffer={handleSendOffer}
        />
        <TabContent
          jobId={jobId}
          jobType="rejected"
          label="REJECTED"
          arr={applyClientFilters(rejected, filters, 'rejected')}
          originalLength={rejected.length}
          onAction={handleAction}
        />
      </div>

    </div>
    
    {/* Section Divider */}
    <div className="my-16 relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-white/5"></div>
      </div>
      <div className="relative flex justify-center">
        <div className="bg-slate-900 px-4">
           <div className="w-2 h-2 rounded-full bg-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
        </div>
      </div>
    </div>
    </>
  );
};

const TabContent = ({
  jobType,
  label,
  jobId,
  arr,
  originalLength,
  onAction,
  onBulkAction,
  onSendOffer,
  isSmart,
}) => {
  const [selectedApplicationForOffer, setSelectedApplicationForOffer] =
    useState(null);

  const handleBulkShortlist = () => {
    const ids = arr.map(app => app._id);
    onBulkAction(ids, 'shortlist');
  };

  return (
    <>
      <input
        type="radio"
        name={`${jobId}_tab`}
        role="tab"
        className="tab capitalize whitespace-nowrap !text-[10px] !font-black !tracking-widest !h-12"
        aria-label={label || jobType}
        defaultChecked={jobType === 'pending'}
      />
      <div role="tabpanel" className="tab-content bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 mt-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

        {arr.length ? (
          <div className="overflow-x-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
               <div className="text-xs font-bold text-slate-500">
                {isSmart ? (
                  <span className="flex items-center gap-2 text-purple-400 animate-pulse">
                    ✨ Smart AI Ranking Active
                  </span>
                ) : (
                  `Showing ${arr.length} of ${originalLength} ${jobType} applications`
                )}
              </div>

              
              {isSmart && jobType === 'pending' && (
                <button 
                  onClick={handleBulkShortlist}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                >
                  ✨ Auto-Shortlist Top {arr.length}
                </button>

              )}
            </div>

            <table className="table w-full">
              {/* head */}
              <thead className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                <tr>
                  <th className="py-5">Candidate</th>
                  {isSmart && <th className="text-purple-400">Match Score</th>}
                  <th>Cover Letter</th>
                  <th>Documents</th>
                  {(jobType === 'pending' || jobType === 'shortlisted') && (
                    <th className="text-right">Actions</th>
                  )}
                  {jobType === 'hired' && <th className="text-right">Status & Offers</th>}
                </tr>
              </thead>

              <tbody>
                {arr.map((application) => {
                    const {
                      _id,
                      applicantName,
                      applicantId,
                      coverLetter,
                      resume,
                      portfolio,
                      status,
                      offerLetterUrl,
                    } = application;
                  return (
                    <tr key={_id}>
                      <td>
                        <div className="flex flex-col">
                          <a
                            href={`/company-dashboard/applications/${_id}/students/${applicantId}`}
                            className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors"
                          >
                            {applicantName}
                          </a>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight opacity-60">ID: {applicantId?.slice(-6)}</span>
                        </div>
                      </td>
                      {isSmart && (
                        <td>
                          <div className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-black w-fit">
                            {application.matchScore}%
                          </div>
                        </td>
                      )}
                      <td className="max-w-[200px]">
                        <p className="text-xs text-slate-400 line-clamp-2 italic leading-relaxed">{coverLetter || 'No cover letter provided.'}</p>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {resume && (
                            <a href={getFileUrl(resume)} target="_blank" rel="noopener" className="p-2 rounded-lg bg-white/5 text-indigo-400 hover:bg-indigo-400/10 transition-all border border-white/5" title="Resume">
                               📄
                            </a>
                          )}
                          {portfolio && (
                            <a href={portfolio} target="_blank" rel="noopener" className="p-2 rounded-lg bg-white/5 text-amber-400 hover:bg-amber-400/10 transition-all border border-white/5" title="Portfolio">
                               💼
                            </a>
                          )}
                        </div>
                      </td>
                      {jobType === 'pending' ? (
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <ActionButton
                              action="shortlist"
                              applicationId={_id}
                              onAction={onAction}
                            />
                            <ActionButton action="hire" applicationId={_id} onAction={onAction} />
                            <ActionButton action="reject" applicationId={_id} onAction={onAction} />
                          </div>
                        </td>
                      ) : jobType == 'shortlisted' ? (
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <ActionButton action="hire" applicationId={_id} onAction={onAction} />
                            <ActionButton action="reject" applicationId={_id} onAction={onAction} />
                          </div>
                        </td>
                      ) : jobType === 'hired' ? (
                        <td className="text-right">
                          <div className="flex flex-wrap items-center justify-end gap-3">
                            <StatusBadge status={status} />
                            
                            {status === 'HIRED' && (
                              <button
                                className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                                onClick={() => onSendOffer(_id)}
                              >
                                Send Offer
                              </button>
                            )}
  
                            {status === 'OFFER_ACCEPTED' && (
                              <button
                                className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
                                onClick={() => setSelectedApplicationForOffer(_id)}
                              >
                                {application.offerLetterUrl ? 'Update Offer' : 'Upload Offer'}
                              </button>
                            )}
                            
                            {application.offerLetterUrl && (
                              <a href={getFileUrl(application.offerLetterUrl)} target="_blank" rel="noopener" className="p-1.5 rounded-lg bg-white/5 text-indigo-400 hover:text-white transition-all">
                                📂
                              </a>
                            )}
                          </div>
                        </td>
                      ) : null}

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-center py-8 text-gray-500 font-medium">
            {originalLength === 0
              ? `No ${jobType} applications yet.`
              : `No applications match the selected filters.`}
          </p>
        )}
      </div>

      {selectedApplicationForOffer && (
        <OfferUploadModal
          applicationId={selectedApplicationForOffer}
          onClose={() => setSelectedApplicationForOffer(null)}
        />
      )}
    </>
  );
};

const StatusBadge = ({ status }) => {
  let badgeStyle = "text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-widest font-black shadow-lg ";
  let text = status;

  switch (status) {
    case 'HIRED':
    case 'hired':
      badgeStyle += "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      text = "HIRED";
      break;
    case 'OFFER_SENT':
      badgeStyle += "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-amber-500/10";
      text = "OFFER SENT";
      break;
    case 'OFFER_ACCEPTED':
      badgeStyle += "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/10";
      text = "ACCEPTED";
      break;
    case 'OFFER_REJECTED':
      badgeStyle += "bg-red-500/10 text-red-400 border border-red-500/20";
      text = "REJECTED";
      break;
    default:
      badgeStyle += "bg-slate-800 text-slate-400 border border-white/5";
  }

  return <span className={badgeStyle}>{text}</span>;
}


const ActionButton = ({ action, applicationId, onAction }) => {
  let btnStyle = 'px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all active:scale-90 shadow-lg ';
  switch (action) {
    case 'hire':
      btnStyle += 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white';
      break;
    case 'reject':
      btnStyle += 'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white';
      break;
    case 'shortlist':
      btnStyle += 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white';
      break;
  }

  return (
    <button
      className={btnStyle}
      onClick={() => onAction(applicationId, action)}
    >
      {action}
    </button>
  );
};


export default SingleJobApplication;
