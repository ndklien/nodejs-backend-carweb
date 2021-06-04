'use strict';
const router = require('express').Router();
const { authToken, isAdmin, isUser } = require('../middlewares/auth');
const { userBoard, adminBoard } = require('../controllers/user.controller');
const userControll = require('../controllers/user.controller');

const { uploadS3post,  } = require('../middlewares/s3');

// Endpoint starts with /api/user

// Lấy thông tin người dùng
router.get('/userboard', [authToken, isUser], userBoard );

router.get('/adminboard', [authToken, isAdmin], adminBoard );


// Post related router 

// Endpoint starts with /api/user
// Tạo bài đăng bán
router.post('/post/create', [authToken, isUser], uploadS3post.array("image", 9), userControll.createNewPost);

// Sửa bài đăng bán
router.put('/post/:id/edit', [authToken, isUser], userControll.updatePost);

// Xóa bài đăng bán
router.delete('/post/:id/delete', [authToken, isUser], userControll.deletePost);

// Xoá tất cả bài đăng
router.delete('/post/deleteall', [authToken, isUser], userControll.deleteAllPosts);

// Lấy danh sách tất cả các bài đăng của người đăng - có phân quyền để truy cập
router.get('/list', [authToken, isUser], userControll.getUserPost);

// Lưu bài viết
router.post('/saved/:postID', [authToken, isUser], userControll.addSavePost);

// Lấy danh sách bài viết của người dùng
router.get('/saved/list', [authToken, isUser], userControll.getSavedPost);

router.put('/saved/remove/:postID', [authToken, isUser], userControll.removeSavedPost);

module.exports = router;