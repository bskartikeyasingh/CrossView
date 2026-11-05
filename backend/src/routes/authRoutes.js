const express = require('express');
const router = express.Router();
const { getMe, logout } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.get('/me', requireAuth, getMe);
router.post('/logout', requireAuth, logout);

module.exports = router;

