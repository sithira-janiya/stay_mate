import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["breakfast", "lunch", "dinner", "dessert"], required: true },
  vegetarian: { type: Boolean, default: false },
  allergens: [{ type: String }],
  price: { type: Number, required: true },
  available: { type: Boolean, default: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }
}, { timestamps: true });

export default mongoose.model("Meal", mealSchema);
