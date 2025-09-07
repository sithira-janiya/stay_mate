const express = require('express');
const jwt = require('jsonwebtoken');
const Tenant = require('../models/Tenant');
const Room = require('../models/Room');
const { protect } = require('../middleware/auth');
const { validateRegistration } = require('../middleware/validation');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register tenant with validation
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { tenantId, name, email, password, roomId, property } = req.body;

    // Check if room exists and has capacity
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(400).json({ 
        success: false,
        message: 'Room not found' 
      });
    }

    if (room.currentOccupancy >= room.capacity) {
      return res.status(400).json({ 
        success: false,
        message: 'Room is at full capacity' 
      });
    }

    if (room.property !== property) {
      return res.status(400).json({ 
        success: false,
        message: 'Room does not belong to the specified property' 
      });
    }

    const tenantExists = await Tenant.findOne({ 
      $or: [{ email }, { tenantId }] 
    });
    
    if (tenantExists) {
      return res.status(400).json({ 
        success: false,
        message: 'Tenant with this email or ID already exists' 
      });
    }

    const tenant = await Tenant.create({
      tenantId,
      name,
      email,
      password,
      roomId,
      property
    });

    // Update room occupancy
    await room.updateOccupancy();

    res.status(201).json({
      success: true,
      data: {
        _id: tenant._id,
        tenantId: tenant.tenantId,
        name: tenant.name,
        email: tenant.email,
        roomId: tenant.roomId,
        property: tenant.property,
        qrCode: tenant.qrCode,
        token: generateToken(tenant._id)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Login tenant
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const tenant = await Tenant.findOne({ email }).populate('roomId');
    if (tenant && (await tenant.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: tenant._id,
          tenantId: tenant.tenantId,
          name: tenant.name,
          email: tenant.email,
          roomId: tenant.roomId,
          roomNo: tenant.roomId.roomNo,
          property: tenant.property,
          status: tenant.status,
          qrCode: tenant.qrCode,
          token: generateToken(tenant._id)
        }
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Get current tenant
router.get('/me', protect, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.tenant._id).populate('roomId');
    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;