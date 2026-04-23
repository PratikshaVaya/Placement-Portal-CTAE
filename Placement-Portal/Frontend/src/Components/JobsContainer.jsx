import SingleJob from './SingleJobContainer';
import { useSelector } from 'react-redux';

const JobsContainer = () => {
  const { currentJobs, currentFilter } = useSelector((state) => state.jobState);
  const role = useSelector((state) => state.userState.user.role);

  if (!currentJobs.length)
    return (
      <div className="flex flex-col items-center justify-center p-20 rounded-[3rem] bg-slate-900/20 border border-dashed border-white/10 animate-in fade-in zoom-in duration-700">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 text-3xl">🔍</div>
        <h3 className="capitalize text-2xl font-black text-white tracking-tight">No Opportunities Found</h3>
        <p className="text-slate-500 font-medium mt-2">Try adjusting your filters or check back later.</p>
      </div>
    );

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {currentJobs.map((job) => (
        <SingleJob job={job} status={currentFilter} role={role} key={job._id} />
      ))}
    </div>
  );
};
export default JobsContainer;
