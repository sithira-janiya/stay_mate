import Order from "../models/Order.js";
import Feedback from "../models/Feedback.js";

export const getAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([{ $group: { _id: null, revenue: { $sum: "$totalCost" } } }]);
    const feedbackStats = await Feedback.aggregate([{ $group: { _id: "$sentiment", count: { $sum: 1 } } }]);

    res.json({ totalOrders, totalRevenue, feedbackStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
