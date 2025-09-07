import express from "express";
import { createOrder, getTenantOrders, updateOrderStatus } from "../controllers/orderController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { orderSchema } from "../utils/validation.js";

const router = express.Router();

router.post("/", authenticate, authorize("tenant"), validateRequest(orderSchema), createOrder);
router.get("/", authenticate, authorize("tenant"), getTenantOrders);
router.patch("/:id/status", authenticate, authorize("supplier"), updateOrderStatus);

export default router;
