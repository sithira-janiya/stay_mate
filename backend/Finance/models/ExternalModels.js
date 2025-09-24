// backend/Finance/models/ExternalModels.js
const mongoose = require("mongoose");

// Loose schema to read existing collections without strict schemas
const Loose = new mongoose.Schema({}, { strict: false });

// ⚠️ Keep collection names EXACTLY as your DB uses them.
const User            = mongoose.model("users", Loose, "users");
const Room            = mongoose.model("rooms", Loose, "rooms");
const Order           = mongoose.model("orders", Loose, "orders");
// If your monthly utility totals live elsewhere, change the collection name:
const UtilitySetting  = mongoose.model("utilitysettings", Loose, "utilitysettings");

module.exports = { User, Room, Order, UtilitySetting };