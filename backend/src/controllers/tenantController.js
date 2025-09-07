import Tenant from "../models/Tenant.js";
import AccessLog from "../models/AccessLog.js";

/* ----------------------------------------------------
   Helper function: format duration between check-in/out
---------------------------------------------------- */
const formatDuration = (ms) => {
  const h = Math.floor(ms / (1000 * 60 * 60));    // hours
  const m = Math.floor((ms / (1000 * 60)) % 60); // minutes
  return `${h}h ${m}m`; // use backticks for template literal
};

/* ----------------------------------------------------
   Tenant Login
---------------------------------------------------- */
export const loginTenant = async (req, res) => {
  try {
    const { email, password } = req.body;

    const tenant = await Tenant.findOne({ email, password });
    if (!tenant) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: tenant._id,
      tenantId: tenant.tenantId,
      name: tenant.name,
      email: tenant.email,
      status: tenant.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ----------------------------------------------------
   Check-In
---------------------------------------------------- */
export const checkIn = async (req, res) => {
  try {
    const { tenantId } = req.body;

    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // prevent multiple check-ins without checkout
    const openLog = await AccessLog.findOne({ tenantId, checkOutTime: null });
    if (openLog) {
      return res.status(400).json({ message: "Already checked in" });
    }

    tenant.status = "Present";
    await tenant.save();

    const log = await AccessLog.create({
      tenantId,
      checkInTime: new Date(),
      status: "Present",
    });

    res.json({ message: "Checked In", log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ----------------------------------------------------
   Check-Out
---------------------------------------------------- */
export const checkOut = async (req, res) => {
  try {
    const { tenantId } = req.body;

    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const log = await AccessLog.findOne({ tenantId, checkOutTime: null }).sort({
      checkInTime: -1,
    });
    if (!log) {
      return res.status(404).json({ message: "No active session" });
    }

    log.checkOutTime = new Date();
    const ms = log.checkOutTime - log.checkInTime;

    log.duration = formatDuration(ms);
    log.status = ms >= 8 * 60 * 60 * 1000 ? "Overused" : "Absent"; // alert if > 8 hrs
    await log.save();

    tenant.status = "Absent";
    await tenant.save();

    res.json({ message: "Checked Out", log });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ----------------------------------------------------
   QR / Tenant ID Simulation (auto toggle in/out)
---------------------------------------------------- */
export const processQR = async (req, res) => {
  try {
    const { tenantId } = req.body;

    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const openLog = await AccessLog.findOne({ tenantId, checkOutTime: null });
    if (openLog) {
      return await checkOut(req, res); // already inside → checkout
    } else {
      return await checkIn(req, res);  // not inside → checkin
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ----------------------------------------------------
   Get All Logs
---------------------------------------------------- */
export const getLogs = async (_req, res) => {
  try {
    const logs = await AccessLog.find().sort({ checkInTime: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};