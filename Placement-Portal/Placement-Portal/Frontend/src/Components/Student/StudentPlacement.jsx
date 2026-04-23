import { redirect } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlusSquare, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient, useQuery } from '@tanstack/react-query';

import { customFetch, fetchStudentPlacements, getFileUrl, fetchDocumentBlobUrl, cleanupBlobUrl } from '../../utils';
import { setPlacements } from '../../features/studentProfile/studentProfileSlice';
import PlacementModal from './PlacementModal';
import DocumentViewerModal from '../DocumentViewerModal';
import { useEffect } from 'react';

const StudentPlacement = () => {
  const { placements, type } = useSelector(
    (state) => state?.studentProfileState
  );
  
  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: ['student_applications'],
    queryFn: async () => {
      const { data } = await customFetch.get('/student/applications');
      return data;
    },
  });

  const [modalData, setModalData] = useState({
    action: 'create',
    onCampus: false,
  });

  const [viewerState, setViewerState] = useState({
    isOpen: false,
    isLoading: false,
    fileUrl: '',
    error: '',
    title: 'Document',
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
        title: 'Document',
      };
    });
  };

  const openDocumentViewer = async (sourceUrl, title = 'Document') => {
    if (!sourceUrl) {
      toast.error('Document URL is missing');
      return;
    }

    setViewerState({
      isOpen: true,
      isLoading: true,
      fileUrl: '',
      error: '',
      title,
    });

    try {
      const localUrl = await fetchDocumentBlobUrl(sourceUrl);
      setViewerState((prev) => {
        cleanupBlobUrl(prev.fileUrl);
        return {
          ...prev,
          isLoading: false,
          fileUrl: localUrl,
        };
      });
    } catch (error) {
      const message = `Unable to open document. ${error?.response?.status
          ? `Status ${error.response.status}`
          : error?.message || 'Please try again.'
        }`;
      setViewerState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  };

  // Extract hiring events from applications
  const portalPlacements = (applicationsData?.applications || []).reduce((acc, curr) => {
    const apps = curr.application || [];
    const status = curr._id.status;
    
    if (['HIRED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'OFFER_SENT'].includes(status)) {
      apps.forEach(app => {
        acc.push({
          _id: app._id,
          jobProfile: app.job?.profile,
          company: app.job?.company?.name,
          status: status,
          offerLetter: app.offerLetterUrl,
          isPortal: true,
          isOnCampus: true, // Portal jobs are considered on-campus in this context
          package: app.job?.package,
          location: app.job?.location
        });
      });
    }
    return acc;
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-700">
      <PlacementModal modalData={modalData} />
      <DocumentViewerModal
        isOpen={viewerState.isOpen}
        isLoading={viewerState.isLoading}
        fileUrl={viewerState.fileUrl}
        error={viewerState.error}
        title={viewerState.title}
        onClose={closeViewer}
      />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-12 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Career <span className="text-indigo-400">Placements</span></h1>
            <p className="text-slate-400 font-medium mt-1">Manage and track your official placement records.</p>
          </div>
        </div>

        {type === 'private' && (
          <button
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-3 group"
            onClick={() => {
              setModalData({ action: 'create', onCampus: false });
              document.getElementById('placementModal').showModal();
            }}
          >
            <div className="p-1 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
              <FaPlusSquare className="text-lg" />
            </div>
            <span>Add Off-Campus Record</span>
          </button>
        )}
      </header>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Portal Placements (Automatic) */}
          {portalPlacements.map((app) => (
            <div key={app._id} className="group rounded-[2.5rem] bg-slate-900/60 backdrop-blur-md border border-indigo-500/30 p-8 hover:bg-slate-800/60 transition-all duration-300 shadow-2xl relative overflow-hidden ring-1 ring-white/5 smooth-gpu">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-indigo-500/15 transition-colors"></div>
              
              <div className="flex justify-between items-start gap-4 mb-6 relative z-10">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white tracking-tight leading-tight group-hover:text-indigo-300 transition-colors">{app.jobProfile}</h3>
                  <p className="text-slate-400 font-bold text-sm mt-1">{app.company}</p>
                </div>
                <div className="flex flex-col gap-2 items-end shrink-0">
                  <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    On Campus
                  </span>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex flex-col gap-3">
                  {app.status === 'OFFER_ACCEPTED' || app.status === 'HIRED' ? (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40">
                        <FaCheckCircle size={14} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest block leading-none">Status</span>
                        <span className="font-black text-sm">Offer Accepted</span>
                      </div>
                    </div>
                  ) : app.status === 'OFFER_REJECTED' ? (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                      <div className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/40">
                        <FaTimesCircle size={14} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest block leading-none">Status</span>
                        <span className="font-black text-sm">Offer Rejected</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/40 animate-pulse">
                        <span className="text-xs">⏳</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest block leading-none">Status</span>
                        <span className="font-black text-sm">Offer Pending</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Package</span>
                    <span className="text-emerald-400 font-black text-sm">{app.package || 'N/A'} LPA</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Source</span>
                    <span className="text-indigo-300 font-black text-sm uppercase tracking-tighter">Portal</span>
                  </div>
                </div>

                {app.offerLetter && (
                  <button 
                    type="button"
                    onClick={() => openDocumentViewer(app.offerLetter, 'Offer Letter')}
                    className="w-full py-4 px-4 rounded-2xl bg-white/5 border border-white/10 text-center text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all block mt-4 group/btn"
                  >
                    <span className="flex items-center justify-center gap-2">
                      View Offer Letter
                      <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                    </span>
                  </button>
                )}
              </div>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
                <span className="text-[40px] font-black text-white/5 uppercase select-none tracking-tighter">OFFICIAL</span>
              </div>
            </div>
          ))}

          {/* Manual Placements */}
          {placements?.length ? (
            placements.map((placement) => (
              <PlacementContainer
                key={placement._id}
                placement={placement}
                setModalData={setModalData}
                openDocumentViewer={openDocumentViewer}
                type={type}
              />
            ))
          ) : (!portalPlacements.length && !appsLoading) ? (
            <div className="sm:col-span-2 lg:col-span-3 p-20 rounded-[3rem] bg-slate-900/40 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-3xl mb-6">📂</div>
              <h4 className="text-white font-black text-xl mb-2">No Records Found</h4>
              <p className="text-slate-500 max-w-xs">Your official and manual placement records will appear here once available.</p>
            </div>
          ) : null}
        </div>
      </div>
  );
};

const PlacementContainer = ({ placement, setModalData, openDocumentViewer, type }) => {
  const {
    jobProfile,
    company,
    location,
    package: packageAMT,
    offerLetter,
    joiningLetter,
    isOnCampus,
  } = placement;
  let { joiningDate } = placement;

  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  if (joiningDate) joiningDate = new Date(joiningDate).toLocaleDateString();

  return (
    <div className="group rounded-[2.5rem] bg-slate-900/40 backdrop-blur-md border border-white/10 p-8 hover:bg-slate-800/60 transition-all duration-300 shadow-2xl relative overflow-hidden smooth-gpu">
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-purple-500/10 transition-colors"></div>
      
      <div className="flex justify-between items-start gap-4 mb-6 relative z-10">
        <div className="flex-1">
          <h3 className="text-xl font-black text-white tracking-tight leading-tight group-hover:text-indigo-300 transition-colors">{jobProfile}</h3>
          <p className="text-indigo-400 font-bold text-sm mt-1">{company}</p>
        </div>
        
        <div className="flex flex-col items-end gap-2 shrink-0">
          {type === 'private' && !isOnCampus && (
            <div className="flex items-center gap-2">
              <button
                className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-600 transition-all"
                onClick={() => {
                  setModalData({
                    action: 'update',
                    placement,
                    onCampus: false,
                  });
                  document.getElementById('placementFormError').innerText = '';
                  document.getElementById('placementModal').showModal();
                }}
              >
                <FaEdit size={16} />
              </button>
              <button
                className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-red-600 transition-all"
                onClick={() =>
                  handleDeletePlacement({
                    dispatch,
                    queryClient,
                    id: placement._id,
                  })
                }
              >
                <FaTrash size={16} />
              </button>
            </div>
          )}
          {isOnCampus && (
            <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              On Campus
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Package</span>
            <span className="text-slate-200 font-black text-sm">{packageAMT} LPA</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Location</span>
            <span className="text-slate-200 font-black text-sm truncate">{location}</span>
          </div>
        </div>

        {joiningDate && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Joining Date</span>
            <span className="text-slate-300 font-bold text-sm">{joiningDate}</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {offerLetter && (
            <button 
              type="button"
              onClick={() => openDocumentViewer(offerLetter, 'Offer Letter')}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-center text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
            >
              Offer Letter
            </button>
          )}
          {joiningLetter && (
            <button 
              type="button"
              onClick={() => openDocumentViewer(joiningLetter, 'Joining Letter')}
              className="flex-1 py-3 px-4 rounded-xl bg-purple-600/10 border border-purple-500/30 text-center text-[10px] font-black uppercase tracking-widest text-purple-400 hover:bg-purple-600 hover:text-white transition-all"
            >
              Joining Letter
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

async function handleDeletePlacement({ queryClient, dispatch, id }) {
  try {
    await customFetch.delete(`/student/placement/${id}`);
    queryClient.removeQueries({ queryKey: ['placements'] });
    const { placements } = await queryClient.fetchQuery(
      fetchStudentPlacements()
    );
    dispatch(setPlacements({ placements }));
    toast.success('Placement deleted successfully!');
    return redirect('/student-dashboard/');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || 'Failed to delete placement!';
    toast.error(errorMessage);
    return error;
  }
}

export default StudentPlacement;
