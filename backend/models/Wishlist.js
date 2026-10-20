const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    carId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Car' }
}, {
    timestamps: true
});

wishlistSchema.index({ userId: 1, carId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
