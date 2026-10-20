const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const Car = require('../models/Car');
const User = require('../models/User');

// Helper to calculate statistics for a given match filter
const calculateFeedbackStats = async (filter) => {
    const allApproved = await Feedback.find(filter).select('rating');
    const totalReviews = allApproved.length;
    
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    allApproved.forEach(item => {
        const r = Math.round(item.rating);
        if (ratingDistribution[r] !== undefined) {
            ratingDistribution[r] += 1;
        }
        sum += item.rating;
    });

    const averageRating = totalReviews > 0 ? Math.round((sum / totalReviews) * 10) / 10 : 0;

    return {
        totalReviews,
        averageRating,
        ratingDistribution
    };
};

// @desc    Get approved feedback for a particular car
// @route   GET /api/feedback/car/:carId
// @access  Public
const getCarFeedback = async (req, res) => {
    try {
        const { carId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(carId)) {
            return res.status(400).json({ success: false, message: 'Invalid Car ID' });
        }

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 6);
        const skip = (page - 1) * limit;

        const filter = { carId, status: 'Approved' };

        // 1. Calculate stats (total, average, distribution)
        const stats = await calculateFeedbackStats(filter);

        // 2. Fetch paginated reviews (newest first)
        const reviews = await Feedback.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-userEmail'); // Don't expose emails publicly

        const totalPages = Math.ceil(stats.totalReviews / limit) || 1;

        res.status(200).json({
            success: true,
            totalReviews: stats.totalReviews,
            averageRating: stats.averageRating,
            ratingDistribution: stats.ratingDistribution,
            page,
            totalPages,
            hasMore: page < totalPages,
            reviews
        });
    } catch (error) {
        console.error('Error in getCarFeedback:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching car feedback' });
    }
};

// @desc    Get approved general website feedback
// @route   GET /api/feedback
// @access  Public
const getGeneralFeedback = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 6);
        const skip = (page - 1) * limit;

        const filter = { carId: null, status: 'Approved' };

        // 1. Calculate stats
        const stats = await calculateFeedbackStats(filter);

        // 2. Fetch paginated reviews (newest first)
        const reviews = await Feedback.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-userEmail');

        const totalPages = Math.ceil(stats.totalReviews / limit) || 1;

        res.status(200).json({
            success: true,
            totalReviews: stats.totalReviews,
            averageRating: stats.averageRating,
            ratingDistribution: stats.ratingDistribution,
            page,
            totalPages,
            hasMore: page < totalPages,
            reviews
        });
    } catch (error) {
        console.error('Error in getGeneralFeedback:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching general feedback' });
    }
};

// @desc    Get the current authenticated user's review for a car or general website
// @route   GET /api/feedback/my-review
// @access  Private
const getMyReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const carId = req.query.carId;

        let queryCarId = null;
        if (carId && carId !== 'null' && carId !== 'undefined') {
            if (!mongoose.Types.ObjectId.isValid(carId)) {
                return res.status(400).json({ success: false, message: 'Invalid Car ID' });
            }
            queryCarId = carId;
        }

        const review = await Feedback.findOne({ userId, carId: queryCarId });

        if (!review) {
            return res.status(200).json({ success: true, hasReviewed: false, review: null });
        }

        res.status(200).json({
            success: true,
            hasReviewed: true,
            review
        });
    } catch (error) {
        console.error('Error in getMyReview:', error);
        res.status(500).json({ success: false, message: 'Server error while checking user review' });
    }
};

// @desc    Submit feedback (Car review or General website feedback)
// @route   POST /api/feedback
// @access  Private (JWT required)
const submitFeedback = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rating, title, comment, carId } = req.body;

        // 1. Validate authenticated user from DB
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found. Please log in again.' });
        }

        // 2. Validate rating (must be an integer 1 - 5)
        const numRating = Number(rating);
        if (!rating || isNaN(numRating) || numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Rating is required and must be an integer between 1 and 5 stars.' 
            });
        }

        // 3. Validate comment
        if (!comment || typeof comment !== 'string' || !comment.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Feedback comment is required.' 
            });
        }

        const cleanComment = comment.trim();
        if (cleanComment.length < 3) {
            return res.status(400).json({ 
                success: false, 
                message: 'Feedback comment must be at least 3 characters long.' 
            });
        }

        // 4. Validate optional carId
        let validCarId = null;
        if (carId && carId !== 'null' && carId !== 'undefined') {
            if (!mongoose.Types.ObjectId.isValid(carId)) {
                return res.status(400).json({ success: false, message: 'Invalid Car ID format.' });
            }
            const car = await Car.findById(carId);
            if (!car) {
                return res.status(404).json({ success: false, message: 'Vehicle not found.' });
            }
            validCarId = car._id;
        }

        const cleanTitle = (title && typeof title === 'string') ? title.trim() : '';

        // 5. Check if user already reviewed this item (one review per user per car/general)
        // If existing, update it cleanly; otherwise create a new one.
        const existingReview = await Feedback.findOne({ userId, carId: validCarId });

        if (existingReview) {
            existingReview.rating = numRating;
            existingReview.title = cleanTitle;
            existingReview.comment = cleanComment;
            existingReview.userName = user.fullName;
            existingReview.userEmail = user.email;
            existingReview.status = 'Approved';
            await existingReview.save();

            return res.status(200).json({
                success: true,
                message: 'Your review has been updated successfully!',
                review: existingReview,
                isUpdate: true
            });
        }

        // 6. Create new feedback entry
        const newFeedback = await Feedback.create({
            userId: user._id,
            userName: user.fullName,
            userEmail: user.email,
            carId: validCarId,
            rating: numRating,
            title: cleanTitle,
            comment: cleanComment,
            status: 'Approved'
        });

        return res.status(201).json({
            success: true,
            message: 'Thank you for your feedback! Your review has been submitted successfully.',
            review: newFeedback,
            isUpdate: false
        });
    } catch (error) {
        console.error('Error in submitFeedback:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while submitting feedback. Please try again.' 
        });
    }
};

// @desc    Delete a review
// @route   DELETE /api/feedback/:id
// @access  Private (Owner or Admin)
const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid feedback ID' });
        }

        const feedback = await Feedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Verify ownership or admin privileges
        if (feedback.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
        }

        await Feedback.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteFeedback:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting review' });
    }
};

// @desc    Get all feedback for Admin moderation
// @route   GET /api/feedback/admin/all
// @access  Private (Admin only)
const getAllFeedbackAdmin = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.type === 'car') {
            filter.carId = { $ne: null };
        } else if (req.query.type === 'general') {
            filter.carId = null;
        }

        const total = await Feedback.countDocuments(filter);
        const reviews = await Feedback.find(filter)
            .populate('carId', 'brand name model modelYear')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
            reviews
        });
    } catch (error) {
        console.error('Error in getAllFeedbackAdmin:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update feedback status (Approve/Reject)
// @route   PATCH /api/feedback/admin/:id/status
// @access  Private (Admin only)
const updateFeedbackStatusAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }

        const review = await Feedback.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        res.status(200).json({
            success: true,
            message: `Review status updated to ${status}`,
            review
        });
    } catch (error) {
        console.error('Error in updateFeedbackStatusAdmin:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getCarFeedback,
    getGeneralFeedback,
    getMyReview,
    submitFeedback,
    deleteFeedback,
    getAllFeedbackAdmin,
    updateFeedbackStatusAdmin
};
