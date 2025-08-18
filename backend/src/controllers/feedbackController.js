import Feedback from "../models/Feedback.js";

export const addFeedback = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const sentiment = rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative";
    const feedback = await Feedback.create({ order: orderId, rating, comment, sentiment });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
