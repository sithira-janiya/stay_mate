console.log("App file loaded");

import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";

// init express
const app = express();

// connect DB
connectDB();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.get("/", (req, res) => {
  res.send("HOME ROUTE TEST :)... 🚀");
});

app.get("/hello", (req, res) => {
  res.json({ message: "Hi ROUTE TEST 👋" });
});

export default app;
