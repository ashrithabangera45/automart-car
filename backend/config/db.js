const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('MongoDB URI source:', process.env.MONGODB_URI ? (process.env.MONGODB_URI.startsWith('mongodb+srv://') ? 'Atlas cloud URI' : 'Non-Atlas URI') : 'MONGODB_URI is missing');
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
