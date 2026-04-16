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
  receivingBatches,
  receivingDepartments,
}) {
  // Normalize inputs to arrays
  receivingCourses = Array.isArray(receivingCourses)
    ? receivingCourses
    : receivingCourses
    ? [receivingCourses]
    : [];
  receivingBatches = Array.isArray(receivingBatches)
    ? receivingBatches
    : receivingBatches
    ? [receivingBatches]
    : [];
  receivingDepartments = Array.isArray(receivingDepartments)
    ? receivingDepartments
    : receivingDepartments
    ? [receivingDepartments]
    : [];

  if (receivingCourses.length === 0)
    throw new CustomAPIError.BadRequestError('Courses are required!');

  if (receivingBatches.length === 0)
    throw new CustomAPIError.BadRequestError('Batches are required!');

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
    courses.push({ 
      id: course._id, 
      courseName: course.courseName.trim().toLowerCase() 
    });
    
    // Collect all departments and batches from this course
    course.departments.forEach((dept, id) => allAvailableDepartments.set(id, dept));
    course.batches.forEach((batch, id) => allAvailableBatches.set(id, batch));
  }

  const batches = [];
  for (let batchId of receivingBatches) {
    const batch = allAvailableBatches.get(batchId);
    if (!batch)
      throw new CustomAPIError.BadRequestError(
        `Invalid batch provided with id: ${batchId}`
      );
    batches.push({ id: batch._id, batchYear: batch.batchYear });
  }

  const departments = [];
  // If receivingDepartments is provided and not empty, validate each
  if (Array.isArray(receivingDepartments) && receivingDepartments.length > 0) {
    for (let receivingDepartment of receivingDepartments) {
      const department = allAvailableDepartments.get(receivingDepartment);
      if (!department)
        throw new CustomAPIError.BadRequestError(
          `Invalid department provided with id: ${receivingDepartment}`
        );
      departments.push({
        id: department._id,
        departmentName: department.departmentName.trim().toLowerCase(),
      });
    }
  }

  return {
    courses,
    batches,
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
    courseName: course.courseName.trim().toLowerCase(),
    courseLevel: course.courseLevel,
    departmentName: department.departmentName.trim().toLowerCase(),
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
