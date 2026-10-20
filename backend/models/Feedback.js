const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    userEmail: {
        type: String,
        trim: true
    },
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        default: null
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        trim: true,
        default: ''
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Approved'
    }
}, {
    timestamps: true
});

// Compound indexes for optimal query performance
feedbackSchema.index({ carId: 1, status: 1, createdAt: -1 });
feedbackSchema.index({ userId: 1, carId: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
