import { useEffect, useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-toastify';
import DocumentViewerModal from '../DocumentViewerModal';
import { cleanupBlobUrl, fetchDocumentBlobUrl, getCompanyWebsite } from '../../utils';

const ApplicationsContainer = () => {
  let pending = [],
    shortlisted = [],
    hired = [],
    rejected = [];

  const applications = useLoaderData()?.applications || [];

  for (let item of applications) {
    const status = item._id.status;
    switch (status) {
      case 'APPLIED':
      case 'OFFER_SENT':
        pending = [...pending, ...item.application];
        break;
      case 'SHORTLISTED':
        shortlisted = [...shortlisted, ...item.application];
        break;
      case 'HIRED':
      case 'OFFER_ACCEPTED':
        hired = [...hired, ...item.application];
        break;
      case 'REJECTED':
      case 'OFFER_REJECTED':
        rejected = [...rejected, ...item.application];
        break;
      default:
        // Fallback for any other or legacy statuses
        if (status?.toLowerCase() === 'pending') pending = [...pending, ...item.application];
        if (status?.toLowerCase() === 'shortlisted') shortlisted = [...shortlisted, ...item.application];
        if (status?.toLowerCase() === 'hired') hired = [...hired, ...item.application];
        if (status?.toLowerCase() === 'rejected') rejected = [...rejected, ...item.application];
    }
  }

  const [viewerState, setViewerState] = useState({
    isOpen: false,
    isLoading: false,
    fileUrl: '',
    error: '',
    fileName: 'Resume',
  });

  useEffect(() => {
    return () => {
      cleanupBlobUrl(viewerState.fileUrl);
    };
  }, [viewerState.fileUrl]);

  const closeViewer = () => {
    setViewerState((prev) => {
      cleanupBlobUrl(prev.fileUrl);
      return {
        isOpen: false,
        isLoading: false,
        fileUrl: '',
        error: '',
        fileName: 'Resume',
      };
    });
  };

  const handleViewResume = async (resumePath, fileName = 'Resume') => {
    if (!resumePath) {
      toast.error('Resume URL is missing');
      return;
    }

    setViewerState({
      isOpen: true,
      isLoading: true,
      fileUrl: '',
      error: '',
      fileName,
    });

    try {
      const localUrl = await fetchDocumentBlobUrl(resumePath);

      setViewerState((prev) => {
        cleanupBlobUrl(prev.fileUrl);
        return {
          ...prev,
          isLoading: false,
          fileUrl: localUrl,
        };
      });
    } catch (error) {
      console.error('Resume viewer fetch failed:', {
        resumePath,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        message: error?.message,
      });
      const errorMessage =
        `Unable to fetch resume document. ${error?.response?.status
          ? `Status ${error.response.status}`
          : error?.message || 'Please try again.'
        }`;
      setViewerState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom duration-700">
      <DocumentViewerModal
        isOpen={viewerState.isOpen}
        isLoading={viewerState.isLoading}
        fileUrl={viewerState.fileUrl}
        error={viewerState.error}
        title={viewerState.fileName}
        onClose={closeViewer}
      />

      <div role="tablist" className="tabs tabs-bordered border-white/5 bg-slate-900/40 p-2 rounded-2xl backdrop-blur-xl">
        <TabContent jobType="pending" arr={pending} onViewResume={handleViewResume} />
        <TabContent
          jobType="shortlisted"
          arr={shortlisted}
          onViewResume={handleViewResume}
        />
        <TabContent jobType="hired" arr={hired} onViewResume={handleViewResume} />
        <TabContent jobType="rejected" arr={rejected} onViewResume={handleViewResume} />
      </div>
    </div>
  );
};

const TabContent = ({ jobType, arr, onViewResume }) => {
  return (
    <>
      <input
        type="radio"
        name="applications"
        role="tab"
        className="tab capitalize font-bold text-slate-500 checked:!text-indigo-400 border-none transition-all duration-300 px-6"
        aria-label={jobType}
        defaultChecked={jobType === 'pending'}
      />
      <div role="tabpanel" className="tab-content mt-8 animate-in fade-in slide-in-from-bottom duration-700">
        {arr.length ? (
          <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-slate-900/20 backdrop-blur-sm">
            <table className="table w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-5 px-6 text-[10px] uppercase tracking-widest text-slate-500 font-black">Job Profile</th>
                  <th className="py-5 px-6 text-[10px] uppercase tracking-widest text-slate-500 font-black">Company</th>
                  <th className="py-5 px-6 text-[10px] uppercase tracking-widest text-slate-500 font-black">Cover Letter</th>
                  <th className="py-5 px-6 text-[10px] uppercase tracking-widest text-slate-500 font-black">Documents</th>
                  <th className="py-5 px-6 text-[10px] uppercase tracking-widest text-slate-500 font-black text-right">Portfolio</th>
                </tr>
              </thead>
              <tbody>
                {arr.map((application) => {
                  const { _id, coverLetter, resume, portfolio, job } = application;
                  const { _id: jobId, profile, company } = job;
                  return (
                    <tr key={_id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="py-5 px-6">
                        <Link
                          to={`/student-dashboard/jobs/${jobId}`}
                          className="text-white font-bold hover:text-indigo-400 transition-colors"
                        >
                          {profile}
                        </Link>
                      </td>
                      <td className="py-5 px-6">
                        <a
                          href={getCompanyWebsite(company?.website)}
                          className="flex items-center gap-2 text-slate-300 font-medium hover:text-indigo-400 transition-colors"
                          target="_blank"
                        >
                          {company?.name} <FiExternalLink size={12} className="opacity-50" />
                        </a>
                      </td>
                      <td className="py-5 px-6">
                        <p className="text-slate-400 text-sm italic max-w-xs truncate" title={coverLetter}>
                          {coverLetter || "No cover letter provided"}
                        </p>
                      </td>
                      <td className="py-5 px-6">
                        <button
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-indigo-600/20 hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
                          onClick={() =>
                            onViewResume(resume, `${profile || 'Job'} - Resume`)
                          }
                        >
                          View Resume
                        </button>
                      </td>
                      <td className="py-5 px-6 text-right">
                        {portfolio ? (
                          <a
                            href={portfolio}
                            target="_blank"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-indigo-600/20 hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
                          >
                            Portfolio <FiExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-slate-600 text-xs font-medium">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 rounded-[3rem] bg-slate-900/20 border border-dashed border-white/10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-3xl opacity-50">📂</div>
            <p className="text-slate-500 font-bold text-lg tracking-tight capitalize">No {jobType} applications found</p>
            <p className="text-slate-600 text-sm mt-1">Applied opportunities will appear here.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ApplicationsContainer;
