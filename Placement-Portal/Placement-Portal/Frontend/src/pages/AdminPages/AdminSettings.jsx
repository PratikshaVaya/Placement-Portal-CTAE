import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { customFetch } from '../../utils';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    uploadLimit: 100,
    dobPasswordEnabled: true,
    forcePasswordResetOnFirstLogin: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await customFetch.get('/admin/settings');
      if (data?.settings) {
        setSettings({
          uploadLimit: data.settings.uploadLimit ?? 100,
          dobPasswordEnabled: Boolean(data.settings.dobPasswordEnabled),
          forcePasswordResetOnFirstLogin: Boolean(
            data.settings.forcePasswordResetOnFirstLogin
          ),
        });
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch admin settings';
      toast.error(errorMessage);
    }
  };

  const handleSaveSettings = async (event) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      await customFetch.patch('/admin/settings', settings);
      toast.success('Admin settings updated');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to update admin settings';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    try {
      setIsChangingPassword(true);
      await customFetch.post('/admin/settings/change-password', passwordForm);
      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-slate-200">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Portal Settings</h1>
        <p className="text-slate-400 text-base md:text-lg">Configure system policies and administrative security</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* POLICIES FORM */}
        <form
          className="p-6 md:p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg space-y-6"
          onSubmit={handleSaveSettings}
        >
          <div>
            <h4 className="text-lg font-bold text-white mb-2">Import & Security Policies</h4>
            <div className="h-1 w-12 bg-indigo-500 rounded-full"></div>
          </div>

          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-slate-300 font-medium">Bulk Upload Limit (Rows)</span>
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                className="input input-bordered bg-slate-800/50 border-white/10 text-white focus:border-indigo-500 focus:bg-slate-800 transition-all"
                value={settings.uploadLimit}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    uploadLimit: Number(event.target.value),
                  }))
                }
              />
              <p className="text-[10px] text-slate-500 mt-1 italic">Maximum students allowed in a single CSV import (1 - 1000)</p>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary border-white/30"
                  checked={settings.dobPasswordEnabled}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      dobPasswordEnabled: event.target.checked,
                    }))
                  }
                />
                <span className="text-slate-300 group-hover:text-white transition-colors">Enable DOB-based password generation</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary border-white/30"
                  checked={settings.forcePasswordResetOnFirstLogin}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      forcePasswordResetOnFirstLogin: event.target.checked,
                    }))
                  }
                />
                <span className="text-slate-300 group-hover:text-white transition-colors">Force password reset on first login</span>
              </label>
            </div>
          </div>

          <button 
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50" 
            type="submit" 
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-xs"></span>
                Saving Changes...
              </span>
            ) : 'Save System Settings'}
          </button>
        </form>

        {/* PASSWORD FORM */}
        <form
          className="p-6 md:p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg space-y-6"
          onSubmit={handleChangePassword}
        >
          <div>
            <h4 className="text-lg font-bold text-white mb-2">Change Admin Password</h4>
            <div className="h-1 w-12 bg-rose-500 rounded-full"></div>
          </div>

          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-slate-300 font-medium">Current Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered bg-slate-800/50 border-white/10 text-white focus:border-rose-500 focus:bg-slate-800 transition-all"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: event.target.value,
                  }))
                }
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text text-slate-300 font-medium">New Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered bg-slate-800/50 border-white/10 text-white focus:border-rose-500 focus:bg-slate-800 transition-all"
                placeholder="••••••••"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: event.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-slate-300 font-medium">Confirm New Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered bg-slate-800/50 border-white/10 text-white focus:border-rose-500 focus:bg-slate-800 transition-all"
                placeholder="••••••••"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <button
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50"
            type="submit"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-xs"></span>
                Updating Security...
              </span>
            ) : 'Update Admin Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
