const mongoose = require('mongoose');

const dailyAttendanceSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    ref: 'Tenant'
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    required: true
  },
  firstCheckInLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccessLog',
    default: null
  },
  autoMarked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DailyAttendance', dailyAttendanceSchema);