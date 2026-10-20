const express = require('express');
const router = express.Router();
const {
    getCarFeedback,
    getGeneralFeedback,
    getMyReview,
    submitFeedback,
    deleteFeedback,
    getAllFeedbackAdmin,
    updateFeedbackStatusAdmin
} = require('../controllers/feedbackController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getGeneralFeedback);
router.get('/car/:carId', getCarFeedback);

// User authenticated routes
router.get('/my-review', protect, getMyReview);
router.post('/', protect, submitFeedback);
router.delete('/:id', protect, deleteFeedback);

// Admin moderation routes
router.get('/admin/all', protect, admin, getAllFeedbackAdmin);
router.patch('/admin/:id/status', protect, admin, updateFeedbackStatusAdmin);

module.exports = router;
