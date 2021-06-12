'use strict';
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { registerValidator } = require('../validations/authentication');

const db = require('../models');

const mailgun = require("mailgun-js");
const DOMAIN = "sandboxe4476ed40d5747e1946f19345dfc475c.mailgun.org";
const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN });

const _ = require('lodash');
const savedpostModel = require('../models/savedpost.model');
const Role = db.role;
const User = db.user;
const fetch = require('node-fetch');
const { isBuffer } = require('lodash');
const { OAuth2Client } = require('google-auth-library');
const { response } = require('express');

const client = new OAuth2Client('855027359850-qfobtd2aaju1tk8bh70unnv0kcak19ve.apps.googleusercontent.com')

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
                { name: { $in: req.body.roles } },
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

            for (let i = 0; i < user.roles.length; i++) {
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

exports.updatePassword = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id)
        if (user) {
            const checkPassword = await bcrypt.compareSync(req.body.oldPassword, user.password);

            if (!checkPassword) return res.status(422).send({ message: "Password is incorrect" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.newPassword, salt);
        const userPassword = await User.findByIdAndUpdate(id, {
            password: hashPassword
        });
        return res.status(200).json({ data: userPassword })

    } catch (error) {
        res.status(409).json({ message: error.message })
    }
}

//forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email })
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
                        <p>${process.env.CLIENT_URL}/quenmatkhau/${token}`
        };

        const userupdate = await User.findByIdAndUpdate(user._id, { resetLink: token }, { new: true });
        await mg.messages().send(data, function (error, body) {
            if (error) {
                res.status(200).json({ message: error.message })
            }
            else res.status(200).json({ result: userupdate})
        });
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
};



exports.resetPassword = async (req, res) => {
    try {
        const resetLink = req.params.token;
        const { newPass } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPass, salt);
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
                        password: hashPassword,
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
            return res.status(401).json({ error: "Authencation error!!!" });
        }
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}




exports.loginFacebook = async (req, res) => {
    let email = '';
    let name = '';
    const userID = req.body.userID;
    const accessToken = req.body.accessToken;
    let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
    await fetch(urlGraphFacebook,
        {
            method: 'GET'
        })
        .then(res => res.json())
        .then(res => {
            const { email, name } = res;
        })
    try {
        const user = await User.findOne({ email })
        if (user) {
            const token = jwt.sign(
                { _id: user._id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: 60 * 60 * 24 });
            user.tokens = user.tokens.concat({ token });
            user.save();

            var authorities = [];

            for (let i = 0; i < user.roles.length; i++) {
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
        } else {
            const password = email + process.env.ACCESS_TOKEN_SECRET;
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const userInfor = {
                fullname: name,
                email: email,
                password: hashPassword,
                address: '',
                phone: '',
                resetLink: '',
            }
            let newUser = new User(userInfor);
            newUser.save((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: "Something went wrong..."
                    })
                }
                const token = jwt.sign(
                    { _id: newUser._id },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: 60 * 60 * 24 });
                newUser.tokens = newUser.tokens.concat({ token });
                newUser.tokens = newUser.tokens.concat({ token });
                newUser.save();

                var authorities = [];

                for (let i = 0; i < newUser.roles.length; i++) {
                    authorities.push("ROLE_" + newUser.roles[i].name.toUpperCase());
                };
                return res
                    .status(200)
                    .json({
                        newUser,
                        roles: authorities,
                        newUserToken: token,
                        message: "Login successfully"
                    });
            })
        }
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

exports.loginGoogle = async (req, res) => {
    const { tokenId } = req.body;
    client.verifyIdToken({ idToken: tokenId, audience: '855027359850-qfobtd2aaju1tk8bh70unnv0kcak19ve.apps.googleusercontent.com' })
        .then(response => {
            const { email_verified, name, email } = response.payload;
        })

    try {
        if (email_verified) {
            const user = await User.findOne({ email })
            // .populate("roles", "-__v")
            // .exec((err, user) => {
            //     if (err) {
            //         return res.status(400).json({
            //             error: 'Something went wrong'
            //         })
            //     } else {
            if (user) {
                const token = jwt.sign(
                    { _id: user._id },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: 60 * 60 * 24 });
                user.tokens = user.tokens.concat({ token });
                user.save();

                var authorities = [];

                for (let i = 0; i < user.roles.length; i++) {
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
            } else {
                const password = email + process.env.ACCESS_TOKEN_SECRET;
                const salt = await bcrypt.genSalt(10);
                const hashPassword = await bcrypt.hash(password, salt);
                const userInfor = {
                    fullname: name,
                    email: email,
                    password: hashPassword,
                    address: '',
                    phone: '',
                    resetLink: '',
                }
                let newUser = new User(userInfor);
                newUser.save((err, data) => {
                    if (err) {
                        return res.status(400).json({
                            error: "Something went wrong..."
                        })
                    }
                    const token = jwt.sign(
                        { _id: newUser._id },
                        process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: 60 * 60 * 24 });
                    newUser.tokens = newUser.tokens.concat({ token });
                    newUser.tokens = newUser.tokens.concat({ token });
                    newUser.save();

                    var authorities = [];

                    for (let i = 0; i < newUser.roles.length; i++) {
                        authorities.push("ROLE_" + newUser.roles[i].name.toUpperCase());
                    };
                    return res
                        .status(200)
                        .json({
                            newUser,
                            roles: authorities,
                            newUserToken: token,
                            message: "Login successfully"
                        });
                })
            }
        }

        //     }
        // })
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}
