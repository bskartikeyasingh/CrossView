const express = require('express');
const router = express.Router();
const { getNews, searchNews, getArticleById, refreshNews, uploadNews } = require('../controllers/newsController');

router.get('/', getNews);
router.get('/search', searchNews);
router.get('/:id', getArticleById);
router.post('/refresh', refreshNews);
router.post('/upload', uploadNews);

module.exports = router;

