import { Form } from 'react-router-dom';
import { FormInput } from '../';

const BatchModal = ({ modalData }) => {
  const { action, batch, courseId } = modalData;
  return (
    <dialog id="batchModal" className="modal backdrop-blur-sm">
      <div className="modal-box bg-slate-900 border border-white/10 shadow-2xl p-0 overflow-hidden max-w-md">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-xl text-white capitalize">
            {action} Batch
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
            name="batchForm"
          >
            <input type="text" name="courseId" defaultValue={courseId} hidden />
            {action === 'update' && (
              <input
                type="text"
                name="batchId"
                defaultValue={batch?.batchId}
                hidden
              />
            )}
            
            <div className="grid gap-5">
              <FormInput
                label="Passing Year (Batch)"
                name="batchYear"
                type="text"
                defaultValue={batch?.batchYear}
                placeholder="e.g. 2025"
                className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
              />
            </div>

            <div id="batchFormError" className="text-rose-400 text-sm font-medium empty:hidden"></div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
              name="intent"
              value={`${action}Batch`}
            >
              {action === 'add' ? 'Create Batch' : 'Update Batch'}
            </button>
          </Form>
        </div>
      </div>
    </dialog>
  );
};

export default BatchModal;
