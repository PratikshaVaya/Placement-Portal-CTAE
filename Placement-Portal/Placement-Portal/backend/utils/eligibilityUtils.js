/**
 * Check if a student meets the job's eligibility criteria
 * @param {Object} studentEducation - Student's education data
 * @param {Object} eligibilityCriteria - Job's eligibility criteria
 * @param {Object} studentPersonal - Student's personal data (for DOB)
 * @param {Object} student - Student user data (for backlogs)
 * @returns {Object} - { isEligible: boolean, reasons: [], matchCount: number, totalCriteria: number }
 */
const checkAcademicEligibility = (
  studentEducation,
  eligibilityCriteria = {},
  studentPersonal = null,
  student = null
) => {
  const reasons = [];
  let matchCount = 0;
  let totalCriteria = 0;

  // Criteria fields to check
  const criteriaMap = [
    { key: 'tenthPercentage', label: '10th %', value: studentEducation?.highschool?.score },
    { key: 'twelfthPercentage', label: '12th %', value: studentEducation?.intermediate?.score },
    { key: 'graduationPercentage', label: 'Graduation %', value: studentEducation?.graduation?.aggregateGPA ? studentEducation.graduation.aggregateGPA * 10 : null },
    { key: 'graduationCGPA', label: 'Graduation CGPA', value: studentEducation?.graduation?.aggregateGPA },
    { key: 'maxActiveBacklogs', label: 'Active Backlogs', value: student?.activeBacklogs },
    { key: 'maxCompletedBacklogs', label: 'Completed Backlogs', value: student?.completedBacklogs },
  ];

  // 1. Diploma (SPECIAL CASE)
  if (eligibilityCriteria.diplomaPercentage != null) {
    totalCriteria++;
    const isDiplomaStudent = student?.isLateralEntry || studentEducation?.diploma?.score != null;
    
    if (isDiplomaStudent) {
      const studentScore = studentEducation?.diploma?.score;
      if (studentScore == null) {
        reasons.push("Missing diploma marks in your profile");
      } else if (studentScore < eligibilityCriteria.diplomaPercentage) {
        reasons.push(`Diploma marks (${studentScore}%) below required ${eligibilityCriteria.diplomaPercentage}%`);
      } else {
        matchCount++;
      }
    } else {
      // Not a diploma student, so skip this criteria (auto-match)
      matchCount++;
    }
  }

  // 2. Percentages & CGPA & Backlogs
  criteriaMap.forEach(({ key, label, value }) => {
    const threshold = eligibilityCriteria[key];
    if (threshold != null) {
      totalCriteria++;
      if (value == null) {
        reasons.push(`${label} data missing in your profile`);
      } else {
        if (key.startsWith('max')) {
          // Backlogs: Reject if value > threshold
          if (value > threshold) {
            reasons.push(`${label} (${value}) exceeds limit (${threshold})`);
          } else {
            matchCount++;
          }
        } else {
          // Percentages/CGPA: Reject if value < threshold
          if (value < threshold) {
            reasons.push(`${label} (${value}${key.includes('Percentage') ? '%' : ''}) below required ${threshold}${key.includes('Percentage') ? '%' : ''}`);
          } else {
            matchCount++;
          }
        }
      }
    }
  });

  // 3. DOB
  if (eligibilityCriteria.maxDOB) {
    totalCriteria++;
    if (!studentPersonal?.dateOfBirth) {
      reasons.push("Date of Birth missing in your profile");
    } else {
      const studentDOB = new Date(studentPersonal.dateOfBirth);
      const maxDOB = new Date(eligibilityCriteria.maxDOB);
      // student.dob <= required date (must be older/at least as old as the maxDOB)
      if (studentDOB > maxDOB) {
        reasons.push(`Birth date must be on or before ${maxDOB.toLocaleDateString()}`);
      } else {
        matchCount++;
      }
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
    matchCount,
    totalCriteria,
  };
};

module.exports = {
  checkAcademicEligibility,
};
