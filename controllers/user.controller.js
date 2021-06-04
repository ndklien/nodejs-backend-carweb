'use strict';
const { createPostValidator } = require('../validations/authentication');
const Post = require('../models/post.model.js');
const User = require('../models/user.model.js');
const savedpostModel = require('../models/savedpost.model');

const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectId; 


exports.adminBoard = (req, res) => {
    return res.status(200).send("Admin Board");
};

exports.userBoard = (req, res) => {
    return res.status(200).json(req.user);
};

// Post related controller 
// Lấy các bài đăng do người dùng tạo ra
exports.getUserPost = (req, res) => {
    Post.find({ postedBy: req.userID })
        .then(data => {
            if (!data) return res.status(404).send({ message: "Cannot get user Posts" });
            
            else return res.json(data);
        })
        .catch(err => res.status(500).send({ message: err.message || "Failed to load user Posts" }));
};

// Tạo bài đăng mới 
exports.createNewPost = (req, res) => {
    const { err } = createPostValidator(req.body);
    
    if (err) return res.status(422).send(err.details[0].message);

    const { title, postContent, contactDistrict, contactProvince, contactPhone, carBrand, carModel, carType, 
    carSeats, carColor, carFuelType, carOdometer, carPrice, postedBy } = req.body;
    
    const newPost = new Post({
        title,
        postedBy,
        postContent,
        // postImage,

        contactProvince,
        contactDistrict,
        contactPhone,

        carBrand,
        carModel,
        carType,
        carSeats,
        carColor,
        carFuelType,
        carOdometer,
        carPrice
    });
    newPost.postedBy = req.user;

    if (!req.files) {
        console.log("No images");
    } else {
        let postImage = [];

        if (req.files.length > 0) {
            postImage = req.files.map((file) => {
                return { image: file.location };
            });
        };

        newPost.postImage = postImage;
    }

    // newUserPost.save(newUserPost);

    newPost.save(newPost)
        .then(data => res.json({ post: data, userName: req.user.fullname }))
        .catch(err => res.status(500).send({
            message: err.message || 'Failed to create new Post'
        }));
};

// Cập nhật bài viết
exports.updatePost = (req, res) => {
    if (!req.body) return res.status(400).send({ message: "Data up-to-date cannot be null" });
    const id = req.params.id;

    Post.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) return res.status(400).send({ message: "Cannot update Post with id " + id });

            else return res.send({ message: "Update Post successfully!"});
        })
        .catch(err => res.status(400).send({ message: err.message || "Failed to update Post with id " + id}));
}

// Xóa bài đăng dựa trên id
exports.deletePost = (req, res) => {
    const id = req.params.id;

    Post.findByIdAndRemove(id, {useFindAndModify: false})
        .then(data => {
            if (!data) return res.status(404).send({ message: "Cannot delete post with id " + id });

            else return res.send({ message: "Delete post with id " + id + " successfully." });
        })
        .catch(err => res.status(500).send({ message: err.message || "Failed while deleting post with id " + id }));
};

// Xóa tất cả bài đăng
exports.deleteAllPosts = (req, res) => {
    Post.deleteMany({ postedBy: req.userID })
        .then(data => res.send({ message: `${data.deletedCount} Posts were deleted successfully.`}))
        .catch(err => res.status(500).send({ message: err.message || "Failed to delete all Posts."}));
};

// Xóa có chọn lọc
exports.deleteChosenPosts = (req, res) => {
    Post.deleteMany()
}

exports.addSavePost = (req, res) => {
    const postID = req.params.postID;

    // Tìm xem user đã tồn tại trong savepost collection chưa
    savedpostModel.findOne({ user: req.user })
        .then(saved => {
            // Kiểm tra Post có tồn tại hay không
            Post.findOne({ _id: postID })
                .then(post => {
                    if (!post) return res.status(404).send({ message: "Cannot find Post with id " + postID });
                    else {
                        // Nếu chưa có trong database
                        if (!saved) {
                            const newModel = new savedpostModel({
                                user: req.user
                            });
            
                            newModel.savedList = newModel.savedList.concat({ post });
                            newModel.save(newModel);
                            return res.send({ message: "Save Post with id " + postID + " succeed!" });
                        } else {
                            // Kiểm tra trường hợp đã lưu bài này
                            const checkPostExists = savedpostModel.findOne({ user: req.user, 'savedList.post': post })
                            if (checkPostExists) {
                                return res.status(400).send({ message: "Already Exists" });
                            }
                            saved.savedList = saved.savedList.concat({ post });
                            saved.save(saved);
            
                            return res.send({ message: "Save Post with id " + postID + " succeed!" });
                        }
                    }
                })
                .catch(err => res.status(500).send({
                    message: err.message || "Failed to find Post to Save Post Model"
                }));

        })
        .catch(err => res.status(500).send({
            message: err.message || "Failed to find User to Save Post Model"
        }));
};

exports.getSavedPost = (req, res) => {
    savedpostModel.find({ user: req.user })
        .then(data => {
            if (!data) return res.status(404).send({ message: "Cannot find User Saved List with id " + req.userID });
            
            else return res.json(data);
        })
        .catch(err => res.status(500).json({
            message: err.message || "Failed to get User Saved Post List"
        }));
};