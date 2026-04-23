import { Form } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { CheckboxInput, FormInput, SelectInput } from '../';
import {
  getCourseOptions,
  getDepartmentOptions,
  getBatchOptions,
} from '../../utils';

const AddSingleStudent = () => {
  const courseOptions = useSelector((state) => state.courseOptions);
  const { action, student } = useSelector((state) => state.createStudentState);

  const courseId = action === 'add' ? -1 : student?.courseId;
  const [deptOptions, setDeptOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);

  useEffect(() => {
    if (courseId !== -1) {
      const deptOptions = getDepartmentOptions(
        courseOptions[courseId].departments
      );
      setDeptOptions(deptOptions);

      const batchOptions = getBatchOptions(courseOptions[courseId].batches);
      setBatchOptions(batchOptions);
    } else {
      setDeptOptions([]);
      setBatchOptions([]);
    }
  }, [action, student?._id, courseId]);

  return (
    <dialog id="addSingleStudentModal" className="modal backdrop-blur-sm">
      <div className="modal-box bg-slate-900 border border-white/10 shadow-2xl p-0 overflow-y-auto max-h-[90vh] max-w-2xl custom-scrollbar">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-xl text-white capitalize">
            {action} Student
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
            name="addSingleStudentForm"
          >
            {action === 'update' && (
              <input
                type="text"
                name="studentId"
                defaultValue={student?._id}
                hidden
              />
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Full Name"
                name="name"
                type="text"
                defaultValue={student?.name}
                className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
              />

              <FormInput
                label="Roll Number"
                name="rollNo"
                type="text"
                defaultValue={student?.rollNo}
                className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
              />

              {action === 'add' && (
                <>
                  <div className="md:col-span-2">
                    <FormInput 
                      label="Email Address" 
                      name="email" 
                      type="email" 
                      className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
                    />
                  </div>

                  <FormInput 
                    label="Password" 
                    name="password" 
                    type="password" 
                    className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
                  />

                  <FormInput
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
                  />
                </>
              )}

              <div className="md:col-span-2 p-4 rounded-xl bg-white/5 border border-white/5">
                <CheckboxInput
                  label="Academic Entry Type"
                  name="isLateralEntry"
                  options={[{ text: 'Lateral Entry (Direct 2nd Year)', value: 'yes' }]}
                  defaultValues={student?.isLateralEntry ? ['yes'] : []}
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectInput
                  label="Course"
                  options={getCourseOptions(courseOptions)}
                  id="createStudentCourse"
                  changeFn={handleCourseChange}
                  name="courseId"
                  defaultValue={courseId}
                  className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
                />

                <SelectInput
                  label="Department"
                  options={deptOptions}
                  name="departmentId"
                  emptyMessage="Select Course First"
                  defaultValue={student?.departmentId}
                  className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
                />

                <SelectInput
                  label="Batch Year"
                  options={batchOptions}
                  name="batchId"
                  emptyMessage="Select Course First"
                  defaultValue={student?.batchId}
                  className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
                />
              </div>
            </div>

            <div id="addSingleStudentFormError" className="text-rose-400 text-sm font-medium empty:hidden"></div>
            
            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
              name="intent"
              value={`${action}SingleStudent`}
            >
              {action === 'add' ? 'Create Student Profile' : 'Update Profile Details'}
            </button>
          </Form>
        </div>
      </div>
    </dialog>
  );

  async function handleCourseChange() {
    const courseId = document.getElementById('createStudentCourse').value;

    if (!courseId || courseId == -1) {
      setDeptOptions([]);
      setBatchOptions([]);
    } else {
      const deptOptions = getDepartmentOptions(
        courseOptions[courseId].departments
      );
      setDeptOptions(deptOptions);
      const batchOptions = getBatchOptions(courseOptions[courseId].batches);
      setBatchOptions(batchOptions);
    }
  }
};
export default AddSingleStudent;
