// backend/src/controllers/analyticsController.js
import Order from "../models/Order.js";
import Feedback from "../models/Feedback.js";
import Meal from "../models/Meal.js";

// Get supplier analytics
export const getSupplierAnalytics = async (req, res) => {
  try {
    const supplierId = req.user._id;
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    // Get orders for this supplier
    const orders = await Order.find({
      ...dateFilter,
      status: { $ne: 'cancelled' }
    }).populate('meals.meal');
    
    // Filter orders that contain meals from this supplier
    const supplierOrders = orders.filter(order => 
      order.meals.some(item => item.meal.supplier.toString() === supplierId.toString())
    );
    
    // Get feedback for this supplier
    const feedbacks = await Feedback.find({
      supplier: supplierId,
      ...dateFilter
    }).populate('tenant order');
    
    // Get meals for this supplier
    const meals = await Meal.find({
      supplier: supplierId,
      ...(dateFilter.createdAt && { date: dateFilter.createdAt })
    });
    
    // Calculate analytics
    const totalRevenue = supplierOrders.reduce((sum, order) => {
      const supplierMeals = order.meals.filter(item => 
        item.meal.supplier.toString() === supplierId.toString()
      );
      return sum + supplierMeals.reduce((mealSum, item) => 
        mealSum + (item.priceAtTime * item.quantity), 0
      );
    }, 0);
    
    const bestSellingMeals = {};
    const mealTypeRevenue = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      dessert: 0
    };
    
    supplierOrders.forEach(order => {
      order.meals.forEach(item => {
        if (item.meal.supplier.toString() === supplierId.toString()) {
          const mealName = item.meal.name;
          bestSellingMeals[mealName] = (bestSellingMeals[mealName] || 0) + item.quantity;
          
          const mealType = item.meal.mealType;
          mealTypeRevenue[mealType] += item.priceAtTime * item.quantity;
        }
      });
    });
    
    // Calculate ratings
    const ratingSummary = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
      average: feedbacks.length > 0 ? 
        (feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length) : 0
    };
    
    feedbacks.forEach(fb => {
      ratingSummary[fb.rating]++;
    });
    
    // Sentiment analysis
    const sentimentSummary = {
      positive: feedbacks.filter(fb => fb.sentiment === 'positive').length,
      neutral: feedbacks.filter(fb => fb.sentiment === 'neutral').length,
      negative: feedbacks.filter(fb => fb.sentiment === 'negative').length
    };
    
    res.json({
      totalOrders: supplierOrders.length,
      totalRevenue,
      bestSellingMeals: Object.entries(bestSellingMeals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      mealTypeRevenue,
      feedbackCount: feedbacks.length,
      ratingSummary,
      sentimentSummary,
      totalMeals: meals.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get monthly income for supplier
export const getMonthlyIncome = async (req, res) => {
  try {
    const supplierId = req.user._id;
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();
    
    const orders = await Order.find({
      status: { $ne: 'cancelled' },
      createdAt: {
        $gte: new Date(`${targetYear}-01-01`),
        $lte: new Date(`${targetYear}-12-31`)
      }
    }).populate('meals.meal');
    
    // Filter orders and group by month
    const monthlyIncome = Array(12).fill(0);
    const monthlyMealTypeIncome = Array(12).fill({
      breakfast: 0, lunch: 0, dinner: 0, dessert: 0
    });
    
    orders.forEach(order => {
      const month = order.createdAt.getMonth();
      
      order.meals.forEach(item => {
        if (item.meal.supplier.toString() === supplierId.toString()) {
          const amount = item.priceAtTime * item.quantity;
          monthlyIncome[month] += amount;
          
          const mealType = item.meal.mealType;
          monthlyMealTypeIncome[month] = {
            ...monthlyMealTypeIncome[month],
            [mealType]: monthlyMealTypeIncome[month][mealType] + amount
          };
        }
      });
    });
    
    res.json({
      year: targetYear,
      monthlyIncome,
      monthlyMealTypeIncome
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};