'use strict';
const router = require('express').Router();
const { authToken, isAdmin, isUser } = require('../middlewares/auth');
const db = require('../models');
const User = db.user;
const Role = db.role;

const postControl = require('../controllers/post.controller');
const { userBoard, adminBoard } = require('../controllers/user.controller');

// Endpoint starts with /api/user

// Lấy thông tin người dùng
router.get('/userboard', [authToken, isUser], userBoard );

router.get('/adminboard', [authToken, isAdmin], adminBoard );

// Delete post 

module.exports = router;