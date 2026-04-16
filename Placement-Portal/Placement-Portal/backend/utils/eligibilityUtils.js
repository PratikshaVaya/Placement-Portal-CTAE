/**
 * Check if a student meets the job's eligibility criteria
 * @param {Object} studentEducation - Student's education data
 * @param {Object} eligibilityCriteria - Job's eligibility criteria
 * @param {Object} studentPersonal - Student's personal data (for DOB)
 * @param {Object} student - Student user data (for backlogs)
 * @returns {Object} - { isEligible: boolean, reasons: [] }
 */
const checkAcademicEligibility = (
  studentEducation,
  eligibilityCriteria,
  studentPersonal = null,
  student = null
) => {
  const reasons = [];

  if (!eligibilityCriteria || Object.keys(eligibilityCriteria).length === 0) {
    return { isEligible: true, reasons: [] };
  }

  if (!studentEducation) {
    return {
      isEligible: false,
      reasons: ['Your education details are incomplete. Please complete your profile.'],
    };
  }

  const isLateral = !!studentEducation?.isLateralEntry;

  // 1. Check 10th percentage (Applies to ALL)
  if (eligibilityCriteria.tenthPercentage !== undefined && eligibilityCriteria.tenthPercentage !== null) {
    if (!studentEducation?.highschool?.score) {
      reasons.push(
        `Your 10th marks data is missing. Required: ${eligibilityCriteria.tenthPercentage}%`
      );
    } else if (studentEducation.highschool.score < eligibilityCriteria.tenthPercentage) {
      reasons.push(
        `Your 10th mark (${studentEducation.highschool.score}%) is below the required ${eligibilityCriteria.tenthPercentage}%`
      );
    }
  }

  // 2. Check 12th percentage (Only for REGULAR students)
  if (!isLateral && eligibilityCriteria.twelfthPercentage !== undefined && eligibilityCriteria.twelfthPercentage !== null) {
    if (!studentEducation?.intermediate?.score) {
      reasons.push(
        `Your 12th marks data is missing. Required: ${eligibilityCriteria.twelfthPercentage}%`
      );
    } else if (
      studentEducation.intermediate.score <
      eligibilityCriteria.twelfthPercentage
    ) {
      reasons.push(
        `Your 12th mark (${studentEducation.intermediate.score}%) is below the required ${eligibilityCriteria.twelfthPercentage}%`
      );
    }
  }

  // 3. Check Diploma percentage (Only for LATERAL entry students)
  if (isLateral && eligibilityCriteria.diplomaPercentage !== undefined && eligibilityCriteria.diplomaPercentage !== null) {
    if (!studentEducation?.diploma?.score) {
      reasons.push(
        `Your Diploma marks data is missing. Required: ${eligibilityCriteria.diplomaPercentage}%`
      );
    } else if (studentEducation.diploma.score < eligibilityCriteria.diplomaPercentage) {
      reasons.push(
        `Your Diploma mark (${studentEducation.diploma.score}%) is below the required ${eligibilityCriteria.diplomaPercentage}%`
      );
    }
  }

  // 4. Check Graduation percentage/CGPA (Applies to ALL)
  if (eligibilityCriteria.graduationPercentage || eligibilityCriteria.graduationCGPA) {
    if (studentEducation?.graduation?.aggregateGPA === undefined || studentEducation?.graduation?.aggregateGPA === null) {
      if (eligibilityCriteria.graduationPercentage) {
        reasons.push(
          `Your graduation percentage data is missing. Required: ${eligibilityCriteria.graduationPercentage}%`
        );
      }
      if (eligibilityCriteria.graduationCGPA) {
        reasons.push(
          `Your graduation CGPA data is missing. Required: ${eligibilityCriteria.graduationCGPA}`
        );
      }
    } else {
      const gpa = studentEducation.graduation.aggregateGPA;

      if (eligibilityCriteria.graduationPercentage) {
        // Convert CGPA to percentage (Assuming CGPA * 10)
        const studentGradPercentage = gpa * 10;
        if (studentGradPercentage < eligibilityCriteria.graduationPercentage) {
          reasons.push(
            `Your graduation percentage (${studentGradPercentage.toFixed(2)}%) is below the required ${eligibilityCriteria.graduationPercentage}%`
          );
        }
      }

      if (eligibilityCriteria.graduationCGPA) {
        if (gpa < eligibilityCriteria.graduationCGPA) {
          reasons.push(
            `Your graduation CGPA (${gpa.toFixed(2)}) is below the required ${eligibilityCriteria.graduationCGPA}`
          );
        }
      }
    }
  }

  // 5. Check active backlogs
  if (eligibilityCriteria.maxActiveBacklogs !== undefined && eligibilityCriteria.maxActiveBacklogs !== null) {
    const activeBacklogs = student?.activeBacklogs ?? 0;
    if (activeBacklogs > eligibilityCriteria.maxActiveBacklogs) {
      reasons.push(
        `Your active backlogs (${activeBacklogs}) exceed the allowed limit (${eligibilityCriteria.maxActiveBacklogs})`
      );
    }
  }

  // 6. Check completed backlogs
  if (eligibilityCriteria.maxCompletedBacklogs !== undefined && eligibilityCriteria.maxCompletedBacklogs !== null) {
    const completedBacklogs = student?.completedBacklogs ?? 0;
    if (completedBacklogs > eligibilityCriteria.maxCompletedBacklogs) {
      reasons.push(
        `Your completed backlogs (${completedBacklogs}) exceed the allowed limit (${eligibilityCriteria.maxCompletedBacklogs})`
      );
    }
  }

  // 7. Check DOB / Age eligibility
  if (eligibilityCriteria.maxDOB) {
    if (!studentPersonal?.dateOfBirth) {
      reasons.push(
        'Your date of birth is missing. Please update your personal details.'
      );
    } else {
      const studentDOB = new Date(studentPersonal.dateOfBirth);
      const maxDOB = new Date(eligibilityCriteria.maxDOB);

      if (studentDOB > maxDOB) {
        const age = Math.floor((new Date() - studentDOB) / (365.25 * 24 * 60 * 60 * 1000));
        const requiredAge = Math.floor((new Date() - maxDOB) / (365.25 * 24 * 60 * 60 * 1000));
        reasons.push(
          `Your age (${age} years) is below the required age for this role.`
        );
      }
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  };
};

module.exports = {
  checkAcademicEligibility,
};
