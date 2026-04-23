import { Form } from 'react-router-dom';
import { ScoreFieldInput, NumberInput } from '../';

const CurrentCourseEducation = ({
  courseLevel,
  isLateralEntry,
  semestersCount,
  data,
  type,
}) => {
  const aggregateGPA = data?.aggregateGPA || '';

  return (
    <div className="p-2 sm:p-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
        <h3 className="text-xl font-black text-white tracking-tight capitalize">
          {courseLevel} <span className="text-indigo-400">Academic Record</span>
        </h3>
      </div>

      <Form method="POST" className="flex flex-col gap-10">
        <input
          type="number"
          name="semestersCount"
          defaultValue={semestersCount}
          hidden
        />
        <input
          type="checkbox"
          name="isLateralEntry"
          defaultChecked={isLateralEntry}
          hidden
        />
        <input
          type="text"
          name="courseLevel"
          defaultValue={courseLevel}
          hidden
        />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {getFormFields({ semestersCount, isLateralEntry, data, type })}
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
          {type === 'private' ? (
            <div className="w-full sm:w-1/2 max-w-xs">
              <NumberInput
                label="Overall Cumulative GPA"
                name="aggregateGPA"
                defaultValue={aggregateGPA}
                minValue={0}
                maxValue={10}
                step={0.01}
                placeholder="0.00"
              />
            </div>
          ) : (
            aggregateGPA !== '' && (
              <div className="px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Cumulative GPA</span>
                <span className="text-emerald-400 font-black text-xl">{aggregateGPA}</span>
              </div>
            )
          )}

          <div id="currentCourseError" className="text-red-500 text-xs font-medium"></div>

          {type === 'private' && (
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              name="intent"
              value="updateCurrentEducation"
            >
              Update Academic Record
            </button>
          )}
        </div>
      </Form>
    </div>
  );
};

function getFormFields({ semestersCount, isLateralEntry, data, type }) {
  const fields = [];
  const scores = Array.isArray(data) ? data : data?.scores || [];
  let sem = isLateralEntry ? 3 : 1;
  for (let i = 0; i < semestersCount; i++) {
    fields.push(
      <ScoreFieldInput
        key={`semester-${i}`}
        label={`Semester ${sem}`}
        data={scores[i]}
        semesterNum={sem}
        type={type}
      />
    );
    ++sem;
  }
  return fields;
}

export default CurrentCourseEducation;
