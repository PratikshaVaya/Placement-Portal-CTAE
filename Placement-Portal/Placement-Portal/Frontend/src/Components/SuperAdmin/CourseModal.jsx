import { Form } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FormInput, NumberInput, SelectInput } from '../';
import { useEffect, useState } from 'react';

/** Controlled number field for lateral counts — fully independent of regular counts */
const LateralCountField = ({ label, name, initValue }) => {
  const [value, setValue] = useState(initValue ?? '');

  return (
    <div className="form-control">
      <label htmlFor={name} className="label">
        <span className="font-medium capitalize">{label}</span>
      </label>
      <input
        id={name}
        type="number"
        name={name}
        className="input input-bordered"
        min={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
      />
    </div>
  );
};

const CourseModal = () => {
  const { action, course } = useSelector((state) => state.courseModalState);
  const [isLateralEntry, setIsLateralEntry] = useState(false);

  useEffect(() => {
    if (course?.courseId) setIsLateralEntry(course?.isLateralAllowed);
    else setIsLateralEntry(false);
  }, [action, course?.courseId]);

  return (
    <dialog id="courseModal" className="modal backdrop-blur-sm">
      <div className="modal-box bg-slate-900 border border-white/10 shadow-2xl p-0 overflow-hidden max-w-xl">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-xl text-white capitalize">
            {action} Course
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
            name="courseForm"
          >
            {action === 'update' && (
              <input
                type="text"
                name="courseId"
                defaultValue={course?.courseId}
                hidden
              />
            )}
            
            <div className="grid gap-6">
              <FormInput
                label="Course Name"
                name="courseName"
                type="text"
                defaultValue={course?.courseName}
                className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
              />

              <SelectInput
                label="Course Level"
                name="courseLevel"
                options={[
                  { text: 'Graduation', value: 'graduation' },
                  { text: 'Post Graduation', value: 'postGraduation' },
                ]}
                defaultValue={course?.courseLevel}
                className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
              />

              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="Regular Years"
                  name="regularYearsCount"
                  minValue={1}
                  defaultValue={course?.regularYearsCount}
                  className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
                />

                <NumberInput
                  label="Regular Semesters"
                  name="regularSemestersCount"
                  minValue={1}
                  defaultValue={course?.regularSemestersCount}
                  className="bg-slate-800/50 border-white/10 text-white focus:border-indigo-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isLateralAllowed"
                    className="checkbox checkbox-primary border-white/30"
                    checked={isLateralEntry}
                    onChange={(e) => setIsLateralEntry(e.currentTarget.checked)}
                  />
                  <span className="text-slate-200 font-medium group-hover:text-white transition-colors">Is Lateral Entry Allowed?</span>
                </label>
              </div>

              {isLateralEntry && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 animate-in fade-in slide-in-from-top-2">
                  <LateralCountField
                    key={`lyc-${course?.courseId ?? 'new'}`}
                    label="Lateral Years"
                    name="lateralYearsCount"
                    initValue={course?.lateralYearsCount}
                  />

                  <LateralCountField
                    key={`lsc-${course?.courseId ?? 'new'}`}
                    label="Lateral Semesters"
                    name="lateralSemestersCount"
                    initValue={course?.lateralSemestersCount}
                  />
                </div>
              )}
            </div>

            <div id="courseFormError" className="text-rose-400 text-sm font-medium empty:hidden"></div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
              name="intent"
              value={`${action}Course`}
            >
              {action === 'add' ? 'Create Course' : 'Update Course'}
            </button>
          </Form>
        </div>
      </div>
    </dialog>
  );
};

export default CourseModal;
