'use strict';
const router = require('express').Router();
const Post = require('../models/post.model');
const User = require('../models/user.model');

// Endpoint starts with /api/admin

// Xóa tất cả các bài post
router.deleteAll_Post = (req, res) => {
    Post.deleteMany({})
        .then(data => res.send({ message: `${data.deletedCount} Posts were deleted successfully by Admin.` }))
        .catch(err => res.send({
            message: err.message || "Failed to delete all Posts by Admin"
        }));
};

// Lấy thông tin tất cả người dùng - trừ token và resetLink 
router.getAll_User = (req, res) => {
    User.find({}, {tokens: 0, resetLink: 0}).sort({ createdAt : 'desc' })
        .then(data => {
            if (!data) return res.status(404).send({ message: "Cannot get any Users" });

            else return res.json(data);
        })
        .catch(err => res.status(400).send({ message: err.message || "Failed to get all users"}));
};
module.exports = router;