const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    city: String,
    state: String,
    address: String
}, { _id: false });

const dealerSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String
}, { _id: false });

const inspectionSchema = new mongoose.Schema({
    accidentHistory: String,
    odometerStatus: String,
    waterDamage: String,
    engineCondition: String,
    tyreCondition: String,
    overallStatus: String,
    notes: String
}, { _id: false });

const warrantySchema = new mongoose.Schema({
    available: Boolean,
    period: String,
    startDate: Date,
    endDate: Date,
    description: String
}, { _id: false });

const insuranceSchema = new mongoose.Schema({
    available: Boolean,
    provider: String,
    policyNumber: String,
    startDate: Date,
    expiryDate: Date
}, { _id: false });

const carSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String },
    variant: { type: String },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    condition: { type: String, enum: ['New', 'Used'], default: 'New' },
    modelYear: { type: Number, min: 1900, max: new Date().getFullYear() + 1 },
    registrationYear: { type: Number, min: 1900, max: new Date().getFullYear() + 1 },
    fuelType: { type: String },
    transmission: { type: String },
    mileage: { type: String },
    engineCapacity: { type: String },
    seatingCapacity: { type: Number },
    colour: { type: String },
    bodyType: { type: String },
    kmDriven: { type: Number },
    owners: { type: Number },
    registrationNumber: { type: String },
    registrationState: { type: String },
    manufacturingYear: { type: Number },
    manufacturingMonth: { type: String },
    spareKey: { type: Boolean },
    serviceHistory: { type: Boolean },
    location: locationSchema,
    dealer: dealerSchema,
    images: [String],
    features: [String],
    specifications: { type: Map, of: String },
    reasonsToBuy: [String],
    description: { type: String },
    inspection: inspectionSchema,
    warranty: warrantySchema,
    insurance: insuranceSchema,
    videoUrl: { type: String, default: '' },
    model3d: { type: String, default: '' },
    stock: { type: Number, default: 1, required: true },
    availability: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Car', carSchema);
