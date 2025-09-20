// These are "loose" models against existing collections.
// 🔶 Keep collection names aligned with your DB (as shown in your screenshot).
import mongoose from "mongoose";

const Loose = new mongoose.Schema({}, { strict: false });

export const User = mongoose.model("users", Loose, "users");
export const Room = mongoose.model("rooms", Loose, "rooms");
export const Order = mongoose.model("orders", Loose, "orders"); // 🔶 if meals are in `meals`, change to "meals"
export const UtilitySetting = mongoose.model("utilitysettings", Loose, "utilitysettings"); // 🔶 if your team uses a different collection for monthly bills, switch it.
