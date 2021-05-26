'use strict';
require('dotenv').config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Article = require('../models/article.model');

// read distinct news
exports.readNews = (req, res) => {

}