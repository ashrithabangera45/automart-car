const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getAdminStatus,
    forgotPassword,
    verifyResetToken,
    resetPassword
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/admin-status', getAdminStatus);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', verifyResetToken);
router.post('/reset-password/:token', resetPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

