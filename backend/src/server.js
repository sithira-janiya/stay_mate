import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from 'http';
import { Server } from 'socket.io';
import Test from "./models/Test.js";
import connectDB from "./config/db.js";

// Import routes
import roomRoutes from './routes/roomRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import rentRoutes from "./routes/rentRoutes.js";
import utilityRoutes from "./routes/utilityRoutes.js";






dotenv.config();

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// --- health check (this is what your browser is hitting) ---
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// Connect to MongoDB
connectDB();

// Make io available to routes
app.set('io', io);

// Use routes
app.use('/api/rooms', roomRoutes);
app.use('/api/properties', propertyRoutes);
app.use("/api/owner/rent", rentRoutes);
app.use("/api/owner/utilities", utilityRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected for real-time room updates');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Browser test route
app.get("/", (req, res) => {
  res.send("<h1>🔥 Its finally working yay! I am going to cry...</h1>");
});

// GET all test data
app.get("/api/test", async (req, res) => {
  try {
    const allTests = await Test.find();
    res.json(allTests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching test data", error: err.message });
  }
});

// POST test data
app.post("/api/test", async (req, res) => {
  try {
    const { name, value } = req.body;
    const newTest = new Test({ name, value });
    await newTest.save();
    res.status(201).json({ message: "Test data saved!", data: newTest });
  } catch (err) {
    res.status(500).json({ message: "Error saving test data", error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 Server running at http://localhost:${PORT}');
});