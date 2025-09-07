// backend/src/models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  meals: [{
    meal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    priceAtTime: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["processing", "preparing", "out-for-delivery", "delivered", "cancelled"],
    default: "processing"
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  deliveryTime: Date,
  specialInstructions: String,
  acknowledgedAllergies: {
    type: Boolean,
    default: false
  },
  allergyWarnings: [{
    meal: String,
    ingredients: String
  }],
  feedbackGiven: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre("save", async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD${(count + 1).toString().padStart(6, "0")}`;
  }
  next();
});

// Update status history when status changes
orderSchema.pre("save", function(next) {
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      notes: `Status changed to ${this.status}`
    });
  }
  next();
});

export default mongoose.model("Order", orderSchema);