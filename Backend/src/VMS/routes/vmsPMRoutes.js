import express from "express";
import VMSUser from "../models/VMSUser.js";
import Project from "../../models/Project.js";
import Invoice from "../../models/Invoice.js";
import vmsAuth from "../middleware/vmsAuth.js";

const router = express.Router();
router.use(vmsAuth);

// Fields a PM/VM is allowed to change on their own profile.
// Excludes role, password, email, isActive so a profile edit can't escalate privileges.
const EDITABLE_PROFILE_FIELDS = [
  "name",
  "countryCode",
  "contactNo",
  "dob",
  "address",
  "gender",
  "title",
  "firstName",
  "lastName",
  "cityName",
  "stateName",
  "countryName",
  "pinCode",
  "teamsId",
  "altEmail",
  "altCountryCode",
  "altContactNo",
  "remark",
];

// GET /api/vms/pm/profile/:id
router.get("/profile/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await VMSUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: "PM not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// PUT /api/vms/pm/profile/:id
router.put("/profile/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = {};
    for (const field of EDITABLE_PROFILE_FIELDS) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }

    // Auto-update 'name' if firstName and lastName are provided and name isn't explicitly sent
    if (updateData.firstName && updateData.lastName && !updateData.name) {
       updateData.name = `${updateData.firstName} ${updateData.lastName}`;
    }

    const user = await VMSUser.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    
    if (!user) {
      return res.status(404).json({ message: "PM not found" });
    }
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    next(error);
  }
});

// GET /api/vms/pm/dashboard/:id
router.get("/dashboard/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const pm = await VMSUser.findById(id);
    if (!pm) {
      return res.status(404).json({ message: "PM not found" });
    }

    // Find projects where this PM is the manager (matching by name for now as manager is a String)
    const projects = await Project.find({ manager: pm.name }).sort({ createdAt: -1 });
    
    // Find Invoices related to these projects
    const projectIds = projects.map(p => p._id);
    const invoices = await Invoice.find({ project: { $in: projectIds } }).sort({ createdAt: -1 });

    res.json({
      projects,
      invoices
    });
  } catch (error) {
    next(error);
  }
});

export default router;
