import express from "express";
import Vendor from "../../models/Vendor.js";
import Project from "../../models/Project.js";
import vmsAuth from "../middleware/vmsAuth.js";

const router = express.Router();
router.use(vmsAuth);

// GET /api/vms/vm/dashboard/:id
router.get("/dashboard/:id", async (req, res, next) => {
  try {
    const { id } = req.params; // Vendor manager ID
    
    // Basic stats for the Vendor Manager
    const totalVendors = await Vendor.countDocuments();
    const activeVendors = await Vendor.countDocuments({ isActive: true });
    const pendingApprovals = await Vendor.countDocuments({ isActive: false });
    
    // Active Projects across the system
    const activeProjects = await Project.countDocuments({ status: { $ne: "Completed" } });
    
    res.json({
      stats: {
        totalVendors,
        activeVendors,
        pendingApprovals,
        activeProjects
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
