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
    { key: 'tenthCompletionYear', label: '10th Completion Year', value: studentEducation?.highschool?.passingYear },
    { key: 'twelfthCompletionYear', label: '12th Completion Year', value: studentEducation?.intermediate?.passingYear },
    { key: 'graduationCompletionYear', label: 'Graduation Year', value: studentEducation?.graduation?.passingYear },
  ];

  // 1. Diploma (SPECIAL CASE)
  if (eligibilityCriteria.diplomaPercentage != null) {
    if (student?.isLateralEntry) {
      totalCriteria++;
      const studentScore = studentEducation?.diploma?.score;
      if (studentScore == null) {
        reasons.push("Missing diploma marks in your profile (Required for Lateral Entry)");
      } else if (studentScore < eligibilityCriteria.diplomaPercentage) {
        reasons.push(`Diploma marks (${studentScore}%) below required ${eligibilityCriteria.diplomaPercentage}%`);
      } else {
        matchCount++;
      }
    } else if (studentEducation?.diploma?.score != null) {
      // Non-lateral student but has diploma marks provided - still check them for consistency
      totalCriteria++;
      if (studentEducation.diploma.score < eligibilityCriteria.diplomaPercentage) {
        reasons.push(`Diploma marks (${studentEducation.diploma.score}%) below required ${eligibilityCriteria.diplomaPercentage}%`);
      } else {
        matchCount++;
      }
    }
    // If not lateral and no diploma marks, we skip this criteria entirely for this student.
  }

  // 2. Percentages & CGPA & Backlogs & Years
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
        } else if (key.endsWith('Year')) {
          // Years: Must match exactly
          if (value !== threshold) {
            reasons.push(`${label} must be ${threshold} (yours: ${value})`);
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

  // 3. DOB (Born Before/On)
  if (eligibilityCriteria.maxDOB) {
    totalCriteria++;
    if (!studentPersonal?.dateOfBirth) {
      reasons.push("Date of Birth missing in your profile");
    } else {
      const studentDOB = new Date(studentPersonal.dateOfBirth);
      const maxDOB = new Date(eligibilityCriteria.maxDOB);
      if (studentDOB > maxDOB) {
        reasons.push(`Birth date must be on or before ${maxDOB.toLocaleDateString()}`);
      } else {
        matchCount++;
      }
    }
  }

  // 4. DOB (Born After/On)
  if (eligibilityCriteria.minDOB) {
    totalCriteria++;
    if (!studentPersonal?.dateOfBirth) {
      if (!reasons.includes("Date of Birth missing in your profile")) {
        reasons.push("Date of Birth missing in your profile");
      }
    } else {
      const studentDOB = new Date(studentPersonal.dateOfBirth);
      const minDOB = new Date(eligibilityCriteria.minDOB);
      if (studentDOB < minDOB) {
        reasons.push(`Birth date must be on or after ${minDOB.toLocaleDateString()}`);
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
