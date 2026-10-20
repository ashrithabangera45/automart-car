const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'New' }
}, {
    timestamps: true
});

module.exports = mongoose.model('ContactMessage', contactSchema);
