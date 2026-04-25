const UserModel = require('../models/User');
const CompanyModel = require('../models/Company');
const JobApplicationModel = require('../models/JobApplication');
const OfferModel = require('../models/Offer');
const ResumeModel = require('../models/Resume');

const CustomAPIError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { validateStudentCourse } = require('../utils');
const JobOpeningModel = require('../models/JobOpenings');
const { PlacementModel, EducationModel, CurrentScoreModel, PastScoreModel, ExperienceModel, TrainingModel, PersonalDataModel, } = require('../models/student');
const { default: mongoose } = require('mongoose');
const { updateStudentPlacementStatus } = require('../utils/placementUtils');

const getStudents = async (req, res) => {
  const requestQuery = req.query || {};
  const page = requestQuery.page || 1;
  const limit = requestQuery.limit || 15;

  const { course, departments, batches } = requestQuery;

  const skip = (page - 1) * limit;

  const query = { role: 'student' };

  if (course) query['courseId'] = course;
  if (batches) query['batchId'] = { $in: batches.split('|') };
  if (departments) query['departmentId'] = { $in: departments.split('|') };

  const studentsCount = await UserModel.countDocuments(query);
  const totalPages = Math.ceil(studentsCount / limit);

  if (totalPages && totalPages < page)
    throw new CustomAPIError.BadRequestError(`Invalid page no ${page}`);

  const students = await UserModel.find(query)
    .select(
      'name isLateralEntry rollNo courseId courseName batchId batchYear departmentId departmentName isBlocked forcePasswordReset'
    )
    .sort('rollNo')
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found students',
    students,
    page,
    limit,
    totalPages,
  });
};

const addSingleStudent = async (req, res) => {
  const {
    name,
    email,
    password,
    confirmPassword,
    rollNo,
    isLateralEntry,
    courseId,
    departmentId,
    batchId,
  } = req.body;

  if (password !== confirmPassword)
    throw new CustomAPIError.BadRequestError(
      "Password and Confirm Password don't match!"
    );

  const {
    courseName,
    courseLevel,
    departmentName,
    batchYear,
    yearsCount,
    semestersCount,
  } = await validateStudentCourse({
    courseId,
    departmentId,
    batchId,
    isLateralEntry,
  });

  const user = await UserModel.create({
    name,
    email,
    password,
    rollNo,
    isLateralEntry,
    yearsCount,
    semestersCount,
    courseId,
    courseLevel,
    courseName,
    departmentId,
    departmentName,
    batchId,
    batchYear,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Created student',
    id: user._id,
  });
};

const updateSingleStudent = async (req, res) => {
  const id = req?.params?.id;

  if (!id?.trim() || !mongoose.Types.ObjectId.isValid(id))
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  const { name, rollNo, isLateralEntry, courseId, departmentId, batchId } =
    req.body;

  const {
    courseName,
    courseLevel,
    departmentName,
    batchYear,
    yearsCount,
    semestersCount,
  } = await validateStudentCourse({
    courseId,
    departmentId,
    batchId,
    isLateralEntry,
  });

  const user = await UserModel.findByIdAndUpdate(
    id,
    {
      name,
      rollNo,
      isLateralEntry,
      yearsCount,
      semestersCount,
      courseId,
      courseLevel,
      courseName,
      departmentId,
      departmentName,
      batchId,
      batchYear,
    },
    { runValidators: true }
  );

  if (!user)
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Updated student',
  });
};

const deleteSingleStudent = async (req, res) => {
  const id = req?.params?.id;

  if (!id?.trim() || !mongoose.Types.ObjectId.isValid(id))
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  const user = await UserModel.findOneAndDelete({ _id: id, role: 'student' });
  if (!user)
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  const jobApplications = await JobApplicationModel.find({ applicantId: id }).select(
    '_id jobId'
  );
  const applicationIds = jobApplications.map((application) => application._id);

  const acceptedOffers = await OfferModel.find({
    studentId: id,
    status: 'accepted',
  }).select('companyId');

  const companyDecrement = acceptedOffers.reduce((acc, offer) => {
    const companyId = offer.companyId?.toString();
    if (companyId) acc[companyId] = (acc[companyId] || 0) + 1;
    return acc;
  }, {});

  await Promise.all([
    JobApplicationModel.deleteMany({ applicantId: id }),
    OfferModel.deleteMany({ studentId: id }),
    PlacementModel.deleteMany({ studentId: id }),
    ResumeModel.deleteMany({ studentId: id }),
    PersonalDataModel.deleteMany({ studentId: id }),
    EducationModel.deleteMany({ studentId: id }),
    CurrentScoreModel.deleteMany({ studentId: id }),
    PastScoreModel.deleteMany({ studentId: id }),
    ExperienceModel.deleteMany({ studentId: id }),
    TrainingModel.deleteMany({ studentId: id }),
    JobOpeningModel.updateMany(
      {
        $or: [
          { applicants: id },
          { shortlistedCandidates: id },
          { selectedCandidates: id },
          { rejectedCandidates: id },
          { applications: { $in: applicationIds } },
        ],
      },
      {
        $pull: {
          applicants: id,
          shortlistedCandidates: id,
          selectedCandidates: id,
          rejectedCandidates: id,
          applications: { $in: applicationIds },
        },
      }
    ),
  ]);

  await Promise.all(
    Object.entries(companyDecrement).map(async ([companyId, count]) => {
      const company = await CompanyModel.findById(companyId);
      if (!company) return;
      company.candidatesHired = Math.max(
        0,
        (company.candidatesHired || 0) - count
      );
      await company.save();
    })
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Student deleted successfully',
  });
};

const blockStudent = async (req, res) => {
  const id = req?.params?.id;

  if (!id?.trim() || !mongoose.Types.ObjectId.isValid(id))
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  const user = await UserModel.findOneAndUpdate(
    { _id: id, role: 'student' },
    { isBlocked: true },
    { new: true }
  );
  if (!user)
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Student blocked successfully',
  });
};

const unblockStudent = async (req, res) => {
  const id = req?.params?.id;

  if (!id?.trim() || !mongoose.Types.ObjectId.isValid(id))
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  const user = await UserModel.findOneAndUpdate(
    { _id: id, role: 'student' },
    { isBlocked: false },
    { new: true }
  );
  if (!user)
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Student unblocked successfully',
  });
};

const getCompanies = async (req, res) => {
  const companies = await CompanyModel.aggregate([
    {
      $lookup: {
        from: JobOpeningModel.collection.name,
        localField: '_id',
        foreignField: 'company.id',
        as: 'jobs',
      },
    },
    {
      $lookup: {
        from: JobApplicationModel.collection.name,
        let: { companyId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$companyId', '$$companyId'] },
                  { $in: ['$status', ['HIRED', 'OFFER_ACCEPTED', 'OFFER_REJECTED']] },
                ],
              },
            },
          },
          { $count: 'count' },
        ],
        as: 'hiredApplications',
      },
    },
    {
      $addFields: {
        jobsPosted: { $size: '$jobs' },
        openingsCreated: { $sum: '$jobs.openingsCount' },
        candidatesHired: {
          $ifNull: [{ $arrayElemAt: ['$hiredApplications.count', 0] }, 0],
        },
      },
    },
    {
      $project: {
        admins: 0,
        jobs: 0,
        hiredApplications: 0,
      },
    },
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Companies found!',
    companies,
  });
};

const getSingleCompany = async (req, res) => {
  const companyId = req?.params?.companyId;
  if (!companyId?.trim() || !mongoose.Types.ObjectId.isValid(companyId))
    throw new CustomAPIError.BadRequestError('Valid Company Id is required!');

  const company = await CompanyModel.findById(companyId).populate({
    path: 'admins',
    select: 'name email photo companyRole',
  });

  if (!company)
    throw new CustomAPIError.NotFoundError(
      `No company found with id: ${companyId}`
    );

  const companyJobs = await JobOpeningModel.aggregate([
    { $match: { 'company.id': company._id } },
    {
      $lookup: {
        from: JobApplicationModel.collection.name,
        let: { jobId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$jobId', '$$jobId'] } } },
          {
            $group: {
              _id: null,
              applicantsCount: { $sum: 1 },
              hiredCount: {
                $sum: {
                  $cond: [{ $in: ['$status', ['HIRED', 'OFFER_ACCEPTED', 'OFFER_REJECTED']] }, 1, 0],
                },
              },
            },
          },
        ],
        as: 'applicationStats',
      },
    },
    {
      $addFields: {
        applicantsCount: {
          $ifNull: [{ $arrayElemAt: ['$applicationStats.applicantsCount', 0] }, 0],
        },
        hiredCount: {
          $ifNull: [{ $arrayElemAt: ['$applicationStats.hiredCount', 0] }, 0],
        },
        jobPackage: {
          $ifNull: ['$jobPackage', '$salary', '$package', 0],
        },
      },
    },
    {
      $project: {
        applicationStats: 0,
        description: 0,
        keySkills: 0,
        receivingCourse: 0,
        receivingBatch: 0,
        receivingDepartments: 0,
        postedBy: 0,
        applicants: 0,
        shortlistedCandidates: 0,
        rejectedCandidates: 0,
        selectedCandidates: 0,
        applications: 0,
      },
    },
  ]);

  const jobsPosted = companyJobs.length;
  const openingsCreated = companyJobs.reduce(
    (sum, job) => sum + (job.openingsCount || 0),
    0
  );
  const candidatesHired = companyJobs.reduce(
    (sum, job) => sum + (job.hiredCount || 0),
    0
  );

  const hiredCandidates = await JobApplicationModel.aggregate([
    { $match: { companyId: company._id, status: { $in: ['HIRED', 'OFFER_ACCEPTED', 'OFFER_REJECTED'] } } },
    {
      $lookup: {
        from: JobOpeningModel.collection.name,
        localField: 'jobId',
        foreignField: '_id',
        as: 'job',
      },
    },
    { $unwind: { path: '$job', preserveNullAndEmptyArrays: false } },
    {
      $lookup: {
        from: UserModel.collection.name,
        localField: 'applicantId',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: { path: '$student', preserveNullAndEmptyArrays: false } },
    {
      $addFields: {
        package: {
          $let: {
            vars: {
              pkgVal: {
                $ifNull: ['$job.jobPackage', '$job.salary', '$job.package', null],
              },
            },
            in: {
              $cond: [
                { $and: [{ $ne: ['$$pkgVal', null] }, { $ne: ['$$pkgVal', 0] }] },
                { $cond: [{ $gt: ['$$pkgVal', 100] }, { $divide: ['$$pkgVal', 100000] }, '$$pkgVal'] },
                null,
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        studentId: '$student._id',
        name: '$student.name',
        course: '$student.courseName',
        branch: '$student.departmentName',
        jobRole: '$job.profile',
        package: 1,
        status: 1,
      },
    },
]);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Company found!',
    company: {
      ...company.toObject(),
      jobsPosted,
      openingsCreated,
      candidatesHired,
      jobs: companyJobs,
      hiredCandidates,
    },
  });
};

const addCompany = async (req, res) => {
  const { companyName: name, companyEmail: email, about, accessTill } = req.body;
  let website = req?.body?.website;

  if (website && !website.match(/^https?:\/\//)) {
    website += 'https://';
  }

  const company = await CompanyModel.create({
    name,
    email,
    about,
    website,
    accessTill: accessTill ? new Date(accessTill) : undefined,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Company created',
    id: company._id,
  });
};

const updateCompany = async (req, res) => {
  const companyId = req?.params?.companyId;
  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    throw new CustomAPIError.BadRequestError('Invalid Company ID');
  }
  const { companyName: name, companyEmail: email, about, accessTill } = req.body;

  let website = req?.body?.website;

  if (website && !website.match(/^https?:\/\//)) {
    website += 'https://';
  }

  const company = await CompanyModel.findByIdAndUpdate(
    companyId,
    {
      name,
      email,
      about,
      website,
      accessTill: accessTill ? new Date(accessTill) : undefined,
    },
    { runValidators: true }
  );

  if (!company)
    throw new CustomAPIError.NotFoundError(`No company found with id: ${companyId}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Company updated!',
    id: company._id,
  });

  if (mongoose.Types.ObjectId.isValid(companyId)) {
    await JobOpeningModel.updateMany(
      { 'company.id': new mongoose.Types.ObjectId(companyId) },
      {
        $set: {
          'company.name': name,
          'company.website': website,
        },
      }
    );
  }
};

const deleteCompany = async (req, res) => {
  const companyId = req?.params?.companyId;

  if (!companyId?.trim() || !mongoose.Types.ObjectId.isValid(companyId))
    throw new CustomAPIError.BadRequestError('Valid Company Id is required!');

  const company = await CompanyModel.findById(companyId);
  if (!company)
    throw new CustomAPIError.NotFoundError(
      `No company found with id: ${companyId}`
    );

  await Promise.all([
    JobOpeningModel.deleteMany({ 'company.id': company._id }),
    JobApplicationModel.deleteMany({ companyId: company._id }),
    OfferModel.deleteMany({ companyId: company._id }),
    UserModel.deleteMany({ companyId: company._id, role: 'company_admin' }),
  ]);

  await company.deleteOne();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Company deleted successfully',
  });
};

const addCompanyAdmin = async (req, res) => {
  const companyId = req?.params?.companyId;
  const {
    companyAdminName: name,
    companyAdminEmail: email,
    companyAdminPassword: password,
    confirmAdminPassword: confirmPassword,
    adminRole: companyRole,
  } = req.body;
  const role = 'company_admin';

  if (password !== confirmPassword)
    throw new CustomAPIError.BadRequestError(
      "Password & Confirm Password don't match!"
    );

  if (!companyRole?.trim() || !companyId?.trim() || !mongoose.Types.ObjectId.isValid(companyId))
    throw new CustomAPIError.BadRequestError('Valid Company & Role is required!');

  const company = await CompanyModel.findById(companyId);
  if (!company)
    throw new CustomAPIError.BadRequestError(
      `No company found with id: ${companyId}`
    );

  const companyAdmin = await UserModel.create({
    name,
    email: email.trim().toLowerCase(),
    password,
    companyRole,
    companyId,
    role,
  });

  company.admins.push(companyAdmin._id);
  await company.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Company Admin created!',
    id: companyAdmin._id,
  });
};

const getAdminStats = async (req, res) => {
  const [
    studentCount,
    companyCount,
    jobCount,
    placementStats,
    deptPlacements,
    packageStats
  ] = await Promise.all([
    UserModel.countDocuments({ role: 'student' }),
    CompanyModel.countDocuments(),
    JobOpeningModel.countDocuments(),
    
    // Unique placed students breakdown
    UserModel.aggregate([
      { $match: { role: 'student', isPlaced: true } },
      { $group: { _id: '$placementType', count: { $sum: 1 } } }
    ]),

    // Department-wise unique placements
    UserModel.aggregate([
      { $match: { role: 'student', isPlaced: true } },
      {
        $group: {
          _id: { $ifNull: ['$departmentName', 'Unknown'] },
          count: { $sum: 1 }
        }
      }
    ]),

    // Package metrics (taking the highest package among all offers for each placed student)
    // This is a bit more complex as we need to check both JobApplications and PlacementModel
    JobApplicationModel.aggregate([
      { $match: { status: { $in: ['HIRED', 'OFFER_ACCEPTED', 'OFFER_REJECTED'] } } },
      {
        $lookup: {
          from: JobOpeningModel.collection.name,
          localField: 'jobId',
          foreignField: '_id',
          as: 'job',
        },
      },
      { $unwind: '$job' },
      {
        $group: {
          _id: '$applicantId',
          maxPackage: { $max: { $ifNull: ['$job.jobPackage', '$job.salary', '$job.package', 0] } }
        }
      }
    ])
  ]);

  // Combine package data with manual placements to find the real average/highest
  const manualPlacements = await PlacementModel.find({ isOnCampus: false }).lean();
  const studentPackages = {};

  // Process on-campus packages
  packageStats.forEach(stat => {
    studentPackages[stat._id.toString()] = stat.maxPackage > 100 ? stat.maxPackage / 100000 : stat.maxPackage;
  });

  // Process off-campus packages (update if higher)
  manualPlacements.forEach(p => {
    const pkg = p.package > 100 ? p.package / 100000 : p.package;
    const sId = p.studentId.toString();
    if (!studentPackages[sId] || pkg > studentPackages[sId]) {
      studentPackages[sId] = pkg;
    }
  });

  const packages = Object.values(studentPackages);
  const totalHiredUnique = Object.keys(studentPackages).length;
  const avgPackage = packages.length ? Number((packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2)) : 0;
  const highestPackage = packages.length ? Number(Math.max(...packages).toFixed(2)) : 0;

  // Breakdown counts
  const breakdown = { onCampus: 0, offCampus: 0, both: 0 };
  placementStats.forEach(s => {
    if (s._id === 'on-campus') breakdown.onCampus = s.count;
    if (s._id === 'off-campus') breakdown.offCampus = s.count;
    if (s._id === 'both') breakdown.both = s.count;
  });

  // 7. Get detailed list of placed students (On-campus)
  const onCampusPlacedList = await JobApplicationModel.aggregate([
    { $match: { status: { $in: ['HIRED', 'OFFER_ACCEPTED', 'OFFER_REJECTED'] } } },
    {
      $lookup: {
        from: JobOpeningModel.collection.name,
        localField: 'jobId',
        foreignField: '_id',
        as: 'job',
      },
    },
    { $unwind: '$job' },
    {
      $lookup: {
        from: UserModel.collection.name,
        localField: 'applicantId',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
    {
      $project: {
        studentName: '$student.name',
        rollNo: '$student.rollNo',
        companyName: '$job.company.name',
        package: { $ifNull: ['$job.jobPackage', '$job.salary', '$job.package', 0] },
        type: { $literal: 'On-Campus' },
        date: '$updatedAt'
      }
    },
    { $sort: { date: -1 } },
    { $limit: 20 }
  ]);

  // 8. Get detailed list of placed students (Off-campus)
  const offCampusPlacedList = await PlacementModel.aggregate([
    { $match: { isOnCampus: false } },
    {
      $lookup: {
        from: UserModel.collection.name,
        localField: 'studentId',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
    {
      $project: {
        studentName: '$student.name',
        rollNo: '$student.rollNo',
        companyName: '$company',
        package: '$package',
        type: { $literal: 'Off-Campus' },
        date: '$createdAt'
      }
    },
    { $sort: { date: -1 } },
    { $limit: 20 }
  ]);

  // Combine and sort by date
  const allPlacedStudents = [...onCampusPlacedList, ...offCampusPlacedList].sort((a, b) => b.date - a.date);

  const stats = {
    totalStudents: studentCount,
    totalCompanies: companyCount,
    totalJobsPosted: jobCount,
    totalCandidatesHired: totalHiredUnique, // Unique student count
    onCampusPlaced: breakdown.onCampus + breakdown.both,
    offCampusPlaced: breakdown.offCampus + breakdown.both,
    avgPackage,
    highestPackage,
    departmentPlacements: deptPlacements.map((d) => ({
      name: d._id,
      value: d.count,
    })),
    placedStudents: allPlacedStudents
  };

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Admin stats retrieved!',
    stats,
  });
};

module.exports = {
  addSingleStudent,
  updateSingleStudent,
  deleteSingleStudent,
  blockStudent,
  unblockStudent,
  getStudents,
  getCompanies,
  getSingleCompany,
  addCompany,
  updateCompany,
  deleteCompany,
  addCompanyAdmin,
  getAdminStats,
};
