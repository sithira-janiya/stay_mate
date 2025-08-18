import Meal from "../models/Meal.js";

// Supplier creates meal option (part of daily menu)
export const addMeal = async (req, res) => {
  try {
    const meal = await Meal.create(req.body);
    res.status(201).json(meal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMenu = async (req, res) => {
  try {
    const meals = await Meal.find({ available: true }).sort({ type: 1, createdAt: -1 });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Edit single meal option
export const updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(meal);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// Cancel a specific meal option (soft disable)
export const cancelMeal = async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(req.params.id, { available: false }, { new: true });
    res.json(meal);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// Hard delete
export const deleteMeal = async (req, res) => {
  try {
    await Meal.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
