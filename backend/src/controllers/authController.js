import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      nic,
      phone,
      address,
      role,
      occupation,
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
      mealSupplierName,
    } = req.body;

    // Check if email or NIC already exists
    const existingUser = await User.findOne({ $or: [{ email }, { nic }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or NIC already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data based on role
    const userData = {
      fullName,
      email,
      password: hashedPassword,
      nic,
      phone,
      address,
      role,
      occupation,
    };

    if (role === "Tenant") {
      Object.assign(userData, {
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
    }

    if (role === "MealSupplier") {
      // Add meal supplier-specific fields
      Object.assign(userData, {
        mealSupplierName,
      });
    }

    // Create user
    const newUser = new User(userData);
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
