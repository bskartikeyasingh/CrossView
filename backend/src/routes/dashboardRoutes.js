const express = require('express');
const router = express.Router();
const { getOverview, getTrending, getActivity } = require('../controllers/dashboardController');

router.get('/overview', getOverview);
router.get('/trending', getTrending);
router.get('/activity', getActivity);

module.exports = router;

