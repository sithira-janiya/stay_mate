const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    ref: 'Tenant'
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Room'
  },
  day: {
    type: String,
    required: true
  },
  checkInTime: {
    type: Date,
    required: true
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  durationMinutes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Overused'],
    default: 'Present'
  },
  overuse: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AccessLog', accessLogSchema);