import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.js";
import { requireAuth } from "../utils/authMiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "nexaai_default_secret_jwt_key_2026";

// High-speed in-memory user cache & fallback store when database is connecting/reconnecting
const memUsers = new Map(); // normalizedEmail -> user object
const memUsersById = new Map(); // userId -> user object

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to generate JWT token (30 days validity)
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
};

// 1. User Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists (DB or Memory)
    let existingUser = null;
    if (isDbConnected()) {
      try {
        existingUser = await User.findOne({ email: normalizedEmail });
      } catch (err) {
        console.warn("DB user check failed, using memory fallback:", err.message);
      }
    }
    if (!existingUser) {
      existingUser = memUsers.get(normalizedEmail);
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists. Please log in.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create unique userId
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userData = {
      userId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    };

    let savedUser = null;
    if (isDbConnected()) {
      try {
        savedUser = await User.create(userData);
      } catch (err) {
        console.warn("DB user create failed, saving in memory:", err.message);
      }
    }

    // Always cache in memory as well
    memUsers.set(normalizedEmail, userData);
    memUsersById.set(userId, userData);

    const token = generateToken({
      userId,
      email: normalizedEmail,
      name: name.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        userId,
        name: name.trim(),
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to register user",
    });
  }
});

// 2. User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user in MongoDB or Memory
    let user = null;
    if (isDbConnected()) {
      try {
        user = await User.findOne({ email: normalizedEmail });
      } catch (err) {
        console.warn("DB login lookup failed, using memory fallback:", err.message);
      }
    }
    if (!user) {
      user = memUsers.get(normalizedEmail);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Cache in memory for quick subsequent access
    memUsers.set(normalizedEmail, user);
    memUsersById.set(user.userId, user);

    const token = generateToken({
      userId: user.userId,
      email: user.email,
      name: user.name,
    });

    res.json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to log in",
    });
  }
});

// 3. Get Current User Profile (Token validation)
router.get("/me", requireAuth, async (req, res) => {
  try {
    let user = null;
    if (isDbConnected()) {
      try {
        user = await User.findOne({ userId: req.userId }).select("-password");
      } catch (err) {
        console.warn("DB /me lookup failed, checking memory:", err.message);
      }
    }
    if (!user) {
      user = memUsersById.get(req.userId);
    }

    if (!user) {
      // Return decoded info from valid token if available
      if (req.user?.userId) {
        return res.json({
          success: true,
          user: {
            userId: req.user.userId,
            name: req.user.name || "User",
            email: req.user.email || "",
          },
        });
      }
      return res.status(404).json({
        success: false,
        error: "User account not found",
      });
    }

    res.json({
      success: true,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch profile",
    });
  }
});

export default router;
