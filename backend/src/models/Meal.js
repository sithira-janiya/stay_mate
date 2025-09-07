// backend/src/models/Meal.js
import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  ingredients: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ["veg", "non-veg"],
    required: true
  },
  mealType: {
    type: String,
    enum: ["breakfast", "lunch", "dinner", "dessert"],
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  orderDeadline: {
    type: Date,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  isSpecial: {
    type: Boolean,
    default: false
  },
  specialOffer: {
    discount: {
      type: Number,
      default: 0
    },
    validUntil: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
mealSchema.index({ date: 1, mealType: 1 });
mealSchema.index({ supplier: 1, date: 1 });

export default mongoose.model("Meal", mealSchema);