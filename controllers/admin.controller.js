'use strict';
const router = require('express').Router();
const Post = require('../models/post.model');
const User = require('../models/user.model');

// Endpoint starts with /api/admin
router.deleteAll_Post = (req, res) => {
    Post.deleteMany({})
        .then(data => res.send({ message: `${data.deletedCount} Posts were deleted successfully by Admin.` }))
        .catch(err => res.send({
            message: err.message || "Failed to delete all Posts by Admin"
        }));
};

router.getAll_User = (req, res) => {
    User.find({})
        .then(data => res.json(data))
        .catch(err => res.status(400).send({ message: err.message || "Failed to get all users"}));
};
module.exports = router;