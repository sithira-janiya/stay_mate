import mongoose from "mongoose";

const financeReportSchema = new mongoose.Schema(
  {
    reportCode: { type: String }, // optional (you can wire to your codeHelper later)
    type: {
      type: String,
      enum: ["rent", "utilities", "meals", "summary"],
      required: true,
    },
    month: { type: String, match: /^\d{4}-\d{2}$/ }, // "YYYY-MM"
    totals: {
      rent: { type: Number, default: 0 },
      utilities: { type: Number, default: 0 },
      meals: { type: Number, default: 0 },
      grand: { type: Number, default: 0 },
    },
    // who created it (optional)
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // store a compact snapshot (counts, sums) – safe to render in UI
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    // your UI uses `generatedAt`, so include it explicitly
    generatedAt: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("FinanceReport", financeReportSchema);
