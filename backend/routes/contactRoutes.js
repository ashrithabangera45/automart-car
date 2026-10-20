const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/Contact');
const { sendContactNotificationEmail } = require('../utils/emailService');

// POST /api/contact
// Create a new contact message: saves to Admin Dashboard (MongoDB) and sends email to Admin + Visitor
router.post('/', async (req, res) => {
    try {
        const { fullName, email, phone, subject, message } = req.body;
        
        // 1. Backend validation of all required fields
        if (
            !fullName || !fullName.trim() ||
            !email || !email.trim() ||
            !phone || !phone.trim() ||
            !subject || !subject.trim() ||
            !message || !message.trim()
        ) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields (Full Name, Email, Phone Number, Subject, Message) are required.' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid email address.' 
            });
        }

        // 2. Always save message in MongoDB for the Admin
        // This ensures the Admin immediately receives the inquiry on the website dashboard (/admin/messages)
        const newMessage = await ContactMessage.create({
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            subject: subject.trim(),
            message: message.trim(),
            status: 'New'
        });

        console.log(`[CONTACT ROUTE] New inquiry saved for Admin in MongoDB (ID: ${newMessage._id}) from ${newMessage.fullName}`);

        // 3. Dispatch emails to BOTH: Admin (ashrithabangera45@gmail.com) and Visitor (newMessage.email)
        const emailResult = await sendContactNotificationEmail(newMessage);

        // 4. Respond with success
        return res.status(200).json({ 
            success: true,
            message: 'Your message has been sent successfully!', 
            data: newMessage,
            emailDispatched: emailResult.sent
        });
    } catch (error) {
        console.error('[CONTACT ROUTE] Server Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while processing your request. Please try again.',
            error: error.message 
        });
    }
});

// GET /api/contact
// Fetch all contact messages for admin dashboard
router.get('/', async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        console.error('Fetch contact messages error:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// PUT /api/contact/:id/status
// Update status of a contact message (e.g. 'New', 'Read', 'Replied')
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await ContactMessage.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.json(updated);
    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({ message: 'Failed to update message status' });
    }
});

// DELETE /api/contact/:id
// Delete a contact message
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete contact message error:', error);
        res.status(500).json({ message: 'Failed to delete message' });
    }
});

module.exports = router;
