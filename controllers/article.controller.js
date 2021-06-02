'use strict';
require('dotenv').config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Article = require('../models/article.model');
const { createArticleValidator } = require('../validations/authentication');

// Lấy danh sách tin tức
exports.getAllNews = (req, res) => {
    Article.find({})
        .then(data => {
            if (!data) return res.status(404).send({ message: "Cannot get all News Articles" });
            
            else return res.json(data);
        })
        .catch(err => res.status(400).send({ message: err.message || "Failed to get all News Articles" }));
};

// Đọc một mẩu tin
exports.readNews = (req, res) => {
    Article.findOne({ slug: req.params.slug })
        .then(data => {
            if (!data) return res.status(404).send({ message: "Cannot get Article with slug " + req.params.slug });
            else return res.json(data);
        })
        .catch(err => res.status(500).send({ message: err.message || "Failed to get Article with slug " + req.params.slug }));
};
// Tạo tin tức mới
exports.createNews = (req, res) => {
    const { err } = createArticleValidator(req.body);

    if (err) return res.status(422).send(err.details[0].message);

    const { title, content } = req.body;

    const newsArticle = new Article({
        title,
        content
    });

    newsArticle.postedBy = req.user;

    if (req.file === 'undefined') {
        console.log("No Image");
    } else {
        newsArticle.newsImage = req.file.location;
    }

    newsArticle.save(newsArticle)
        .then(data => res.json(data))
        .catch(err => res.status(400).send({ message: err.message || "Failed to save Article" }));
};

// Chỉnh sửa tin tức
exports.updateNews = (req, res) => {
    const id = req.params.id;
    if (!req.body) return res.status(400).send({ message: "Data up-to-date cannot be null" });

    Article.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) return res.status(400).send({ message: "Cannot update Article with id " + id });

            else return res.send({ message: "Update Article successfully!"});
        })
        .catch(err => res.status(400).send({ message: err.message || "Failed to update Article with id " + id}));
}

// Xóa tất cả trong danh sách tin tức
exports.deleteAll_News = (req, res) => {
    Article.deleteMany({})
        .then(data => res.send({ message: `${data.deletedCount} Posts were deleted successfully.`}))
        .catch(err => res.status(400).send({ message: err.message || "Failed when deleting all Articles" }));
};

exports.deleteArticle = (req, res) => {
    const id = req.params.id;
    Article.findByIdAndRemove(id, { useFindAndModify: false })
        .then(data => {
            if (!data) return res.status(404).send({ message: "Cannot find article with id " + id });

            else return res.send({ message: "Deleted Article with id " + id });
        })
        .catch(err => res.status(500).send({
            message: err.message || "Failed to delete Article with id" + id
        }));
};

