'use strict';
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { registerValidator } = require('../validations/authentication');

const db = require('../models');

const mailgun = require("mailgun-js");
const DOMAIN = 'sandboxe4476ed40d5747e1946f19345dfc475c.mailgun.org';
const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN });

const _ = require('lodash');
const savedpostModel = require('../models/savedpost.model');
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

    const savedList = await new savedpostModel({
        user: newUser
    });

    await savedList.save(savedList);

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

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, {
            fullname: req.body.fullname,
            phone: req.body.phone,
            address: req.body.address,

        }, function (err, docs) { });
        res.status(200).json(user)

    } catch (error) {
        res.status(409).json({ message: error.message })
    }
}

//Change password

// exports.updatePassword = async (req, res) => {
//     try { 
//         const salt = await bcrypt.genSalt(10);
//         const hashPassword = await bcrypt.hash(req.body.password, salt);
//         User.findOne({ email: req.body.email }, (err, user) =>{        
//             const checkPassword = bcrypt.compareSync(req.body.password, user.password);
//             if (!checkPassword) 
//                 return res.status(422).send({ message: "Password is incorrect" });
//         })
//         const user = await User.findByIdAndUpdate(req.user.id, {
//             password: hashPassword
//         }, function (err, docs) { });   
//         res.status(200).json(user)

//     } catch (error) {
//         res.status(409).json({ message: error.message })
//     }
// }

//forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    User.findOne({ email })
        .populate("roles", "-__v")
        .exec((err, user) => {
            if (err) return res.status(500).send({ message: err });

            if (!user) return res.status(422).send({ message: "Email not found!" });
            //If email is correct
            const token = jwt.sign(
                { _id: user._id },
                process.env.RESET_PASSWORD_KEY,
                { expiresIn: 60 * 60 * 24 });

            const data = {
                from: 'noreply@carthrift.com',
                to: email,
                subject: 'Account Activation Link',
                html: `
                    <h2>Please click on given link to reset you password</h2>
                    <p>${process.env.CLIENT_URL}/resetpassword/${token}`
            };

            return user.updateOne({ resetLink: token }, function (err, seccess) {
                if (err) {
                    return res.status(400).json({ error: "reset password link error" });
                } else {
                    mg.messages().send(data, function (error, body) {
                        if (error) {
                            return res.json({
                                error: err.message
                            })
                        }
                        return res.json({ message: "Email has been sent, kindly follow the link" });
                    });
                }
            })
        });
};

// Reset pass
exports.resetPassword = async (req, res) => {
    try {
        const { resetLink, newPass } = req.body;
        if (resetLink) {
            jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function (error, decodedData) {
                if (error) {
                    return res.status(401).json({
                        error: "Incorrect token or it is expored"
                    })
                }

                User.findOne({ resetLink }, (err, user) => {
                    if (err || !user) {
                        return res.status(400).json({ error: "User with this token does not exist" });
                    }

                    const obj = {
                        password: newPass,
                        resetLink: ''
                    }
                    user = _.extend(user, obj);
                    user.save((err, result) => {
                        if (err) {
                            return res.status(400).json({ error: "reset password error" });
                        } else {
                            return res.status(200).json({ message: "Your password has been changed" });
                        }
                    })
                })
            })
        } else {
            return res.status(401).json({ error: "Authercation error!!!" });
        }
    } catch (error) {
        res.status(404).json({ message: error.message })
    }  
}
