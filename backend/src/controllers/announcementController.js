import Announcement from "../models/Announcement.js";

export const createAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.create(req.body);
    res.status(201).json(ann);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const listAnnouncements = async (req, res) => {
  try {
    const items = await Announcement.find().sort({ createdAt: -1 }).limit(50);
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
