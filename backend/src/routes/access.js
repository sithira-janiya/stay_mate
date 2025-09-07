const express = require('express');
const { protect } = require('../middleware/auth');
const AccessLog = require('../models/AccessLog');
const DailyAttendance = require('../models/DailyAttendance');
const FinanceAlert = require('../models/FinanceAlert');
const { validateQRCode } = require('../middleware/validation');

const router = express.Router();

// Check-in with QR validation
router.post('/checkin', protect, validateQRCode, async (req, res) => {
  try {
    const tenant = req.tenant;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Check if already checked in today
    const existingLog = await AccessLog.findOne({
      tenantId: tenant.tenantId,
      day: today,
      checkOutTime: null
    });

    if (existingLog) {
      return res.status(400).json({ 
        success: false,
        message: 'Already checked in today' 
      });
    }

    // Check if it's before 10:00 AM for late check-in
    const isLate = now.getHours() >= 10 && now.getMinutes() > 0;
    const status = isLate ? 'Late' : 'Present';

    // Create access log
    const accessLog = await AccessLog.create({
      tenantId: tenant.tenantId,
      roomId: tenant.roomId,
      property: tenant.property,
      day: today,
      checkInTime: now,
      status: status
    });

    // Update or create daily attendance
    await DailyAttendance.findOneAndUpdate(
      { tenantId: tenant.tenantId, date: today },
      {
        status: status,
        firstCheckInLogId: accessLog._id,
        autoMarked: false,
        isLate: isLate
      },
      { upsert: true, new: true }
    );

    // Update tenant status
    tenant.status = 'Present';
    await tenant.save();

    res.json({
      success: true,
      message: 'Checked in successfully',
      data: accessLog,
      isLate: isLate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Check-out
router.post('/checkout', protect, async (req, res) => {
  try {
    const tenant = req.tenant;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Find today's check-in log
    const accessLog = await AccessLog.findOne({
      tenantId: tenant.tenantId,
      day: today,
      checkOutTime: null
    });

    if (!accessLog) {
      return res.status(400).json({ 
        success: false,
        message: 'No active check-in found for today' 
      });
    }

    // Calculate duration
    const durationMinutes = Math.floor((now - accessLog.checkInTime) / (1000 * 60));
    
    // Check for overuse (more than 8 hours)
    const overuse = durationMinutes > 480; // 8 hours = 480 minutes
    const overuseMinutes = overuse ? durationMinutes - 480 : 0;
    
    // Update access log
    accessLog.checkOutTime = now;
    accessLog.durationMinutes = durationMinutes;
    accessLog.overuse = overuse;
    accessLog.overuseMinutes = overuseMinutes;
    
    if (overuse) {
      accessLog.status = 'Overused';
    }
    
    await accessLog.save();

    // Update tenant status
    tenant.status = 'Absent';
    await tenant.save();

    // Create finance alert if overused
    if (overuse) {
      const overuseHours = (overuseMinutes / 60).toFixed(1);
      await FinanceAlert.create({
        tenantId: tenant.tenantId,
        property: tenant.property,
        date: today,
        reason: 'Overuse',
        details: `${(durationMinutes / 60).toFixed(1)}h used, over by ${overuseHours}h`,
        overuseMinutes: overuseMinutes
      });
    }

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: accessLog,
      overuse: overuse,
      overuseMinutes: overuseMinutes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// QR code check-in (for suppliers/admins)
router.post('/qr-checkin', async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    // Parse QR data
    const qrInfo = JSON.parse(qrData);
    const { tenantId, property } = qrInfo;

    // Find tenant
    const tenant = await Tenant.findOne({ tenantId, property });
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found or invalid QR code'
      });
    }

    // Simulate check-in
    req.tenant = tenant;
    return await exports.checkin(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Invalid QR code or server error'
    });
  }
});

// Get access history with property filtering
router.get('/history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, property } = req.query;
    const skip = (page - 1) * limit;

    let query = { tenantId: req.tenant.tenantId };
    if (property && property !== 'all') {
      query.property = property;
    }

    const accessLogs = await AccessLog.find(query)
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('roomId', 'roomNo');

    const total = await AccessLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        accessLogs,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLogs: total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;
