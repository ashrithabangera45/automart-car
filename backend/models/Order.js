const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    carName: { type: String, required: true },
    carPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Online', 'Offline', 'Cash on Delivery'], required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    orderStatus: { type: String, enum: ['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled'], default: 'Pending' },
    bookingDate: { type: Date, default: Date.now },
    expectedDelivery: { type: Date }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
