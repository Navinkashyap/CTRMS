import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    // Superadmins sign in with their email; Sales Managers sign in with the
    // mobile number an admin set on their account. One field accepts either,
    // so the login form stays the same for both.
    // `identifier` is the current field name; `email` is kept as a fallback
    // for any older frontend build still sending the legacy key.
    const { password } = req.body;
    const identifier = (req.body.identifier || req.body.email || "").trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/mobile number and password are required" });
    }

    const isEmail = identifier.includes("@");
    const admin = await Admin.findOne(
      isEmail ? { email: identifier.toLowerCase() } : { mobile: identifier }
    );
    if (!admin) {
      return res.status(401).json({ message: "Invalid email/mobile number or password" });
    }

    if (admin.status === "Inactive") {
      return res.status(403).json({ message: "Account is inactive. Contact your admin." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email/mobile number or password" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || "default_super_secret_key_123",
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  // For JWT, client-side deletion is enough, but we provide this endpoint for completeness/logging.
  res.json({ message: "Logged out successfully" });
});

export default router;
