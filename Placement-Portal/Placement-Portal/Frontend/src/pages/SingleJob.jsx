import { useLoaderData, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { FiExternalLink } from 'react-icons/fi';

import { toast } from 'react-toastify';
import { FaEdit, FaExternalLinkAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import {
  customFetch,
  fetchJobsQuery,
  fetchSingleJobQuery,
  getCompanyWebsite,
} from '../utils';
import {
  resetJobApply,
  setCurrentJobs,
  setJobApply,
} from '../features/jobs/jobsSlice';
import { JobApplicationForm } from '../Components';
import TopCandidates from '../Components/CompanyAdmin/TopCandidates';

export const action = (queryClient, store) => {
  return async function ({ request }) {
    const formData = await request.formData();
    const intent = formData.get('intent');

    /* Handle Job Apply */
    if (intent === 'jobApplyAction') {
      const jobId = store.getState()?.jobState?.jobApply?.jobId;
      const url = `/student/jobs/${jobId}/apply`;
      try {
        await customFetch.post(url, formData);
        await queryClient.refetchQueries({ queryKey: ['jobs', 'open'] });
        await queryClient.refetchQueries({ queryKey: ['jobs', 'applied'] });
        const { jobs } = await queryClient.fetchQuery(
          fetchJobsQuery({ role: 'student', status: 'open' })
        );
        store.dispatch(setCurrentJobs({ jobs }));
        store.dispatch(resetJobApply());
        document.getElementById('jobApplicationModal').close();
        document.getElementById('jobApplicationFormError').innerText = '';
        toast.success('Applied successfully!');
        return redirect('/student-dashboard/jobs');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || 'Failed to apply for job!';
        document.getElementById('jobApplicationFormError').innerText =
          errorMessage;
        return error;
      }
    }
  };
};

export const loader = (queryClient, store) => {
  return async function ({ params }) {
    const { role } = store.getState()?.userState?.user;
    const jobId = params.jobId;

    try {
      const { job } = await queryClient.ensureQueryData(
        fetchSingleJobQuery({ role, jobId })
      );
      return { job };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch job!';
      console.log(error);
      toast.error(errorMessage);
      throw error;
    }
  };
};

const SingleJob = () => {
  const role = useSelector((state) => state?.userState?.user?.role);
  const userHiredStatus = useSelector((state) => state?.userState?.user?.hiredStatus);
  const jobHiredStatus = useSelector((state) => state?.jobState?.hiredStatus);
  const hiredStatus = userHiredStatus || jobHiredStatus;
  const { job } = useLoaderData();

  const {
    _id,
    profile,
    openingsCount,
    applicationsCount,
    description,
    location,
    company,
    jobPackage,
    keySkills,
    postedBy,
    applicationStatus,
    deadline,
    enableEligibilityFilter,
    eligibilityCriteria,
    eligibilityStatus,
  } = job;

  const hasOfferState =
    role === 'student' && 
    hiredStatus && 
    ['OFFER_ACCEPTED', 'OFFER_REJECTED'].includes(hiredStatus);

  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10 animate-in fade-in duration-700">
      <JobApplicationForm />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] -ml-32 -mt-32"></div>
        
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Job Opportunity
            </span>
            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              {new Date(deadline) < new Date() ? 'Open' : 'Active'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-2">
            {profile}
          </h1>
          
          <div className="flex items-center gap-3 flex-wrap">
            <a
              className="text-xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
              href={company?.website ? getCompanyWebsite(company.website) : ''}
              target="_blank"
            >
              {company.name} <FaExternalLinkAlt size={14} className="opacity-50" />
            </a>
            <span className="text-slate-700">|</span>
            <span className="text-slate-300 font-medium">Posted by {postedBy.name}</span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-4 items-end">
          {role == 'student' && (
            <div className="flex flex-col items-end gap-2">
              {applicationStatus == 'APPLIED' ? (
                <div className="px-6 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-sm shadow-lg shadow-indigo-500/5">
                  ✓ Application Submitted
                </div>
              ) : applicationStatus == 'HIRED' || applicationStatus == 'OFFER_SENT' || applicationStatus == 'OFFER_ACCEPTED' ? (
                <div className="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-500/20">
                  🎉 Selected / Offer Received
                </div>
              ) : applicationStatus == 'REJECTED' || applicationStatus == 'OFFER_REJECTED' ? (
                <div className="px-6 py-3 rounded-2xl bg-red-500 text-white font-black text-sm shadow-xl shadow-red-500/20">
                  Application Closed
                </div>
              ) : applicationStatus == 'SHORTLISTED' ? (
                <div className="px-6 py-3 rounded-2xl bg-orange-500 text-white font-black text-sm shadow-xl shadow-orange-500/20">
                  ⚡ Shortlisted
                </div>
              ) : hasOfferState ? (
                <div className="px-6 py-3 rounded-2xl bg-slate-800 text-slate-500 font-black text-sm opacity-60">
                  {hiredStatus === 'OFFER_ACCEPTED' ? 'OFFER FINALIZED ✅' : 'OFFER FINALIZED ❌'}
                </div>
              ) : (
                <button
                  type="button"
                  className={`px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-2xl active:scale-95 ${
                    (enableEligibilityFilter && eligibilityStatus?.isEligible === false) || new Date(deadline) < new Date()
                    ? 'bg-red-500/10 border border-red-500/20 text-red-500 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/30'
                  }`}
                  onClick={() => {
                    if (enableEligibilityFilter && eligibilityStatus?.isEligible === false) return;
                    if (new Date(deadline) < new Date()) return;
                    dispatch(
                      setJobApply({
                        jobApply: {
                          jobId: _id,
                          profile,
                          company: company.name,
                          isEligible: true,
                          reasons: eligibilityStatus?.reasons || [],
                        },
                      })
                    );
                    document.getElementById('jobApplicationModal').showModal();
                  }}
                  disabled={(enableEligibilityFilter && eligibilityStatus?.isEligible === false) || new Date(deadline) < new Date()}
                >
                  {new Date(deadline) < new Date() 
                    ? 'Application Closed' 
                    : enableEligibilityFilter && eligibilityStatus?.isEligible === false 
                    ? 'Ineligible to Apply' 
                    : 'Apply for this Role'}
                </button>
              )}
            </div>
          )}

          {role == 'company_admin' && (
            <div className="flex items-center gap-3">
              <Link 
                to={`/company-dashboard/edit-job/${_id}`}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-xl"
                title="Edit Job"
              >
                <FaEdit size={20} />
              </Link>
              {applicationsCount === 0 && (
                <button
                  onClick={() => handleDeleteJob({ queryClient, dispatch, id: _id })}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all shadow-xl"
                  title="Delete Job"
                >
                  <MdDelete size={20} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Eligibility Panel for Students */}
          {enableEligibilityFilter && eligibilityCriteria && (
            <div className={`p-8 rounded-[2.5rem] border backdrop-blur-xl relative overflow-hidden bg-black/40 shadow-inner ${
              role === 'student' && eligibilityStatus?.isEligible 
              ? 'border-emerald-500/20' 
              : role === 'student' && eligibilityStatus?.isEligible === false
              ? 'border-red-500/20'
              : 'border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xl">📋</div>
                  <h3 className="text-xl font-black text-white tracking-tight">Academic Eligibility</h3>
                </div>
                {role === 'student' && eligibilityStatus && (
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                     eligibilityStatus.isEligible ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                   }`}>
                     {eligibilityStatus.isEligible ? '✓ Eligible' : '✕ Ineligible'}
                   </span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                {Object.entries({
                  "10th Standard": eligibilityCriteria.tenthPercentage ? `${eligibilityCriteria.tenthPercentage}%` : null,
                  "12th Standard": eligibilityCriteria.twelfthPercentage ? `${eligibilityCriteria.twelfthPercentage}%` : null,
                  "Diploma": eligibilityCriteria.diplomaPercentage ? `${eligibilityCriteria.diplomaPercentage}%` : null,
                  "Graduation": eligibilityCriteria.graduationPercentage ? `${eligibilityCriteria.graduationPercentage}%` : null,
                  "Graduation CGPA": eligibilityCriteria.graduationCGPA || null,
                  "Max Active Backlogs": eligibilityCriteria.maxActiveBacklogs ?? null,
                  "Max Completed Backlogs": eligibilityCriteria.maxCompletedBacklogs ?? null,
                  "Born On or Before": eligibilityCriteria.maxDOB ? new Date(eligibilityCriteria.maxDOB).toLocaleDateString() : null,
                  "Born On or After": eligibilityCriteria.minDOB ? new Date(eligibilityCriteria.minDOB).toLocaleDateString() : null,
                  "10th Pass Year": eligibilityCriteria.tenthCompletionYear ?? null,
                  "12th Pass Year": eligibilityCriteria.twelfthCompletionYear ?? null,
                  "Graduation Pass Year": eligibilityCriteria.graduationCompletionYear ?? null
                }).map(([label, value]) => value !== null && (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</span>
                    <span className="text-white font-black text-sm">{value}</span>
                  </div>
                ))}
              </div>

              {role === 'student' && eligibilityStatus?.reasons?.length > 0 && !eligibilityStatus.isEligible && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-xs font-black uppercase tracking-widest mb-2">Requirement Mismatch:</p>
                  <ul className="space-y-1">
                    {eligibilityStatus.reasons.map((reason, idx) => (
                      <li key={idx} className="text-red-300 text-sm flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-red-400 shrink-0"></span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="p-8 md:p-10 rounded-[3.5rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[100px] -mr-32 -mb-32"></div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-white tracking-tight">Job Description</h3>
            </div>
            <div className="prose prose-invert prose-indigo max-w-none prose-p:text-slate-300 prose-headings:text-white prose-li:text-slate-300 prose-strong:text-white prose-headings:tracking-tight leading-relaxed job-markdown">
              <Markdown 
                remarkPlugins={[remarkBreaks, remarkGfm]}
                components={{
                  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline transition-colors" />
                }}
              >
                {description}
              </Markdown>
            </div>
          </div>
          
          {role === 'company_admin' && <TopCandidates jobId={_id} />}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="p-8 rounded-[2.5rem] bg-slate-900/60 border border-white/10 shadow-xl space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black block mb-1">Package</span>
                  <span className="text-emerald-400 text-xl font-black">{jobPackage} LPA</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl text-emerald-500">💰</div>
              </div>
              
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black block mb-1">Openings</span>
                  <span className="text-white text-xl font-black">{openingsCount} Positions</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl text-blue-500">👥</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black block mb-1">Applications</span>
                  <span className="text-white text-xl font-black">{applicationsCount}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xl text-indigo-500">📄</div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Location</span>
                 <span className="text-slate-200 font-black">{location}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Deadline</span>
                 <span className="text-red-400 font-black">{new Date(deadline).toLocaleDateString()}</span>
               </div>
            </div>
          </div>

          {/* Key Skills */}
          <div className="p-8 rounded-[2.5rem] bg-slate-900/60 border border-white/10 shadow-xl">
             <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Required Skills
             </h3>
             <div className="flex flex-wrap gap-2">
               {keySkills.map((skill, idx) => (
                 <span
                   key={idx}
                   className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all"
                 >
                   {skill}
                 </span>
               ))}
             </div>
          </div>

          {/* Recruiter Details (Visible to Admins) */}
          {role === 'company_admin' && (
            <div className="p-8 rounded-[2.5rem] bg-indigo-600/5 border border-indigo-500/20 shadow-xl">
               <h3 className="text-sm font-black text-indigo-300 uppercase tracking-widest mb-6">Internal Config</h3>
               <div className="space-y-4">
                  {[
                    { label: "Target Courses", value: job?.receivingCourses?.map(c => c?.courseName).join(', ') },
                    { label: "Target Batches", value: Array.isArray(job?.receivingBatch) ? job.receivingBatch.map(b => b.batchYear).join(', ') : job?.receivingBatch?.batchYear },
                    { label: "Departments", value: job?.receivingDepartments?.map(d => d?.departmentName).join(', ') }
                  ].map((item, i) => item.value && (
                    <div key={i}>
                       <span className="text-[10px] uppercase tracking-widest text-slate-600 font-black block mb-1">{item.label}</span>
                       <span className="text-slate-300 text-xs font-medium block">{item.value}</span>
                    </div>
                  ))}
               </div>
            </div>
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
    return redirect('/company-dashboard/jobs');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || 'Failed to delete job!';
    toast.error(errorMessage);
    return error;
  }
}

export default SingleJob;
