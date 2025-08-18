import Order from "../models/Order.js";
import Meal from "../models/Meal.js";

// Tenant places order
export const placeOrder = async (req, res) => {
  try {
    const { tenantId, mealIds } = req.body;
    const meals = await Meal.find({ _id: { $in: mealIds } });
    const totalCost = meals.reduce((sum, meal) => sum + meal.price, 0);

    const order = await Order.create({ tenant: tenantId, meals: mealIds, totalCost });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supplier updates order status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
