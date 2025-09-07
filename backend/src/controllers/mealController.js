// backend/src/controllers/mealController.js
import Meal from "../models/Meal.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// Add a new meal
export const addMeal = async (req, res) => {
  try {
    const meal = await Meal.create({ ...req.body, supplier: req.user._id });
    
    // Notify all tenants about new menu
    const tenants = await User.find({ role: 'tenant', isActive: true });
    
    for (const tenant of tenants) {
      await Notification.create({
        recipient: tenant._id,
        title: 'New Menu Available',
        message: `New ${meal.mealType} menu has been added for ${new Date(meal.date).toLocaleDateString()}.`,
        type: 'menu_update',
        relatedEntity: meal._id,
        entityType: 'Meal'
      });
    }
    
    res.status(201).json(meal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get daily menu
export const getDailyMenu = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    
    // Set time to start of day
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const meals = await Meal.find({
      date: { $gte: queryDate, $lt: nextDay },
      available: true,
      orderDeadline: { $gt: new Date() }
    }).populate("supplier", "fullName");
    
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a meal
export const updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, supplier: req.user._id },
      req.body,
      { new: true }
    );
    
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    
    res.json(meal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a meal
export const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, supplier: req.user._id });
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    
    res.json({ message: "Meal deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get supplier meals
export const getSupplierMeals = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { supplier: req.user._id };
    
    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    const meals = await Meal.find(query).sort({ date: -1, mealType: 1 });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};