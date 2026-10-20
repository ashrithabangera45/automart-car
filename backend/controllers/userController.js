const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const User = require('../models/User');

// @desc    Get user dashboard stats and latest order
// @route   GET /api/users/dashboard
// @access  Private
const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch User profile to determine status
        const user = await User.findById(userId);
        let profileStatus = 'Incomplete';
        // Now that the unified login form forces all details to be provided,
        // if the user exists in DB, their profile is Complete.
        if (user && user.fullName && user.phone && user.address) {
            profileStatus = 'Complete';
        }

        // Count Orders
        const totalOrders = await Order.countDocuments({ userId });
        
        // Orders in Progress (not delivered or cancelled)
        const ordersInProgress = await Order.countDocuments({ 
            userId, 
            status: { $nin: ['Delivered', 'Cancelled'] } 
        });

        // Saved Cars
        const savedCars = await Wishlist.countDocuments({ userId });

        // Latest active order
        const latestOrder = await Order.findOne({ userId }).sort({ createdAt: -1 });

        res.json({
            profileStatus,
            totalOrders,
            ordersInProgress,
            savedCars,
            latestOrder
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile contact and delivery address
// @route   PUT /api/users/profile
// @access  Private (JWT protected)
const updateUserProfile = async (req, res) => {
    try {
        const { fullName, email, phone, address, state, pincode } = req.body;
        
        // Find user by verified JWT token identity
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (fullName !== undefined) {
            if (!fullName.trim()) return res.status(400).json({ message: 'Full name cannot be empty' });
            user.fullName = fullName.trim();
        }

        if (email !== undefined) {
            const cleanEmail = email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) {
                return res.status(400).json({ message: 'Please provide a valid email address' });
            }
            if (cleanEmail !== user.email) {
                const existingEmail = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
                if (existingEmail) {
                    return res.status(400).json({ message: 'This email is already registered to another account' });
                }
                user.email = cleanEmail;
            }
        }

        if (phone !== undefined) {
            const cleanPhone = phone.trim();
            const phoneDigits = cleanPhone.replace(/\D/g, '');
            if (phoneDigits.length < 10) {
                return res.status(400).json({ message: 'Please provide a valid phone number with at least 10 digits' });
            }
            if (cleanPhone !== user.phone) {
                const existingPhone = await User.findOne({ phone: cleanPhone, _id: { $ne: user._id } });
                if (existingPhone) {
                    return res.status(400).json({ message: 'This phone number is already registered to another account' });
                }
                user.phone = cleanPhone;
            }
        }

        if (address !== undefined) {
            if (!address.trim()) return res.status(400).json({ message: 'Delivery address cannot be empty' });
            user.address = address.trim();
        }

        if (state !== undefined) {
            if (!state.trim()) return res.status(400).json({ message: 'State cannot be empty' });
            user.state = state.trim();
        }

        if (pincode !== undefined) {
            const cleanPincode = pincode.trim();
            const pinRegex = /^[0-9]{5,6}$/;
            if (!pinRegex.test(cleanPincode)) {
                return res.status(400).json({ message: 'Please provide a valid 5 or 6 digit pincode' });
            }
            user.pincode = cleanPincode;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            state: updatedUser.state,
            pincode: updatedUser.pincode,
            role: updatedUser.role
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

module.exports = { getUserDashboard, getUserProfile, updateUserProfile };
