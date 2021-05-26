'use strict';
const router = require('express').Router();

const User = require('../models/user.model');
const Article = require('../models/article.model');
const newsControl = require('../controllers/news.controller');


// GET all news
router.get('/', (req, res) => {
    Article.find()
        .then()
        .catch()
});

