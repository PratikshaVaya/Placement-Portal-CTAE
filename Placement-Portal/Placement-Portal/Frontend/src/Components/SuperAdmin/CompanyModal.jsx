import { Form } from 'react-router-dom';
import { FormInput, Textarea } from '../';
import { useSelector } from 'react-redux';

const CompanyModal = () => {
  const { action, company } = useSelector((state) => state.companyModalState);

  const formatAccessTill = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };
  return (
    <dialog id="companyModal" className="modal backdrop-blur-sm">
      <div className="modal-box bg-slate-900 border border-white/10 shadow-2xl p-0 overflow-hidden max-w-xl">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-xl text-white capitalize">
            {action} Company
          </h3>
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
            name="companyForm"
          >
            {action === 'update' && (
              <input
                type="text"
                name="companyId"
                defaultValue={company?._id}
                hidden
              />
            )}
            
            <div className="grid gap-5">
              <FormInput
                label="Company Name"
                name="companyName"
                type="text"
                defaultValue={company?.name || ''}
                className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
              />

              <FormInput
                label="Primary Contact Email"
                name="companyEmail"
                type="email"
                defaultValue={company?.email || ''}
                className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
              />

              <FormInput
                label="Official Website"
                name="website"
                type="url"
                defaultValue={company?.website || ''}
                className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
              />

              <FormInput
                label="Dashboard Access Duration"
                name="accessTill"
                type="date"
                defaultValue={formatAccessTill(company?.accessTill)}
                className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
              />

              <Textarea
                label="Company Overview"
                name="about"
                placeholder="Write a brief description of the company..."
                defaultValue={company?.about || ''}
                className="bg-slate-800/50 border-white/10 text-white h-32 focus:border-indigo-500"
              />
            </div>

            <div id="companyFormError" className="text-rose-400 text-sm font-medium empty:hidden"></div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
              name="intent"
              value={`${action}Company`}
            >
              {action === 'add' ? 'Register Company' : 'Save Changes'}
            </button>
          </Form>
        </div>
      </div>
    </dialog>
  );
};
export default CompanyModal;
