const CustomAPIError = require('../errors');
const { CourseModel } = require('../models/Course');

function validateModelDoc(doc, message) {
  const error = doc.validateSync();
  if (error) {
    for (let key in error?.errors) {
      message = error?.errors?.[key]?.message;
      break;
    }
    throw new CustomAPIError.BadRequestError(message);
  }
}

async function validateJobReceivers({
  receivingCourses,
  receivingBatch,
  receivingDepartments,
}) {
  if (
    !Array.isArray(receivingCourses) ||
    !receivingCourses.length ||
    !receivingBatch?.trim() ||
    !Array.isArray(receivingDepartments) ||
    !receivingDepartments.length
  ) {
    throw new CustomAPIError.BadRequestError('Invalid job receivers!');
  }

  const courses = [];
  const allAvailableDepartments = new Map();
  const allAvailableBatches = new Map();

  for (let courseId of receivingCourses) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new CustomAPIError.BadRequestError(
        `Invalid course provided with id: ${courseId}`
      );
    }
    courses.push({ id: course._id, courseName: course.courseName });
    
    // Collect all departments and batches from this course
    course.departments.forEach((dept, id) => allAvailableDepartments.set(id, dept));
    course.batches.forEach((batch, id) => allAvailableBatches.set(id, batch));
  }

  // Use the first course to validate the batch (or ensure it exists in the pool)
  const batch = allAvailableBatches.get(receivingBatch);
  if (!batch)
    throw new CustomAPIError.BadRequestError(
      `Invalid batch provided with id: ${receivingBatch}`
    );

  const departments = [];

  for (let receivingDepartment of receivingDepartments) {
    const department = allAvailableDepartments.get(receivingDepartment);
    if (!department)
      throw new CustomAPIError.BadRequestError(
        `Invalid department provided with id: ${receivingDepartment}`
      );
    departments.push({
      id: department._id,
      departmentName: department.departmentName,
    });
  }

  return {
    courses,
    batch: { id: batch._id, batchYear: batch.batchYear },
    departments,
  };
}

async function validateStudentCourse({
  courseId,
  departmentId,
  batchId,
  isLateralEntry,
}) {
  const course = await CourseModel.findById(courseId);
  if (!course)
    throw new CustomAPIError.BadRequestError(
      `No course found with id: ${courseId}`
    );

  if (isLateralEntry && !course.isLateralAllowed)
    throw new CustomAPIError.BadRequestError(
      "Lateral Entry isn't allowed for this course"
    );

  const department = course.departments.get(departmentId);
  if (!department)
    throw new CustomAPIError.BadRequestError(
      `Invalid Department Id: ${departmentId}`
    );

  const batch = course.batches.get(batchId);
  if (!batch)
    throw new CustomAPIError.BadRequestError(`Invalid Batch Id: ${batchId}`);

  const yearsCount = isLateralEntry
    ? course.lateralYearsCount
    : course.regularYearsCount;

  const semestersCount = isLateralEntry
    ? course.lateralSemestersCount
    : course.regularSemestersCount;

  return {
    courseName: course.courseName,
    courseLevel: course.courseLevel,
    departmentName: department.departmentName,
    batchYear: batch.batchYear,
    yearsCount,
    semestersCount,
  };
}

module.exports = {
  validateModelDoc,
  validateJobReceivers,
  validateStudentCourse,
};
