const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { fullName, email, phone, address, state, pincode, password } = req.body;

        if (!fullName || !email || !phone || !address || !state || !pincode || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        
        const phoneExists = await User.findOne({ phone });
        if (phoneExists) {
            return res.status(400).json({ message: 'User with this phone number already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            fullName,
            email,
            phone,
            address,
            state,
            pincode,
            password: hashedPassword
        });

        if (user) {
            res.status(201).json({
                message: 'Account created successfully. Please login.',
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                message: 'Logged in successfully',
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    state: user.state,
                    pincode: user.pincode,
                    role: user.role,
                    token: generateToken(user._id, user.role),
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Check if admin exists
// @route   GET /api/auth/admin-status
const getAdminStatus = async (req, res) => {
    try {
        const adminCount = await Admin.countDocuments();
        res.json({ adminExists: adminCount > 0 });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Forgot Password - Request reset link
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !/\S+@\S+\.\S+/.test(email.trim())) {
            return res.status(400).json({ message: 'Please provide a valid registered email address.' });
        }

        const genericMessage = 'If an account exists with this email address, a password reset link has been sent to your email.';

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        // Security best practice: Do not reveal whether user exists to prevent account enumeration
        if (!user) {
            return res.status(200).json({ message: genericMessage });
        }

        // Generate cryptographically secure, random, single-use reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Store SHA-256 hash of reset token in MongoDB
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Reset token valid for 15 minutes
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password/${resetToken}`;

        // Send password reset email via Nodemailer with Gmail SMTP
        const emailResult = await sendPasswordResetEmail({
            email: user.email,
            fullName: user.fullName,
            resetUrl
        });

        // If email dispatch fails, safely invalidate token and return error status
        if (!emailResult.sent) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            let reasonMsg = 'Failed to send password reset email. Please try again later.';
            if (emailResult.code === 'CREDENTIALS_NOT_CONFIGURED') {
                reasonMsg = 'Gmail SMTP credentials are unconfigured or placeholder in backend/.env. Please configure SMTP_USER and a valid 16-character Gmail App Password (SMTP_PASS).';
            } else if (emailResult.code === 'EAUTH') {
                reasonMsg = 'Gmail SMTP authentication failed. Please verify your Gmail address and 16-character Gmail App Password in backend/.env.';
            } else if (emailResult.code === 'ESOCKET' || emailResult.code === 'ETIMEDOUT' || emailResult.code === 'ECONNREFUSED') {
                reasonMsg = `Could not connect to Gmail SMTP server (${emailResult.code}). Please check your internet connection and firewall settings.`;
            } else if (emailResult.error) {
                reasonMsg = `Email delivery failed: ${emailResult.error}`;
            }

            return res.status(500).json({
                message: reasonMsg,
                code: emailResult.code || 'EMAIL_FAILED'
            });
        }

        return res.status(200).json({ message: genericMessage });
    } catch (error) {
        console.error('Error in forgotPassword:', error.message);
        return res.status(500).json({ message: 'Server error processing password reset request.' });
    }
};

// @desc    Verify reset token status
// @route   GET /api/auth/reset-password/:token
const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ valid: false, message: 'Reset token is required.' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                valid: false,
                message: 'This password reset link is invalid or has expired.'
            });
        }

        return res.status(200).json({
            valid: true,
            message: 'Reset token is valid.'
        });
    } catch (error) {
        console.error('Error in verifyResetToken:', error);
        return res.status(500).json({ valid: false, message: 'Server error verifying reset token.' });
    }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password and POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
    try {
        const token = req.params.token || req.body.token;
        const { password, newPassword, confirmPassword } = req.body;
        const targetPassword = newPassword || password;

        if (!token) {
            return res.status(400).json({ message: 'Reset token is missing or invalid.' });
        }

        if (!targetPassword) {
            return res.status(400).json({ message: 'Please provide a new password.' });
        }

        if (targetPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        if (confirmPassword !== undefined && targetPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New password and confirm password do not match.' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Hash the new password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(targetPassword, salt);

        // Atomic update in MongoDB: match token and expiry, update password, and remove reset token
        const updatedUser = await User.findOneAndUpdate(
            {
                resetPasswordToken: hashedToken,
                resetPasswordExpire: { $gt: Date.now() }
            },
            {
                $set: { password: hashedPassword },
                $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 }
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({
                message: 'Password reset link is invalid, expired, or has already been used.'
            });
        }

        return res.status(200).json({
            message: 'Password reset successful! You can now log in with your new password.'
        });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(500).json({ message: 'Server error while resetting password.' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAdminStatus,
    forgotPassword,
    verifyResetToken,
    resetPassword
};
