import { Link } from 'react-router-dom';
import { customFetch } from '../../utils';
import { toast } from 'react-toastify';
import { FiExternalLink, FiSend, FiUpload } from 'react-icons/fi';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import OfferUploadModal from '../OfferUploadModal';
import ApplicationFilterPanel from './ApplicationFilterPanel';

const SingleJobApplication = ({
  jobId,
  profile,
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

  const handleSendOffer = async (applicationId) => {
    try {
      const { data } = await customFetch.post('/company/offer/send', { applicationId });
      toast.success(data.message || 'Offer sent!');
      queryClient.invalidateQueries({ queryKey: ['single-job-applications'] });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send offer');
    }
  };

  // Client-side filtering function
  const applyClientFilters = (applications, currentFilters) => {
    if (!applications || !currentFilters) return applications;

    return applications.filter((app) => {
      // Search filter (name)
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        const matchName = app.applicantName?.toLowerCase().includes(searchLower);
        if (!matchName) return false;
      }

      // Resume filter
      if (currentFilters.hasResume !== 'all' && currentFilters.hasResume !== undefined && currentFilters.hasResume !== '') {
        const hasResume = !!app.resume;
        const filterHasResume = currentFilters.hasResume === 'true';
        if (hasResume !== filterHasResume) return false;
      }

      return true;
    });
  };

  const allBranches = ['CSE', 'IT', 'ECE', 'Mechanical', 'Civil', 'Electrical'];

  return (
    <div className="py-4 px-8 flex flex-col gap-y-4">
      <Link
        to={`/company-dashboard/jobs/${jobId}`}
        className="text-xl font-medium tracking-wide flex gap-x-2 items-center underline hover:link-primary"
      >
        {profile} <FiExternalLink />
      </Link>
      <p className="flex gap-x-4">
        <span>Deadline: {new Date(deadline).toLocaleDateString()}</span>
        <span>Openings Count: {openingsCount}</span>
      </p>

      {/* Filter Panel */}
      <ApplicationFilterPanel
        onFiltersChange={setFilters}
        branches={allBranches}
      />

      <div role="tablist" className="tabs tabs-lifted">
        <TabContent
          jobId={jobId}
          jobType="pending"
          label="APPLIED"
          arr={applyClientFilters(pending, filters)}
          originalLength={pending.length}
          onAction={handleAction}
        />
        <TabContent
          jobId={jobId}
          jobType="shortlisted"
          label="SHORTLISTED"
          arr={applyClientFilters(shortlisted, filters)}
          originalLength={shortlisted.length}
          onAction={handleAction}
        />
        <TabContent
          jobId={jobId}
          jobType="hired"
          label="HIRED / OFFERS"
          arr={applyClientFilters(hired, filters)}
          originalLength={hired.length}
          onAction={handleAction}
          onSendOffer={handleSendOffer}
        />
        <TabContent
          jobId={jobId}
          jobType="rejected"
          label="REJECTED"
          arr={applyClientFilters(rejected, filters)}
          originalLength={rejected.length}
          onAction={handleAction}
        />
      </div>
    </div>
  );
};

const TabContent = ({
  jobType,
  label,
  jobId,
  arr,
  originalLength,
  onAction,
  onSendOffer,
}) => {
  const [selectedApplicationForOffer, setSelectedApplicationForOffer] =
    useState(null);

  return (
    <>
      <input
        type="radio"
        name={`${jobId}_tab`}
        role="tab"
        className="tab capitalize text-blue-500 whitespace-nowrap"
        aria-label={label || jobType}
        defaultChecked={jobType === 'pending'}
      />
      <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
        {arr.length ? (
          <div className="overflow-x-auto">
            <div className="mb-2 text-sm text-gray-600">
              Showing {arr.length} of {originalLength} {jobType} applications
            </div>
            <table className="table">
              {/* head */}
              <thead className="text-base font-normal">
                <tr>
                  <th>Name</th>
                  <th>Cover Letter</th>
                  <th>Resume</th>
                  <th>Portfolio</th>
                  {(jobType === 'pending' || jobType === 'shortlisted') && (
                    <th>Action</th>
                  )}
                  {jobType === 'hired' && <th>Status & Offer Action</th>}
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
                    status
                  } = application;
                  return (
                    <tr key={_id}>
                      <td>
                        <a
                          href={`/company-dashboard/applications/${_id}/students/${applicantId}`}
                          className="link font-semibold"
                        >
                          {applicantName}
                        </a>
                      </td>
                      <td className="max-w-xs truncate">{coverLetter || 'N/A'}</td>
                      <td>
                        {resume ? (
                          <a href={resume} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs text-blue-600">
                             Resume
                          </a>
                        ) : 'No Resume'}
                      </td>
                      <td>
                        {portfolio ? (
                          <a href={portfolio} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs text-blue-600">
                            Portfolio
                          </a>
                        ) : 'N/A'}
                      </td>
                      {jobType === 'pending' ? (
                        <td className="flex flex-wrap gap-2">
                          <ActionButton
                            action="shortlist"
                            applicationId={_id}
                            onAction={onAction}
                          />
                          <ActionButton action="hire" applicationId={_id} onAction={onAction} />
                          <ActionButton action="reject" applicationId={_id} onAction={onAction} />
                        </td>
                      ) : jobType == 'shortlisted' ? (
                        <td className="flex flex-wrap gap-2">
                          <ActionButton action="hire" applicationId={_id} onAction={onAction} />
                          <ActionButton action="reject" applicationId={_id} onAction={onAction} />
                        </td>
                      ) : jobType === 'hired' ? (
                        <td className="flex flex-wrap items-center gap-4">
                          <StatusBadge status={status} />
                          
                          {status === 'HIRED' && (
                            <button
                              className="btn btn-xs btn-primary text-white gap-1"
                              onClick={() => onSendOffer(_id)}
                            >
                              <FiSend size={12} /> Send Offer
                            </button>
                          )}

                          {status === 'OFFER_ACCEPTED' && (
                            <button
                              className="btn btn-xs btn-info text-white gap-1"
                              onClick={() => setSelectedApplicationForOffer(_id)}
                            >
                              <FiUpload size={12} /> {application.offerLetterUrl ? 'Update Offer Letter' : 'Upload Offer Letter'}
                            </button>
                          )}
                          
                          {application.offerLetterUrl && (
                            <a href={application.offerLetterUrl} target="_blank" rel="noreferrer" className="text-xs link link-primary">
                              View Letter
                            </a>
                          )}
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
  let badgeClass = "badge badge-sm font-semibold ";
  let text = status;

  switch (status) {
    case 'HIRED':
    case 'hired':
      badgeClass += "badge-info badge-outline";
      text = "HIRED";
      break;
    case 'OFFER_SENT':
      badgeClass += "badge-warning text-white";
      text = "OFFER SENT";
      break;
    case 'OFFER_ACCEPTED':
      badgeClass += "badge-success text-white";
      text = "ACCEPTED";
      break;
    case 'OFFER_REJECTED':
      badgeClass += "badge-error text-white";
      text = "REJECTED";
      break;
    default:
      badgeClass += "badge-ghost";
  }

  return <span className={badgeClass}>{text}</span>;
}

const ActionButton = ({ action, applicationId, onAction }) => {
  let btnClass = 'btn btn-xs capitalize ';
  switch (action) {
    case 'hire':
      btnClass += 'btn-success text-white';
      break;
    case 'reject':
      btnClass += 'btn-error text-white';
      break;
    case 'shortlist':
      btnClass += 'btn-warning';
      break;
  }

  return (
    <button
      className={btnClass}
      onClick={() => onAction(applicationId, action)}
    >
      {action}
    </button>
  );
};

export default SingleJobApplication;
