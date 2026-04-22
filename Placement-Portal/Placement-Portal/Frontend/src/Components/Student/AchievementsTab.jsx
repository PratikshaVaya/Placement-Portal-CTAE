import { useSelector, useDispatch } from 'react-redux';
import { FaEdit, FaTrash, FaPlusSquare } from 'react-icons/fa';
import { useState } from 'react';
import { Form, redirect } from 'react-router-dom';
import { FormInput } from '../';
import { setAchievements } from '../../features/studentProfile/studentProfileSlice';
import { toast } from 'react-toastify';
import { customFetch, fetchStudentAchievements } from '../../utils';
import { useQueryClient } from '@tanstack/react-query';

const AchievementsTab = () => {
  const { achievements, type } = useSelector(
    (state) => state?.studentProfileState
  );
  const [modalData, setModalData] = useState({ action: 'create', achievement: '' });
  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-700">
        <AchievementModal modalData={modalData} />
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
            <h3 className="text-2xl font-black text-white tracking-tight">Achievements</h3>
          </div>
          
          {type === 'private' && (
            <button
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
              onClick={() => {
                setModalData({ action: 'create', achievement: '' });
                document.getElementById('achievementModal').showModal();
                document.getElementById('achievementFormError').innerText = '';
              }}
            >
              <FaPlusSquare className="text-lg" />
              <span>Add Achievement</span>
            </button>
          )}
        </div>

        {achievements?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <AchievementContainer
                achievement={achievement}
                key={index}
                setModalData={setModalData}
                type={type}
              />
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center">
            <p className="text-slate-500 font-medium italic">No achievements recorded yet.</p>
          </div>
        )}
      </div>
  );
};

const AchievementContainer = ({ achievement, setModalData, type }) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return (
    <div className="group flex items-center justify-between p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:bg-slate-800/60 transition-all duration-300">
      <h4 className="text-white font-bold tracking-tight">{achievement}</h4>
      {type === 'private' && (
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => {
              setModalData({ action: 'update', achievement });
              document.getElementById('achievementModal').showModal();
              document.getElementById('achievementFormError').innerText = '';
            }}
          >
            <FaEdit size={14} />
          </button>
          <button
            className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
            onClick={() =>
              handleDeleteAchievement({ queryClient, dispatch, achievement })
            }
          >
            <FaTrash size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

const AchievementModal = ({ modalData }) => {
  const { action, achievement } = modalData;
  return (
    <dialog id="achievementModal" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
      <div className="modal-box bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl">
        <div className="mb-8">
          <h3 className="text-2xl font-black text-white tracking-tight capitalize">
            {action} <span className="text-indigo-400">Achievement</span>
          </h3>
          <p className="text-slate-400 text-sm mt-1">Share your awards, certifications, or notable successes.</p>
        </div>

        <Form
          method="POST"
          className="space-y-6"
          name="achievementForm"
          id="achievementForm"
        >
          {action === 'update' && (
            <input
              type="text"
              name="oldAchievement"
              defaultValue={achievement || ''}
              hidden
            />
          )}
          <FormInput
            label="Achievement Title"
            name={action === 'create' ? 'achievement' : 'updatedAchievement'}
            type="text"
            defaultValue={action === 'update' ? achievement : ''}
            placeholder="e.g. Winner of National Hackathon"
          />

          <div id="achievementFormError" className="text-red-500 text-sm font-medium"></div>

          <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
            <form method="dialog">
              <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition-all">
                Cancel
              </button>
            </form>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              name="intent"
              value={`${action}Achievement`}
            >
              {action === 'create' ? 'Add Achievement' : 'Update Achievement'}
            </button>
          </div>
        </Form>
      </div>
    </dialog>
  );
};

async function handleDeleteAchievement({ queryClient, dispatch, achievement }) {
  try {
    await customFetch.delete(`/student/achievements`, {
      data: { achievement },
    });
    queryClient.removeQueries({ queryKey: ['achievements'] });
    const { achievements } = await queryClient.fetchQuery(
      fetchStudentAchievements()
    );
    dispatch(setAchievements({ achievements }));
    toast.success('Achievement deleted successfully!');
    return redirect('/student-dashboard/');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || 'Failed to delete achievement!';
    toast.error(errorMessage);
    return error;
  }
}

export default AchievementsTab;
