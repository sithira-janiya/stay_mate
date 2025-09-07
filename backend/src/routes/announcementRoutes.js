import express from "express";
import { createAnnouncement, getAnnouncements } from "../controllers/announcementController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, authorize("supplier", "admin"), createAnnouncement);
router.get("/", getAnnouncements);

export default router;


