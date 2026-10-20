const Order = require('../models/Order');
const Car = require('../models/Car');
const User = require('../models/User');

// User: Place an order
const placeOrder = async (req, res) => {
    try {
        const { 
            carId, 
            paymentMethod, 
            paymentStatus,
            customerName,
            customerEmail,
            customerPhone,
            deliveryAddress,
            state,
            pincode,
            saveToProfile 
        } = req.body;
        const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
        
        // Securely fetch user and car
        const user = await User.findById(req.user.id);
        const car = await Car.findById(carId);

        if (!user || !car) {
            return res.status(404).json({ message: 'User or Car not found' });
        }

        if (car.stock <= 0) {
            return res.status(400).json({ message: 'This car is currently out of stock.' });
        }

        // Validate and sanitize customer and delivery details
        const finalName = (customerName !== undefined ? customerName : user.fullName || '').trim();
        const finalEmail = (customerEmail !== undefined ? customerEmail : user.email || '').trim().toLowerCase();
        const finalPhone = (customerPhone !== undefined ? customerPhone : user.phone || '').trim();
        const finalAddress = (deliveryAddress !== undefined ? deliveryAddress : user.address || '').trim();
        const finalState = (state !== undefined ? state : user.state || '').trim();
        const finalPincode = (pincode !== undefined ? pincode : user.pincode || '').trim();

        if (!finalName || !finalEmail || !finalPhone || !finalAddress || !finalState || !finalPincode) {
            return res.status(400).json({ 
                message: 'All delivery details (Full Name, Email, Phone Number, Delivery Address, State, Pincode) are required.' 
            });
        }

        const phoneDigits = finalPhone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            return res.status(400).json({ message: 'Please provide a valid phone number with at least 10 digits' });
        }

        const pinRegex = /^[0-9]{5,6}$/;
        if (!pinRegex.test(finalPincode)) {
            return res.status(400).json({ message: 'Please provide a valid 5 or 6 digit pincode' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(finalEmail)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        // Optionally update user's profile in MongoDB if "Save to my profile" was chosen
        if (saveToProfile) {
            user.fullName = finalName;
            if (finalEmail && finalEmail !== user.email) {
                const existingEmail = await User.findOne({ email: finalEmail, _id: { $ne: user._id } });
                if (existingEmail) {
                    return res.status(400).json({ message: 'This email is already registered to another account' });
                }
                user.email = finalEmail;
            }
            if (finalPhone && finalPhone !== user.phone) {
                const existingPhone = await User.findOne({ phone: finalPhone, _id: { $ne: user._id } });
                if (existingPhone) {
                    return res.status(400).json({ message: 'This phone number is already registered to another account' });
                }
                user.phone = finalPhone;
            } else {
                user.phone = finalPhone;
            }
            user.address = finalAddress;
            user.state = finalState;
            user.pincode = finalPincode;
            await user.save();
            console.log(`[ORDER] Updated user profile for ${user._id} during checkout`);
        }

        const carPrice = car.price;
        const discount = car.discount || 0;
        const priceAfterDiscount = carPrice - discount;
        const tax = priceAfterDiscount * 0.1; // 10% tax
        const totalAmount = priceAfterDiscount + tax;

        // Expected delivery in 7 days
        const expectedDelivery = new Date();
        expectedDelivery.setDate(expectedDelivery.getDate() + 7);

        // Save snapshot of final customer details with order
        const order = await Order.create({
            orderId,
            userId: user._id,
            carId: car._id,
            customerName: finalName,
            customerEmail: finalEmail,
            customerPhone: finalPhone,
            deliveryAddress: finalAddress,
            state: finalState,
            pincode: finalPincode,
            carName: `${car.brand} ${car.name} ${car.variant || ''}`.trim(),
            carPrice,
            discount,
            tax,
            totalAmount,
            paymentMethod,
            paymentStatus: paymentStatus || (paymentMethod === 'Offline' || paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Failed'),
            orderStatus: paymentStatus === 'Paid' ? 'Confirmed' : 'Pending',
            expectedDelivery
        });

        // Decrement stock
        car.stock -= 1;
        await car.save();

        res.status(201).json(order);
    } catch (error) {
        console.error('Order placement failed:', error);
        res.status(500).json({ message: error.message || 'Server Error', error });
    }
};

// User: Get own orders
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).populate('carId').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'fullName email phone address state pincode')
            .populate('carId')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('getAllOrders error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled'];
        const validPaymentStatuses = ['Pending', 'Paid', 'Failed'];

        const newStatus = req.body.status || req.body.orderStatus;
        if (newStatus) {
            if (!validStatuses.includes(newStatus)) {
                return res.status(400).json({ message: `Invalid order status. Allowed: ${validStatuses.join(', ')}` });
            }
            order.orderStatus = newStatus;
        }

        if (req.body.paymentStatus) {
            if (!validPaymentStatuses.includes(req.body.paymentStatus)) {
                return res.status(400).json({ message: `Invalid payment status. Allowed: ${validPaymentStatuses.join(', ')}` });
            }
            order.paymentStatus = req.body.paymentStatus;
        }

        await order.save();

        const updated = await Order.findById(order._id)
            .populate('userId', 'fullName email phone address state pincode')
            .populate('carId');

        res.json(updated);
    } catch (error) {
        console.error('updateOrderStatus error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { placeOrder, getMyOrders, getAllOrders, updateOrderStatus };
