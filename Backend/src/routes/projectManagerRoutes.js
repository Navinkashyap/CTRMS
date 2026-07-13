import express from "express";
import bcrypt from "bcryptjs";
import ProjectManager from "../models/ProjectManager.js";
import VMSUser from "../VMS/models/VMSUser.js";

const router = express.Router();

const formatProjectManager = (pm) => ({
  _id: pm._id,
  code: pm.code,
  name: pm.name,
  email: pm.email,
  mobile: pm.mobile,
  dob: pm.dob ? new Date(pm.dob).toISOString().split("T")[0] : "",
  gender: pm.gender,
  country: pm.country,
  state: pm.state,
  city: pm.city,
  zipCode: pm.zipCode,
  ptft: pm.ptft,
  availability: pm.availability,
  address: pm.address,
  isActive: pm.isActive,
  createdAt: pm.createdAt,
  updatedAt: pm.updatedAt,
});

// Get all project managers
router.get("/", async (_req, res, next) => {
  try {
    const projectManagers = await ProjectManager.find().sort({ createdAt: -1 });
    res.json(projectManagers.map(formatProjectManager));
  } catch (error) {
    next(error);
  }
});

// Search project managers
router.get("/search", async (req, res, next) => {
  try {
    const query = req.query.q || "";
    const projectManagers = await ProjectManager.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { code: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });
    res.json(projectManagers.map(formatProjectManager));
  } catch (error) {
    next(error);
  }
});

// Get project manager by ID
router.get("/:id", async (req, res, next) => {
  try {
    const pm = await ProjectManager.findById(req.params.id);
    if (!pm) {
      return res.status(404).json({ message: "Project Manager not found" });
    }
    res.json(formatProjectManager(pm));
  } catch (error) {
    next(error);
  }
});

// Create new project manager
router.post("/", async (req, res, next) => {
  try {
    const data = { ...req.body };
    const pm = await ProjectManager.create(data);

    // Also create a VMSUser for the project manager login
    if (req.body.password) {
      await VMSUser.create({
        name: pm.name,
        email: pm.email,
        password: req.body.password,
        role: "project_manager",
        isActive: pm.isActive
      });
    }

    res.status(201).json(formatProjectManager(pm));
  } catch (error) {
    next(error);
  }
});

// Update project manager
router.put("/:id", async (req, res, next) => {
  try {
    const oldPM = await ProjectManager.findById(req.params.id);
    if (!oldPM) {
      return res.status(404).json({ message: "Project Manager not found" });
    }

    const plainPassword = req.body.password;
    const data = { ...req.body };

    // Handle password hashing manually for findByIdAndUpdate
    if (plainPassword) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(plainPassword, salt);
    } else {
      delete data.password;
    }

    const pm = await ProjectManager.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    
    // Sync with VMSUser so Project Manager can log in
    const vmsUser = await VMSUser.findOne({ email: oldPM.email });
    if (vmsUser) {
      vmsUser.name = pm.name;
      vmsUser.email = pm.email;
      vmsUser.isActive = pm.isActive;
      // VMSUser pre-save hook handles hashing, so we pass the plain password
      if (plainPassword) {
        vmsUser.password = plainPassword;
      }
      await vmsUser.save();
    } else if (plainPassword) {
      // If VMSUser didn't exist but password is provided, create it
      await VMSUser.create({
        name: pm.name,
        email: pm.email,
        password: plainPassword,
        role: "project_manager",
        isActive: pm.isActive
      });
    }

    res.json(formatProjectManager(pm));
  } catch (error) {
    next(error);
  }
});

// Delete project manager
router.delete("/:id", async (req, res, next) => {
  try {
    const pm = await ProjectManager.findByIdAndDelete(req.params.id);
    if (!pm) {
      return res.status(404).json({ message: "Project Manager not found" });
    }
    res.json({ message: "Project Manager deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
