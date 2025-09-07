import Announcement from "../models/Announcement.js";

export const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().populate("createdBy", "fullName role");
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
