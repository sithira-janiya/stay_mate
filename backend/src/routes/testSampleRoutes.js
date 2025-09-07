import express from "express";
import TestSample from "../models/TestSample.js";

const router = express.Router();

// Insert a test record
router.post("/", async (req, res) => {
  try {
    const testData = new TestSample(req.body);
    await testData.save();
    res.status(201).json(testData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all test records
router.get("/", async (req, res) => {
  try {
    const data = await TestSample.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
