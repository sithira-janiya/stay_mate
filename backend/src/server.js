const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const cronJobs = require('./utils/cronJobs'); // Make sure this file exists

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/access', require('./routes/access'));
// Add other routes as needed

// Start cron jobs
cronJobs.startAll();

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'StayMate Backend API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// ✅ Correct app.listen
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
