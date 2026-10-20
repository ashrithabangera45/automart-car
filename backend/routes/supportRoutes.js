const express = require('express');
const router = express.Router();
const { 
    createServiceRequest, 
    getMyServiceRequests, 
    createSupportTicket, 
    getMySupportTickets, 
    getWarrantyAndInsurance 
} = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/service-requests', protect, createServiceRequest);
router.get('/service-requests', protect, getMyServiceRequests);

router.post('/tickets', protect, createSupportTicket);
router.get('/tickets', protect, getMySupportTickets);

router.get('/warranty-insurance', protect, getWarrantyAndInsurance);

module.exports = router;
