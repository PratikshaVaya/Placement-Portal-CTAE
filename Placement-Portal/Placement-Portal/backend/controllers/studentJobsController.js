const JobOpeningModel = require('../models/JobOpenings');
const UserModel = require('../models/User');
const PersonalDataModel = require('../models/student/PersonalData');
const CompanyModel = require('../models/Company');

const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('../errors');

const { fileUpload, checkAcademicEligibility } = require('../utils');

const {
  studentJobOpeningsAgg,
  studentJobsByStatusAgg,
  singleJobStudentAgg,
  studentJobApplicationsAgg,
} = require('../models/aggregations/');
const JobApplicationModel = require('../models/JobApplication');
const { EducationModel } = require('../models/student');
const OfferModel = require('../models/Offer');

const getJobsForStudent = async (req, res) => {
  const status = req?.query?.status?.toUpperCase() || 'open';
  const validStatus = ['OPEN', 'APPLIED', 'SHORTLISTED', 'REJECTED', 'HIRED'];
  
  const displayStatus = status === 'HIRED' ? 'HIRED' : status.toLowerCase();

  const { batchId, departmentId, courseId, userId } = req.user;

  if (!courseId || !batchId || !departmentId) {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Complete your profile (Course, Batch, Department) to see jobs',
      jobs: [],
    });
  }

  const student = await UserModel.findById(userId);
  const studentEducation = await EducationModel.findOne({ studentId: userId });
  const studentPersonal = await PersonalDataModel.findOne({ studentId: userId });

  // Requirement 6: Check for mandatory profile fields
  const isProfileComplete = 
    studentEducation?.highschool?.score != null &&
    studentEducation?.intermediate?.score != null &&
    studentEducation?.graduation?.aggregateGPA != null &&
    student?.activeBacklogs != null &&
    studentPersonal?.dateOfBirth != null;

  let jobs;
  if (displayStatus === 'open') {
    jobs = await JobOpeningModel.aggregate(
      studentJobOpeningsAgg({
        batchId,
        courseId,
        departmentId,
        userId,
      })
    );
  } else {
    jobs = await UserModel.aggregate(
      studentJobsByStatusAgg({ userId, status: displayStatus })
    );
  }

  const userSkills = (student.skills || []).map((s) => s.toLowerCase().trim());

  jobs = jobs.map((job) => {
    // Skill matching
    let requiredSkills = job.keySkills || [];
    let matchedSkills = [];
    let missingSkills = [];
    let skillMatchScore = 0;

    if (requiredSkills.length > 0) {
      requiredSkills.forEach((rSkill) => {
        if (userSkills.includes(rSkill.toLowerCase().trim())) {
          matchedSkills.push(rSkill);
        } else {
          missingSkills.push(rSkill);
        }
      });
      skillMatchScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
    } else {
      skillMatchScore = 100;
    }

    // Eligibility check
    let eligibilityStatus = { isEligible: true, reasons: [], matchCount: 0, totalCriteria: 0 };
    if (!isProfileComplete) {
      eligibilityStatus = {
        isEligible: false,
        reasons: ['Complete your profile to check eligibility'],
        matchCount: 0,
        totalCriteria: 0
      };
    } else if (job.enableEligibilityFilter && job.eligibilityCriteria) {
      eligibilityStatus = checkAcademicEligibility(
        studentEducation,
        job.eligibilityCriteria,
        studentPersonal,
        student
      );
    }

    return {
      ...job,
      matchFeature: {
        skillMatchScore,
        matchedSkills,
        missingSkills,
      },
      eligibilityStatus,
    };
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: isProfileComplete ? 'Jobs found!' : 'Complete your profile to see eligibility',
    jobs,
    hiredStatus: student.hiredStatus,
    hiredJobId: student.hiredJobId,
    isProfileComplete
  });

  student.lastJobFetched = new Date();
  await student.save();
};

const getStudentJobById = async (req, res) => {
  const jobId = req?.params?.jobId;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new CustomAPIError.BadRequestError('Invalid Job ID');
  }

  const { batchId, departmentId, courseId, userId } = req.user;

  const job = (
    await JobOpeningModel.aggregate(
      singleJobStudentAgg({ jobId, userId, batchId, departmentId, courseId })
    )
  )?.[0];

  if (!job)
    throw new CustomAPIError.NotFoundError('Job not found or not targeted for you.');

  const student = await UserModel.findById(userId);
  const studentEducation = await EducationModel.findOne({ studentId: userId });
  const studentPersonal = await PersonalDataModel.findOne({ studentId: userId });

  const isProfileComplete = 
    studentEducation?.highschool?.score != null &&
    studentEducation?.intermediate?.score != null &&
    studentEducation?.graduation?.aggregateGPA != null &&
    student?.activeBacklogs != null &&
    studentPersonal?.dateOfBirth != null;

  let eligibilityStatus = { isEligible: true, reasons: [], matchCount: 0, totalCriteria: 0 };
  if (!isProfileComplete) {
    eligibilityStatus = {
      isEligible: false,
      reasons: ['Complete your profile to check eligibility'],
      matchCount: 0,
      totalCriteria: 0
    };
  } else if (job.enableEligibilityFilter && job.eligibilityCriteria) {
    eligibilityStatus = checkAcademicEligibility(
      studentEducation,
      job.eligibilityCriteria,
      studentPersonal,
      student
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    job: { ...job, eligibilityStatus, isProfileComplete },
  });
};

const createJobApplication = async (req, res) => {
  const { portfolio, coverLetter } = req?.body;
  const resumeFile = req?.files?.resumeFile;
  const jobId = req?.params?.id;
  const { userId: applicantId } = req.user;

  // Requirement 4: Application Restriction
  const applicant = await UserModel.findById(applicantId);
  if (['OFFER_ACCEPTED', 'OFFER_REJECTED'].includes(applicant.hiredStatus)) {
    throw new CustomAPIError.BadRequestError('You have already finalized an offer and cannot apply further.');
  }

  const job = await JobOpeningModel.findById(jobId);
  if (!job || job.status !== 'open') throw new CustomAPIError.BadRequestError('Job is not open.');

  // Final check: Targeting Logic (Multi Batch/Dept)
  const studentBatchId = applicant.batchId.toString();
  const studentDeptId = applicant.departmentId.toString();
  
  const matchesBatch = job.receivingBatch.length === 0 || job.receivingBatch.some(b => b.id.toString() === studentBatchId);
  const matchesDept = job.receivingDepartments.length === 0 || job.receivingDepartments.some(d => d.id.toString() === studentDeptId);

  if (!matchesBatch || !matchesDept) {
    throw new CustomAPIError.BadRequestError('You are not targeted for this job.');
  }

  // Eligibility check inside apply
  const studentEducation = await EducationModel.findOne({ studentId: applicantId });
  const studentPersonal = await PersonalDataModel.findOne({ studentId: applicantId });
  
  const eligibility = checkAcademicEligibility(studentEducation, job.eligibilityCriteria, studentPersonal, applicant);
  if (!eligibility.isEligible) {
    throw new CustomAPIError.BadRequestError(`Eligibility failed: ${eligibility.reasons.join(', ')}`);
  }

  const existingApplication = await JobApplicationModel.findOne({ jobId, applicantId });
  if (existingApplication) {
    throw new CustomAPIError.BadRequestError('You have already applied for this job.');
  }

  const fileUploadResp = await fileUpload(resumeFile, 'resumes', 'document');
  const resume = fileUploadResp?.fileURL;

  const jobApplication = await JobApplicationModel.create({
    jobId,
    applicantId,
    applicantName: applicant.name,
    coverLetter,
    portfolio,
    resume,
    companyId: job.company.id,
  });

  job.applicants.push(applicantId);
  job.applications.push(jobApplication._id);
  await job.save();

  applicant.jobsApplied.push(jobId);
  applicant.jobApplications.push(jobApplication._id);
  await applicant.save();

  res.status(StatusCodes.CREATED).json({ success: true, message: 'Applied successfully!' });
};

const getApplications = async (req, res) => {
  const applicantId = req?.user?.userId;
  const applications = await JobApplicationModel.aggregate(
    studentJobApplicationsAgg({ applicantId })
  );
  res.status(StatusCodes.OK).json({ success: true, applications });
};

const getOfferStatus = async (req, res) => {
  const userId = req.user.userId;
  const application = await JobApplicationModel.findOne({ 
    applicantId: userId, 
    status: { $in: ['OFFER_SENT', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'HIRED'] } 
  }).populate('jobId').populate('companyId');

  if (!application) {
    return res.status(StatusCodes.OK).json({ success: true, offer: null });
  }

  const offer = {
    ...application.toObject(),
    jobTitle: application.jobId?.profile,
    companyName: application.companyId?.name,
    offerLetter: application.offerLetterUrl,
  };

  res.status(StatusCodes.OK).json({ success: true, offer });
};

const acceptOffer = async (req, res) => {
  const userId = req.user.userId;
  const user = await UserModel.findById(userId);
  if (user.hiredStatus !== 'OFFER_SENT') throw new CustomAPIError.BadRequestError('No pending offer.');

  const application = await JobApplicationModel.findOne({ applicantId: userId, status: 'OFFER_SENT' });
  application.status = 'OFFER_ACCEPTED';
  await application.save();

  user.hiredStatus = 'OFFER_ACCEPTED';
  await user.save();

  const company = await CompanyModel.findById(application.companyId);
  company.candidatesHired = (company.candidatesHired || 0) + 1;
  await company.save();

  res.status(StatusCodes.OK).json({ success: true, message: 'Offer accepted!' });
};

const rejectOffer = async (req, res) => {
  const userId = req.user.userId;
  const user = await UserModel.findById(userId);
  if (user.hiredStatus !== 'OFFER_SENT') throw new CustomAPIError.BadRequestError('No pending offer.');

  const application = await JobApplicationModel.findOne({ applicantId: userId, status: 'OFFER_SENT' });
  application.status = 'OFFER_REJECTED';
  await application.save();

  user.hiredStatus = 'OFFER_REJECTED';
  await user.save();

  res.status(StatusCodes.OK).json({ success: true, message: 'Offer rejected.' });
};

module.exports = {
  getJobsForStudent,
  createJobApplication,
  getStudentJobById,
  getApplications,
  getOfferStatus,
  acceptOffer,
  rejectOffer,
};
