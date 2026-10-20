const Wishlist = require('../models/Wishlist');

const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.find({ userId: req.user.id }).populate('carId');
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const { carId } = req.body;
        const exists = await Wishlist.findOne({ userId: req.user.id, carId });
        if (exists) return res.status(400).json({ message: 'Car already in wishlist' });

        const wishlistItem = await Wishlist.create({ userId: req.user.id, carId });
        res.status(201).json(wishlistItem);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        await Wishlist.findOneAndDelete({ userId: req.user.id, carId: req.params.id });
        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
