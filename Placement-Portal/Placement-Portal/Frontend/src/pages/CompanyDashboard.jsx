import Navbar from '../Components/Navbar';
import { Outlet, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';

import { options } from '../Components/CompanyAdmin/NavOptions';
import { fetchCourseOptions } from '../utils';
import { setCourseOptions } from '../features/courseOptions/courseOptions';

export const loader = (queryClient, store) => {
  return async function () {
    try {
      const { options } = await queryClient.ensureQueryData(
        fetchCourseOptions()
      );
      store.dispatch(setCourseOptions({ options }));
      return true;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch courses!';
      console.log(error);
      toast.error(errorMessage);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return redirect('/');
      }
      return error;
    }
  };
};

const CompanyDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col relative overflow-x-hidden">
      {/* Premium Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.05)_0%,transparent_50%)] pointer-events-none"></div>

      <Navbar options={options} />
      <div className="flex-1 p-4 md:p-8 lg:p-10 w-full max-w-7xl mx-auto">
        <Outlet />
      </div>
    </div>
  );
};
export default CompanyDashboard;
