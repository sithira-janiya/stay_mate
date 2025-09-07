import { Router } from "express";
import { loginTenant, checkIn, checkOut, processQR, getLogs } from "../controllers/tenantController.js";

const router = Router();

router.post("/login", loginTenant);
router.post("/checkin", checkIn);
router.post("/checkout", checkOut);
router.post("/process-qr", processQR);
router.get("/logs", getLogs);

export default router;