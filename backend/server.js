require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/valuation', require('./routes/valuationRoutes'));
const { verifySMTP } = require('./utils/emailService');

// Connect to MongoDB and then start the server
connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        // Safe SMTP verification check on startup without crashing the server
        verifySMTP().catch((err) => {
            console.error('[SMTP STARTUP NOTICE] SMTP verification could not run:', err.message);
        });
    });
});
// AutoMart Server active - Gmail SMTP configured

