const mongoose = require("mongoose");

// ✅ Check if YYYY-MM format is valid
function isValidMonth(s) {
  return /^\d{4}-\d{2}$/.test(s);
}

// ✅ Ensure ObjectId or return null
function ensureObjectId(v) {
  try {
    return new mongoose.Types.ObjectId(v);
  } catch {
    return null;
  }
}

module.exports = { isValidMonth, ensureObjectId };
