// backend/Finance/models/Counter.js
const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema(
  {
    _id:    { type: String, required: true }, // e.g. 'invoice', 'payment'
    seq:    { type: Number, default: 0 },
    prefix: { type: String, default: "" },    // e.g. 'INV'
    pad:    { type: Number, default: 3 },     // zero-padding
  },
  { collection: "counters" }
);

module.exports = mongoose.model("Counter", CounterSchema);