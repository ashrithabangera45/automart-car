const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    carId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Car' },
    price: { type: Number, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
