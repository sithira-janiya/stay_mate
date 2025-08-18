import express from "express";
import { addMeal, getMenu } from "../controllers/menuController.js";

const router = express.Router();

router.post("/", addMeal);  // Supplier adds meal
router.get("/", getMenu);   // Tenant fetches menu

export default router;
