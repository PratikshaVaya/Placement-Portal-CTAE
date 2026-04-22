import { toast } from 'react-toastify';

import {
  StudentIntro,
  StudentEducation,
  StudentExperience,
  StudentTraining,
  SkillsTab,
  AchievementsTab,
} from '../Components';

import { initialProfileSetup } from '../features/studentProfile/studentProfileSlice';
import { fetchStudentPublicProfile } from '../utils';

export const loader = (queryClient, store) => {
  return async function ({ params }) {
    const { applicationId, studentId } = params;
    try {
      const { profileDetails } = await queryClient.ensureQueryData(
        fetchStudentPublicProfile({ applicationId, studentId })
      );
      store.dispatch(initialProfileSetup({ profileDetails, type: 'public' }));
      return {
        profileDetails,
      };
    } catch (error) {
      console.log(error.response);
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch student details!';
      toast.error(errorMessage);
      return error;
    }
  };
};

const PublicStudentProfile = () => {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-10 flex flex-col gap-10 animate-in fade-in duration-700">
      {/* Intro Section */}
      <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[3.5rem] p-1 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
         <StudentIntro />
      </section>

      {/* Education Group */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-6">Academic Background</h3>
        <div role="tablist" className="tabs tabs-bordered border-white/5 bg-slate-900/40 p-2 rounded-[2.5rem] backdrop-blur-xl">
          <StudentEducation />
        </div>
      </div>

      {/* Professional Group */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-6">Professional Portfolio</h3>
        <div role="tablist" className="tabs tabs-bordered border-white/5 bg-slate-900/40 p-2 rounded-[2.5rem] backdrop-blur-xl">
          <StudentExperience />
          <StudentTraining />
        </div>
      </div>

      {/* Skills Group */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-6">Core Competencies</h3>
        <div role="tablist" className="tabs tabs-bordered border-white/5 bg-slate-900/40 p-2 rounded-[2.5rem] backdrop-blur-xl">
          <SkillsTab />
          <AchievementsTab />
        </div>
      </div>
    </div>
  );
};
export default PublicStudentProfile;
