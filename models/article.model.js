const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const articleSchema = new Schema({
    title: {
        type: String, required: true,
    },
    // Người đăng bài
    postedBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
    },
    dateCreate: {
        type: Date, 
        default: Date.now
    },
    content: {
        type: String,
    },
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;