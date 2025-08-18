// orderRoutes.js
import express from "express";
import { placeOrder, updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", placeOrder);            // Tenant creates order
router.patch("/:id/status", updateOrderStatus);  // Supplier updates status

export default router;