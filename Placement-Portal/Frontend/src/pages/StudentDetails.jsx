import { redirect } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  customFetch,
  fetchStudentPersonal,
  fetchStudentEducation,
  fetchStudentExperiences,
  fetchStudentPlacements,
  fetchStudentTrainings,
  fetchStudentSkills,
  fetchStudentAchievements,
  fetchStudentPrivateProfile,
} from '../utils';

import {
  initialProfileSetup,
  setPersonalDetails,
  setEducationDetails,
  setExperiences,
  setPlacements,
  setTrainings,
  setSkills,
  setAchievements,
} from '../features/studentProfile/studentProfileSlice';

import {
  StudentIntro,
  StudentPersonal,
  ChangePassword,
  StudentEducation,
  StudentExperience,
  StudentPlacement,
  StudentTraining,
  SkillsTab,
  AchievementsTab,
  OfferStatus,
} from '../Components';

export const action = (queryClient, store) => {
  return async function ({ request }) {
    const formData = await request.formData();
    const intent = formData.get('intent');

    /* UPDATE PERSONAL DETAILS */
    if (intent === 'updatePersonalDetails') {
      const url = `/student/personal`;
      try {
        const { data } = await customFetch.post(url, formData);
        toast.success('Personal Details updated successfully!');
        // If the backend returned a photo URL, update the profile state immediately.
        if (data?.photo) {
          store.dispatch(
            initialProfileSetup({
              profileDetails: { photo: data.photo },
              type: 'private',
            })
          );
        }

        // Refetch personal details
        queryClient.removeQueries({ queryKey: ['personal'] });
        const { personalDetails } = await queryClient.fetchQuery(
          fetchStudentPersonal()
        );
        store.dispatch(setPersonalDetails({ personalDetails }));

        // Also refetch private profile to update the top-level photo/name
        queryClient.removeQueries({ queryKey: ['privateProfile'] });
        const { profileDetails } = await queryClient.fetchQuery(
          fetchStudentPrivateProfile()
        );
        store.dispatch(initialProfileSetup({ profileDetails, type: 'private' }));

        return redirect('/student-dashboard/');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message ||
          'Failed to update personal details!';
        toast.error(errorMessage);
        return error;
      }
    }

    /* CHANGE PASSWORD */
    if (intent === 'changePassword') {
      const url = `/student/change-password`;
      try {
        await customFetch.post(url, {
          oldPassword: formData.get('oldPassword'),
          newPassword: formData.get('newPassword'),
          confirmPassword: formData.get('confirmPassword'),
        });
        toast.success('Password changed successfully!');
        return redirect('/student-dashboard/');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message ||
          'Failed to change password!';
        toast.error(errorMessage);
        return error;
      }
    }

    /* UPDATE PAST EDUCATION */
    if (intent === 'updatePastEducation') {
      const update = formData.get('update');
      const url = `/student/education/${update}`;
      try {
        await customFetch.post(url, formData);
        queryClient.removeQueries({ queryKey: ['education'] });
        const { educationDetails } = await queryClient.fetchQuery(
          fetchStudentEducation()
        );
        store.dispatch(setEducationDetails({ educationDetails }));
        document.getElementById('pastScoreModal').close();
        toast.success(`${update} data updated successfully!`);
        return redirect('/student-dashboard/');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || `Failed to update ${update} data!`;
        document.getElementById('pastScoreError').innerText = errorMessage;
        return error;
      }
    }

    /* UPDATE CURRENT EDUCATION */
    if (intent === 'updateCurrentEducation') {
      const courseLevel = formData.get('courseLevel');
      const url = `/student/education/${courseLevel}`;

      const isLateralEntry = formData.get('isLateralEntry');
      let semestersCount = formData.get('semestersCount');
      let sem = isLateralEntry ? 3 : 1;

      const data = { scores: [] };
      while (semestersCount > 0) {
        const gpa = Number(formData.get(`gpa-${sem}`));
        const backsCount = Number(formData.get(`backsCount-${sem}`));
        if (isNaN(gpa) || isNaN(backsCount)) {
          document.getElementById('currentCourseError').innerText =
            'Invalid scores!';
          return null;
        }

        if (!gpa) break;
        data.scores.push({ gpa, backsCount });
        ++sem;
        --semestersCount;
      }

      const aggregateGPA = formData.get('aggregateGPA');
      if (aggregateGPA !== null && aggregateGPA !== '') {
        const parsedAggregateGPA = Number(aggregateGPA);
        if (isNaN(parsedAggregateGPA)) {
          document.getElementById('currentCourseError').innerText =
            'Invalid overall GPA!';
          return null;
        }
        data.aggregateGPA = parsedAggregateGPA;
      }

      try {
        await customFetch.post(url, data);
        queryClient.removeQueries({ queryKey: ['education'] });
        const { educationDetails } = await queryClient.fetchQuery(
          fetchStudentEducation()
        );
        store.dispatch(setEducationDetails({ educationDetails }));
        toast.success(`${courseLevel} data updated successfully!`);
        return redirect('/student-dashboard/');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message ||
          `Failed to update ${courseLevel} data!`;
        toast.error(errorMessage);
        return error;
      }
    }

    /* CREATE NEW EXPERIENCE */
    if (intent === 'createExperience') {
      const url = `/student/experience/`;
      try {
        await customFetch.post(url, formData);
        document.getElementById('experienceModal').close();
        queryClient.removeQueries({ queryKey: ['experiences'] });
        const { experiences } = await queryClient.fetchQuery(
          fetchStudentExperiences()
        );
        store.dispatch(setExperiences({ experiences }));
        toast.success('Experience added successfully!');
        return redirect('/student-dashboard/');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || 'Failed to add experience!';
        document.getElementById('experienceFormError').innerText = errorMessage;
        return error;
      }
    }

    /* UPDATE EXPERIENCE */
    if (intent === 'updateExperience') {
      const id = formData.get('experienceId');
      const url = `/student/experience/${id}`;
      try {
        await customFetch.patch(url, formData);
        queryClient.removeQueries({ queryKey: ['experiences'] });
        const { experiences } = await queryClient.fetchQuery(
          fetchStudentExperiences()
        );
        store.dispatch(setExperiences({ experiences }));
        document.getElementById('experienceModal').close();
        toast.success('Experience updated successfully!');
        return redirect('/student-dashboard/');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || 'Failed to update experience!';
        document.getElementById('experienceFormError').innerText = errorMessage;
        return error;
      }
    }

    /* CREATE NEW TRAINING */
    if (intent === 'createTraining') {
      const url = `/student/training/`;
      try {
        await customFetch.post(url, formData);
        queryClient.removeQueries({ queryKey: ['trainings'] });
        const { trainings } = await queryClient.fetchQuery(
          fetchStudentTrainings()
        );
        store.dispatch(setTrainings({ trainings }));
        document.getElementById('trainingModal').close();
        toast.success('Training added successfully!');
        return redirect('/student-dashboard/');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || 'Failed to add training!';
        document.getElementById('trainingFormError').innerText = errorMessage;
        return error;
      }
    }

    /* UPDATE TRAINING */
    if (intent === 'updateTraining') {
      const id = formData.get('trainingId');
      const url = `/student/training/${id}`;
      try {
        await customFetch.patch(url, formData);
        queryClient.removeQueries({ queryKey: ['trainings'] });
        const { trainings } = await queryClient.fetchQuery(
          fetchStudentTrainings()
        );
        store.dispatch(setTrainings({ trainings }));
        document.getElementById('trainingModal').close();
        toast.success('Training updated successfully!');
        return redirect('/student-dashboard/');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || 'Failed to update training!';
        document.getElementById('trainingFormError').innerText = errorMessage;
        return error;
      }
    }

    /* CREATE PLACEMENT */
    if (intent === 'createPlacement') {
      const url = `/student/placement/`;
      try {
        await customFetch.post(url, formData);
        queryClient.removeQueries({ queryKey: ['placements'] });
        const { placements } = await queryClient.fetchQuery(
          fetchStudentPlacements()
        );
        store.dispatch(setPlacements({ placements }));
        document.getElementById('placementModal').close();
        toast.success('Placement added successfully!');
        return redirect('/student-dashboard/');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || 'Failed to add placement!';
        document.getElementById('placementFormError').innerText = errorMessage;
        return error;
      }
    }

    /* UPDATE PLACEMENT */
    if (intent === 'updatePlacement') {
      const id = formData.get('placementId');
      const url = `/student/placement/${id}`;
      try {
        await customFetch.patch(url, formData);
        queryClient.removeQueries({ queryKey: ['placements'] });
        const { placements } = await queryClient.fetchQuery(
          fetchStudentPlacements()
        );
        store.dispatch(setPlacements({ placements }));
        document.getElementById('placementModal').close();
        toast.success('Placement updated successfully!');
        return redirect('/student-dashboard/');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || 'Failed to update placement!';
        document.getElementById('placementFormError').innerText = errorMessage;
        return error;
      }
    }

    /* CREATE SKILL */
    if (intent === 'createSkill') {
      const url = `/student/skills`;
      try {
        await customFetch.post(url, formData);
        queryClient.removeQueries({ queryKey: ['skills'] });
        const { skills } = await queryClient.fetchQuery(fetchStudentSkills());
        store.dispatch(setSkills({ skills }));
        document.getElementById('skillModal').close();
        toast.success('Skill created successfully!');
        document.getElementById("skillForm").reset();
        return redirect('/student-dashboard/');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || 'Failed to create skill!';
        document.getElementById('skillFormError').innerText = errorMessage;
        return error;
      }
    }

    /* UPDATE SKILL */
    if (intent === 'updateSkill') {
      const url = `/student/skills`;
      try {
        await customFetch.patch(url, formData);
        queryClient.removeQueries({ queryKey: ['skills'] });
        const { skills } = await queryClient.fetchQuery(fetchStudentSkills());
        store.dispatch(setSkills({ skills }));
        document.getElementById('skillModal').close();
        toast.success('Skill updated successfully!');
        document.getElementById("skillForm").reset();
        return redirect('/student-dashboard/');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || 'Failed to update skill!';
        document.getElementById('skillFormError').innerText = errorMessage;
        return error;
      }
    }

    /* CREATE ACHIEVEMENT */
    if (intent === 'createAchievement') {
      const url = `/student/achievements`;
      try {
        await customFetch.post(url, formData);
        queryClient.removeQueries({ queryKey: ['achievements'] });
        const { achievements } = await queryClient.fetchQuery(
          fetchStudentAchievements()
        );
        store.dispatch(setAchievements({ achievements }));
        document.getElementById('achievementModal').close();
        toast.success('Achievement created successfully!');
        document.getElementById("achievementForm").reset();
        return redirect('/student-dashboard/');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || 'Failed to create achievement!';
        document.getElementById('achievementFormError').innerText =
          errorMessage;
        return error;
      }
    }

    /* UPDATE ACHIEVEMENT */
    if (intent === 'updateAchievement') {
      const url = `/student/achievements`;
      try {
        await customFetch.patch(url, formData);
        queryClient.removeQueries({ queryKey: ['achievements'] });
        const { achievements } = await queryClient.fetchQuery(
          fetchStudentAchievements()
        );
        store.dispatch(setAchievements({ achievements }));
        document.getElementById('achievementModal').close();
        toast.success('Achievement updated successfully!');
        document.getElementById("achievementForm").reset();
        return redirect('/student-dashboard/');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || 'Failed to update achievement!';
        document.getElementById('achievementFormError').innerText =
          errorMessage;
        return error;
      }
    }
  };
};

export const loader = (queryClient, store) => {
  return async function () {
    try {
      const { profileDetails } = await queryClient.ensureQueryData(
        fetchStudentPrivateProfile()
      );
      store.dispatch(initialProfileSetup({ profileDetails, type: 'private' }));
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

const StudentDetails = () => {
  return (
    <div className="flex flex-col gap-16 w-full max-w-6xl mx-auto py-10 px-4 animate-in fade-in duration-1000">
      <OfferStatus />
      <StudentIntro />

      <div className="space-y-24">
        {/* Profile & Password Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
            <StudentPersonal />
          </section>
          <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
            <ChangePassword />
          </section>
        </div>

        {/* Education Section */}
        <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          <StudentEducation />
        </section>

        {/* Career & Experience Section */}
        <div className="space-y-12">
          <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
            <StudentPlacement />
          </section>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
              <StudentExperience />
            </section>
            <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
              <StudentTraining />
            </section>
          </div>
        </div>

        {/* Skills & Achievements Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
            <SkillsTab />
          </section>
          <section className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
            <AchievementsTab />
          </section>
        </div>
      </div>
    </div>
  );
};
export default StudentDetails;
