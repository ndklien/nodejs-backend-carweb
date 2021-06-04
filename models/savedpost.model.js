'use strict';
const Post = require('../models/post.model');
const User = require('../models/post.model');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const savedPostSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User"
    },

    savedList: [{
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    }]
});

module.exports = mongoose.model("SavedPost", savedPostSchema);
