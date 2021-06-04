const router = require('express').Router();
let Post = require('../models/post.model');

var postControll = require('../controllers/post.controller');
const { isUser, isAdmin, authToken } = require('../middlewares/auth');

// Endpoint starts with /api/post
// Xem tất cả các bài đăng
router.get('/all', postControll.getAll_Posts);

// Xem bài đăng
router.get('/:slug', postControll.readPost);

// Lấy danh sách bài đăng theo id người dùng
router.get('/list/:userID', postControll.getUserPost);

module.exports = router;