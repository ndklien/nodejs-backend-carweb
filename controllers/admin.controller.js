'use strict';
const router = require('express').Router();
const Post = require('../models/post.model');

// Endpoint starts with /api/admin
router.deleteAll_Post = (req, res) => {
    Post.deleteMany({})
        .then(data => res.send({ message: `${data.deletedCount} Posts were deleted successfully by Admin.` }))
        .catch(err => res.send({
            message: err.message || "Failed to delete all Posts by Admin"
        }));
};


module.exports = router;