const express = require('express');
const router = express.Router();
const {
  getSavedReports,
  createSavedReport,
  deleteSavedReport,
} = require('../controllers/savedReportController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', getSavedReports);
router.post('/', createSavedReport);
router.delete('/:id', deleteSavedReport);

module.exports = router;

