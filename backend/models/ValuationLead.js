const mongoose = require('mongoose');

const valuationLeadSchema = new mongoose.Schema({
    registrationNumber: { type: String, trim: true, uppercase: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    variant: { type: String },
    manufacturingYear: { type: Number },
    kmDriven: { type: Number },
    fuelType: { type: String },
    transmission: { type: String },
    condition: { type: String },
    city: { type: String },
    state: { type: String },
    estimatedMinPrice: { type: Number },
    estimatedMaxPrice: { type: Number },
    fairMarketPrice: { type: Number },
    sellerName: { type: String, required: true },
    sellerPhone: { type: String, required: true },
    sellerEmail: { type: String },
    preferredDate: { type: String },
    preferredTime: { type: String },
    address: { type: String },
    status: { 
        type: String, 
        enum: ['Pending', 'Inspection Scheduled', 'Offer Made', 'Completed', 'Cancelled'], 
        default: 'Pending' 
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    notes: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('ValuationLead', valuationLeadSchema);
