import Joi from "joi";

export const registerSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nic: Joi.string().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  role: Joi.string().valid("tenant", "supplier", "admin", "manager"),
  allergies: Joi.array().items(Joi.string()),
  dietaryPreference: Joi.string().valid("vegetarian", "non-vegetarian", "vegan")
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const mealSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid("breakfast", "lunch", "dinner", "dessert").required(),
  isVegetarian: Joi.boolean(),
  ingredients: Joi.array().items(Joi.string()).min(1).required(),
  price: Joi.number().min(0).required(),
});

export const orderSchema = Joi.object({
  meals: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  deliveryAddress: Joi.string().required()
});
