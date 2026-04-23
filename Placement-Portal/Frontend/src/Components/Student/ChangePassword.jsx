import { Form, useSubmit } from 'react-router-dom';
import { SimpleFormInput } from '../';

const ChangePassword = () => {
  const submit = useSubmit();

  const handleSubmit = (e) => {
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('intent', 'changePassword');
    submit(formData, { method: 'post' });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-700">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
            <h3 className="text-2xl font-black text-white tracking-tight">Security</h3>
          </div>

          <Form
            method="POST"
            className="flex flex-col gap-y-10"
            onSubmit={handleSubmit}
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <SimpleFormInput
                name="oldPassword"
                type="password"
                label="Current Password"
                placeholder="••••••••"
              />
              <SimpleFormInput
                name="newPassword"
                type="password"
                label="New Password"
                placeholder="••••••••"
              />
              <SimpleFormInput
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                name="intent"
                value="changePassword"
              >
                Update Password
              </button>
            </div>
          </Form>
        </div>
      </div>
  );
};

export default ChangePassword;
