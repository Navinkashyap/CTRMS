import express from "express";
import Vendor from "../models/Vendor.js";

const router = express.Router();

const formatVendor = (vendor) => ({
  _id: vendor._id,
  code: vendor.code,
  name: vendor.name,
  email: vendor.email,
  mobile: vendor.mobile,
  dob: vendor.dob ? new Date(vendor.dob).toISOString().split("T")[0] : "",
  gender: vendor.gender,
  country: vendor.country,
  motherTongue: vendor.motherTongue,
  ptft: vendor.ptft,
  availability: vendor.availability,
  address: vendor.address,
  serviceQuality: vendor.serviceQuality,
  taskQuality: vendor.taskQuality,
  timelyDelivery: vendor.timelyDelivery,
  isActive: vendor.isActive,
  createdAt: vendor.createdAt,
  updatedAt: vendor.updatedAt,
});

// Get all vendors
router.get("/", async (_req, res, next) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json(vendors.map(formatVendor));
  } catch (error) {
    next(error);
  }
});

// Search vendors by name, code, or email
router.get("/search", async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) {
      return res.json([]);
    }

    const regex = new RegExp(q.trim(), "i");
    const vendors = await Vendor.find({
      $or: [{ name: regex }, { code: regex }, { email: regex }],
    })
      .sort({ name: 1 })
      .limit(10);

    res.json(vendors.map(formatVendor));
  } catch (error) {
    next(error);
  }
});

// Get vendor by ID
router.get("/:id", async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json(formatVendor(vendor));
  } catch (error) {
    next(error);
  }
});

// Create new vendor
router.post("/", async (req, res, next) => {
  try {
    const vendor = await Vendor.create(req.body);
    res.status(201).json(formatVendor(vendor));
  } catch (error) {
    next(error);
  }
});

// Update vendor
router.put("/:id", async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json(formatVendor(vendor));
  } catch (error) {
    next(error);
  }
});

// Delete vendor
router.delete("/:id", async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
