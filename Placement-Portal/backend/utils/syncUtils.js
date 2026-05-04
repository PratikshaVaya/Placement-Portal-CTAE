const mongoose = require('mongoose');

/**
 * Synchronize course name changes across the system.
 */
async function syncCourseName(courseId, newName) {
  const UserModel = require('../models/User');
  const JobOpeningModel = require('../models/JobOpenings');

  await Promise.all([
    UserModel.updateMany({ courseId }, { courseName: newName }),
    JobOpeningModel.updateMany(
      { 'receivingCourses.id': courseId },
      { $set: { 'receivingCourses.$[elem].courseName': newName } },
      { arrayFilters: [{ 'elem.id': courseId }] }
    ),
  ]);
}

/**
 * Synchronize department name changes across the system.
 */
async function syncDepartmentName(courseId, departmentId, oldName, newName) {
  const UserModel = require('../models/User');
  const JobOpeningModel = require('../models/JobOpenings');
  const { PlacementModel: PlacementDataModel } = require('../models/student');

  await Promise.all([
    UserModel.updateMany(
      { courseId, departmentId },
      { departmentName: newName }
    ),
    PlacementDataModel.updateMany(
      { departmentName: oldName },
      { departmentName: newName }
    ),
    JobOpeningModel.updateMany(
      { 'receivingDepartments.id': departmentId },
      { $set: { 'receivingDepartments.$[elem].departmentName': newName } },
      { arrayFilters: [{ 'elem.id': departmentId }] }
    ),
  ]);
}

/**
 * Synchronize batch year changes across the system.
 */
async function syncBatchYear(courseId, batchId, newYear) {
  const UserModel = require('../models/User');
  const JobOpeningModel = require('../models/JobOpenings');

  await Promise.all([
    UserModel.updateMany(
      { courseId, batchId },
      { batchYear: newYear }
    ),
    JobOpeningModel.updateMany(
      { 'receivingBatch.id': batchId },
      { $set: { 'receivingBatch.$[elem].batchYear': newYear } },
      { arrayFilters: [{ 'elem.id': batchId }] }
    ),
  ]);
}

module.exports = {
  syncCourseName,
  syncDepartmentName,
  syncBatchYear,
};
