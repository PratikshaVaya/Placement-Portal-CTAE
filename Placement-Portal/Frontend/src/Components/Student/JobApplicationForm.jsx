import { Form } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { FileInput, FormInput, Textarea } from '../';

const JobApplicationForm = () => {
  const jobApply = useSelector((state) => state?.jobState?.jobApply);
  const profile = jobApply?.profile || '';
  const company = jobApply?.company || '';
  const isEligible = jobApply?.isEligible;
  const reasons = jobApply?.reasons || [];

  return (
    <dialog id="jobApplicationModal" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
      <div className="modal-box bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl max-w-2xl">
        <div className="mb-8">
          <h3 className="text-2xl font-black text-white tracking-tight">
            Apply for <span className="text-indigo-400">Position</span>
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-slate-200 font-bold text-lg">{profile}</span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-400 font-medium">{company}</span>
          </div>
        </div>

        <Form
          method="POST"
          encType="multipart/form-data"
          className="space-y-6"
        >
          <div className="grid gap-6">
            <FormInput 
              label="Portfolio / Project Link" 
              name="portfolio" 
              type="url" 
              placeholder="https://github.com/your-profile"
            />
            
            <Textarea
              label="Cover Letter / Why should we hire you?"
              name="coverLetter"
              placeholder="Share your motivation and relevant experience for this role..."
              rows={4}
            />
            
            <FileInput
              label="Update Resume (Optional - PDF only)"
              name="resumeFile"
              accept="application/pdf"
            />
          </div>

          <div id="jobApplicationFormError" className="text-red-500 text-sm font-medium"></div>

          {isEligible === false && (
            <div className="p-6 rounded-[2rem] bg-black/40 border border-red-500/40 text-red-400 animate-in slide-in-from-bottom duration-500 shadow-inner">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-xl">⚠️</div>
                <p className="font-black text-lg tracking-tight">Not Eligible to Apply</p>
              </div>
              {reasons.length > 0 && (
                <div className="ml-13">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-2">Requirement Mismatch:</p>
                  <ul className="space-y-2">
                    {reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm font-medium flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-red-500 shrink-0"></span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <form method="dialog">
              <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition-all">
                Cancel
              </button>
            </form>
            <button
              type="submit"
              className={`px-10 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                isEligible === false 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20'
              }`}
              name="intent"
              value="jobApplyAction"
              disabled={isEligible === false}
            >
              Submit Application
            </button>
          </div>
        </Form>
      </div>
    </dialog>
  );
};
export default JobApplicationForm;
