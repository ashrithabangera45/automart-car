const express = require('express');
const router = express.Router();
const {
    getValuationBrands,
    getValuationModels,
    calculateValuationEstimate,
    submitValuationLead
} = require('../controllers/valuationController');

// Public endpoints (no login required)
router.get('/brands', getValuationBrands);
router.get('/models', getValuationModels);
router.post('/estimate', calculateValuationEstimate);
router.post('/lead', submitValuationLead);

module.exports = router;
