const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    role: { type: String, default: 'user' },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
