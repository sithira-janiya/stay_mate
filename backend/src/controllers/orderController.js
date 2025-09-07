// backend/src/controllers/orderController.js
import Order from "../models/Order.js";
import Meal from "../models/Meal.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { getAllergyWarnings } from "../utils/allergyCheck.js";

// Create a new order with allergy check
export const createOrder = async (req, res) => {
  try {
    const { meals, specialInstructions } = req.body;
    const tenantId = req.user.id;
    
    // Get tenant with allergies
    const tenant = await User.findById(tenantId);
    
    // Get meal details and calculate total
    let totalAmount = 0;
    const mealDetails = [];
    
    for (const item of meals) {
      const meal = await Meal.findById(item.meal);
      if (!meal) {
        return res.status(404).json({ message: `Meal ${item.meal} not found` });
      }
      
      // Check if ordering past deadline
      if (new Date() > meal.orderDeadline) {
        return res.status(400).json({ 
          message: `Order deadline passed for ${meal.name}` 
        });
      }
      
      totalAmount += meal.price * item.quantity;
      mealDetails.push({
        ...meal.toObject(),
        quantity: item.quantity
      });
    }
    
    // Check for allergies
    const allergyWarnings = getAllergyWarnings(mealDetails, tenant.allergies);
    
    // If there are allergy warnings, return them without creating order
    if (allergyWarnings.length > 0) {
      return res.status(200).json({
        allergyWarnings,
        totalAmount,
        message: 'Allergy warnings detected'
      });
    }
    
    // Create the order if no allergies
    const order = new Order({
      tenant: tenantId,
      meals: meals.map(item => ({
        meal: item.meal,
        quantity: item.quantity,
        priceAtTime: mealDetails.find(m => m._id.toString() === item.meal).price
      })),
      totalAmount,
      specialInstructions
    });
    
    await order.save();
    await order.populate('meals.meal');
    
    // Create notification
    await Notification.create({
      recipient: tenantId,
      title: 'Order Placed',
      message: `Your order #${order.orderNumber} has been placed successfully.`,
      type: 'order_update',
      relatedEntity: order._id,
      entityType: 'Order'
    });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Confirm order despite allergies
export const confirmOrderWithAllergies = async (req, res) => {
  try {
    const { meals, specialInstructions } = req.body;
    const tenantId = req.user.id;
    
    // Get meal details and calculate total
    let totalAmount = 0;
    const mealDetails = [];
    
    for (const item of meals) {
      const meal = await Meal.findById(item.meal);
      if (!meal) {
        return res.status(404).json({ message: `Meal ${item.meal} not found` });
      }
      
      // Check if ordering past deadline
      if (new Date() > meal.orderDeadline) {
        return res.status(400).json({ 
          message: `Order deadline passed for ${meal.name}` 
        });
      }
      
      totalAmount += meal.price * item.quantity;
      mealDetails.push({
        ...meal.toObject(),
        quantity: item.quantity
      });
    }
    
    // Get tenant with allergies
    const tenant = await User.findById(tenantId);
    const allergyWarnings = getAllergyWarnings(mealDetails, tenant.allergies);
    
    // Create the order with allergy acknowledgement
    const order = new Order({
      tenant: tenantId,
      meals: meals.map(item => ({
        meal: item.meal,
        quantity: item.quantity,
        priceAtTime: mealDetails.find(m => m._id.toString() === item.meal).price
      })),
      totalAmount,
      specialInstructions,
      acknowledgedAllergies: allergyWarnings.length > 0,
      allergyWarnings
    });
    
    await order.save();
    await order.populate('meals.meal');
    
    // Create notification
    await Notification.create({
      recipient: tenantId,
      title: 'Order Placed',
      message: `Your order #${order.orderNumber} has been placed successfully.`,
      type: 'order_update',
      relatedEntity: order._id,
      entityType: 'Order'
    });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tenant orders
export const getTenantOrders = async (req, res) => {
  try {
    const orders = await Order.find({ tenant: req.user._id })
      .populate("meals.meal")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("tenant meals.meal");
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Create notification for tenant
    await Notification.create({
      recipient: order.tenant._id,
      title: 'Order Status Updated',
      message: `Your order #${order.orderNumber} is now ${status}.`,
      type: 'order_update',
      relatedEntity: order._id,
      entityType: 'Order'
    });
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get tenant expense analytics
export const getExpenseAnalytics = async (req, res) => {
  try {
    const { range = 'month' } = req.query;
    const tenantId = req.user._id;
    
    let startDate;
    const endDate = new Date();
    
    switch (range) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }
    
    const orders = await Order.find({
      tenant: tenantId,
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' }
    }).populate('meals.meal');
    
    // Calculate analytics
    const analytics = {
      totalSpent: 0,
      byMealType: {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        dessert: 0
      },
      byDate: [],
      orderCount: orders.length
    };
    
    orders.forEach(order => {
      analytics.totalSpent += order.totalAmount;
      
      order.meals.forEach(item => {
        const mealType = item.meal.mealType;
        analytics.byMealType[mealType] += item.priceAtTime * item.quantity;
      });
      
      // Group by date
      const orderDate = order.createdAt.toISOString().split('T')[0];
      const existingDate = analytics.byDate.find(d => d.date === orderDate);
      
      if (existingDate) {
        existingDate.amount += order.totalAmount;
      } else {
        analytics.byDate.push({
          date: orderDate,
          amount: order.totalAmount
        });
      }
    });
    
    // Sort by date
    analytics.byDate.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};