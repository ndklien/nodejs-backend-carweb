'use strict';
require('dotenv').config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { registerValidator } = require('../validations/authentication');

const db = require('../models');
const Role = db.role;
const User = db.user;

// Register for user
exports.registerUser = async (req, res) => {
    const { err } = registerValidator(req.body);

    if (err) {
        return res.status(422).send(err.details[0].message);
    }

    // Check whether email is taken or not
    const checkEmailExist = await User.findOne({
        email: req.body.email,
    });

    if (checkEmailExist) {
        return res.status(422).send('Email is already exist!');
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        fullname: req.body.fullname,
        email: req.body.email,
        password: hashPassword,
    });

    const newUser = await user.save((err) => {
        if (err) return res.status(500).send({ message: err });

        if (req.body.roles) {
            Role.find(
                { name: { $in: req.body.roles }},
                (err, roles) => {
                    if (err) return res.status(500).send({ message: err });
    
                    user.roles = roles.map(role => role._id);
                    user.save((err) => {
                        if (err) return res.status(500).send({ message: err });
                    });
                }
            );
        } else {
            Role.findOne({ name: "user" }, (err, role) => {
                if (err) res.status(500).send({ message: err });

                user.roles = [role._id];
                user.save((err) => {
                    if (err) return res.status(500).send({ message: err });
                });
            });
        };
    });

    try {
        return res.send({
            message: "Register Succeed!",
        });
    } catch (err) {
        return res.status(400).send({ message: error });
    };
};

exports.login = (req, res) => {
    User.findOne({ email: req.body.email })
        .populate("roles", "-__v")
        .exec((err, user) => {
            if (err) return res.status(500).send({ message: err });

            if (!user) return res.status(422).send({ message: "Email not found!" });

            const checkPassword = bcrypt.compareSync(req.body.password, user.password);

            if (!checkPassword) return res.status(422).send({ message: "Password is incorrect" });

            //If password and email is correct
            const token = jwt.sign(
                { _id: user._id }, 
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: 60 * 60 * 24 });

            user.tokens = user.tokens.concat({ token });
            user.save();
    
            var authorities = [];

            for (let i=0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
            };

            return res
            .status(200)
            .json({
                user,
                roles: authorities,
                userToken: token,
                message: "Login successfully"
            });
    });
};

exports.logout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token;
        });
        await req.user.save();
        return res.status(200).send({
            message: 'Logout successfully.'
        });
    } catch (err) {
        return res.status(500).send(err);
    };
};

exports.logoutAll = async (req, res) => {
    try {
        req.user.tokens.splice(0, req.user.tokens.length);
        await req.user.save();
        return res.send({
            message: 'You have logged out all devices'
        });
    } catch (err) {
        return res.status(400).send(err);
    }
};