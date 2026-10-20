const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
    carName: { type: String },
    serviceType: { type: String, required: true },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true },
    description: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Requested', 'Accepted', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Requested' 
    }
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
