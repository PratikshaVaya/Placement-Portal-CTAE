import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { customFetch } from '../utils';
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-blue-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!offerData?.offer) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-blue-900">Offer Status</h3>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
            No Offer
          </span>
        </div>
        <div>
          <p className="text-blue-800">
            No active offer is available right now. Once a company hires you and sends an offer, the details will appear here.
          </p>
          {offerData?.message && (
            <p className="mt-2 text-sm text-slate-600">{offerData.message}</p>
          )}
        </div>
      </div>
    );
  }

  const { offer } = offerData;
  const isPending = offer.status === 'OFFER_SENT' || offer.status === 'pending';
  const isAccepted = offer.status === 'OFFER_ACCEPTED' || offer.status === 'accepted';
  const isRejected = offer.status === 'OFFER_REJECTED' || offer.status === 'rejected';

  return (
    <div className="bg-white border border-blue-100 rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Project Placement Offer</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isPending
              ? 'bg-yellow-400 text-yellow-900'
              : isAccepted
              ? 'bg-green-400 text-green-900'
              : isRejected
              ? 'bg-red-400 text-red-900'
              : 'bg-blue-400 text-blue-900'
          }`}
        >
          {offer.status.replace('_', ' ')}
        </span>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Company Detail</h4>
          <p className="text-2xl font-bold text-gray-800">{offer.companyName || 'Campus Placement'}</p>
          <p className="text-gray-600">{offer.jobTitle || 'Software Engineer'}</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Message</h4>
            {isPending ? (
              <p className="text-gray-700">
                Congratulations! You have been selected for this position. Please review the offer and respond accordingly.
              </p>
            ) : isAccepted ? (
              <p className="text-green-700 font-medium">
                You have accepted this offer. Congratulations on your new role!
              </p>
            ) : isRejected ? (
              <p className="text-red-700">
                You have declined this offer.
              </p>
            ) : (
              <p className="text-gray-700">
                Status: {offer.status}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start gap-2 min-w-[200px]">
            <h4 className="text-sm font-semibold text-gray-500 uppercase">Documents</h4>
            {offer.offerLetter ? (
              <a
                href={offer.offerLetter}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold underline decoration-2 underline-offset-4"
              >
                📄 Download Offer Letter
              </a>
            ) : (
              <p className="text-sm text-gray-400 italic">No document uploaded yet</p>
            )}
          </div>
        </div>

        {isPending && (
          <div className="flex flex-wrap gap-4 border-t pt-6">
            <button
              onClick={handleAccept}
              disabled={acceptMutation.isPending}
              className="btn btn-success text-white px-8 flex-1 sm:flex-none font-bold"
            >
              {acceptMutation.isPending ? 'Accepting...' : 'Accept Offer'}
            </button>
            <button
              onClick={handleReject}
              disabled={rejectMutation.isPending}
              className="btn btn-error text-white px-8 flex-1 sm:flex-none font-bold"
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject Offer'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferStatus;