// backend/Server.js

const express = require('express');
const connectDB = require('./config/db'); // Import the database connection
const dotenv = require('dotenv');
const cors = require('cors');

// Import routes
const propertyRoutes = require('./Room/Routes/PropertyRoutes');
const roomRoutes = require('./Room/Routes/RoomRoutes');
const attendanceRoutes = require('./Tenant/Routes/AttendanceRoutes');
const orderRoutes = require('./Tenant/Routes/OrderRoutes');
const mealRoutes = require('./Tenant/Routes/MealRoutes');
const UserRoutes = require('./User/routes/UserRoutes'); 
// ❌ Removed duplicate "FiRoutes" (it was a duplicate import of UserRoutes)

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to the database
connectDB();

// ✅ CORS configuration (allow any localhost port)
app.use(cors({
 
  origin: 'http://localhost:5173',  // 👈 your frontend URL

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- Health / root ---
app.get('/', (_req, res) => res.send('Hello from the backend!'));
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

// --- Mount routes ---
app.use('/api/properties', propertyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-requests', require('./Room/Routes/RoomRequestRoutes'));
app.use('/api/attendance', attendanceRoutes);
app.use('/api/utility-settings', require('./Tenant/Routes/UtilitySettingsRoutes'));
app.use('/api/feedback', require('./Tenant/Routes/FeedbackRoutes'));
app.use('/api/orders', orderRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/notifications', require('./Supplier/Routes/NotificationRoutes'));
app.use('/api/users', UserRoutes);

// --- Finance routes ---
const rentRoutes           = require('./Finance/routes/rentRoutes');
const utilityRoutes        = require('./Finance/routes/utilityRoutes');
const financeReportRoutes  = require('./Finance/routes/financeReportRoutes');
const mealPaymentRoutes    = require('./Finance/routes/mealPaymentRoutes');

app.use('/api/owner/rent',        rentRoutes);
app.use('/api/utilities',         utilityRoutes);
app.use('/api/finance-reports',   financeReportRoutes);
app.use('/api/meal-payments',     mealPaymentRoutes);

// --- Start server ---
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
