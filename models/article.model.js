const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const articleSchema = new Schema({
    title: {
        type: String, 
        required: true,
        trim: true,
    },
    // Người đăng bài
    postedBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
    },
    content: {
        type: String,
    },
    slug: {
        type: String, 
        slug: "title",
        unique: true,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});

module.exports = mongoose.model('Article', articleSchema);