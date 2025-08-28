import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      nic,
      phone,
      address,
      role,
      gender,
      age,
      smoking,
      alcoholic,
      cleanlinessLevel,
      noiseTolerance,
      sleepingHabit,
      socialBehavior,
      preferredRoomType,
      preferredEnvironment,
      foodAllergies,
      medicalConditions,
    } = req.body;

    // check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      nic,
      phone,
      address,
      role,
      gender,
      age,
      smoking,
      alcoholic,
      cleanlinessLevel,
      noiseTolerance,
      sleepingHabit,
      socialBehavior,
      preferredRoomType,
      preferredEnvironment,
      foodAllergies,
      medicalConditions,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      "mysecretkey123", // 🔑 replace with process.env.JWT_SECRET later
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
