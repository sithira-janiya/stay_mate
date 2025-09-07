// src/utils/cronJobs.js
const cron = require('node-cron');
const DailyAttendance = require('../models/DailyAttendance');
const Tenant = require('../models/Tenant');
const FinanceAlert = require('../models/FinanceAlert');

// =====================
// Auto-mark absent at 10:00 AM daily
// =====================
const autoMarkAbsent = cron.schedule('0 10 * * *', async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Find tenants who are still marked as "Present"
    const tenants = await Tenant.find({ status: 'Present' });

    for (const tenant of tenants) {
      // Check if they already checked in for today
      const attendance = await DailyAttendance.findOne({
        tenantId: tenant.tenantId,
        date: today,
      });

      if (!attendance || attendance.status !== 'Present') {
        // Mark them as absent
        await DailyAttendance.findOneAndUpdate(
          { tenantId: tenant.tenantId, date: today },
          { status: 'Absent', autoMarked: true },
          { upsert: true, new: true }
        );

        tenant.status = 'Absent';
        await tenant.save();

        // Create finance alert
        await FinanceAlert.create({
          tenantId: tenant.tenantId,
          date: today,
          reason: 'NoCheckInBy10AM',
          details: 'Tenant did not check in by 10:00 AM',
        });
      }
    }

    console.log('✅ Auto-mark absent completed at', new Date());
  } catch (error) {
    console.error('❌ Error in autoMarkAbsent:', error);
  }
});

// =====================
// Calculate monthly usage (last day of month at midnight)
// =====================
const calculateMonthlyUsage = cron.schedule('0 0 28-31 * *', async () => {
  try {
    const currentDate = new Date();
    if (currentDate.getDate() < 28) return; // only last days of the month

    const month = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;

    // TODO: Add your calculation logic here
    console.log('📊 Monthly usage calculation triggered for', month);
  } catch (error) {
    console.error('❌ Error in calculateMonthlyUsage:', error);
  }
});

// =====================
// Export job controls
// =====================
module.exports = {
  startAll: () => {
    autoMarkAbsent.start();
    calculateMonthlyUsage.start();
    console.log('🚀 All cron jobs started');
  },
  stopAll: () => {
    autoMarkAbsent.stop();
    calculateMonthlyUsage.stop();
    console.log('🛑 All cron jobs stopped');
  },
};
