import { Outlet, redirect } from 'react-router-dom';

import Navbar from '../Components/Navbar';
import { options } from '../Components/Student/NavOptions';
import { customFetch } from '../utils';

export const loader = () => {
  return async function ({ request }) {
    try {
      const { data } = await customFetch.get('/user/whoami');
      const { user } = data;
      const isResetRoute = request.url.includes('/student-dashboard/reset-password');

      if (user?.role === 'student' && user?.forcePasswordReset && !isResetRoute) {
        return redirect('/student-dashboard/reset-password');
      }

      if (
        user?.role === 'student' &&
        !user?.forcePasswordReset &&
        isResetRoute
      ) {
        return redirect('/student-dashboard');
      }

      return null;
    } catch (error) {
      return redirect('/');
    }
  };
};

const StudentDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col relative overflow-x-hidden">
      {/* Premium Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.05)_0%,transparent_50%)] pointer-events-none"></div>

      <Navbar options={options} />
      <div className="flex-1 p-4 md:p-8 lg:p-10 w-full max-w-7xl mx-auto smooth-gpu overscroll-none">
        <Outlet />
      </div>
    </div>
  );
};
export default StudentDashboard;
