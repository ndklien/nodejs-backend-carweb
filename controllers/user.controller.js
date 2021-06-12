'use strict';
const { createPostValidator } = require('../validations/authentication');
const Post = require('../models/post.model.js');
const User = require('../models/user.model.js');
const savedpostModel = require('../models/savedpost.model');

const mongoose = require('mongoose');

exports.adminBoard = (req, res) => {
    return res.status(200).send("Admin Board");
};

exports.getUserInfo = (req, res) => {
    User.findById(req.userID, { tokens: 0, resetLink: 0})
        .then((data) => {
            if (!data) return res.status(404).send({ message: "Cannot find User information" });
            else return res.json(data);
        })
        .catch((err) => res.status(500).send({
            message: err.message || "Failed to get User Information"
        }));
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

    const { title, postContent, contactDistrict, contactProvince, contactPhone, carBrand, carModel, carType, carYear,
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
        carYear,
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

            else return res.send({ message: "Cập nhật Post thành công"});
        })
        .catch(err => res.status(400).send({ message: err.message || "Failed to update Post with id " + id}));
}

// Xóa bài đăng dựa trên id
exports.deletePost = (req, res) => {
    const id = req.params.id;

    Post.findByIdAndRemove(id, {useFindAndModify: false})
        .then(data => {
            if (!data) return res.status(404).send({ message: "Cannot delete post with id " + id });

            else return res.send({ message: "Xóa Post với id " + id + " thành công." });
        })
        .catch(err => res.status(500).send({ message: err.message || "Failed while deleting post with id " + id }));
};

// Xóa tất cả bài đăng
exports.deleteAllPosts = (req, res) => {
    Post.deleteMany({ postedBy: req.userID })
        .then(data => res.send({ message: `${data.deletedCount} Posts đã được xóa.`}))
        .catch(err => res.status(500).send({ message: err.message || "Failed to delete all Posts."}));
};

// Xóa có chọn lọc -- chưa
exports.deleteChosenPosts = (req, res) => {
    Post.deleteMany()
}

// Lưu bài viết
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
                            return res.send({ message: "Lưu Post với id " + postID + " thành công!" });
                        } else {
                            // Kiểm tra trường hợp đã lưu bài này
                            let checkPostExists = 0;
                            saved.savedList.forEach((ele) => {
                                if (ele.post == postID) {
                                    checkPostExists += 1;
                                }
                            })

                            if (checkPostExists > 0) {
                                return res.status(400).send({ message: "Bài viết đã được lưu" });
                            }
                            saved.savedList = saved.savedList.concat({ post });
                            saved.save(saved);
            
                            return res.send({ message: "Lưu Post với id " + postID + " thành công!" });
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

// Lấy danh sách các bài viết đã lưu
exports.getSavedPost = (req, res) => {
    savedpostModel.findOne({ user: req.user })
        
        .then(data => {
            if (!data) return res.status(404).send({ message: "Cannot find User Saved List with id " + req.userID });
            
            else {
                // console.log(data.savedList);
                let postList = [];
                let len = data.savedList.length;
                if (len === 0) return res.send({ message: "Danh sách lưu đang rỗng" });
                let i = 0;
                data.savedList.forEach(ele => {
                    Post.findById(ele.post)
                        .populate("postedBy", "fullname")
                        .then(post => {
                            if (!post) return res.send({ message: "Post with id " + ele.post + " not found"});
                            postList.push(post);
                            if (++i === len) {
                                return res.json(postList);
                            }
                        })
                        .catch(err => res.status(500).send({ 
                            message: err.message || "Failed to find Post"
                        }))
                })
            }
        })
        .catch(err => res.status(500).json({
            message: err.message || "Failed to get User Saved Post List"
        }));
};

// Xoá bài đã lưu
exports.removeSavedPost = (req, res) => {
    const postRemove = req.params.postID;
    Post.find({ _id: postRemove })
        .then((post) => {
            if (!post) return res.status(404).send({ message: "Cannot find Post with id " + postRemove });
        })
        .catch(err => res.status(500).send({ message: err.message || "Failed to find Post with id " + postRemove }));

    savedpostModel.findOneAndUpdate({ user: req.user },{$pull: {savedList: {post: postRemove}}}, { returnOriginal: false })
        .populate({path: "savedList", select: "post", model: "Post" })
        .exec((err, data) => {
            if (err) return res.status(500).send({ message: err.message || "Failed to find saved Post with id " + postRemove });

            return res.json(data);
        });
};