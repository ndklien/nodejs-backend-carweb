const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const Post = require('../models/post.model.js');
const User = require('../models/user.model.js');
const { createPostValidator } = require('../validations/authentication');

// Post controll for user
exports.getAllPost = async (req, res) => {
    try {
        const userPostList = await Post.find({ postedBy: req.user._id });

        return res.status(200).json({
            confirmation: 'Succeed.',
            data: userPostList,
        })
    } catch (err) {
        return res.status(400).json({
            err,
            message: 'Error in getAllPost'
        });
    };
};


// Create new post 
exports.createNewPost = async (req, res) => {
    const { err } = createPostValidator(req.body);

    if (err) {
        return res.status(422).send(err.details[0].message);
    }

    var item = {
        title: req.body.title,
        postedBy: req.user._id,
        dateCreated: Date.parse(req.body.dateCreated),
        postContent: req.body.postContent,
        postPics: req.body.postPics,

        contactProvince: req.body.contactProvince,
        contactDistrict: req.body.contactDistrict,
        contactPhone: req.body.contactPhone,

        carBrand: req.body.carBrand,
        carModel: req.body.carModel,
        carType: req.body.carType,
        carSeats: Number(req.body.carSeats),
        carColor: req.body.carColor,
        carFuelType: req.body.carFuelType,
        carOdometer: Number(req.body.carOdometer),
        carPrice: Number(req.body.carPrice)
    };

    const newPost = new Post(item);

    newPost.save()
        .then(() => res.json('Post added!'))
        .catch(err => res.status(400).json('Err' + err)); 
};


// Read distinct post
exports.readPost = (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(400).json('Error '+ err));
};


// Delete distinct post
exports.deletePost = (req, res) => {
    Post.findByIdAndDelete(req.params.id)
        .then(() => res.json('Post ' + req.params.id +' deleted!'))
        .catch(err => res.status(400).json('Err '+ err));
};

// Edit distinct post
exports.editPost = (req, res) => {
    if (req.isAuthenticated() && req.Post.postedBy == req.session.User.ObjectId) {
        console.log(req.session.passport.user);
        Post.findByIdAndUpdate(req.params.id)
            .then(() => res.json('Post '+ res.params.id + ' updated!'))
            .catch(err => res.status(400).json('Err ' + err));

    } else {
        res.send("You don't have the permission to access.");
    }
};
