import { customFetch, fetchSingleJobApplicationsQuery } from '../utils';
import { SingleJobApplication } from '../Components';
import { useLoaderData } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export const action = (queryClient, store) => {
  return async function ({ request }) {
    return null;
  };
};

export const loader = (queryClient, store) => {
  return async function ({ params }) {
    const jobId = params.jobId;
    try {
      const { job } = await queryClient.ensureQueryData(
        fetchSingleJobApplicationsQuery(jobId)
      );
      return { job, jobId };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch job!';
      console.log(error);
      toast.error(errorMessage);
      return null;
    }
  };
};

const SingleJobApplications = () => {
  const { job, jobId } = useLoaderData();

  const query = fetchSingleJobApplicationsQuery(jobId);
  const { data: queryData, isLoading } = useQuery({
    ...query,
    initialData: { job },
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const currentJob = queryData?.job || job;

  return (
    <div>
      <SingleJobApplication
        jobId={jobId}
        profile={currentJob?.profile}
        openingsCount={currentJob?.openingsCount}
        deadline={currentJob?.deadline}
        applications={currentJob?.applications}
        isLoading={isLoading}
      />
    </div>
  );
};
export default SingleJobApplications;
