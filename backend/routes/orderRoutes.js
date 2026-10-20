const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, placeOrder)
    .get(protect, admin, getAllOrders); // Admin route to get all
router.get('/myorders', protect, getMyOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
