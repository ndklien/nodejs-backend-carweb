'use strict';
var authController = require('../controllers/auth.controller');
const express = require('express');
const { authToken } = require('../middlewares/auth');
const router = express.Router();

const User = require('../models/user.model');
const { checkRolesExist } = require('../middlewares/verify');

// Endpoint starts with /api/auth

// Register account: tested
router.post('/dangki', checkRolesExist, authController.registerUser);

// Login account: tested
router.post('/dangnhap', authController.login);

//Change information
router.post('/changeaccount', authToken, authController.updateUser);

// Quên password
router.post('/forgotpassword', authController.forgotPassword);

// Reset Password
router.post('/resetpassword', authController.resetPassword);

// Logout in all device
router.post('/dangxuat-all', authToken, authController.logoutAll);

// Logout in one device
router.post('/dangxuat', authToken, authController.logout);

module.exports = router;