import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { customFetch, cleanupBlobUrl, fetchDocumentBlobUrl } from '../utils';
import DocumentViewerModal from './DocumentViewerModal';

const OfferUploadModal = ({ applicationId, onClose }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: offerData } = useQuery({
    queryKey: ['offer-details', applicationId],
    queryFn: async () => {
      const { data } = await customFetch.get(`/company/applications/${applicationId}/offer`);
      return data;
    },
  });

  const [viewerState, setViewerState] = useState({
    isOpen: false,
    isLoading: false,
    fileUrl: '',
    error: '',
    title: 'Offer Letter',
  });

  // Handle Escape key to close
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

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
        title: 'Offer Letter',
      };
    });
  };

  const openDocumentViewer = async (sourceUrl, title = 'Offer Letter') => {
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

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      await customFetch.post(`/company/applications/${applicationId}/offer-letter`, formData);
    },
    onSuccess: () => {
      toast.success('Offer letter uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['offer-details', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['single-job-applications'] });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to upload offer letter');
    },
  });

  const handleUpload = () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('offerLetter', file);

    uploadMutation.mutate(formData);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('document') && !selectedFile.type.includes('word')) {
        toast.error('Please upload a PDF or document file');
        return;
      }
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size should not exceed 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const offer = offerData?.offer;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl max-w-md w-full p-8 relative overflow-hidden group">
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-500/20"></div>
        
        <h2 className="text-3xl font-black text-white tracking-tight mb-6 flex items-center gap-3 relative z-10">
          <div className="w-1.5 h-8 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
          Upload Offer <span className="text-indigo-400">Letter</span>
        </h2>

        {offer?.status === 'OFFER_ACCEPTED' || offer?.status === 'accepted' ? (
          <div className="relative z-10">
            <div className="mb-8">
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                The student has accepted the offer. Please upload the formal offer letter document to finalize the process.
              </p>

              {offer?.offerLetter && (
                <div className="mb-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 backdrop-blur-xl shadow-inner group/success">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      ✓
                    </div>
                    <div>
                      <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">
                        Already Uploaded
                      </p>
                      <button
                        type="button"
                        onClick={() => openDocumentViewer(offer.offerLetter, 'Current Offer Letter')}
                        className="text-indigo-400 hover:text-indigo-300 text-[10px] font-bold underline mt-1 block transition-colors text-left"
                      >
                        View Current Document
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Select PDF or Document
                </label>
                <div className="relative group/input">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    disabled={uploadMutation.isPending}
                    className="hidden"
                    id="offer-file-upload"
                  />
                  <label
                    htmlFor="offer-file-upload"
                    className="flex items-center justify-between w-full bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer group-hover/input:border-indigo-500/50 transition-all duration-300 shadow-inner"
                  >
                    <span className="text-slate-400 text-xs font-medium truncate max-w-[200px]">
                      {file ? file.name : "No file chosen"}
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest group-hover/input:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
                      Choose File
                    </span>
                  </label>
                </div>
                <p className="text-[9px] text-slate-500 italic ml-1 italic">Maximum file size: 10MB (PDF, DOCX)</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                disabled={uploadMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploadMutation.isPending}
                className={`flex-1 py-4 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                  !file || uploadMutation.isPending 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25'
                }`}
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Now'}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 bg-rose-500/5 border border-rose-500/20 rounded-3xl p-8 text-center backdrop-blur-xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
            <h4 className="text-white font-black text-lg mb-2">Access Restricted</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              You can only upload an offer letter after the student accepts the offer.
            </p>
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8">
              Current Status: <span className="text-rose-400 ml-1">{offer?.status?.toUpperCase() || 'UNKNOWN'}</span>
            </div>
            <button 
              onClick={onClose} 
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Back to Applications
            </button>
          </div>
        )}
      </div>
      {/* Standardized Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={viewerState.isOpen}
        isLoading={viewerState.isLoading}
        fileUrl={viewerState.fileUrl}
        error={viewerState.error}
        title={viewerState.title}
        onClose={closeViewer}
      />
    </div>
  );
};

export default OfferUploadModal;
