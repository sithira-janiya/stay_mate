import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import mealRoutes from "./routes/mealRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

import ChatMessage from "./models/ChatMessage.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/expenses", expenseRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Socket.IO
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("chatMessage", async (msg) => {
    const chat = new ChatMessage({
      from: msg.from,
      fromRole: msg.fromRole,
      to: msg.to,
      message: msg.message,
    });
    await chat.save();
    io.emit("chatMessage", chat);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
