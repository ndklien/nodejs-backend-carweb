'use strict';
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.user;
const Role = db.role;

exports.authToken = async (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).send({
            message: 'Auth Token is Missing!',
        });
    }

    const data = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    try {
        const userLoad = await User.findOne({ _id: data._id, 'tokens.token': token});
        if (!userLoad) {
            throw new Error()
        }

        req.user = userLoad;
        req.token = token;
        next();
    } catch (err) {
        return res.status(400).send({
            err,
            message: 'Permission Denied',
        });
    }
};

// Kiểm tra phân quyền User và Admin
exports.isUser = async (req, res, next) => {
    User.findById(req.user._id)
        .exec((err, user) => {
            if (err) return res.status(500).send({ message: err });

            Role.find(
                { _id: { $in: user.roles }},
                (err, roles) => {
                    if (err) return res.status(500).send({ message: err});

                    for (let i=0; i < roles.length; i++) {
                        if (roles[i].name === "user") {
                            return next();
                        }
                    };
                    return res.status(403).send({ message: "Require User login!" });
            });
            
    });
};


exports.isAdmin = async (req, res, next) => {
    User.findById(req.user._id).exec((err, user) => {
        if (err) return res.status(500).send({ message: err });

        Role.find(
            { _id: { $in: user.role }},
            (err, roles) => {
                if (err) return res.status(500).send({ message: err });

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "admin") {
                        return next();
                    }
                };
                return res.status(403).send({ message: "Require Admin login!"});
            });
    });
};
