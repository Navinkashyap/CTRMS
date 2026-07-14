import express from "express";
import jwt from "jsonwebtoken";
import VMSUser from "../models/VMSUser.js";
import Vendor from "../../models/Vendor.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_key_123";
const JWT_EXPIRES_IN = "1d";

// ─── Generate JWT Token ─────────────────────────────────────────────────────
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// ─── POST /api/vms/auth/login ─── Unified login for VM & PM ─────────────────
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user in VMSUser collection (Vendor Manager / Project Manager)
    const user = await VMSUser.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is deactivated. Contact admin." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
      type: "vms_user",
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/vms/auth/vendor/login ─── Vendor email+password login ────────
// Checks both: Vendor collection (self-registered) AND VMSUser collection (created by Vendor Manager)
router.post("/vendor/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // ── 1. Check self-registered Vendor collection first ──────────────────────
    const vendor = await Vendor.findOne({ email: email.toLowerCase() });
    if (vendor) {
      if (!vendor.isActive) {
        return res
          .status(403)
          .json({ message: "Account is deactivated. Contact admin." });
      }

      if (!vendor.password) {
        return res.status(401).json({
          message:
            "No password set for this account. Please login with Google or set a password.",
        });
      }

      const isMatch = await vendor.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = generateToken({
        id: vendor._id,
        email: vendor.email,
        role: "vendor",
        type: "vendor",
      });

      return res.json({
        message: "Login successful",
        token,
        user: {
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          role: "vendor",
          code: vendor.code,
          profilePicture: vendor.profilePicture,
        },
      });
    }

    // ── 2. Check VMSUser collection (vendors created by Vendor Manager) ───────
    const vmsUser = await VMSUser.findOne({ email: email.toLowerCase() });
    if (vmsUser) {
      if (!vmsUser.isActive) {
        return res
          .status(403)
          .json({ message: "Account is deactivated. Contact admin." });
      }

      const isMatch = await vmsUser.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = generateToken({
        id: vmsUser._id,
        email: vmsUser.email,
        role: vmsUser.role,
        type: "vms_user",
      });

      return res.json({
        message: "Login successful",
        token,
        user: {
          id: vmsUser._id,
          name: vmsUser.name,
          email: vmsUser.email,
          role: vmsUser.role,
        },
      });
    }

    // ── 3. Not found in either collection ─────────────────────────────────────
    return res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/vms/auth/vendor/google ─── Vendor Google login ───────────────
router.post("/vendor/google", async (req, res, next) => {
  try {
    const { email, name, googleId, profilePicture } = req.body;

    if (!email || !googleId) {
      return res
        .status(400)
        .json({ message: "Email and Google ID are required" });
    }

    // Check if vendor exists by email or googleId
    let vendor = await Vendor.findOne({
      $or: [{ email: email.toLowerCase() }, { googleId }],
    });

    if (vendor) {
      // Update Google info if not already set
      if (!vendor.googleId) {
        vendor.googleId = googleId;
      }
      if (profilePicture && !vendor.profilePicture) {
        vendor.profilePicture = profilePicture;
      }
      await vendor.save();
    } else {
      // Create new vendor with Google account
      const vendorCount = await Vendor.countDocuments();
      vendor = await Vendor.create({
        code: `G-${vendorCount + 1}`,
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        googleId,
        profilePicture: profilePicture || "",
      });
    }

    if (!vendor.isActive) {
      return res
        .status(403)
        .json({ message: "Account is deactivated. Contact admin." });
    }

    const token = generateToken({
      id: vendor._id,
      email: vendor.email,
      role: "vendor",
      type: "vendor",
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: "vendor",
        code: vendor.code,
        profilePicture: vendor.profilePicture,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/vms/auth/vendor/register ─── Vendor manual registration ──────
router.post("/vendor/register", async (req, res, next) => {
  try {
    const { name, email, password, mobile, country } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({
      email: email.toLowerCase(),
    });
    if (existingVendor) {
      return res
        .status(409)
        .json({ message: "Email already registered. Please login." });
    }

    // Generate vendor code
    const vendorCount = await Vendor.countDocuments();
    const vendorCode = `V-${vendorCount + 1}`;

    const vendor = await Vendor.create({
      code: vendorCode,
      name,
      email: email.toLowerCase(),
      password,
      mobile: mobile || "",
      country: country || "",
    });

    const token = generateToken({
      id: vendor._id,
      email: vendor.email,
      role: "vendor",
      type: "vendor",
    });

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: "vendor",
        code: vendor.code,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/vms/auth/forgot-password ─── Forgot password ─────────────────
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check in both VMSUser and Vendor collections
    const vmsUser = await VMSUser.findOne({ email: email.toLowerCase() });
    const vendor = await Vendor.findOne({ email: email.toLowerCase() });

    if (!vmsUser && !vendor) {
      // Return success anyway to prevent email enumeration
      return res.json({
        message: "If this email exists, a password reset link has been sent.",
      });
    }

    // TODO: Implement actual email sending with nodemailer
    // For now, return success response
    return res.json({
      message: "If this email exists, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/vms/auth/logout ─── Logout ───────────────────────────────────
router.post("/logout", (_req, res) => {
  // JWT is stateless — client-side token removal handles logout
  res.json({ message: "Logged out successfully" });
});

export default router;
