import { Form } from 'react-router-dom';
import { CurrentCourseEducation, PastScoreContainer } from '../';
import { FormInput, NumberInput, SelectInput } from '../';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const StudentEducation = () => {
  const {
    courseLevel,
    isLateralEntry,
    semestersCount,
    educationDetails,
    type,
  } = useSelector((state) => state.studentProfileState);

  let highschool, intermediate, diploma, graduation, postGraduation;

  if (educationDetails) {
    highschool = educationDetails?.highschool;
    intermediate = educationDetails?.intermediate;
    diploma = educationDetails?.diploma;
    graduation = educationDetails?.graduation;
    postGraduation = educationDetails?.postGraduation;
  }

  const [modalData, setModalData] = useState({ action: 'update' });

  const newOptions = [];
  if (!highschool)
    newOptions.push(getPastScoreOption('highschool', setModalData));
  if (!intermediate)
    newOptions.push(getPastScoreOption('intermediate', setModalData));
  if (!diploma) newOptions.push(getPastScoreOption('diploma', setModalData));
  if (courseLevel === 'postGraduation' && !graduation)
    newOptions.push(getPastScoreOption('graduation', setModalData));

  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-700">
        {type === 'private' && <PastScoreModal modalData={modalData} />}

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
            <h3 className="text-2xl font-black text-white tracking-tight">Education Details</h3>
          </div>
          
          {type === 'private' && newOptions.length ? (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Add New</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[10] mt-2 w-48 p-2 shadow-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl"
              >
                {newOptions}
              </ul>
            </div>
          ) : null}
        </div>

        <CurrentCourseEducation
          courseLevel={courseLevel}
          semestersCount={semestersCount}
          isLateralEntry={isLateralEntry}
          data={courseLevel === 'graduation' ? graduation : postGraduation}
          type={type}
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {courseLevel === 'postGraduation' && graduation && (
            <PastScoreContainer
              label="graduation"
              data={graduation}
              setModalData={setModalData}
              type={type}
            />
          )}

          {diploma && (
            <PastScoreContainer
              label="diploma"
              data={diploma}
              setModalData={setModalData}
              type={type}
            />
          )}

          {intermediate && (
            <PastScoreContainer
              label="intermediate"
              data={intermediate}
              setModalData={setModalData}
              type={type}
            />
          )}

          {highschool && (
            <PastScoreContainer
              label="highschool"
              data={highschool}
              setModalData={setModalData}
              type={type}
            />
          )}
        </div>
      </div>
  );
};

const PastScoreModal = ({ modalData }) => {
  const { action, data, label, open } = modalData;

  const [institute, setInstitute] = useState(data?.institute || '');
  const [board, setBoard] = useState(data?.board || '');
  const [stream, setStream] = useState(data?.stream || '');
  const [year, setYear] = useState(data?.year || '');
  const [score, setScore] = useState(data?.score || '');
  const [scale, setScale] = useState(data?.scale || '');

  useEffect(() => {
    setInstitute(data?.institute || '');
    setBoard(data?.board || '');
    setStream(data?.stream || '');
    setYear(data?.year || '');
    setScore(data?.score || '');
    setScale(data?.scale || '');
  }, [open, label]);

  return (
    <dialog id="pastScoreModal" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
      <div className="modal-box bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl">
        <div className="mb-8">
          <h3 className="text-2xl font-black text-white tracking-tight capitalize">
            {action} <span className="text-indigo-400">{label}</span> data
          </h3>
          <p className="text-slate-400 text-sm mt-1">Please provide accurate academic information.</p>
        </div>

        <Form
          method="POST"
          className="space-y-6"
          name={`${label}Form`}
        >
          <input type="text" name="update" defaultValue={label} hidden />

          <FormInput
            label="Institute Name"
            name="institute"
            type="text"
            defaultValue={institute}
            placeholder="e.g. CTAE Udaipur"
          />

          <FormInput
            label="Board / University"
            name="board"
            type="text"
            defaultValue={board}
            placeholder="e.g. CBSE"
          />

          <FormInput
            label="Stream"
            name="stream"
            type="text"
            defaultValue={stream}
            isRequired={false}
            placeholder="e.g. Science"
          />

          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Passing Year"
              name="year"
              defaultValue={year}
              minValue={2000}
              maxValue={new Date().getFullYear()}
              step={1}
            />

            <div className="flex gap-x-2 items-end">
              <div className="flex-1">
                <NumberInput
                  label="Score"
                  name="score"
                  defaultValue={score}
                  minValue={1}
                  maxValue={scale === 'percentage' ? 100 : 10}
                  step={0.01}
                />
              </div>

              <div className="w-24">
                <SelectInput
                  label="Scale"
                  name="scale"
                  options={[
                    { text: 'GPA', value: 'GPA' },
                    { text: '%', value: 'percentage' },
                  ]}
                  defaultValue={scale}
                  changeFn={(e) => {
                    const value = e.currentTarget.value;
                    if (value === 'GPA') {
                      document.forms[`${label}Form`].score.max = 10;
                    } else {
                      document.forms[`${label}Form`].score.max = 100;
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div id="pastScoreError" className="text-red-500 text-sm font-medium"></div>

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
              value="updatePastEducation"
            >
              Save Details
            </button>
          </div>
        </Form>
      </div>
    </dialog>
  );
};

function getPastScoreOption(label, setModalData) {
  return (
    <li
      key={label}
      onClick={() => {
        setModalData({ action: 'create', label });
        document.getElementById('pastScoreModal').showModal();
      }}
      className="capitalize p-3 cursor-pointer rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors font-medium"
    >
      {label}
    </li>
  );
}

export default StudentEducation;
