const router = require('express').Router();
const { authorizeRoles } = require('../middleware/authentication-middleware');

const {
  getEducationData,
  updateEducationData,
  deletePastEducation,

  getPersonalData,
  updatePersonalData,
  getStudentProfile,

  getExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,

  createPlacement,
  getPlacements,
  getPlacementById,
  updatePlacement,
  deletePlacement,

  createTraining,
  getTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,

  addSkill,
  deleteSkill,
  getSkills,
  updateSkill,

  addAchievement,
  updateAchievement,
  deleteAchievement,
  getAchievements,

  changePassword,
} = require('../controllers/studentDetailsController');

const {
  getJobsForStudent,
  createJobApplication,
  getStudentJobById,
  getApplications,
  getOfferStatus,
  acceptOffer,
  rejectOffer,
} = require('../controllers/studentJobsController');

// All student routes should be explicitly restricted to 'student' role for defense in depth
router.get('/profile', authorizeRoles('student'), getStudentProfile);

router.get('/personal', authorizeRoles('student'), getPersonalData);
router.post('/personal', authorizeRoles('student'), updatePersonalData);

router.post('/education/:update', authorizeRoles('student'), updateEducationData);
router.delete('/education/:field', authorizeRoles('student'), deletePastEducation);
router.get('/education', authorizeRoles('student'), getEducationData);

router.get('/experience/:id', authorizeRoles('student'), getExperienceById);
router.get('/experience', authorizeRoles('student'), getExperiences);
router.post('/experience', authorizeRoles('student'), createExperience);
router.patch('/experience/:id', authorizeRoles('student'), updateExperience);
router.delete('/experience/:id', authorizeRoles('student'), deleteExperience);

router.get('/placement/:id', authorizeRoles('student'), getPlacementById);
router.post('/placement', authorizeRoles('student'), createPlacement);
router.get('/placement', authorizeRoles('student'), getPlacements);
router.patch('/placement/:id', authorizeRoles('student'), updatePlacement);
router.delete('/placement/:id', authorizeRoles('student'), deletePlacement);

router.get('/training/:id', authorizeRoles('student'), getTrainingById);
router.post('/training', authorizeRoles('student'), createTraining);
router.get('/training', authorizeRoles('student'), getTrainings);
router.patch('/training/:id', authorizeRoles('student'), updateTraining);
router.delete('/training/:id', authorizeRoles('student'), deleteTraining);

router.get('/jobs?', authorizeRoles('student'), getJobsForStudent);
router.get('/jobs/:jobId', authorizeRoles('student'), getStudentJobById);
router.post('/jobs/:id/apply', authorizeRoles('student'), createJobApplication);

router.post('/skills', authorizeRoles('student'), addSkill);
router.delete('/skills', authorizeRoles('student'), deleteSkill);
router.get('/skills', authorizeRoles('student'), getSkills);
router.patch('/skills', authorizeRoles('student'), updateSkill);

router.post('/achievements', authorizeRoles('student'), addAchievement);
router.delete('/achievements', authorizeRoles('student'), deleteAchievement);
router.get('/achievements', authorizeRoles('student'), getAchievements);
router.patch('/achievements', authorizeRoles('student'), updateAchievement);

router.post('/change-password', authorizeRoles('student'), changePassword);

router.get('/applications', authorizeRoles('student'), getApplications);

router.get('/offer', authorizeRoles('student'), getOfferStatus);
router.post('/offer/accept', authorizeRoles('student'), acceptOffer);
router.post('/offer/reject', authorizeRoles('student'), rejectOffer);

module.exports = router;
