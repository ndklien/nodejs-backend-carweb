'use strict';
const mongoose = require('mongoose');
const router = require('express').Router();
const articleControll = require('../controllers/article.controller');
const adminControll = require('../controllers/admin.controller');

const { authToken, isAdmin } = require('../middlewares/auth');

const { uploadS3news } = require('../middlewares/s3');

// Endpoint starts with /api/admin

// Post Related
// Xóa tất cả các bài đăng trong db
router.delete('/post/deleteall', [authToken, isAdmin], adminControll.deleteAll_Post);

// News Related
// Tạo tin tức
router.post('/news/create', [authToken, isAdmin], uploadS3news.single("image") , articleControll.createNews);

// Sửa tin tức
router.put('/news/:id/edit', [authToken, isAdmin], articleControll.updateNews);

// Xóa tin tức
router.delete('/news/:id/delete', [authToken, isAdmin], articleControll.deleteArticle);

// Xóa tất cả tin tức
router.delete('/news/deleteall', [authToken, isAdmin], articleControll.deleteAll_News);

module.exports = router;