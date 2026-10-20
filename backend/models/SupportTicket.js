const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String }, // Optional
    category: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open' 
    }
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
