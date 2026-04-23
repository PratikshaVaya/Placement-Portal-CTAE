const mongoose = require('mongoose');

const studentJobOpeningsAgg = ({ batchId, courseId, departmentId, userId }) => {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
    return [{ $match: { _id: null } }]; // Return empty result safely
  }
  const userObjId = new mongoose.Types.ObjectId(userId);
  const courseObjId = new mongoose.Types.ObjectId(courseId);
  const batchObjId = mongoose.Types.ObjectId.isValid(batchId) ? new mongoose.Types.ObjectId(batchId) : null;
  const deptObjId = mongoose.Types.ObjectId.isValid(departmentId) ? new mongoose.Types.ObjectId(departmentId) : null;

  return [
    {
      $match: {
        status: 'open',
        deadline: { $gte: new Date() },
        applicants: { $nin: [userObjId] },
        shortlistedCandidates: { $nin: [userObjId] },
        selectedCandidates: { $nin: [userObjId] },
        rejectedCandidates: { $nin: [userObjId] },
        // Targeting Logic
        // Targeting Logic
        'receivingCourses.id': courseObjId,
        $and: [
          {
            $or: [
              { receivingBatch: { $exists: false } },
              { receivingBatch: { $size: 0 } },
              { 'receivingBatch.id': batchObjId },
              { receivingBatch: batchObjId } // Legacy handling
            ]
          },
          {
            $or: [
              { receivingDepartments: { $exists: false } },
              { receivingDepartments: { $size: 0 } },
              { 'receivingDepartments.id': deptObjId },
              { receivingDepartments: deptObjId } // Legacy handling
            ]
          }
        ]
      },
    },
    {
      $project: {
        receivingCourse: 0,
        receivingBatch: 0,
        receivingDepartments: 0,
        applicants: 0,
        shortlistedCandidates: 0,
        rejectedCandidates: 0,
        selectedCandidates: 0,
        status: 0,
        applications: 0,
        openingsCount: 0,
        description: 0,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ];
}

function studentJobsByStatusAgg({ userId, status }) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return [{ $match: { _id: null } }];
  }
  const userObjId = new mongoose.Types.ObjectId(userId);
  const jobInclude = { _id: 0 };
  const jobExclude = {};
  let jobPath;

  switch (status) {
    case 'applied':
      jobPath = 'jobsApplied';
      jobInclude['jobsApplied'] = 1;
      jobExclude['jobsApplied'] = 0;
      break;
    case 'rejected':
      jobPath = 'jobsRejected';
      jobInclude['jobsRejected'] = 1;
      jobExclude['jobsRejected'] = 0;
      break;
    case 'shortlisted':
      jobPath = 'jobsShortlisted';
      jobInclude['jobsShortlisted'] = 1;
      jobExclude['jobsShortlisted'] = 0;
      break;
    case 'hired':
    case 'HIRED':
      jobPath = 'jobsSelected';
      jobInclude['jobsSelected'] = 1;
      jobExclude['jobsSelected'] = 0;
      break;
  }

  return [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: jobInclude,
    },
    {
      $lookup: {
        from: 'jobopenings',
        localField: jobPath,
        foreignField: '_id',
        as: 'jobs',
        pipeline: [
          {
            $addFields: {
              applicationStatus: {
                $switch: {
                  branches: [
                    {
                      case: { $in: [userObjId, { $ifNull: ['$selectedCandidates', []] }] },
                      then: 'HIRED',
                    },
                    {
                      case: { $in: [userObjId, { $ifNull: ['$rejectedCandidates', []] }] },
                      then: 'REJECTED',
                    },
                    {
                      case: { $in: [userObjId, { $ifNull: ['$shortlistedCandidates', []] }] },
                      then: 'SHORTLISTED',
                    },
                    { case: { $in: [userObjId, { $ifNull: ['$applicants', []] }] }, then: 'APPLIED' },
                  ],
                  default: 'NOT_APPLIED',
                },
              },
            },
          },
          {
            $project: {
              receivingCourse: 0,
              receivingBatch: 0,
              receivingDepartments: 0,
              applicants: 0,
              shortlistedCandidates: 0,
              rejectedCandidates: 0,
              selectedCandidates: 0,
              status: 0,
              applications: 0,
              openingsCount: 0,
              description: 0,
            },
          },
        ],
      },
    },
    {
      $project: jobExclude,
    },
    {
      $unwind: {
        path: '$jobs',
      },
    },
    {
      $replaceRoot: {
        newRoot: '$jobs',
      },
    },
  ];
}

function singleJobStudentAgg({
  jobId,
  userId,
  courseId,
  batchId,
  departmentId,
}) {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(jobId)) {
    return [{ $match: { _id: null } }];
  }
  userId = new mongoose.Types.ObjectId(userId);
  jobId = new mongoose.Types.ObjectId(jobId);
  courseId = mongoose.Types.ObjectId.isValid(courseId) ? new mongoose.Types.ObjectId(courseId) : null;
  batchId = mongoose.Types.ObjectId.isValid(batchId) ? new mongoose.Types.ObjectId(batchId) : null;
  departmentId = mongoose.Types.ObjectId.isValid(departmentId) ? new mongoose.Types.ObjectId(departmentId) : null;

  return [
    {
      $match: {
        _id: jobId,
        'receivingCourses.id': courseId,
        $and: [
          {
            $or: [
              { receivingBatch: { $exists: false } },
              { receivingBatch: { $size: 0 } },
              { 'receivingBatch.id': batchId },
              { receivingBatch: batchId }
            ]
          },
          {
            $or: [
              { receivingDepartments: { $exists: false } },
              { receivingDepartments: { $size: 0 } },
              { 'receivingDepartments.id': departmentId },
              { receivingDepartments: departmentId }
            ]
          }
        ]
      },
    },
    {
      $addFields: {
        applicationsCount: {
          $size: { $ifNull: ['$applications', []] },
        },
        applicationStatus: {
          $switch: {
            branches: [
              {
                case: { $in: [userId, { $ifNull: ['$selectedCandidates', []] }] },
                then: 'HIRED',
              },
              {
                case: { $in: [userId, { $ifNull: ['$rejectedCandidates', []] }] },
                then: 'REJECTED',
              },
              {
                case: { $in: [userId, { $ifNull: ['$shortlistedCandidates', []] }] },
                then: 'SHORTLISTED',
              },
              { case: { $in: [userId, { $ifNull: ['$applicants', []] }] }, then: 'APPLIED' },
            ],
            default: 'NOT_APPLIED',
          },
        },
      },
    },
    {
      $project: {
        applicants: 0,
        applications: 0,
        shortlistedCandidates: 0,
        rejectedCandidates: 0,
        selectedCandidates: 0,
        receivingCourse: 0,
        receivingBatch: 0,
        receivingDepartments: 0,
      },
    },
  ];
}

function companyInchargeJobsAgg({ companyId, status }) {
  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    return [{ $match: { _id: null } }];
  }
  companyId = new mongoose.Types.ObjectId(companyId);

  // Build the match condition
  let matchCondition;
  if (status === 'expired') {
    // Show jobs explicitly marked expired OR open jobs whose deadline has passed (legacy)
    matchCondition = {
      'company.id': companyId,
      $or: [
        { status: 'expired' },
        { status: 'open', deadline: { $lt: new Date() } },
      ],
    };
  } else {
    // For 'open': only truly open jobs where the deadline hasn't passed
    matchCondition = {
      'company.id': companyId,
      status,
      ...(status === 'open' ? { deadline: { $gte: new Date() } } : {}),
    };
  }

  return [
    { $match: matchCondition },
    {
      $addFields: {
        applicationsCount: {
          $size: { $ifNull: ['$applications', []] },
        },
        isExpired: {
          $or: [
            { $eq: ['$status', 'expired'] },
            { $lt: ['$deadline', new Date()] },
          ],
        },
      },
    },
    {
      $project: {
        applicants: 0,
        applications: 0,
        shortlistedCandidates: 0,
        rejectedCandidates: 0,
        selectedCandidates: 0,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ];
}

function singleJobCompanyAgg({ companyId, jobId }) {
  if (!mongoose.Types.ObjectId.isValid(companyId) || !mongoose.Types.ObjectId.isValid(jobId)) {
    return [{ $match: { _id: null } }];
  }
  companyId = new mongoose.Types.ObjectId(companyId);
  jobId = new mongoose.Types.ObjectId(jobId);

  return [
    {
      $match: {
        'company.id': companyId,
        _id: jobId,
      },
    },
    {
      $addFields: {
        applicationsCount: {
          $size: { $ifNull: ['$applications', []] },
        },
      },
    },
    {
      $project: {
        applicants: 0,
        applications: 0,
        shortlistedCandidates: 0,
        rejectedCandidates: 0,
        selectedCandidates: 0,
      },
    },
  ];
}

module.exports = {
  studentJobOpeningsAgg,
  studentJobsByStatusAgg,
  singleJobStudentAgg,
  companyInchargeJobsAgg,
  singleJobCompanyAgg,
};
