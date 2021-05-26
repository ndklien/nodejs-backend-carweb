const router = require('express').Router();
let Post = require('../models/post.model');

var postControl = require('../controllers/post.controller');
const { authToken } = require('../middlewares/auth');

// Endpoint starts with /post

router.post('/create', authToken, postControl.createNewPost);
// router.route('/create').post(postControl.createNewPost);

module.exports = router;