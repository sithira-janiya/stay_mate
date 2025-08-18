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

// GET /api/orders/tenant/:tenantId
export const getOrdersByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const orders = await Order.find({ tenant: tenantId })
      .populate("meals")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /api/orders/tenant/:tenantId/expenses
export const getTenantExpenseBreakdown = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const orders = await Order.find({ tenant: tenantId }).populate("meals");
    const totals = { breakfast: 0, lunch: 0, dinner: 0, dessert: 0, overall: 0 };

    orders.forEach(o => {
      o.meals.forEach(m => {
        totals[m.type] += m.price;
        totals.overall += m.price;
      });
    });

    res.json(totals);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};