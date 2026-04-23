import { Form, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';

import { customFetch } from '../utils';

export const action = (store, setUser) => {
  return async function ({ request }) {
    const formData = await request.formData();
    try {
      await customFetch.post('/student/change-password', {
        oldPassword: formData.get('oldPassword'),
        newPassword: formData.get('newPassword'),
        confirmPassword: formData.get('confirmPassword'),
      });

      const { data } = await customFetch.get('/user/whoami');
      store.dispatch(setUser({ user: data.user }));

      toast.success('Password updated successfully');
      return redirect('/student-dashboard');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to update password';
      toast.error(errorMessage);
      return null;
    }
  };
};

const StudentPasswordReset = () => {
  return (
    <section className="p-4 sm:p-8 max-w-xl mx-auto animate-in fade-in zoom-in duration-700">
      <div className="relative rounded-[3rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 p-10 shadow-2xl overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-[80px] -mr-24 -mt-24"></div>
        
        <div className="relative z-10 text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-6 text-3xl">🔐</div>
          <h2 className="text-3xl font-black text-white tracking-tight">Security <span className="text-indigo-400">Update</span></h2>
          <p className="text-slate-400 font-medium mt-2">
            Your account requires a password update before you can access the dashboard.
          </p>
        </div>

        <Form method="post" className="relative z-10 flex flex-col gap-6">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-black ml-4">Current Password</label>
            <input
              type="password"
              name="oldPassword"
              placeholder="••••••••"
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-black ml-4">New Password</label>
            <input
              type="password"
              name="newPassword"
              placeholder="••••••••"
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-black ml-4">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              required
            />
          </div>

          <button 
            type="submit" 
            className="mt-4 px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm transition-all shadow-2xl shadow-indigo-500/30 active:scale-95"
          >
            Secure My Account
          </button>
        </Form>
      </div>
    </section>
  );
};

export default StudentPasswordReset;
