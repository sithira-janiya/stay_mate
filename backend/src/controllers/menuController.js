import Meal from "../models/Meal.js";

// Supplier uploads menu
export const addMeal = async (req, res) => {
  try {
    const meal = await Meal.create(req.body);
    res.status(201).json(meal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Tenants view daily menu
export const getMenu = async (req, res) => {
  try {
    const meals = await Meal.find({ available: true });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
