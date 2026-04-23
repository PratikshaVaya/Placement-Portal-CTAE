import { FaEdit, FaTrash, FaPlusSquare } from 'react-icons/fa';
import { redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

const BatchesTab = ({ batches, courseId, setModalData }) => {
  return (
    <>
      <input
        type="radio"
        name={`course-tab-${courseId}`}
        role="tab"
        className="tab sm:text-lg font-semibold text-slate-400 checked:text-indigo-400 transition-colors border-slate-700 checked:border-indigo-500"
        aria-label="Batches"
        defaultChecked={false}
      />
      <div role="tabpanel" className="mt-8 tab-content">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white tracking-tight">Active Batches</h3>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
            onClick={() => {
              setModalData({ action: 'add', courseId });
              document.getElementById('batchModal').showModal();
              document.getElementById('batchFormError').innerText = '';
            }}
          >
            <FaPlusSquare />
            Add Batch
          </button>
        </div>

        {batches?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((batch) => (
              <BatchContainer
                key={batch.batchId}
                batch={batch}
                setModalData={setModalData}
                courseId={courseId}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center rounded-xl bg-white/5 border border-white/5 text-slate-500 italic">
            No batches found for this course.
          </div>
        )}
      </div>
    </>
  );
};

const BatchContainer = ({ batch, setModalData, courseId }) => {
  return (
    <div className="flex justify-between items-center py-4 px-6 rounded-xl bg-slate-800/50 border border-white/5 hover:bg-slate-800 hover:border-white/10 transition-all group">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Passing Year</span>
        <h4 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{batch.batchYear}</h4>
      </div>
      <div className="flex gap-2">
        <button
          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
          title="Edit Batch"
          onClick={() => {
            setModalData({ action: 'update', batch, courseId });
            document.getElementById('batchModal').showModal();
            document.getElementById('batchFormError').innerText = '';
          }}
        >
          <FaEdit size={18} />
        </button>
      </div>
    </div>
  );
};

async function handleDeletebatch({ queryClient, dispatch, skill }) {
  try {
    await customFetch.delete(`/admin/courses/`);
    toast.success('batch deleted successfully!');
    return redirect('/admin-dashboard/courses');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || 'Failed to delete batch!';
    toast.error(errorMessage);
    return error;
  }
}

export default BatchesTab;
