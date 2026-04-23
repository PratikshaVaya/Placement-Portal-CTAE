import { Form, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLock } from 'react-icons/fi';

import { customFetch } from '../utils';
import { FormInput } from '../Components';


export const action = (store, setUser) => {
  return async function ({ request }) {
    const formData = await request.formData();
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return null;
    }

    try {
      await customFetch.post('/company/change-password', {
        currentPassword,
        newPassword,
      });

      const { data } = await customFetch.get('/user/whoami');
      store.dispatch(setUser({ user: data.user }));

      toast.success('Password updated successfully');
      return redirect('/company-dashboard');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to update password';
      toast.error(errorMessage);
      return null;
    }
  };
};

const CompanyPasswordChange = () => {
  return (
    <div className="flex items-center justify-center min-h-[80vh] animate-in fade-in zoom-in duration-700">
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -mr-24 -mt-24 transition-all duration-500 group-hover:bg-indigo-500/10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl -ml-24 -mb-24 transition-all duration-500 group-hover:bg-purple-500/10"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FiLock size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Security</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Update access credentials</p>
            </div>
          </div>

          <Form method="post" className="space-y-6">
            <div className="space-y-4">
              <FormInput
                label="Current Password"
                name="currentPassword"
                type="password"
                placeholder="••••••••"
              />
              <FormInput
                label="New Password"
                name="newPassword"
                type="password"
                placeholder="••••••••"
              />
              <FormInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
              >
                Sync New Password
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CompanyPasswordChange;
