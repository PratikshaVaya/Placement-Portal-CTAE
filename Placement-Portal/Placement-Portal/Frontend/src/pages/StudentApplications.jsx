import { StudentApplicationContainer } from '../Components';
import { fetchStudentApplications } from '../utils';
import { toast } from 'react-toastify';

export const loader = (queryClient, store) => {
  return async function () {
    try {
      const { applications } = await queryClient.ensureQueryData(
        fetchStudentApplications()
      );
      return { applications };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch applications!';
      console.log(error);
      toast.error(errorMessage);
      return null;
    }
  };
};

const StudentApplications = () => {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1.5 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
        <div>
          <h3 className="text-3xl font-black text-white tracking-tight">Your <span className="text-indigo-400">Applications</span></h3>
          <p className="text-slate-400 text-sm font-medium mt-1">Track the status of your recent job applications</p>
        </div>
      </div>
      
      <StudentApplicationContainer />
    </div>
  );
};
export default StudentApplications;
