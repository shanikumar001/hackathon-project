const FarmerUser = require('../models/FarmerUser');
const ProfileInfo = require('../models/ProfileInfo');
const admin = require('../config/firebase');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { sendOTP } = require('../utils/twilio');
const crypto = require('crypto');

// Validation schema for firebase login
const firebaseLoginSchema = Joi.object({
    idToken: Joi.string().required().messages({
        'string.empty': 'Firebase ID token is required',
        'any.required': 'Firebase ID token is required',
    }),
});

const signupSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().required(),
    role: Joi.string().valid('farmer', 'buyer').default('farmer'),
    location: Joi.string().allow('').optional(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const otpRequestSchema = Joi.object({
    phone: Joi.string().required(),
});

const otpVerifySchema = Joi.object({
    phone: Joi.string().required(),
    otp: Joi.string().length(6).required(),
});

/**
 * Firebase Login / Signup
 * POST /api/auth/firebase-login
 *
 * Flow:
 * 1. Verify Firebase ID token
 * 2. Find or create user in farmer_user collection
 * 3. Auto-create profile_info document for new users
 * 4. Return JWT session token + user data
 */
exports.firebaseLogin = async (req, res) => {
    // Validate input
    const { error } = firebaseLoginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }

    const { idToken } = req.body;

    try {
        // Step 1: Verify Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture, phone_number, firebase } = decodedToken;
        const provider = firebase?.sign_in_provider === 'phone' ? 'phone' : 'google';

        // Step 2: Find existing user by firebase_uid
        let user = await FarmerUser.findOne({ firebase_uid: uid });

        if (!user) {
            // Step 3: Create new user
            user = new FarmerUser({
                firebase_uid: uid,
                name: name || 'User',
                email: email || '',
                phone: phone_number || '',
                role: 'farmer', // default role, can be changed later
                language: 'en',
                location: '',
            });
            await user.save();

            // Step 4: Auto-create profile_info document
            const profile = new ProfileInfo({
                userId: user._id,
                profileImage: picture || '',
                email: email || '',
                phone: phone_number || '',
            });
            await profile.save();

            // Link profile to user
            user.profileId = profile._id;
            await user.save();
            console.log(`🆕 New User Registered: ${user.name} (${uid})`);
        } else {
            console.log(`🔑 User Logged In: ${user.name} (${uid})`);
        }

        // Step 5: Generate JWT session token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        console.log(`🎟️ JWT Generated for user: ${user._id}`);

        // Step 6: Return response
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                language: user.language,
                location: user.location,
                profileId: user.profileId,
            },
        });
    } catch (error) {
        console.error('Firebase Login Error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid Firebase token or authentication failed',
        });
    }
};

/**
 * Email/Password Signup
 * POST /api/auth/signup
 */
exports.signup = async (req, res) => {
    const { error } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { name, email, password, phone, role, location } = req.body;

    try {
        let user = await FarmerUser.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: 'User already exists' });

        user = new FarmerUser({ name, email, password, phone, role, location, isVerified: true });
        await user.save();

        const profile = new ProfileInfo({ userId: user._id, email, phone });
        await profile.save();

        user.profileId = profile._id;
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ success: true, token, user: formatUserResponse(user) });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ success: false, message: 'Server error during signup' });
    }
};

/**
 * Email/Password Login
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { email, password } = req.body;

    try {
        const user = await FarmerUser.findOne({ email });
        if (!user || !user.password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, token, user: formatUserResponse(user) });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

/**
 * Request OTP (Twilio)
 * POST /api/auth/request-otp
 */
exports.requestOTP = async (req, res) => {
    const { error } = otpRequestSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    try {
        let user = await FarmerUser.findOne({ phone });
        if (!user) {
            user = new FarmerUser({
                phone,
                name: 'User',
                role: 'buyer',
                firebase_uid: `phone-${phone}-${Date.now()}` // dummy uid for legacy support
            });
        }

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendOTP(phone, otp);

        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('OTP Request Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
};

/**
 * Verify OTP (Twilio)
 * POST /api/auth/verify-otp
 */
exports.verifyOTP = async (req, res) => {
    const { error } = otpVerifySchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { phone, otp } = req.body;

    try {
        const user = await FarmerUser.findOne({
            phone,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Clear OTP
        user.otp = null;
        user.otpExpires = null;
        user.isVerified = true;
        await user.save();

        // Check/Create profile
        if (!user.profileId) {
            const profile = new ProfileInfo({ userId: user._id, phone });
            await profile.save();
            user.profileId = profile._id;
            await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, token, user: formatUserResponse(user) });
    } catch (error) {
        console.error('OTP Verify Error:', error);
        res.status(500).json({ success: false, message: 'Server error during verification' });
    }
};

// Helper to format user for response
const formatUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    language: user.language,
    location: user.location,
    profileId: user.profileId,
});
