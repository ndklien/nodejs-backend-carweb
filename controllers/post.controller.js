'use strict';
const Post = require('../models/post.model.js');
const User = require('../models/user.model.js');

const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

//Search
exports.suggestionPost = async (req, res) => {
    try {
        var q = req.query.q;
        console.log(q);
        var regex = new RegExp(q, 'i');
        const post = await Post.find({index_name: regex }, { 'name': 1 });
        res.status(200).json({post})
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

//gơi ý khi search
exports.searchPost = async (req, res) => {
    try {
        const query = req.query;
        var q = query.q;
        let post = await Post
            .find({
                $text:
                {
                    $search: q,
                    $caseSensitive: false,
                    $diacriticSensitive: true
                }
            }, { score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" } })
        res.status(200).json(post)
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// read all Posts
exports.getAll_Posts = (req, res) => {
    Post.find({}).sort({ updatedAt : 'desc' })
        .populate("postedBy", "fullname")
        .then((data) => {
            if (!data) return res.status(404).send({ message: "Cannot find any Posts" });
            else return res.json(data);
        })
        .catch(err => res.status(400).send({ message: err.message || "Failed to get all Posts"}));
};

// Xem bài đăng
exports.readPost = (req, res) => {
    const slug = req.params.slug;
    Post.findOne({ slug: slug })
        .then(data => {
            if (!data) return res.status(404).send({ message: "Post with slug " + slug + " not found."});

            else {
                let id = data.postedBy;
                User.findOne({ "_id": id })
                    .then(user => {
                        if (!user) return res.status(404).send({ message: "User with id " + id + " not found!" });
                        const userName = user.fullname;
                        return res.json({
                            data,
                            userName
                        });
                    })
                    .catch(err => res.status(500).send({ message: err.message || "Failed to get User"}));
            }; 
        })
        .catch(err => res.status(500).send({ message: err.message || "Failed to read Post with id " + id }));
};

// Lấy danh sách bài đăng theo id người dùng
exports.getUserPost = (req, res) => {
    const userID = req.params.userID;
    User.findOne({ _id: userID }).sort({ createdAt : 'desc' })
        .then(user => {
            if (!user) return res.status(404).send({ message: "Cannot find user with id " + userID });

            Post.find({ postedBy: userID })
                .then(data => {
                    if (!data) return res.status(404).send({ message: "Cannot find any posts from user with id " + userID });
                    else return res.json({
                        userName : user.fullname,
                        posts: data,
                    })
                })
                .catch(err => res.status(500).send({ message: err.message || "Failed to find posts by User ID" }));
        })
        .catch(err => res.status(500).send({ message: err.message || "Failed to find User by User ID" }));
};

// Lấy danh sách bài đăng theo thương hiệu
exports.getPost_byBrand = (req, res) => {
    const brand = req.params.brand;

    Post.find({ carBrand: brand }).sort({ updatedAt : 'desc' })
        .populate("postedBy", "fullname")
        .then((data) => {
            if (!data) return res.status(404).send({ message: "Cannot find any Brand with name " + brand });

            else return res.json(data);
        })
        .catch((err) => res.status(500).send({
            message: err.message || "Failed to load Posts with Brand named " + brand
        }));
};
