import { Form } from 'react-router-dom';
import { FormInput } from '../';
import { useSelector } from 'react-redux';

const CompanyAdminModal = () => {
  const { action, admin, companyId, companyName } = useSelector(
    (state) => state.companyAdminModalState
  );
  return (
    <dialog id="companyAdminModal" className="modal backdrop-blur-sm">
      <div className="modal-box bg-slate-900 border border-white/10 shadow-2xl p-0 overflow-hidden max-w-xl">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="font-bold text-xl text-white capitalize leading-tight">
              {action} Admin
            </h3>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{companyName}</p>
          </div>
          <form method="dialog">
            <button className="text-white/70 hover:text-white transition-colors">
              <span className="text-2xl">✕</span>
            </button>
          </form>
        </div>

        <div className="p-6">
          <Form
            method="POST"
            className="flex flex-col gap-6"
            name="companyAdminForm"
          >
            <input type="text" name="companyId" defaultValue={companyId} hidden />
            {action === 'update' && (
              <input type="text" name="adminId" defaultValue={admin._id} hidden />
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                label="Full Name"
                name="companyAdminName"
                type="text"
                defaultValue={admin?.name}
                className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
              />

              <FormInput
                label="Email Address"
                name="companyAdminEmail"
                type="email"
                defaultValue={admin?.email}
                className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
              />

              {action === 'add' && (
                <>
                  <FormInput
                    label="Initial Password"
                    name="companyAdminPassword"
                    type="password"
                    className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
                  />

                  <FormInput
                    label="Confirm Password"
                    name="confirmAdminPassword"
                    type="password"
                    className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
                  />
                </>
              )}

              <div className="md:col-span-2">
                <FormInput
                  label="Designation / Role"
                  name="adminRole"
                  type="text"
                  defaultValue={admin?.companyRole}
                  placeholder="e.g. HR Manager, Technical Recruiter"
                  className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
                />
              </div>
            </div>

            <div id="companyAdminFormError" className="text-rose-400 text-sm font-medium empty:hidden"></div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
              name="intent"
              value={`${action}CompanyAdmin`}
            >
              {action === 'add' ? 'Create Admin Account' : 'Update Admin Access'}
            </button>
          </Form>
        </div>
      </div>
    </dialog>
  );
};
export default CompanyAdminModal;
