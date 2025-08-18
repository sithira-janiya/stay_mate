import express from "express";
import { addMeal, getMenu, updateMeal, cancelMeal, deleteMeal } from "../controllers/menuController.js";
const router = express.Router();

router.post("/", addMeal);
router.get("/", getMenu);
router.put("/:id", updateMeal);
router.patch("/:id/cancel", cancelMeal);
router.delete("/:id", deleteMeal);

export default router;
