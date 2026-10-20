const mongoose = require('mongoose');
const ServiceRequest = require('../models/ServiceRequest');
const SupportTicket = require('../models/SupportTicket');
const Order = require('../models/Order');

// @desc    Create a new service request
// @route   POST /api/support/service-requests
// @access  Private
const createServiceRequest = async (req, res) => {
    try {
        let { carId, carName, serviceType, preferredDate, preferredTime, description } = req.body;
        
        // Handle object or string carId
        if (carId && typeof carId === 'object' && carId._id) {
            carId = carId._id;
        }

        let validCarId = null;
        if (carId && mongoose.Types.ObjectId.isValid(carId)) {
            validCarId = carId;
        }

        const serviceRequest = await ServiceRequest.create({
            userId: req.user.id,
            carId: validCarId,
            carName: carName || 'Vehicle',
            serviceType,
            preferredDate,
            preferredTime,
            description
        });
        
        res.status(201).json(serviceRequest);
    } catch (error) {
        console.error('Service request error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get logged in user's service requests
// @route   GET /api/support/service-requests
// @access  Private
const getMyServiceRequests = async (req, res) => {
    try {
        const requests = await ServiceRequest.find({ userId: req.user.id })
            .populate('carId', 'name brand')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new support ticket
// @route   POST /api/support/tickets
// @access  Private
const createSupportTicket = async (req, res) => {
    try {
        const { orderId, category, subject, description } = req.body;
        
        const ticket = await SupportTicket.create({
            userId: req.user.id,
            orderId,
            category,
            subject,
            description
        });
        
        res.status(201).json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get logged in user's support tickets
// @route   GET /api/support/tickets
// @access  Private
const getMySupportTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user's warranty and insurance details (Mocked for existing orders)
// @route   GET /api/support/warranty-insurance
// @access  Private
const getWarrantyAndInsurance = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).populate('carId');
        
        // Generate mock warranty and insurance data based on orders
        const data = orders.map(order => {
            const startDate = new Date(order.bookingDate);
            const warrantyExpiry = new Date(startDate);
            warrantyExpiry.setFullYear(startDate.getFullYear() + 3); // 3 year warranty
            
            const insuranceExpiry = new Date(startDate);
            insuranceExpiry.setFullYear(startDate.getFullYear() + 1); // 1 year insurance
            
            return {
                orderId: order.orderId,
                carName: order.carDetails.name || 'Your Car',
                warranty: {
                    period: '3 Years / 100,000 km',
                    startDate: startDate,
                    expiryDate: warrantyExpiry,
                    coveredItems: ['Engine', 'Transmission', 'Drive Axles'],
                    notCoveredItems: ['Brake pads', 'Tires', 'Wiper blades']
                },
                insurance: {
                    provider: 'DriveSafe Insurance Ltd',
                    policyNumber: 'POL' + order.orderId,
                    startDate: startDate,
                    expiryDate: insuranceExpiry,
                    status: insuranceExpiry > new Date() ? 'Active' : 'Expired'
                }
            };
        });
        
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createServiceRequest,
    getMyServiceRequests,
    createSupportTicket,
    getMySupportTickets,
    getWarrantyAndInsurance
};
