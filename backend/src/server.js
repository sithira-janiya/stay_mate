import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import connectDB from "./config/db.js";

import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

import ChatMessage from "./models/ChatMessage.js"; // for persistence

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// REST routes
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/chat", chatRoutes);

// http + sockets
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Simple auth-less role join (replace with real auth in your project)
io.on("connection", (socket) => {
  // client should emit: join, { role: "tenant"|"supplier", tenantId? }
  socket.on("join", ({ role, tenantId }) => {
    socket.data.role = role;
    if (role === "tenant" && tenantId) {
      socket.join(`tenant:${tenantId}`);
    } else if (role === "supplier") {
      socket.join("supplier");
    }
  });

  // broadcast announcements to every connected tenant
  socket.on("announcement", (payload) => {
    if (socket.data.role !== "supplier") return;
    io.to("supplier").emit("announcement:mirror", payload); // for supplier UI
    io.emit("announcement:new", payload); // all tenants
  });

  // direct chat message: { toTenantId?, from, role, message }
  socket.on("chat:message", async (msg) => {
    const { toTenantId, from, role, message } = msg;
    const saved = await ChatMessage.create({ toTenantId, from, role, message });
    if (role === "supplier" && toTenantId) {
      io.to(`tenant:${toTenantId}`).emit("chat:message", saved);
      socket.emit("chat:message", saved); // echo to sender
    } else if (role === "tenant") {
      // send to all suppliers online
      io.to("supplier").emit("chat:message", saved);
      socket.emit("chat:message", saved);
    }
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server with sockets on ${PORT}`));
