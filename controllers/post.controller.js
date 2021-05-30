'use strict';
const Post = require('../models/post.model.js');
const User = require('../models/user.model.js');

const mongoose = require('mongoose');

// read all Posts
exports.getAll_Posts = (req, res) => {
    Post.find({})
        .then(data => {
            if (!data) return res.status(400).send({ message: "Cannot find any Posts"});

            else return res.json(data);
        })
        .catch(err => res.status(400).send({ message: err.message || "Failed to get all Posts"}));
};

// Xem bài đăng
exports.readPost = (req, res) => {
    Post.find({ slug: req.params.slug })
        .then(data => {
            if (!data) return res.status(404).send({ message: "Post with id " + id + " not found."});

            else return res.json(data);
        })
        .catch( err => res.status(500).send({ message: err.message || "Failed to read Post with id " + id }));
};