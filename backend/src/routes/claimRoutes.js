const express = require('express');
const router = express.Router();
const { getAllClaims, getClaimById, getEventClaims } = require('../controllers/claimController');

router.get('/', getAllClaims);
router.get('/:id', getClaimById);
router.get('/event/:id', getEventClaims);

module.exports = router;
