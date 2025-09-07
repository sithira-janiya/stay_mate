import express from "express";
import { addMeal, getDailyMenu, updateMeal, deleteMeal } from "../controllers/mealController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { mealSchema } from "../utils/validation.js";

const router = express.Router();

router.get("/", getDailyMenu);
router.post("/", authenticate, authorize("supplier"), validateRequest(mealSchema), addMeal);
router.put("/:id", authenticate, authorize("supplier"), updateMeal);
router.delete("/:id", authenticate, authorize("supplier"), deleteMeal);

export default router;
