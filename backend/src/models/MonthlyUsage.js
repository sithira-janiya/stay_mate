const mongoose = require('mongoose');

const monthlyUsageSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    ref: 'Tenant'
  },
  month: {
    type: String,
    required: true
  },
  totalMinutes: {
    type: Number,
    default: 0
  },
  overuseMinutes: {
    type: Number,
    default: 0
  },
  overuseDays: {
    type: Number,
    default: 0
  },
  presentDays: {
    type: Number,
    default: 0
  },
  absentDays: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MonthlyUsage', monthlyUsageSchema);