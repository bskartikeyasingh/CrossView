const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  getEventArticles,
  getEventTimeline,
  getEventComparison,
  getEventReport,
} = require('../controllers/eventController');

router.get('/', getEvents);
router.get('/:id', getEventById);
router.get('/:id/articles', getEventArticles);
router.get('/:id/timeline', getEventTimeline);
router.get('/:id/comparison', getEventComparison);
router.get('/:id/report', getEventReport);

module.exports = router;

