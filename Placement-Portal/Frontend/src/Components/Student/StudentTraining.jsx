import { Form, redirect } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlusSquare } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';

import { FormInput, FileInput, DateInput } from '../';
import { formatDate, customFetch, fetchStudentTrainings, getFileUrl } from '../../utils';
import { setTrainings } from '../../features/studentProfile/studentProfileSlice';

const StudentTraining = () => {
  const { trainings, type } = useSelector(
    (state) => state?.studentProfileState
  );
  const [modalData, setModalData] = useState({ action: 'create' });

  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-700">
        <TrainingModal modalData={modalData} />
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
            <h3 className="text-2xl font-black text-white tracking-tight">Trainings & Certifications</h3>
          </div>
          
          {type === 'private' && (
            <button
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
              onClick={() => {
                setModalData({ action: 'create' });
                document.getElementById('trainingFormError').innerText = '';
                document.getElementById('trainingModal').showModal();
              }}
            >
              <FaPlusSquare className="text-lg" />
              <span>Add Training</span>
            </button>
          )}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trainings?.length ? (
            trainings.map((training) => (
              <TrainingContainer
                key={training._id}
                training={training}
                setModalData={setModalData}
                type={type}
              />
            ))
          ) : (
            <div className="sm:col-span-2 lg:col-span-3 p-10 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center">
              <p className="text-slate-500 font-medium italic">No training records found.</p>
            </div>
          )}
        </div>
      </div>
  );
};

const TrainingContainer = ({ training, setModalData, type }) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { trainingName, organisation, certificate } = training;
  let { startDate, endDate } = training;

  startDate = new Date(startDate).toLocaleDateString();
  if (endDate) endDate = new Date(endDate).toLocaleDateString();

  return (
    <div className="group rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 hover:bg-slate-800/60 transition-all duration-300 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-12 -mt-12 transition-colors group-hover:bg-indigo-500/10"></div>
      
      <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight leading-tight">{trainingName}</h3>
          <p className="text-indigo-400 font-bold text-sm mt-1">{organisation}</p>
        </div>
        
        {type === 'private' && (
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => {
                setModalData({
                  action: 'update',
                  training,
                });
                document.getElementById('trainingModal').showModal();
              }}
            >
              <FaEdit size={14} />
            </button>
            <button
              className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
              onClick={() =>
                handleDeleteTraining({
                  queryClient,
                  dispatch,
                  id: training._id,
                })
              }
            >
              <FaTrash size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 relative z-10 mt-6 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Duration</span>
          <span className="text-slate-200 font-medium">{startDate} - {endDate || 'Present'}</span>
        </div>
        
        {certificate && (
          <div className="pt-4">
            <a 
              href={certificate} 
              target="_blank" 
              className="block w-full py-2 px-4 rounded-xl bg-white/5 border border-white/10 text-center text-xs font-bold text-slate-300 hover:bg-indigo-600/20 hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
            >
              View Certificate
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const TrainingModal = ({ modalData }) => {
  const { action, training } = modalData;
  return (
    <dialog id="trainingModal" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
      <div className="modal-box bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl">
        <div className="mb-8">
          <h3 className="text-2xl font-black text-white tracking-tight capitalize">
            {action} <span className="text-indigo-400">Training</span>
          </h3>
          <p className="text-slate-400 text-sm mt-1">Detail your professional training or certifications.</p>
        </div>

        <Form
          method="POST"
          className="space-y-6"
          name="trainingForm"
          encType="multipart/form-data"
        >
          {action === 'update' && (
            <input
              type="text"
              name="trainingId"
              defaultValue={training?._id}
              hidden
            />
          )}
          <FormInput
            label="Training / Course Name"
            name="trainingName"
            type="text"
            defaultValue={training?.trainingName}
            placeholder="e.g. Full Stack Web Development"
          />
          <FormInput
            label="Organisation / Platform"
            name="organisation"
            type="text"
            defaultValue={training?.organisation}
            placeholder="e.g. Coursera, Udemy, IBM"
          />
          
          <div className="grid sm:grid-cols-2 gap-4">
            <FileInput
              label="Certificate (PDF)"
              name="certificate"
              accept="application/pdf"
            />
            <div className="flex flex-col justify-end">
              {training?.certificate && (
                <a
                  href={getFileUrl(training?.certificate)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 font-bold hover:underline mb-2"
                >
                  View Current Certificate
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DateInput
              label="Start Date"
              name="startDate"
              defaultValue={
                training?.startDate && formatDate(new Date(training?.startDate))
              }
              maxDate={formatDate(new Date())}
            />
            <DateInput
              label="End Date"
              name="endDate"
              defaultValue={
                training?.endDate && formatDate(new Date(training?.endDate))
              }
              maxDate={formatDate(new Date())}
            />
          </div>

          <div id="trainingFormError" className="text-red-500 text-sm font-medium"></div>

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
              value={`${action}Training`}
            >
              {action === 'create' ? 'Add Training' : 'Update Training'}
            </button>
          </div>
        </Form>
      </div>
    </dialog>
  );
};

async function handleDeleteTraining({ queryClient, dispatch, id }) {
  try {
    await customFetch.delete(`/student/training/${id}`);
    queryClient.removeQueries({ queryKey: ['trainings'] });
    const { trainings } = await queryClient.fetchQuery(fetchStudentTrainings());
    dispatch(setTrainings({ trainings }));
    toast.success('Training deleted successfully!');
    return redirect('/student-dashboard/');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || 'Failed to delete training!';
    toast.error(errorMessage);
    return error;
  }
}

export default StudentTraining;
