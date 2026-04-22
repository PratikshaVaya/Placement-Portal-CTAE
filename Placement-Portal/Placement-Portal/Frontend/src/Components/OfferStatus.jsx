import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { customFetch, getFileUrl } from '../utils';
import { setUser } from '../features/user/userSlice';

const OfferStatus = () => {
  const queryClient = useQueryClient();

  const { data: offerData, isLoading: offerLoading } = useQuery({
    queryKey: ['offer-status'],
    queryFn: async () => {
      const { data } = await customFetch.get('/student/offer');
      return data;
    },
  });

  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.userState.user);

  const acceptMutation = useMutation({
    mutationFn: () => customFetch.post('/student/offer/accept'),
    onSuccess: () => {
      toast.success('Offer accepted successfully!');
      queryClient.invalidateQueries({ queryKey: ['offer-status'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['single-job-applications'] });
      dispatch(
        setUser({
          user: {
            ...currentUser,
            hiredStatus: 'OFFER_ACCEPTED',
          },
        })
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to accept offer');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => customFetch.post('/student/offer/reject'),
    onSuccess: () => {
      toast.success('Offer rejected');
      queryClient.invalidateQueries({ queryKey: ['offer-status'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['single-job-applications'] });
      dispatch(
        setUser({
          user: {
            ...currentUser,
            hiredStatus: 'OFFER_REJECTED',
          },
        })
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to reject offer');
    },
  });

  const handleAccept = async () => {
    if (window.confirm('Are you sure you want to accept this offer?')) {
      acceptMutation.mutate();
    }
  };

  const handleReject = async () => {
    if (window.confirm('Are you sure you want to reject this offer? This action cannot be undone.')) {
      rejectMutation.mutate();
    }
  };

  if (offerLoading) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 animate-pulse">
        <div className="h-6 bg-white/10 rounded-full w-1/4 mb-4"></div>
        <div className="h-4 bg-white/5 rounded-full w-1/2"></div>
      </div>
    );
  }

  if (!offerData?.offer) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight mb-2">Offer Status</h3>
            <p className="text-slate-400 font-medium">
              No active offer is available right now. Once a company hires you, your offer details will appear here.
            </p>
          </div>
          <span className="px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest bg-white/5 text-slate-500 border border-white/5">
            No Active Offer
          </span>
        </div>
      </div>
    );
  }

  const { offer } = offerData;
  const isPending = offer.status === 'OFFER_SENT' || offer.status === 'pending';
  const isAccepted = offer.status === 'OFFER_ACCEPTED' || offer.status === 'accepted';
  const isRejected = offer.status === 'OFFER_REJECTED' || offer.status === 'rejected';

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden mb-8 shadow-2xl relative group">
      {isAccepted && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur opacity-30"></div>
      )}
      
      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-white/5 px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <h3 className="text-xl font-black text-white tracking-tight uppercase">Placement Offer</h3>
        </div>
        <span
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            isPending
              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
              : isAccepted
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              : isRejected
              ? 'bg-red-500/10 text-red-500 border-red-500/20'
              : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
          }`}
        >
          {offer.status.replace('_', ' ')}
        </span>
      </div>

      <div className="p-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Company Detail</h4>
              <p className="text-3xl font-black text-white tracking-tight leading-none mb-2">{offer.companyName || 'Campus Placement'}</p>
              <p className="text-indigo-400 font-bold text-lg">{offer.jobTitle || 'Software Engineer'}</p>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Message</h4>
              {isPending ? (
                <p className="text-slate-300 font-medium leading-relaxed">
                  Congratulations! You have been selected. Please review the official offer and respond to secure your position.
                </p>
              ) : isAccepted ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-emerald-400 font-bold leading-relaxed">
                    You have accepted this offer. Congratulations on your new role! 🎉
                  </p>
                </div>
              ) : isRejected ? (
                <p className="text-red-400 font-medium leading-relaxed">
                  You have declined this offer.
                </p>
              ) : (
                <p className="text-slate-300">Status: {offer.status}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:border-l lg:border-white/5 lg:pl-10">
            <div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Official Documents</h4>
              {offer.offerLetter ? (
                <a
                  href={getFileUrl(offer.offerLetter)}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/doc"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-2xl group-hover/doc:scale-110 transition-transform">
                    📄
                  </div>
                  <div>
                    <p className="text-white font-bold">Offer_Letter.pdf</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Click to view/download</p>
                  </div>
                </a>
              ) : (
                <div className="p-5 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
                  <p className="text-sm text-slate-500 font-medium italic">No document uploaded yet</p>
                </div>
              )}
            </div>

            {isPending && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4 mt-auto">
                <button
                  onClick={handleAccept}
                  disabled={acceptMutation.isPending}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                >
                  {acceptMutation.isPending ? 'Processing...' : 'Accept Offer'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                  className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 font-black text-sm uppercase tracking-widest transition-all border border-white/10 hover:border-red-500/20 active:scale-95 disabled:opacity-50"
                >
                  {rejectMutation.isPending ? 'Processing...' : 'Decline'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferStatus;
