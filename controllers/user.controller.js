'use strict';

exports.adminBoard = (req, res) => {
    return res.status(200).send("Admin Board");
};

exports.userBoard = (req, res) => {
    return res.status(200).json(req.user);
};