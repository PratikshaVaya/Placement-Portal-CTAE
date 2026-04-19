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
  // A job is expired if the deadline has passed OR its status is explicitly 'expired'
  const isExpired = deadlineDiffDays < 0 || jobStatus === 'expired';
  const deadlineStatusText = isExpired
    ? 'Expired'
    : deadlineDiffDays <= 1
    ? 'Last day to apply'
    : `${deadlineDiffDays} days left`;
  const deadlineBadgeClass = isExpired
    ? 'badge badge-error'
    : deadlineDiffDays <= 1
    ? 'badge badge-error'
    : deadlineDiffDays === 2
    ? 'badge badge-warning'
    : 'badge badge-success';

  const { hiredStatus } = useSelector((state) => state.jobState);

  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return (
    <div className="card gap-y-2 border-t border-b-slate-200 p-4 shadow-md hover:shadow-xl w-sm border-l-gray-700">
      {role == 'company_admin' && (
        <div className="flex items-center gap-4 justify-end">
          {/* Edit: show for all admin jobs (to allow reopening expired ones with new deadline) */}
          <Link
            to={`/company-dashboard/edit-job/${_id}`}
            title={isExpired ? 'Edit to reopen this expired job' : 'Edit job'}
          >
            <FaEdit className={isExpired ? 'text-orange-500' : ''} />
          </Link>
          {/* Delete: only if no applications yet */}
          {applicationsCount === 0 && (
            <button
              onClick={() => handleDeleteJob({ queryClient, dispatch, id: _id })}
              title="Delete job"
            >
              <MdDelete />
            </button>
          )}
        </div>
      )}
      <div className="flex gap-x-2 items-center">
        <Link to={_id} className="text-success overflow-hidden">
          <h3 className="font-semibold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-2xl">
          {profile}
        </h3>
        </Link>
      </div>
      <div className="flex justify-between gap-x-4">
        <a
          className="font-bold tracking-wider link max-w-[50%] whitespace-nowrap overflow-hidden text-ellipsis"
          href={getCompanyWebsite(company.website)}
          target="_blank"
        >
          {company.name}
        </a>
        <p className="whitespace-nowrap overflow-hidden text-ellipsis">
          {postedBy.name}
        </p>
      </div>
      <p>
        <span className="font-medium">Location:</span> {location}
      </p>
      <p>
        <span className="font-medium">Package:</span> {jobPackage} LPA
      </p>
      <p className="font-medium">Key Skills:</p>
      <div className="flex flex-wrap gap-4">
        {keySkills.map((skill, idx) => (
          <span
            key={idx}
            className="inline-block py-1 px-2 rounded-lg text-sm text-base-300 bg-gray-500 max-w-[40%] overflow-hidden whitespace-nowrap text-ellipsis"
          >
            {skill}
          </span>
        ))}
      </div>
      <p>
        <span className="font-medium">Deadline:</span>{' '}
        {new Date(deadline).toLocaleDateString()}{' '}
        <span className={`ml-2 ${deadlineBadgeClass}`}>{deadlineStatusText}</span>
      </p>

      {isExpired && (
        <p className="text-sm text-error font-semibold mt-1">
          Deadline passed
          {role === 'company_admin' && (
            <span className="ml-2 text-orange-500 font-normal">
              — Edit job to set a new deadline and reopen
            </span>
          )}
        </p>
      )}

      {role === 'student' && matchFeature && (
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2 text-sm">
          <p className="font-bold flex items-center gap-2 mb-2">
            Match Score: 
            <span className={`badge ${matchScore === 'N/A' ? 'badge-ghost' : matchScore >= 70 ? 'badge-success' : matchScore >= 40 ? 'badge-warning' : 'badge-error'} text-white`}>
              {matchScore}{matchScore !== 'N/A' ? '%' : ''}
            </span>
          </p>
          {matchedSkills?.length > 0 && (
            <p className="mb-1 text-slate-700">
              <span className="font-semibold text-success">✔ Matched:</span> {matchedSkills.join(', ')}
            </p>
          )}
          {missingSkills?.length > 0 && (
            <p className="text-slate-700">
              <span className="font-semibold text-error">❌ Missing:</span> {missingSkills.join(', ')}
            </p>
          )}
        </div>
      )}

      {role === 'student' && eligibilityStatus && (
        <div className={`p-3 rounded-lg border text-sm mt-2 ${eligibilityStatus.isEligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold flex items-center gap-1">
              {eligibilityStatus.isEligible ? '✅ Eligible' : '❌ Not Eligible'}
            </span>
            <span className="badge badge-sm badge-ghost opacity-70">
              {eligibilityStatus.matchCount}/{eligibilityStatus.totalCriteria} Criteria Met
            </span>
          </div>
          {!eligibilityStatus.isEligible && eligibilityStatus.reasons?.length > 0 && (
            <ul className="list-disc list-inside text-xs mt-1 space-y-0.5 text-red-700">
              {eligibilityStatus.reasons.map((reason, idx) => (
                <li key={idx} className="overflow-hidden text-ellipsis whitespace-nowrap" title={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Link
        className="btn btn-sm btn-success text-white w-fit self-center hover:scale-110 mt-2"
        to={`${_id}`}
      >
        View Details
      </Link>
      {role == 'student' &&
        (status == 'applied' ? (
          <button className="w-fit self-center btn btn-sm btn-info">
            Applied
          </button>
        ) : status == 'hired' ? (
          <button className="w-fit self-center text-white btn btn-sm btn-success">
            Hired
          </button>
        ) : status == 'rejected' ? (
          <button className=" w-fit self-center btn btn-sm btn-error">
            Rejected
          </button>
        ) : status == 'shortlisted' ? (
          <button className=" w-fit self-center btn btn-sm btn-warning">
            Shortlisted
          </button>
        ) : (['OFFER_ACCEPTED', 'OFFER_REJECTED'].includes(hiredStatus)) ? (
          <button className="w-fit self-center btn btn-sm btn-info btn-disabled opacity-60 font-bold" disabled>
            {hiredStatus === 'OFFER_ACCEPTED' ? 'OFFER FINALIZED ✅' : 'OFFER FINALIZED ❌'}
          </button>
        ) : isNotEligible ? (
          <button className="w-fit self-center btn btn-sm btn-error btn-disabled opacity-50" disabled>
            Not Eligible
          </button>
        ) : isExpired ? (
          <button className="w-fit self-center btn btn-sm btn-error btn-disabled opacity-50" disabled>
            Deadline passed
          </button>
        ) : (
          <button
            className="hover:scale-125 w-fit self-center text-white btn btn-success btn-sm"
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
            Apply
          </button>
        ))}
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
