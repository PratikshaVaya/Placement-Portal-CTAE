import { redirect } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { customFetch, fetchStudentEducation } from '../../utils';

import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { setEducationDetails } from '../../features/studentProfile/studentProfileSlice';

const PastScoreContainer = ({ type, label, data, setModalData }) => {
  const { year, score, scale, board, institute, stream } = data;

  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return (
    <div className="group relative rounded-[2.5rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 p-7 hover:bg-slate-800/60 transition-all duration-500 shadow-2xl overflow-hidden flex flex-col h-full">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-600/10 transition-all duration-500"></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2 inline-block">
            {label}
          </span>
          <h3 className="text-xl font-black text-white tracking-tight leading-tight truncate max-w-[200px]">
            {institute}
          </h3>
        </div>
        
        {type === 'private' && (
          <div className="flex items-center gap-2">
            <button
              className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 transition-all shadow-xl"
              onClick={() => {
                setModalData({ action: 'update', data, label, open: true });
                document.getElementById('pastScoreError').innerText = '';
                document.getElementById('pastScoreModal').showModal();
              }}
            >
              <FaEdit size={14} />
            </button>
            <button
              className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all shadow-xl"
              onClick={() =>
                handleDeletePastEducation({ queryClient, dispatch, label })
              }
            >
              <FaTrash size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black block mb-1">Year</span>
          <span className="text-slate-200 font-bold text-sm block">{year}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black block mb-1">Score</span>
          <span className="text-emerald-400 font-black text-sm block">
            {score} {scale === 'GPA' ? 'GPA' : '%'}
          </span>
        </div>
      </div>

      <div className="mt-auto space-y-3 relative z-10 pt-4 border-t border-white/5">
        <div className="flex justify-between items-center text-sm">
           <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Board</span>
           <span className="text-slate-300 font-bold text-xs">{board}</span>
        </div>
        {stream && (
          <div className="flex justify-between items-center text-sm">
             <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Stream</span>
             <span className="text-slate-300 font-bold text-xs">{stream}</span>
          </div>
        )}
      </div>
    </div>
  );
};

async function handleDeletePastEducation({ queryClient, dispatch, label }) {
  try {
    await customFetch.delete(`/student/education/${label}`);
    queryClient.removeQueries({ queryKey: ['education'] });
    const { educationDetails } = await queryClient.fetchQuery(
      fetchStudentEducation()
    );
    dispatch(setEducationDetails({ educationDetails }));
    toast.success(`${label} record deleted successfully!`);
    return redirect('/student-dashboard/');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || `Failed to delete ${label} record!`;
    toast.error(errorMessage);
    return error;
  }
}

export default PastScoreContainer;
