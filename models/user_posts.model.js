const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userPostsSchema = new.Schema({
    userId: mongoose.Schema.Types.ObjectId, ref: 'User',

    userPosts: mongoose.Schema.Types.ObjectId, ref: 'Post',

});

const userPosts = mongoose.model('userPosts', userPostsSchema);

module.exports = userPosts;