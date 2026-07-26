import express from "express";
import bcrypt from "bcryptjs";
import VMSUser from "../models/VMSUser.js";
import vmsAuth from "../middleware/vmsAuth.js";

const router = express.Router();
router.use(vmsAuth);

// GET /api/vms/users
router.get("/", async (req, res, next) => {
  try {
    // In a real app we might want pagination and filtering here.
    // For now, returning all users.
    const users = await VMSUser.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// POST /api/vms/users
router.post("/", async (req, res, next) => {
  try {
    const { name, email, password, role, countryCode, contactNo, dob, address, gender, isActive } = req.body;
    
    // Use a default password if not provided
    const userPassword = password || "123456";

    const existingUser = await VMSUser.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists." });
    }

    const newUser = new VMSUser({
      name,
      email,
      password: userPassword,
      role,
      countryCode,
      contactNo,
      dob,
      address,
      gender,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    next(error);
  }
});

// PUT /api/vms/users/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, countryCode, contactNo, dob, address, gender, isActive } = req.body;

    const user = await VMSUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.toLowerCase();
    if (role !== undefined) user.role = role;
    if (countryCode !== undefined) user.countryCode = countryCode;
    if (contactNo !== undefined) user.contactNo = contactNo;
    if (dob !== undefined) user.dob = dob;
    if (address !== undefined) user.address = address;
    if (gender !== undefined) user.gender = gender;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vms/users/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await VMSUser.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
