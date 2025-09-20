import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  const {
    fullName,
    email,
    password,
    confirmPassword,
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

  // Basic validation
  if (
    !fullName ||
    !email ||
    !password ||
    !confirmPassword ||
    !nic ||
    !phone ||
    !address ||
    !role
  ) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Check for existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Check for existing NIC
    const existingNIC = await User.findOne({ nic });
    if (existingNIC) {
      return res.status(400).json({ message: "NIC already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (convert age to number)
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      nic,
      phone,
      address,
      role,
      gender,
      age: Number(age), // Convert string to number
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

    const savedUser = await newUser.save();

    // Remove password from response
    const userResponse = { ...savedUser._doc };
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email or NIC already exists",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({ message: "Server error during registration" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide both email and password",
    });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: rememberMe ? "7d" : "24h", // Longer expiry if remember me is checked
      }
    );

    // Remove password from response
    const userResponse = { ...user._doc };
    delete userResponse.password;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login",
    });
  }
};
