//server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import Test from "./models/Test.js";
import connectDB from "./config/db.js";

// routes
import roomRoutes from "./routes/roomRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import rentRoutes from "./Finance/routes/rentRoutes.js";
import utilityRoutes from "./Finance/routes/utilityRoutes.js";
import mealRoutes from "./Finance/routes/mealRoutes.js";
import financeReportRoutes from "./Finance/routes/financeReportRoutes.js";


dotenv.config();

const app = express();

// --- HTTP + Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // vite default
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  },
});

// middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());

// health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// db
connectDB();

// make io available to routes if you need it
app.set("io", io);

// route mounts
app.use("/api/rooms", roomRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/owner/rent", rentRoutes);
app.use("/api/meal", mealRoutes);
app.use("/api/finance-reports", financeReportRoutes);


// 👇 **changed to plural and no /owner** to match your frontend
app.use("/api/utilities", utilityRoutes);

// socket.io
io.on("connection", (socket) => {
  console.log("Client connected for real-time updates");
  socket.on("disconnect", () => console.log("Client disconnected"));
});

// simple root page
app.get("/", (_req, res) => {
  res.send("<h1>🔥 Backend is up!</h1>");
});

// demo test routes
app.get("/api/test", async (_req, res) => {
  try {
    const all = await Test.find();
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Error fetching test data", error: err.message });
  }
});

app.post("/api/test", async (req, res) => {
  try {
    const { name, value } = req.body;
    const doc = await new Test({ name, value }).save();
    res.status(201).json({ message: "Saved", data: doc });
  } catch (err) {
    res.status(500).json({ message: "Error saving test data", error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
// 👇 start the *httpServer* so Socket.IO works too
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
