// 🔶 COLLECTION NAME: 'counters'  (align with team if different)
import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // e.g. 'invoice', 'payment'
    seq: { type: Number, default: 0 },
    prefix: { type: String, default: "" }, // e.g. 'INV', 'PMT'
    pad: { type: Number, default: 3 },     // width for zero-padding
  },
  { collection: "counters" }
);

export default mongoose.model("Counter", CounterSchema);
