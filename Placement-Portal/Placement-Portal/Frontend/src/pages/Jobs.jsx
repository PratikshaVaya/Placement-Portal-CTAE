import { toast } from 'react-toastify';
import { redirect, useLoaderData } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';

import { JobsContainer, SelectInput, JobApplicationForm } from '../Components';

import {
  changeFilter,
  setCurrentJobs,
  resetJobApply,
  setHiredStatus,
} from '../features/jobs/jobsSlice';

import {
  customFetch,
  fetchJobsQuery,
  getStudentJobFilters,
  getCompanyJobFilters,
} from '../utils';

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
  return async function () {
    const { role } = store.getState()?.userState?.user;

    try {
      const response = await queryClient.ensureQueryData(
        fetchJobsQuery({ role, status: 'open' })
      );
      const { jobs, hiredStatus, hiredJobId, error } = response;
      store.dispatch(setCurrentJobs({ jobs }));
      if (role === 'student') {
        store.dispatch(setHiredStatus({ hiredStatus, hiredJobId }));
      }
      return { error };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch jobs!';
      console.log(error);
      toast.error(errorMessage);
      return null;
    }
  };
};

const Jobs = () => {
  const { error: profileError } = useLoaderData() || {};
  const { currentFilter, currentJobs } = useSelector((state) => state.jobState);
  const { role } = useSelector((state) => state.userState.user);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const urgentJobsCount = currentJobs.filter((job) => {
    const now = new Date();
    const deadline = new Date(job.deadline);
    const diffDays = Math.floor(
      (deadline.setHours(23, 59, 59, 999) - now) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 0 && diffDays <= 2;
  }).length;

  let jobOptions;
  if (role == 'student') jobOptions = getStudentJobFilters;
  if (role == 'company_admin') jobOptions = getCompanyJobFilters;

  async function handleJobChange(e) {
    const newFilter = e.currentTarget.value;
    dispatch(changeFilter({ newFilter }));
    const { jobs } = await queryClient.ensureQueryData(
      fetchJobsQuery({ status: newFilter, role })
    );
    dispatch(setCurrentJobs({ jobs }));
  }

  return (
    <section className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight">Available <span className="text-indigo-400">Opportunities</span></h3>
            <p className="text-slate-400 text-sm font-medium mt-1">Explore and apply for the latest job openings</p>
          </div>
        </div>
        
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex items-center gap-4">
          <SelectInput
            options={jobOptions}
            label="Filter Opportunities"
            value={currentFilter}
            id="jobFilterSelect"
            changeFn={handleJobChange}
          />
        </div>
      </div>

      {profileError && (
        <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-red-400 flex items-center gap-4 backdrop-blur-xl animate-in slide-in-from-top duration-500">
          <div className="p-2 rounded-xl bg-red-500/10 text-xl">⚠️</div>
          <p className="font-medium">{profileError}</p>
        </div>
      )}

      {role === 'student' && currentFilter === 'open' && urgentJobsCount > 0 && (
        <div className="mb-8 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 text-orange-400 flex items-center gap-4 backdrop-blur-xl animate-in slide-in-from-top duration-500 delay-100">
          <div className="p-2 rounded-xl bg-orange-500/10 text-xl">🔥</div>
          <p className="font-medium">
            <span className="text-white font-black">{urgentJobsCount}</span> job{urgentJobsCount > 1 ? 's' : ''} closing in 2 days. Apply soon!
          </p>
        </div>
      )}

      <JobsContainer />

      {role === 'student' && currentFilter === 'open' && <JobApplicationForm />}
    </section>
  );
};
export default Jobs;
