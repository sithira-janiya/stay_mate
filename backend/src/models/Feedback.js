// backend/src/models/Feedback.js
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  sentiment: {
    type: String,
    enum: ["positive", "neutral", "negative"],
    default: "neutral"
  },
  mealType: {
    type: String,
    enum: ["breakfast", "lunch", "dinner", "dessert"],
    required: true
  },
  response: {
    message: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

feedbackSchema.index({ supplier: 1, createdAt: -1 });
feedbackSchema.index({ order: 1 }, { unique: true });

export default mongoose.model("Feedback", feedbackSchema);