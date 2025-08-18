// orderRoutes.js
import express from "express";
import { placeOrder, updateOrderStatus, getOrdersByTenant, getTenantExpenseBreakdown } from "../controllers/orderController.js";
const router = express.Router();

router.post("/", placeOrder);
router.put("/:id", updateOrderStatus);
router.get("/tenant/:tenantId", getOrdersByTenant);
router.get("/tenant/:tenantId/expenses", getTenantExpenseBreakdown);

export default router;
