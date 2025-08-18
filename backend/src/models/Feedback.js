import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  sentiment: { type: String, enum: ["positive", "neutral", "negative"], default: "neutral" }
}, { timestamps: true });

export default mongoose.model("Feedback", feedbackSchema);
