const express = require('express');
const router = express.Router();
const { getNews, searchNews, getArticleById, refreshNews } = require('../controllers/newsController');

router.get('/', getNews);
router.get('/search', searchNews);
router.get('/:id', getArticleById);
router.post('/refresh', refreshNews);

module.exports = router;
