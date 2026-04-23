const JobApplicationModel = require('../models/JobApplication');
const { PlacementModel } = require('../models/student');
const UserModel = require('../models/User');

/**
 * Recalculates and updates the placement status of a student
 * based on their on-campus applications and manual placement records.
 */
const updateStudentPlacementStatus = async (studentId) => {
  const student = await UserModel.findById(studentId);
  if (!student) return;

  // 1. Check for on-campus offers
  // Statuses that count as an offer: OFFER_SENT, OFFER_ACCEPTED, OFFER_REJECTED, HIRED
  const onCampusOffer = await JobApplicationModel.findOne({
    applicantId: studentId,
    status: { $in: ['OFFER_SENT', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'HIRED'] }
  });

  // 2. Check for off-campus offers in manual placement records
  const offCampusOffer = await PlacementModel.findOne({
    studentId,
    isOnCampus: false
  });

  let isPlaced = false;
  let placementType = 'none';

  if (onCampusOffer && offCampusOffer) {
    isPlaced = true;
    placementType = 'both';
  } else if (onCampusOffer) {
    isPlaced = true;
    placementType = 'on-campus';
  } else if (offCampusOffer) {
    isPlaced = true;
    placementType = 'off-campus';
  }

  student.isPlaced = isPlaced;
  student.placementType = placementType;
  
  // Also sync the hiredStatus for backward compatibility if it's an on-campus offer
  if (onCampusOffer) {
    student.hiredStatus = onCampusOffer.status;
    student.hiredJobId = onCampusOffer.jobId;
    student.hiredApplicationId = onCampusOffer._id;
  } else if (!offCampusOffer) {
    student.hiredStatus = 'none';
    student.hiredJobId = null;
    student.hiredApplicationId = null;
  }

  await student.save();
  return { isPlaced, placementType };
};

module.exports = {
  updateStudentPlacementStatus,
};
