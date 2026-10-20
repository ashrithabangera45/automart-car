const Cart = require('../models/Cart');
const Car = require('../models/Car');

const getCart = async (req, res) => {
    try {
        const cart = await Cart.find({ userId: req.user.id }).populate('carId');
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const addToCart = async (req, res) => {
    try {
        const { carId, price } = req.body;
        
        const car = await Car.findById(carId);
        if (!car) return res.status(404).json({ message: 'Car not found' });
        if (car.stock <= 0) return res.status(400).json({ message: 'This car is currently out of stock.' });

        const exists = await Cart.findOne({ userId: req.user.id, carId });
        if (exists) return res.status(400).json({ message: 'Car already in cart' });

        const cartItem = await Cart.create({ userId: req.user.id, carId, price });
        res.status(201).json(cartItem);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        await Cart.findByIdAndDelete(req.params.id);
        res.json({ message: 'Removed from cart' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const clearCart = async (req, res) => {
    try {
        await Cart.deleteMany({ userId: req.user.id });
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };
