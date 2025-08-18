import express from "express";
import { createAnnouncement, listAnnouncements } from "../controllers/announcementController.js";
const router = express.Router();

router.post("/", createAnnouncement);
router.get("/", listAnnouncements);

export default router;
