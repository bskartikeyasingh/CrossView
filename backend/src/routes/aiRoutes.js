const express = require('express');
const router = express.Router();
const {
  consolidateEvent,
  compareEvent,
  analyzeClaimsEvent,
  askCrossView,
} = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

router.post('/consolidate/:eventId', consolidateEvent);
router.post('/compare/:eventId', compareEvent);
router.post('/analyze-claims/:eventId', analyzeClaimsEvent);
router.post('/ask/:eventId', optionalAuth, askCrossView);

module.exports = router;
