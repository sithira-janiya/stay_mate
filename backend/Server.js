// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// --- Core app setup
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// --- DB
connectDB();

// --- Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- Health / root
app.get('/', (_req, res) => res.send('Hello from the backend!'));
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

// --- Existing teammates’ routes
const propertyRoutes = require('./Room/Routes/PropertyRoutes');
const roomRoutes = require('./Room/Routes/RoomRoutes');
const attendanceRoutes = require('./Tenant/Routes/AttendanceRoutes');
const orderRoutes = require('./Tenant/Routes/OrderRoutes');
const mealRoutes = require('./Tenant/Routes/MealRoutes');

app.use('/api/properties', propertyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-requests', require('./Room/Routes/RoomRequestRoutes'));
app.use('/api/attendance', attendanceRoutes);
app.use('/api/utility-settings', require('./Tenant/Routes/UtilitySettingsRoutes'));
app.use('/api/feedback', require('./Tenant/Routes/FeedbackRoutes'));
app.use('/api/orders', orderRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/notifications', require('./Supplier/Routes/NotificationRoutes'));

// --- Finance routes ---
const rentRoutes           = require('./Finance/routes/rentRoutes');
const utilityRoutes        = require('./Finance/routes/utilityRoutes');
const financeReportRoutes  = require('./Finance/routes/financeReportRoutes');
const mealPaymentRoutes    = require('./Finance/routes/mealPaymentRoutes');

// NOTE: these prefixes match your frontend services
app.use('/api/owner/rent',        rentRoutes);          // /api/owner/rent/invoices, /generate, /payments, /receipt
app.use('/api/utilities',         utilityRoutes);       // /api/utilities/bills, /payments, etc.
app.use('/api/finance-reports',   financeReportRoutes); // /api/finance-reports/, /generate, /:id
app.use('/api/meal-payments',     mealPaymentRoutes);   // /api/meal-payments/invoices, /payments


app.use(/^\/api\/.*/, (_req, res) => {
  res.status(404).json({ message: 'Not Found' });
});


// --- Start
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
