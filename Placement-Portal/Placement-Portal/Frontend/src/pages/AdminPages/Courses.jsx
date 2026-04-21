import { useSelector, useDispatch } from 'react-redux';
import {
  BatchModal,
  BatchTab,
  DepartmentModal,
  DepartmentsTab,
} from '../../Components';
import { useState } from 'react';
import { redirect } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import { setModalData } from '../../features/courseModal/courseModal';
import { customFetch } from '../../utils';
import { toast } from 'react-toastify';

export const action = (queryClient, store) => {
  return async function ({ request }) {
    const formData = await request.formData();
    const intent = formData.get('intent');

    /* Department Creation and Updation */
    if (intent === 'addDepartment' || intent === 'updateDepartment') {
      const courseId = formData.get('courseId');
      let url = `/courses/${courseId}/departments/`;
      if (intent === 'updateDepartment') url += formData.get('departmentId');
      try {
        if (intent === 'addDepartment') await customFetch.post(url, formData);
        else await customFetch.patch(url, formData);

        queryClient.removeQueries({ queryKey: ['courseOptions'] });
        toast.success(
          `Department ${
            intent === 'addDepartment' ? 'added' : 'updated'
          } successfully!`
        );
        document.forms.departmentForm.reset();
        document.getElementById('departmentModal').close();
        return redirect('/admin-dashboard/courses');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message ||
          `Failed to ${
            intent === 'addDepartment' ? 'add' : 'update'
          } department!`;
        document.getElementById('departmentFormError').textContent =
          errorMessage;
        return error;
      }
    }

    /* Department Creation and Updation */
    if (intent === 'addBatch' || intent === 'updateBatch') {
      const courseId = formData.get('courseId');
      let url = `/courses/${courseId}/batches/`;
      if (intent === 'updateBatch') url += formData.get('batchId');
      try {
        if (intent === 'addBatch') await customFetch.post(url, formData);
        else await customFetch.patch(url, formData);

        queryClient.removeQueries({ queryKey: ['courseOptions'] });
        toast.success(
          `Batch ${intent === 'addBatch' ? 'added' : 'updated'} successfully!`
        );
        document.forms.batchForm.reset();
        document.getElementById('batchModal').close();
        return redirect('/admin-dashboard/courses');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message ||
          `Failed to ${intent === 'addBatch' ? 'add' : 'update'} batch!`;
        document.getElementById('batchFormError').textContent = errorMessage;
        return error;
      }
    }
  };
};

const CoursePage = () => {
  const dispatch = useDispatch();
  const courses = useSelector((state) => state.courseOptions);
  const arr = [];
  for (let courseId in courses) {
    arr.push({
      courseId,
      ...courses[courseId],
    });
  }
  const [departmentModalData, setDepartmentModalData] = useState({
    action: 'add',
  });
  const [batchModalData, setBatchModalData] = useState({ action: 'add' });

  return (
    <div className="flex flex-col gap-8 text-slate-200">
      <DepartmentModal modalData={departmentModalData} />
      <BatchModal modalData={batchModalData} />
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Courses & Batches</h1>
        <p className="text-slate-400 text-base md:text-lg">Manage academic programs, departments, and batches</p>
      </div>

      <div className="flex flex-col gap-6">
        {arr.map((course) => {
          const { courseId, courseName, batches, departments } = course;
          return (
            <div key={courseId} className="p-6 md:p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg transition-all hover:bg-white/[0.07]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
                  <h3 className="text-2xl font-bold text-white tracking-wide">{courseName}</h3>
                </div>
                <button
                  className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors border border-transparent hover:border-indigo-400/20"
                  title="Edit Course"
                  onClick={() => {
                    document.getElementById('courseFormError').innerText = '';
                    document.getElementById('courseModal').showModal();
                    dispatch(setModalData({ course }));
                  }}
                >
                  <FaEdit size={18} />
                </button>
              </div>
              
              <div role="tablist" className="tabs tabs-bordered custom-tabs">
                <DepartmentsTab
                  departments={departments}
                  courseId={courseId}
                  setModalData={setDepartmentModalData}
                />
                <BatchTab
                  batches={batches}
                  courseId={courseId}
                  setModalData={setBatchModalData}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoursePage;
