const JobOpeningModel = require('../models/JobOpenings');
const CompanyModel = require('../models/Company');
const JobApplicationModel = require('../models/JobApplication');
const mongoose = require('mongoose');

const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('../errors');

const { validateJobReceivers } = require('../utils');

const {
  jobApplicationsAgg,
  jobApplicationsAggWithFilters,
  companyInchargeJobsAgg,
  studentProfileDetailsAgg,
  singleJobCompanyAgg,
  singleJobApplicationsAgg,
} = require('../models/aggregations');
const UserModel = require('../models/User');

const { fileUpload } = require('../utils');
const { PlacementModel, EducationModel } = require('../models/student');

const createJobOpening = async (req, res) => {
  const {
    profile,
    description,
    location,
    jobPackage,
    receivingCourses,
    receivingBatch,
    receivingBatches,
    receivingDepartments,
    keySkills,
    openingsCount,
    deadline,
    cgpaCutoff,
    enableEligibilityFilter,
    tenthPercentage,
    twelfthPercentage,
    diplomaPercentage,
    graduationPercentage,
    graduationCGPA,
    maxActiveBacklogs,
    maxCompletedBacklogs,
    maxDOB,
  } = req.body;

  const { userId, companyId } = req.user;

  if (!companyId?.trim())
    throw new CustomAPIError.BadRequestError('Company is required!');

  const company = await CompanyModel.findById(companyId);
  const companyAdmin = await UserModel.findById(userId);

  if (!company)
    throw new CustomAPIError.BadRequestError(
      `No company is found with id: ${companyId}`
    );

  if (companyAdmin.companyId != companyId)
    throw new CustomAPIError.UnauthorizedError(
      'Not allowed to access this resource'
    );

  const { courses, batch, departments } = await validateJobReceivers({
    receivingCourses,
    receivingBatches: receivingBatches || (receivingBatch ? [receivingBatch] : []),
    receivingDepartments,
  });

  const eligibilityCriteria =
    enableEligibilityFilter === 'true' || enableEligibilityFilter === true
      ? {
          tenthPercentage: tenthPercentage ? Number(tenthPercentage) : null,
          twelfthPercentage: twelfthPercentage ? Number(twelfthPercentage) : null,
          diplomaPercentage: diplomaPercentage ? Number(diplomaPercentage) : null,
          graduationPercentage: graduationPercentage ? Number(graduationPercentage) : null,
          graduationCGPA: graduationCGPA ? Number(graduationCGPA) : null,
          maxActiveBacklogs: maxActiveBacklogs !== undefined && maxActiveBacklogs !== '' ? Number(maxActiveBacklogs) : null,
          maxCompletedBacklogs: maxCompletedBacklogs !== undefined && maxCompletedBacklogs !== '' ? Number(maxCompletedBacklogs) : null,
          maxDOB: maxDOB ? new Date(maxDOB) : null,
        }
      : {};

  const openingsCountValue = Number(openingsCount);
  const jobOpening = await JobOpeningModel.create({
    profile,
    description,
    location,
    company: {
      id: company._id,
      name: company.name,
      website: company.website,
    },
    jobPackage,
    receivingCourses: courses,
    receivingBatch: batch,
    receivingDepartments: departments,
    keySkills,
    postedBy: {
      id: companyAdmin._id,
      name: companyAdmin.name,
    },
    openingsCount: openingsCountValue,
    deadline,
    cgpaCutoff,
    enableEligibilityFilter: enableEligibilityFilter === 'true' || enableEligibilityFilter === true,
    eligibilityCriteria,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Created Job Opening',
    id: jobOpening._id,
  });

  // Increment company stats
  company.jobsPosted = (company.jobsPosted || 0) + 1;
  company.openingsCreated = (company.openingsCreated || 0) + (openingsCountValue || 1);
  await company.save();
};

const getJobsForIncharge = async (req, res) => {
  const { companyId, userId } = req.user;
  const status = req?.query?.status || 'open';

  const validStatus = ['open', 'expired'];
  if (!validStatus.includes(status)) {
    throw new CustomAPIError.BadRequestError('Invalid status');
  }

  const company = await CompanyModel.findById(companyId);
  if (!company)
    throw new CustomAPIError.NotFoundError(`No company found with id: ${companyId}`);
  
  if (!company.admins.includes(userId))
    throw new CustomAPIError.UnauthorizedError(`Not allowed to access this resource!`);

  // Background sync: mark any open jobs with past deadlines as 'expired' in the DB
  // This runs without blocking the response
  if (mongoose.Types.ObjectId.isValid(companyId)) {
    JobOpeningModel.updateMany(
      {
        'company.id': new mongoose.Types.ObjectId(companyId),
        status: 'open',
        deadline: { $lt: new Date() },
      },
      { $set: { status: 'expired' } }
    ).catch((err) => console.error('Failed to auto-expire jobs:', err));
  }

  const jobs = await JobOpeningModel.aggregate(
    companyInchargeJobsAgg({ companyId, status })
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found job openings!',
    jobs,
  });
};

const getSingleJob = async (req, res) => {
  const jobId = req?.params?.jobId;
  const companyId = req?.user?.companyId;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new CustomAPIError.BadRequestError('Invalid Job ID');
  }
  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    throw new CustomAPIError.BadRequestError('Invalid Company ID (Unauthorized or Session Expired)');
  }

  const job = (
    await JobOpeningModel.aggregate(
      singleJobCompanyAgg({ companyId, jobId })
    )
  )?.[0];

  if (!job)
    throw new CustomAPIError.NotFoundError(`No job found with id: ${jobId}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found job',
    job,
  });
};

const updateJobOpening = async (req, res) => {
  const jobId = req?.params?.jobId;
  const { userId, companyId } = req.user;

  const companyAdmin = await UserModel.findById(userId);
  if (companyAdmin.companyId != companyId)
    throw new CustomAPIError.UnauthorizedError('Not allowed to access this resource');

  const existingJob = await JobOpeningModel.findById(jobId);
  if (!existingJob) throw new CustomAPIError.NotFoundError(`No job found with id: ${jobId}`);

  const {
    profile, description, location, jobPackage, receivingCourses,
    receivingBatch, receivingBatches, receivingDepartments, keySkills, openingsCount,
    deadline, cgpaCutoff, enableEligibilityFilter, tenthPercentage,
    twelfthPercentage, diplomaPercentage, graduationPercentage,
    graduationCGPA, maxActiveBacklogs, maxCompletedBacklogs, maxDOB,
  } = req.body;

  const updateData = {};
  if (profile !== undefined) updateData.profile = profile;
  if (description !== undefined) updateData.description = description;
  if (location !== undefined) updateData.location = location;
  if (jobPackage !== undefined) updateData.jobPackage = jobPackage;
  if (keySkills !== undefined) updateData.keySkills = keySkills;
  if (openingsCount !== undefined) updateData.openingsCount = Number(openingsCount);
  if (deadline !== undefined) updateData.deadline = deadline;
  if (cgpaCutoff !== undefined) updateData.cgpaCutoff = cgpaCutoff;
  if (enableEligibilityFilter !== undefined) updateData.enableEligibilityFilter = enableEligibilityFilter === 'true' || enableEligibilityFilter === true;

  if (receivingCourses || receivingBatch || receivingBatches || receivingDepartments) {
    const { courses, batch, departments } = await validateJobReceivers({
      receivingCourses: receivingCourses || 
        (Array.isArray(existingJob.receivingCourses) 
          ? existingJob.receivingCourses.map(c => c.id.toString()) 
          : existingJob.receivingCourses?.id ? [existingJob.receivingCourses.id.toString()] : []),
      receivingBatches: receivingBatches || (receivingBatch ? [receivingBatch] : null) || 
        (Array.isArray(existingJob.receivingBatch) 
          ? existingJob.receivingBatch.map(b => b.id.toString()) 
          : existingJob.receivingBatch?.id ? [existingJob.receivingBatch.id.toString()] : []),
      receivingDepartments: receivingDepartments || 
        (Array.isArray(existingJob.receivingDepartments) 
          ? existingJob.receivingDepartments.map(d => d.id.toString()) 
          : existingJob.receivingDepartments?.id ? [existingJob.receivingDepartments.id.toString()] : []),
    });
    if (courses) updateData.receivingCourses = courses;
    if (batch) updateData.receivingBatch = batch;
    if (departments) updateData.receivingDepartments = departments;
  }

  if (updateData.enableEligibilityFilter || (enableEligibilityFilter === undefined && existingJob.enableEligibilityFilter)) {
    const ec = { ...existingJob.eligibilityCriteria.toObject() };
    if (tenthPercentage !== undefined) ec.tenthPercentage = tenthPercentage ? Number(tenthPercentage) : null;
    if (twelfthPercentage !== undefined) ec.twelfthPercentage = twelfthPercentage ? Number(twelfthPercentage) : null;
    if (diplomaPercentage !== undefined) ec.diplomaPercentage = diplomaPercentage ? Number(diplomaPercentage) : null;
    if (graduationPercentage !== undefined) ec.graduationPercentage = graduationPercentage ? Number(graduationPercentage) : null;
    if (graduationCGPA !== undefined) ec.graduationCGPA = graduationCGPA ? Number(graduationCGPA) : null;
    if (maxActiveBacklogs !== undefined) ec.maxActiveBacklogs = maxActiveBacklogs !== undefined && maxActiveBacklogs !== '' ? Number(maxActiveBacklogs) : null;
    if (maxCompletedBacklogs !== undefined) ec.maxCompletedBacklogs = maxCompletedBacklogs !== undefined && maxCompletedBacklogs !== '' ? Number(maxCompletedBacklogs) : null;
    if (maxDOB !== undefined) ec.maxDOB = maxDOB ? new Date(maxDOB) : null;
    updateData.eligibilityCriteria = ec;
  }

  // Auto-reopen: if a new future deadline is being set and the job is expired, reset to open
  if (deadline !== undefined) {
    const newDeadline = new Date(deadline);
    if (!isNaN(newDeadline) && newDeadline > new Date()) {
      // New deadline is in the future — reopen the job if it was expired
      const currentJob = await JobOpeningModel.findById(jobId);
      if (currentJob && currentJob.status === 'expired') {
        updateData.status = 'open';
      }
    }
  }

  const jobOpening = await JobOpeningModel.findByIdAndUpdate(
    jobId, { $set: updateData }, { new: true, runValidators: true }
  );

  res.status(StatusCodes.OK).json({ success: true, message: 'Updated Job Opening', job: jobOpening });
};

const deleteJobOpening = async (req, res) => {
  const jobId = req?.params?.jobId;
  const job = await JobOpeningModel.findOneAndDelete({ _id: jobId, applications: { $size: 0 } });
  if (!job) throw new CustomAPIError.NotFoundError('Invalid job id or job has applications!');
  res.status(StatusCodes.OK).json({ success: true, message: 'Job Deleted successfully!' });
};

const getJobApplications = async (req, res) => {
  const companyId = req?.user?.companyId;

  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    throw new CustomAPIError.BadRequestError('Invalid Company ID');
  }
  const filters = {};
  [ 'search', 'status', 'minCGPA', 'min10thPercentage', 'min12thPercentage', 'minGraduationPercentage', 'branch', 'sortBy' ].forEach(key => {
    if (req.query[key]) filters[key] = req.query[key];
  });
  if (req.query.hasResume !== undefined) filters.hasResume = req.query.hasResume === 'true';
  if (req.query.skills) filters.skills = Array.isArray(req.query.skills) ? req.query.skills : [req.query.skills];

  const aggregationPipeline = Object.keys(filters).length > 0
    ? jobApplicationsAggWithFilters({ companyId, filters })
    : jobApplicationsAgg({ companyId });

  const jobsWithApplications = await JobOpeningModel.aggregate(aggregationPipeline);
  res.status(StatusCodes.OK).json({ success: true, message: 'Found Applications', jobsWithApplications });
};

const getSingleJobApplications = async (req, res) => {
  const { jobId } = req.params;
  const { companyId } = req.user;
  
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new CustomAPIError.BadRequestError('Invalid Job ID');
  }
  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    throw new CustomAPIError.BadRequestError('Invalid Company ID (Unauthorized or Session Expired)');
  }
  const job = (await JobOpeningModel.aggregate(singleJobApplicationsAgg({ jobId, companyId })))?.[0];
  if (!job) throw new CustomAPIError.NotFoundError(`No job found with id: ${jobId}`);
  res.status(StatusCodes.OK).json({ success: true, message: 'Applications found!', job });
};

const jobApplicationAction = async (req, res) => {
  const { id: applicationId, action } = req?.params;
  const userId = req?.user?.userId;

  const application = await JobApplicationModel.findById(applicationId);
  if (!application) throw new CustomAPIError.BadRequestError('Invalid application id!');

  const { applicantId, jobId, companyId, status: currentStatus } = application;
  const { isValid, updatedStatus, currentJobArr, updatedJobArr, currentApplicantArr, updatedApplicantArr } = isActionValid(action, currentStatus);

  if (!isValid) throw new CustomAPIError.BadRequestError('Invalid action!');

  const job = await JobOpeningModel.findById(jobId);
  if (job.status !== 'open' && action !== 'reject') throw new CustomAPIError.BadRequestError('Job is already closed!');

  const company = await CompanyModel.findById(companyId);
  if (!company) throw new CustomAPIError.NotFoundError(`No company found with id: ${companyId}`);
  if (!company.admins.includes(userId)) throw new CustomAPIError.UnauthorizedError('Not authorized');

  application.status = updatedStatus;

  if (currentJobArr && updatedJobArr) {
    job[currentJobArr] = job[currentJobArr].filter(id => id.toString() !== applicantId.toString());
    job[updatedJobArr].push(applicantId);
  }

  const applicant = await UserModel.findById(applicantId);
  if (currentApplicantArr && updatedApplicantArr) {
    applicant[currentApplicantArr] = applicant[currentApplicantArr].filter(id => id.toString() !== jobId.toString());
    applicant[updatedApplicantArr].push(jobId);
  }

  await application.save();
  await job.save();
  await applicant.save();

  res.status(StatusCodes.OK).json({ success: true, message: `Candidate status updated to ${updatedStatus}`, application });
};

const bulkJobApplicationAction = async (req, res) => {
  const { ids, action } = req.body;
  const userId = req.user.userId;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new CustomAPIError.BadRequestError('No application IDs provided');
  }

  const results = [];
  for (const applicationId of ids) {
    try {
      const application = await JobApplicationModel.findById(applicationId);
      if (!application) continue;

      const { applicantId, jobId, companyId, status: currentStatus } = application;
      const { isValid, updatedStatus, currentJobArr, updatedJobArr, currentApplicantArr, updatedApplicantArr } = isActionValid(action, currentStatus);

      if (!isValid) continue;

      const job = await JobOpeningModel.findById(jobId);
      if (job.status !== 'open' && action !== 'reject') continue;

      const company = await CompanyModel.findById(companyId);
      if (!company || !company.admins.includes(userId)) continue;

      application.status = updatedStatus;

      if (currentJobArr && updatedJobArr) {
        job[currentJobArr] = job[currentJobArr].filter(id => id.toString() !== applicantId.toString());
        job[updatedJobArr].push(applicantId);
      }

      const applicant = await UserModel.findById(applicantId);
      if (currentApplicantArr && updatedApplicantArr) {
        applicant[currentApplicantArr] = applicant[currentApplicantArr].filter(id => id.toString() !== jobId.toString());
        applicant[updatedApplicantArr].push(jobId);
      }

      await application.save();
      await job.save();
      await applicant.save();
      results.push(application._id);
    } catch (err) {
      console.error(`Error processing application ${applicationId}:`, err);
    }
  }

  res.status(StatusCodes.OK).json({ 
    success: true, 
    message: `Bulk update successful for ${results.length} candidates.`, 
    updatedIds: results 
  });
};

const sendOffer = async (req, res) => {
  const { applicationId } = req.body;
  const userId = req.user.userId;

  const application = await JobApplicationModel.findById(applicationId);
  if (!application) throw new CustomAPIError.NotFoundError('Application not found');
  if (application.status !== 'HIRED') throw new CustomAPIError.BadRequestError('Candidate must be HIRED before sending an offer');

  const company = await CompanyModel.findById(application.companyId);
  if (!company) throw new CustomAPIError.NotFoundError('Company not found');
  if (!company.admins.includes(userId)) throw new CustomAPIError.UnauthorizedError('Not authorized');

  application.status = 'OFFER_SENT';
  await application.save();

  const user = await UserModel.findById(application.applicantId);
  user.hiredStatus = 'OFFER_SENT';
  user.hiredJobId = application.jobId;
  user.hiredApplicationId = application._id;
  await user.save();

  res.status(StatusCodes.OK).json({ success: true, message: 'Offer sent successfully', application });
};

const uploadOfferLetter = async (req, res) => {
  const { applicationId } = req.params;
  const userId = req.user.userId;
  const offerLetterFile = req.files?.offerLetter;

  if (!offerLetterFile) throw new CustomAPIError.BadRequestError('Offer letter file is required');

  const application = await JobApplicationModel.findById(applicationId);
  if (!application) throw new CustomAPIError.NotFoundError('Application not found');
  if (application.status !== 'OFFER_ACCEPTED') throw new CustomAPIError.BadRequestError('Offer must be accepted first');

  const company = await CompanyModel.findById(application.companyId);
  if (!company) throw new CustomAPIError.NotFoundError('Company not found');
  if (!company.admins.includes(userId)) throw new CustomAPIError.UnauthorizedError('Not authorized');

  const fileUploadResp = await fileUpload(offerLetterFile, 'offer-letters', 'document');
  application.offerLetterUrl = fileUploadResp.fileURL;
  await application.save();

  res.status(StatusCodes.OK).json({ success: true, message: 'Offer letter uploaded successfully', offerLetterUrl: application.offerLetterUrl });
};

function isActionValid(action, currentStatus) {
  const obj = { isValid: false, updatedStatus: '', currentJobArr: '', updatedJobArr: '', currentApplicantArr: '', updatedApplicantArr: '' };
  switch (action) {
    case 'shortlist':
      obj.isValid = currentStatus === 'APPLIED';
      obj.updatedStatus = 'SHORTLISTED';
      obj.currentJobArr = 'applicants'; obj.updatedJobArr = 'shortlistedCandidates';
      obj.currentApplicantArr = 'jobsApplied'; obj.updatedApplicantArr = 'jobsShortlisted';
      break;
    case 'hire':
      obj.isValid = currentStatus === 'APPLIED' || currentStatus === 'SHORTLISTED';
      obj.updatedStatus = 'HIRED';
      obj.currentJobArr = currentStatus === 'APPLIED' ? 'applicants' : 'shortlistedCandidates';
      obj.updatedJobArr = 'selectedCandidates';
      obj.currentApplicantArr = currentStatus === 'APPLIED' ? 'jobsApplied' : 'jobsShortlisted';
      obj.updatedApplicantArr = 'jobsSelected';
      break;
    case 'reject':
      obj.isValid = ['APPLIED', 'SHORTLISTED', 'HIRED'].includes(currentStatus);
      obj.updatedStatus = 'REJECTED';
      if (currentStatus === 'APPLIED') { obj.currentJobArr = 'applicants'; obj.currentApplicantArr = 'jobsApplied'; }
      else if (currentStatus === 'SHORTLISTED') { obj.currentJobArr = 'shortlistedCandidates'; obj.currentApplicantArr = 'jobsShortlisted'; }
      else if (currentStatus === 'HIRED') { obj.currentJobArr = 'selectedCandidates'; obj.currentApplicantArr = 'jobsSelected'; }
      obj.updatedJobArr = 'rejectedCandidates'; obj.updatedApplicantArr = 'jobsRejected';
      break;
  }
  return obj;
}

const getOfferDetails = async (req, res) => {
  const { applicationId } = req.params;
  const application = await JobApplicationModel.findById(applicationId);
  if (!application) throw new CustomAPIError.BadRequestError('Invalid application id');
  res.status(StatusCodes.OK).json({ success: true, offer: { status: application.status, offerLetter: application.offerLetterUrl } });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await UserModel.findById(req.user.userId).select('+password');
  if (!(await user.comparePassword(currentPassword))) throw new CustomAPIError.UnauthenticatedError('Invalid credentials');
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ success: true, message: 'Password updated successfully' });
};

const getTopCandidates = async (req, res) => {
  const { id: jobId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new CustomAPIError.BadRequestError('Invalid Job ID');
  }
  const job = await JobOpeningModel.findById(jobId);
  if (!job) throw new CustomAPIError.NotFoundError('Job not found');

  const courseIds = (Array.isArray(job.receivingCourses) 
    ? job.receivingCourses.map((c) => c.id) 
    : job.receivingCourses?.id ? [job.receivingCourses.id] : [])
    .filter(id => id && mongoose.Types.ObjectId.isValid(id))
    .map(id => new mongoose.Types.ObjectId(id));

  const deptIds = (Array.isArray(job.receivingDepartments) 
    ? job.receivingDepartments.map((d) => d.id) 
    : job.receivingDepartments?.id ? [job.receivingDepartments.id] : [])
    .filter(id => id && mongoose.Types.ObjectId.isValid(id))
    .map(id => new mongoose.Types.ObjectId(id));

  const batchIds = (Array.isArray(job.receivingBatch) 
    ? job.receivingBatch.map((b) => b.id) 
    : job.receivingBatch?.id ? [job.receivingBatch.id] : [])
    .filter(id => id && mongoose.Types.ObjectId.isValid(id))
    .map(id => new mongoose.Types.ObjectId(id));

  const query = {
    role: 'student',
    courseId: { $in: courseIds },
  };

  if (deptIds.length > 0) query.departmentId = { $in: deptIds };
  if (batchIds.length > 0) query.batchId = { $in: batchIds };

  const students = await UserModel.find(query);
  const jobSkills = (job.keySkills || []).map((s) => s.toLowerCase().trim());

  const rankedCandidates = await Promise.all(
    students.map(async (student) => {
      const studentEducation = await EducationModel.findOne({ studentId: student._id });
      const studentSkills = (student.skills || []).map((s) => s.toLowerCase().trim());
      
      let skillScore = 0;
      if (jobSkills.length > 0) {
        const matched = jobSkills.filter((s) => studentSkills.includes(s));
        skillScore = matched.length / jobSkills.length;
      }

      const cgpa = studentEducation?.graduation?.aggregateGPA || 0;
      const matchScore =
        skillScore * 0.5 +
        (cgpa / 10) * 0.3 +
        (1 / (1 + (student.activeBacklogs || 0))) * 0.2;

      return {
        id: student._id,
        name: student.name,
        email: student.email,
        department: student.departmentName,
        cgpa,
        skills: student.skills,
        matchScore: Math.round(matchScore * 100),
        isApplied: await JobApplicationModel.exists({ jobId, applicantId: student._id }),
      };
    })
  );

  res.status(StatusCodes.OK).json({
    success: true,
    candidates: rankedCandidates
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10),
  });
};

const getCompanyDashboardStats = async (req, res) => {
  const { companyId } = req.user;
  if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
    throw new CustomAPIError.BadRequestError('Invalid Company ID');
  }

  const totalJobs = await JobOpeningModel.countDocuments({ 'company.id': companyId });
  const openJobs = await JobOpeningModel.countDocuments({ 'company.id': companyId, status: 'open' });
  const statusCountsRaw = await JobApplicationModel.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const counts = statusCountsRaw.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const jobStatsRaw = await JobOpeningModel.aggregate([
    { $match: { 'company.id': new mongoose.Types.ObjectId(companyId) } },
    {
      $group: {
        _id: null,
        totalShortlisted: { $sum: { $size: { $ifNull: ['$shortlistedCandidates', []] } } },
      }
    }
  ]);

  const totalShortlistedCount = jobStatsRaw[0]?.totalShortlisted || 0;

  // Map for frontend consistency
  const stats = {
    totalJobs,
    openJobs,
    totalApplied: statusCountsRaw.reduce((sum, curr) => sum + curr.count, 0),
    totalHired: (counts['HIRED'] || 0) + (counts['OFFER_ACCEPTED'] || 0) + (counts['OFFER_SENT'] || 0) + (counts['OFFER_REJECTED'] || 0),
    totalShortlisted: totalShortlistedCount,
    totalRejected: (counts['REJECTED'] || 0),
    totalOfferSent: (counts['OFFER_SENT'] || 0) + (counts['OFFER_ACCEPTED'] || 0) + (counts['OFFER_REJECTED'] || 0),
    statusCounts: counts
  };

  const recentApplications = await JobApplicationModel.find({ companyId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('jobId', 'profile')
    .populate('applicantId', 'name email');

  res.status(StatusCodes.OK).json({
    success: true,
    stats,
    recentApplications
  });
};

const getStudentPublicProfile = async (req, res) => {
  const { applicationId, studentId } = req.params;
  const { companyId } = req.user;
  
  if (!mongoose.Types.ObjectId.isValid(applicationId) || !mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(companyId)) {
    throw new CustomAPIError.BadRequestError('Invalid ID provided');
  }

  const application = await JobApplicationModel.findById(applicationId);
  if (!application || application.companyId.toString() !== companyId || application.applicantId.toString() !== studentId)
    throw new CustomAPIError.UnauthorizedError("Unauthorized access!");
  const profileDetails = (await UserModel.aggregate(studentProfileDetailsAgg(studentId, false)))?.[0];
  res.status(StatusCodes.OK).json({ success: true, profileDetails });
};

module.exports = {
  createJobOpening, updateJobOpening, deleteJobOpening, getJobsForIncharge, getJobApplications, jobApplicationAction,
  getStudentPublicProfile, getSingleJob, getSingleJobApplications, uploadOfferLetter, getOfferDetails, changePassword,
  getTopCandidates, getCompanyDashboardStats, sendOffer, bulkJobApplicationAction
};
