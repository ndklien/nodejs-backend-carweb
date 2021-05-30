'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userPostSchema = new Schema({
    userID: {
        type: String, 
    },
    postID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Post"
    }
});

module.exports = mongoose.model('userPost', userPostSchema);;