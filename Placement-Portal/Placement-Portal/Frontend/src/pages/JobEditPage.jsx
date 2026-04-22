import { Form, redirect, useLoaderData } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Markdown from 'react-markdown';

import {
  FormInput,
  SelectInput,
  CheckboxInput,
  MultipleInputs,
  NumberInput,
  DateInput,
} from '../Components';

import {
  getCourseOptions,
  getDepartmentOptions,
  getBatchOptions,
  formatDate,
  fetchSingleJobQuery,
  customFetch,
  fetchJobsQuery,
} from '../utils';

import { setCurrentJobs } from '../features/jobs/jobsSlice';

export const action = (queryClient, store) => {
  return async function ({ request }) {
    const formData = await request.formData();
    const intent = formData.get('intent');

    /* Handle Job Creation & Updation */
    if (intent === 'updateJob') {
      /* Transforming Into Array */
      const receivingDepartments = formData.getAll('receivingDepartments');
      const receivingCourses = formData.getAll('receivingCourses');
      const keySkills = formData.getAll('keySkills');

      const data = Object.fromEntries(formData);
      data.receivingDepartments = receivingDepartments;
      data.receivingCourses = receivingCourses;
      data.keySkills = keySkills;

      // Clean up eligibility criteria - convert empty strings to empty values
      const criteria = [
        'tenthPercentage',
        'twelfthPercentage',
        'diplomaPercentage',
        'graduationPercentage',
        'graduationCGPA',
        'maxActiveBacklogs',
        'maxCompletedBacklogs',
        'maxDOB',
      ];
      criteria.forEach((field) => {
        if (data[field] === '' || data[field] === null) {
          delete data[field];
        }
      });

      // Handle checkbox - if not checked, it won't be in formData
      if (!data.enableEligibilityFilter) {
        data.enableEligibilityFilter = false;
      }

      const url = `/company/jobs/${data['jobId']}`;

      try {
        await customFetch.patch(url, data);
        await queryClient.invalidateQueries({ queryKey: [data['jobId']] });
        await queryClient.refetchQueries({ queryKey: ['jobs', 'open'] });
        const { jobs } = await queryClient.fetchQuery(
          fetchJobsQuery({ role: 'company_admin', status: 'open' })
        );
        store.dispatch(setCurrentJobs({ jobs }));
        toast.success('Job updated successfully!');
        return redirect('/company-dashboard/jobs');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || `Failed to update job!`;
        toast.error(errorMessage);
        return error;
      }
    }
  };
};

export const loader = (queryClient, store) => {
  return async function ({ params }) {
    const jobId = params.jobId;
    try {
      const { job: jobData } = await queryClient.ensureQueryData(
        fetchSingleJobQuery({ role: 'company_admin', jobId })
      );
      return { jobData };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch courses!';
      console.log(error);
      toast.error(errorMessage);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return redirect('/');
      }
      return error;
    }
  };
};

const JobEditPage = () => {
  const courseOptions = useSelector((state) => state.courseOptions);

  const { jobData } = useLoaderData();

  const selectedCoursesInJob = jobData?.receivingCourses?.map(c => c.id) || [];

  // Initial options calculation
  let initialDepts = [];
  let initialBatches = [];
  let seenDeptIds = new Set();
  let seenBatchYears = new Set();

  selectedCoursesInJob.forEach(courseId => {
    const course = courseOptions[courseId];
    if (course) {
      course.departments.forEach(dept => {
        if (!seenDeptIds.has(dept.departmentId)) {
          initialDepts.push({ text: dept.departmentName, value: dept.departmentId });
          seenDeptIds.add(dept.departmentId);
        }
      });
      course.batches.forEach(batch => {
        if (!seenBatchYears.has(batch.batchYear)) {
          initialBatches.push({ text: batch.batchYear, value: batch.batchId });
          seenBatchYears.add(batch.batchYear);
        }
      });
    }
  });

  const [deptOptions, setDeptOptions] = useState(initialDepts);
  const [batchOptions, setBatchOptions] = useState(initialBatches);

  const [skillFields, setSkillFields] = useState(['']);
  const [defaultDeadline, setDefaultDeadline] = useState();
  const [description, setDescription] = useState(jobData?.description || '');
  const [enableEligibility, setEnableEligibility] = useState(
    jobData?.enableEligibilityFilter || false
  );

  useEffect(() => {
    setDeptOptions(initialDepts);
    setBatchOptions(initialBatches);
  }, [JSON.stringify(selectedCoursesInJob)]);

  useEffect(() => {
    if (jobData?.keySkills) {
      setSkillFields(jobData?.keySkills);
    }
  }, [jobData?.keySkills]);

  const todayDate = new Date();
  useEffect(() => {
    if (jobData?.deadline) {
      setDefaultDeadline(formatDate(new Date(jobData.deadline)));
    } else {
      const laterDate = new Date();
      laterDate.setMonth(todayDate.getMonth() + 1);
      setDefaultDeadline(formatDate(laterDate));
    }
  }, [jobData?.deadline]);

  return (
    <div className="flex flex-col gap-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-12 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Update <span className="text-indigo-400">Opportunity</span></h1>
            <p className="text-slate-400 font-medium mt-1">Refine job details and eligibility for {jobData?.profile}.</p>
          </div>
        </div>
      </header>

      <div className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        <Form
          method="POST"
          className="relative z-10 flex flex-col gap-8"
          name="updateJobForm"
        >
          <input type="text" name="jobId" defaultValue={jobData?._id} hidden />

          <div className="grid grid-cols-1 gap-8">
            <FormInput 
              label="Job Profile / Role" 
              name="profile" 
              type="text" 
              defaultValue={jobData?.profile} 
            />

            <div className="space-y-4">
              <label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Job Description (Markdown Supported)
              </label>
              <div role="tablist" className="tabs tabs-lifted bg-slate-900/40 p-1 rounded-2xl border border-white/5">
                <input
                  type="radio"
                  name="job-description"
                  role="tab"
                  className="tab !text-[10px] !font-black !tracking-widest"
                  aria-label="Write Content"
                  defaultChecked={true}
                />
                <div role="tabpanel" className="mt-4 tab-content p-4">
                  <textarea
                    className="w-full bg-black/20 border border-white/10 rounded-2xl p-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner leading-relaxed"
                    placeholder="Mention job responsibilities, requirements, and perks!"
                    name="description"
                    rows="10"
                    onChange={(e) => setDescription(e.currentTarget.value)}
                    value={description}
                  ></textarea>
                </div>

                <input
                  type="radio"
                  name="job-description"
                  role="tab"
                  className="tab !text-[10px] !font-black !tracking-widest"
                  aria-label="Live Preview"
                  defaultChecked={false}
                />
                <div role="tabpanel" className="mt-4 tab-content p-4">
                  <div className="flex flex-col gap-y-4 text-slate-300 job-markdown bg-black/20 rounded-2xl p-6 border border-white/5 h-[280px] overflow-auto prose prose-invert max-w-none">
                    <Markdown>{description || "*Preview will appear here...*"}</Markdown>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6 p-6 rounded-3xl bg-white/5 border border-white/5">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                 Target Audience
               </h4>
               <CheckboxInput
                label="Select Courses"
                options={getCourseOptions(courseOptions).filter(opt => opt.value !== '-1')}
                name="receivingCourses"
                onChange={handleCoursesChange}
                defaultValues={selectedCoursesInJob}
                emptyMsg="No courses found!"
              />

              <CheckboxInput
                label="Select Departments"
                options={deptOptions}
                name="receivingDepartments"
                defaultValues={jobData?.receivingDepartments?.map((item) => item.id)}
                emptyMsg="Select a course first"
              />

              <CheckboxInput
                label="Select Batches"
                options={batchOptions}
                name="receivingBatches"
                defaultValues={Array.isArray(jobData?.receivingBatch) 
                  ? jobData.receivingBatch.map((item) => item.id)
                  : jobData?.receivingBatch?.id ? [jobData.receivingBatch.id] : []}
                emptyMsg="Select a course first"
              />
            </div>

            <div className="space-y-6 p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span>
                 Skills & Requirements
               </h4>
               <MultipleInputs
                label="Key Skills Required"
                name="keySkills"
                type="text"
                defaultValue={skillFields}
                manageFields={setSkillFields}
              />
            </div>
          </div>

          {/* ELIGIBILITY CRITERIA SECTION */}
          <div className="relative py-8">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0b1120] px-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Eligibility Configuration</span>
            </div>
          </div>

          <div className={`p-8 rounded-[2rem] border transition-all duration-500 ${enableEligibility ? 'bg-indigo-500/5 border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.1)]' : 'bg-white/5 border-white/5'}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-2xl border transition-all ${enableEligibility ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/40' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                    <span className="text-xl">⚖️</span>
                 </div>
                 <div>
                    <h4 className="font-black text-white tracking-tight">Academic Filter Engine</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enforce strict eligibility requirements</p>
                 </div>
              </div>
              <input
                type="checkbox"
                name="enableEligibilityFilter"
                className="toggle toggle-indigo toggle-lg"
                value="true"
                checked={enableEligibility}
                onChange={(e) => setEnableEligibility(e.target.checked)}
              />
            </div>

            {enableEligibility && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
                <NumberInput label="10th % Min" name="tenthPercentage" minValue={0} maxValue={100} required={false} defaultValue={jobData?.eligibilityCriteria?.tenthPercentage} />
                <NumberInput label="12th % Min" name="twelfthPercentage" minValue={0} maxValue={100} required={false} defaultValue={jobData?.eligibilityCriteria?.twelfthPercentage} />
                <NumberInput label="Diploma % (Opt)" name="diplomaPercentage" minValue={0} maxValue={100} required={false} defaultValue={jobData?.eligibilityCriteria?.diplomaPercentage} />
                <NumberInput label="Graduation %" name="graduationPercentage" minValue={0} maxValue={100} required={false} defaultValue={jobData?.eligibilityCriteria?.graduationPercentage} />
                
                <div className="md:col-span-2">
                  <NumberInput label="Graduation CGPA (Min)" name="graduationCGPA" minValue={0} maxValue={10} step={0.1} required={false} defaultValue={jobData?.eligibilityCriteria?.graduationCGPA} />
                </div>
                <NumberInput label="Max Active Backlogs" name="maxActiveBacklogs" minValue={0} required={false} defaultValue={jobData?.eligibilityCriteria?.maxActiveBacklogs} />
                <NumberInput label="Max Total Backlogs" name="maxCompletedBacklogs" minValue={0} required={false} defaultValue={jobData?.eligibilityCriteria?.maxCompletedBacklogs} />
                
                <div className="md:col-span-4">
                  <DateInput label="Date of Birth (On or Before)" name="maxDOB" minDate="1900-01-01" required={false} defaultValue={jobData?.eligibilityCriteria?.maxDOB?.slice(0, 10)} />
                </div>

                <div className="md:col-span-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-4">
                  <span className="text-xl">💡</span>
                  <p className="text-xs font-bold text-indigo-300 italic">
                    Note: Empty fields will be ignored. Student eligibility will only be checked against the values provided above.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FormInput label="Job Location" name="location" type="text" defaultValue={jobData?.location} placeholder="e.g. Remote / Bangalore" />
            <NumberInput label="Package (LPA)" name="jobPackage" minValue={1} defaultValue={jobData?.jobPackage} placeholder="e.g. 12" />
            <NumberInput label="Openings" name="openingsCount" minValue={1} defaultValue={jobData?.openingsCount} placeholder="e.g. 5" />
            <DateInput label="Application Deadline" name="deadline" minDate={formatDate(todayDate)} defaultValue={defaultDeadline} />
          </div>

          <div className="pt-10 flex justify-center">
            <button
              type="submit"
              className="px-12 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-500/30 active:scale-95"
              name="intent"
              value="updateJob"
            >
              Sync Updates
            </button>
          </div>
        </Form>
      </div>
    </div>
  );

  async function handleCoursesChange() {
    const courseInputs = document.querySelectorAll('input[name="receivingCourses"]:checked');
    const selectedCourseIds = Array.from(courseInputs).map(input => input.value);

    if (selectedCourseIds.length === 0) {
      setDeptOptions([]);
      setBatchOptions([]);
    } else {
      let combinedDepts = [];
      let combinedBatches = [];
      let seenDeptIds = new Set();
      let seenBatchYears = new Set();

      selectedCourseIds.forEach(courseId => {
        const course = courseOptions[courseId];
        if (course) {
          course.departments.forEach(dept => {
            if (!seenDeptIds.has(dept.departmentId)) {
              combinedDepts.push({ text: dept.departmentName, value: dept.departmentId });
              seenDeptIds.add(dept.departmentId);
            }
          });
          course.batches.forEach(batch => {
            if (!seenBatchYears.has(batch.batchYear)) {
              combinedBatches.push({ text: batch.batchYear, value: batch.batchId });
              seenBatchYears.add(batch.batchYear);
            }
          });
        }
      });

      setDeptOptions(combinedDepts);
      setBatchOptions(combinedBatches);
    }
  }
}

export default JobEditPage;
