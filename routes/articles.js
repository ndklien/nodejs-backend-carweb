'use strict';
const router = require('express').Router();

const User = require('../models/user.model');
const Article = require('../models/article.model');
const articleControll = require('../controllers/article.controller');

// Endpoint starts with /api/news
// GET all news
router.get('/all', articleControll.getAllNews);

// GET distinct news
router.get('/:slug', articleControll.readNews);

module.exports = router;