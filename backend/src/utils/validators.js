import mongoose from "mongoose";

// Check if YYYY-MM format is valid
export function isValidMonth(s) {
  return /^\d{4}-\d{2}$/.test(s);
}

// Ensure ObjectId or return null
export function ensureObjectId(v) {
  try {
    return new mongoose.Types.ObjectId(v);
  } catch {
    return null;
  }
}
