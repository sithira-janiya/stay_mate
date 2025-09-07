const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Send overuse alert email to finance department
const sendOveruseAlert = async (tenant, usageDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'finance@staymate.com', // Finance department email
      subject: `🚨 Usage Overuse Alert - ${tenant.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">Usage Overuse Alert</h2>
          <p><strong>Tenant:</strong> ${tenant.name}</p>
          <p><strong>Tenant ID:</strong> ${tenant.tenantId}</p>
          <p><strong>Room:</strong> ${tenant.roomId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <hr>
          <h3 style="color: #e67e22;">Usage Details:</h3>
          <p>${usageDetails}</p>
          <hr>
          <p style="color: #7f8c8d;">This is an automated alert from StayMate Room Access System.</p>
          <p style="color: #7f8c8d;">Please review the tenant's usage and take appropriate action.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Overuse alert email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending overuse alert email:', error);
    throw error;
  }
};

// Send absent alert email to finance department
const sendAbsentAlert = async (tenant) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'finance@staymate.com', // Finance department email
      subject: `⚠ Absent Tenant Alert - ${tenant.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f39c12;">Absent Tenant Alert</h2>
          <p><strong>Tenant:</strong> ${tenant.name}</p>
          <p><strong>Tenant ID:</strong> ${tenant.tenantId}</p>
          <p><strong>Room:</strong> ${tenant.roomId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <hr>
          <p style="color: #e74c3c;">The tenant did not check in by 10:00 AM and has been marked as absent.</p>
          <hr>
          <p style="color: #7f8c8d;">This is an automated alert from StayMate Room Access System.</p>
          <p style="color: #7f8c8d;">Please review the tenant's attendance record.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Absent alert email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending absent alert email:', error);
    throw error;
  }
};

// Send monthly usage report
const sendMonthlyReport = async (tenant, monthlyUsage) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'finance@staymate.com',
      subject: `📊 Monthly Usage Report - ${tenant.name} - ${monthlyUsage.month}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Monthly Usage Report</h2>
          <p><strong>Tenant:</strong> ${tenant.name}</p>
          <p><strong>Tenant ID:</strong> ${tenant.tenantId}</p>
          <p><strong>Month:</strong> ${monthlyUsage.month}</p>
          <hr>
          <h3 style="color: #27ae60;">Usage Summary:</h3>
          <p><strong>Total Minutes:</strong> ${monthlyUsage.totalMinutes} (${(monthlyUsage.totalMinutes / 60).toFixed(1)} hours)</p>
          <p><strong>Present Days:</strong> ${monthlyUsage.presentDays}</p>
          <p><strong>Absent Days:</strong> ${monthlyUsage.absentDays}</p>
          <p><strong>Overuse Minutes:</strong> ${monthlyUsage.overuseMinutes} (${(monthlyUsage.overuseMinutes / 60).toFixed(1)} hours)</p>
          <p><strong>Overuse Days:</strong> ${monthlyUsage.overuseDays}</p>
          <hr>
          <p style="color: #7f8c8d;">This is an automated monthly report from StayMate Room Access System.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Monthly report email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending monthly report email:', error);
    throw error;
  }
};

// Send tenant notification (for check-in/check-out confirmation)
const sendTenantNotification = async (tenant, action, time) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: tenant.email,
      subject: `✅ ${action} Confirmation - StayMate`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #27ae60;">${action} Successful</h2>
          <p>Hello ${tenant.name},</p>
          <p>Your ${action.toLowerCase()} has been successfully recorded.</p>
          <p><strong>Time:</strong> ${time.toLocaleString()}</p>
          <p><strong>Tenant ID:</strong> ${tenant.tenantId}</p>
          <hr>
          <p style="color: #7f8c8d;">If you did not perform this action, please contact support immediately.</p>
          <p style="color: #7f8c8d;">Thank you for using StayMate Room Access System.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Tenant notification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending tenant notification email:', error);
    throw error;
  }
};

module.exports = {
  sendOveruseAlert,
  sendAbsentAlert,
  sendMonthlyReport,
  sendTenantNotification
};
