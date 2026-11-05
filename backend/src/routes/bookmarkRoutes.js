const express = require('express');
const router = express.Router();
const { getBookmarks, createBookmark, deleteBookmark } = require('../controllers/bookmarkController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', getBookmarks);
router.post('/', createBookmark);
router.delete('/:id', deleteBookmark);

module.exports = router;

