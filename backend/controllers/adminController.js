const Admin = require('../models/Admin');
const User = require('../models/User');
const Car = require('../models/Car');
const Order = require('../models/Order');
const SupportTicket = require('../models/SupportTicket');
const ServiceRequest = require('../models/ServiceRequest');
const ContactMessage = require('../models/Contact');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === 'admin@gmail.com' && password === 'admin123') {
            res.json({
                _id: '000000000000000000000000',
                email: 'admin@gmail.com',
                role: 'admin',
                token: generateToken('000000000000000000000000', 'admin'),
            });
        } else {
            res.status(401).json({ message: 'Invalid admin credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
    try {
        const totalCars = await Car.countDocuments();
        const totalUsers = await User.countDocuments();
        const carsSold = await Order.countDocuments({ orderStatus: 'Delivered' });
        const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
        const deliveries = await Order.countDocuments({ orderStatus: 'Out for Delivery' });
        const availableCars = await Car.countDocuments({ availability: true });
        const contactMessagesCount = await ContactMessage.countDocuments();
        const newContactMessagesCount = await ContactMessage.countDocuments({ status: 'New' });
        
        const recentOrders = await Order.find().populate('userId', 'fullName name').sort({ createdAt: -1 }).limit(5);
        const registeredUsers = await User.find().sort({ createdAt: -1 }).limit(5);
        const availableCarsList = await Car.find({ availability: true }).sort({ createdAt: -1 }).limit(5);
        const recentContactMessages = await ContactMessage.find().sort({ createdAt: -1 }).limit(5);

        // Calculate cars bought per user in the list
        const usersWithCarsBought = await Promise.all(registeredUsers.map(async (user) => {
            const bought = await Order.countDocuments({ userId: user._id });
            return { ...user._doc, carsBought: bought };
        }));

        res.json({
            stats: {
                totalCars,
                totalUsers,
                carsSold,
                pendingOrders,
                deliveries,
                availableCars,
                contactMessages: contactMessagesCount,
                newContactMessages: newContactMessagesCount
            },
            recentOrders,
            registeredUsers: usersWithCarsBought,
            availableCarsList,
            recentContactMessages
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};



// @desc    Get all registered users
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        const usersWithCarsBought = await Promise.all(users.map(async (user) => {
            const bought = await Order.countDocuments({ userId: user._id });
            return { ...user._doc, carsBought: bought };
        }));
        res.json(usersWithCarsBought);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all user issues (support tickets, service requests, and contact messages)
// @route   GET /api/admin/issues
const getUserIssues = async (req, res) => {
    try {
        const tickets = await SupportTicket.find().populate('userId', 'fullName email phone').sort({ createdAt: -1 });
        const serviceRequests = await ServiceRequest.find().populate('userId', 'fullName email phone').populate('carId', 'name brand').sort({ createdAt: -1 });
        const contactMessages = await ContactMessage.find().sort({ createdAt: -1 });
        
        res.json({ tickets, serviceRequests, contactMessages });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update status of an issue (service request or ticket)
// @route   PUT /api/admin/issues/:type/:id
const updateIssueStatus = async (req, res) => {
    try {
        const { type, id } = req.params;
        const { status } = req.body;
        
        let updatedDoc;
        if (type === 'service') {
            updatedDoc = await ServiceRequest.findByIdAndUpdate(id, { status }, { new: true });
        } else if (type === 'ticket') {
            updatedDoc = await SupportTicket.findByIdAndUpdate(id, { status }, { new: true });
        } else if (type === 'contact') {
            updatedDoc = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true });
        } else {
            return res.status(400).json({ message: 'Invalid issue type' });
        }
        
        res.json(updatedDoc);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { loginAdmin, getDashboardStats, getAllUsers, getUserIssues, updateIssueStatus };
