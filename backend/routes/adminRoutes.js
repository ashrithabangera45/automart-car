const express = require('express');
const router = express.Router();
const { loginAdmin, getDashboardStats, getAllUsers, getUserIssues, updateIssueStatus } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getAllUsers);
router.get('/issues', protect, admin, getUserIssues);
router.put('/issues/:type/:id', protect, admin, updateIssueStatus);

module.exports = router;
