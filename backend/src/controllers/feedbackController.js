import Feedback from "../models/Feedback.js";

export const addFeedback = async (req, res) => {
  try {
    const { order, supplier, rating, comment, sentiment } = req.body;
    const feedback = await Feedback.create({
      order,
      tenant: req.user._id,
      supplier,
      rating,
      comment,
      sentiment
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getSupplierFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ supplier: req.user._id }).populate("tenant order");
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
