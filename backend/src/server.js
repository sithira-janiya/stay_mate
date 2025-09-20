import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Connect to MongoDB Atlas with better error handling
const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log(
      "Connection string:",
      process.env.MONGO_URI ? "Exists" : "Missing"
    );

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Atlas connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("Please check:");
    console.log("1. Your IP is whitelisted in MongoDB Atlas");
    console.log("2. Your connection string is correct in .env file");
    console.log("3. Your MongoDB Atlas cluster is running");
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Basic health check endpoint
app.get("/api/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.json({
    message: "Server is running",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
