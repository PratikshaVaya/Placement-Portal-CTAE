const router = require('express').Router();
const { authorizeRoles } = require('../middleware/authentication-middleware');

const {
  getStudents,
  addCompany,
  addCompanyAdmin,
  addSingleStudent,
  updateSingleStudent,
  deleteSingleStudent,
  blockStudent,
  unblockStudent,
  deleteCompany,
  getCompanies,
  getSingleCompany,
  updateCompany,
  getAdminStats,
} = require('../controllers/adminController');
const {
  getAdminSettings,
  updateAdminSettings,
  changeAdminPassword,
  previewStudentsImport,
  confirmStudentsImport,
  exportStudentsCsv,
  downloadSampleStudentCsv,
} = require('../controllers/adminImportSettingsController');

router.get('/stats', authorizeRoles('admin'), getAdminStats);
router.get('/students', authorizeRoles('admin'), getStudents);
router.post('/students/single', authorizeRoles('admin'), addSingleStudent);
router.patch('/students/single/:id', authorizeRoles('admin'), updateSingleStudent);
router.delete('/students/single/:id', authorizeRoles('admin'), deleteSingleStudent);
router.patch('/students/single/:id/block', authorizeRoles('admin'), blockStudent);
router.patch('/students/single/:id/unblock', authorizeRoles('admin'), unblockStudent);

router.post('/companies', authorizeRoles('admin'), addCompany);
router.get('/companies', authorizeRoles('admin'), getCompanies);
router.delete('/companies/:companyId', authorizeRoles('admin'), deleteCompany);
router.post('/companies/:companyId/admins', authorizeRoles('admin'), addCompanyAdmin);
router.get('/companies/:companyId', authorizeRoles('admin'), getSingleCompany);
router.patch('/companies/:companyId', authorizeRoles('admin'), updateCompany);

router.get('/settings', authorizeRoles('admin'), getAdminSettings);
router.patch('/settings', authorizeRoles('admin'), updateAdminSettings);
router.post('/settings/change-password', authorizeRoles('admin'), changeAdminPassword);

router.get('/students/import/sample', authorizeRoles('admin'), downloadSampleStudentCsv);
router.post('/students/import/preview', authorizeRoles('admin'), previewStudentsImport);
router.post('/students/import/confirm', authorizeRoles('admin'), confirmStudentsImport);
router.get('/students/export', authorizeRoles('admin'), exportStudentsCsv);

module.exports = router;
