import express from "express";
import { getTenantThread } from "../controllers/chatController.js";
const router = express.Router();

router.get("/tenant/:tenantId", getTenantThread);

export default router;
