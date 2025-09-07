const AccessLog = require("../models/AccessLog");
const FinanceAlert = require("../models/FinanceAlert");

const MAX_HOURS = 8; // Overuse limit

// ✅ Check-In
exports.checkIn = async (req, res) => {
  try {
    const { tenantId, roomId } = req.body;
    const today = new Date().toISOString().split("T")[0];

    // Prevent duplicate check-in
    const existing = await AccessLog.findOne({ tenantId, day: today, checkOutTime: null });
    if (existing) return res.status(400).json({ message: "Already checked in!" });

    const newLog = await AccessLog.create({
      tenantId,
      roomId,
      day: today,
      checkInTime: new Date()
    });

    res.json(newLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Check-Out
exports.checkOut = async (req, res) => {
  try {
    const { tenantId } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const log = await AccessLog.findOne({ tenantId, day: today, checkOutTime: null });
    if (!log) return res.status(400).json({ message: "No active check-in found!" });

    log.checkOutTime = new Date();
    const duration = Math.floor((log.checkOutTime - log.checkInTime) / (1000 * 60));
    log.durationMinutes = duration;

    if (duration > MAX_HOURS * 60) {
      log.status = "Overused";
      log.overuse = true;

      await FinanceAlert.create({
        tenantId,
        date: today,
        reason: "Overuse",
        details: `Used ${duration} minutes, over limit`
      });
    } else {
      log.status = "Present";
    }

    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Fetch Logs
exports.getLogs = async (req, res) => {
  try {
    const logs = await AccessLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};