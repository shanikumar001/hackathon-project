const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Firebase Auth
router.post('/firebase-login', authController.firebaseLogin);

// Email/Password Auth
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Phone Auth (Twilio)
router.post('/request-otp', authController.requestOTP);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;
