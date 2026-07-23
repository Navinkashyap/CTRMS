import express from "express";
import Vendor from "../models/Vendor.js";
import VMSUser from "../VMS/models/VMSUser.js";
import bcrypt from "bcryptjs";

const router = express.Router();

const formatVendor = (vendor) => ({
  _id: vendor._id,
  code: vendor.code,
  name: vendor.name,
  title: vendor.title,
  firstName: vendor.firstName,
  lastName: vendor.lastName,
  email: vendor.email,
  phoneCode: vendor.phoneCode,
  phone: vendor.phone,
  mobileCode: vendor.mobileCode,
  mobile: vendor.mobile,
  altEmail: vendor.altEmail,
  altPhoneCode: vendor.altPhoneCode,
  altPhone: vendor.altPhone,
  teamsId: vendor.teamsId,
  remark: vendor.remark,
  dob: vendor.dob ? new Date(vendor.dob).toISOString().split("T")[0] : "",
  gender: vendor.gender,
  country: vendor.country,
  motherTongue: vendor.motherTongue,
  ptft: vendor.ptft,
  availability: vendor.availability,
  address: vendor.address,
  city: vendor.city,
  state: vendor.state,
  pinCode: vendor.pinCode,
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

// Get vendor by code (used by self-service pages that only know the vendor's code, not its Mongo _id)
router.get("/code/:code", async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ code: req.params.code });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json(formatVendor(vendor));
  } catch (error) {
    next(error);
  }
});

// Update personal & address details from the vendor's own profile page
router.put("/code/:code/personal", async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ code: req.params.code });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const oldEmail = vendor.email;
    const updates = {
      title: req.body.title,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneCode: req.body.phoneCode,
      phone: req.body.phone,
      mobileCode: req.body.mobileCode,
      mobile: req.body.mobile,
      email: req.body.email,
      dob: req.body.dob,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      pinCode: req.body.pinCode,
      altEmail: req.body.altEmail,
      altPhoneCode: req.body.altPhoneCode,
      altPhone: req.body.altPhone,
      teamsId: req.body.teamsId,
      remark: req.body.remark,
      gender: req.body.gender,
      ptft: req.body.ptft,
      availability: req.body.availability,
      motherTongue: req.body.motherTongue,
    };
    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

    Object.assign(vendor, updates);
    await vendor.save();

    // Keep the Vendor Manager login record (VMSUser) in sync with name/email changes
    const vmsUser = await VMSUser.findOne({ email: oldEmail });
    if (vmsUser) {
      vmsUser.name = vendor.name;
      vmsUser.email = vendor.email;
      await vmsUser.save();
    }

    res.json(formatVendor(vendor));
  } catch (error) {
    next(error);
  }
});

// Change password from the vendor's own Security tab
router.put("/code/:code/password", async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ code: req.params.code });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    if (vendor.password) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      const isMatch = await vendor.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
    }

    vendor.password = newPassword;
    await vendor.save();

    // Keep the Vendor Manager login record (VMSUser) in sync so the new password works there too
    const vmsUser = await VMSUser.findOne({ email: vendor.email });
    if (vmsUser) {
      vmsUser.password = newPassword;
      await vmsUser.save();
    }

    res.json({ message: "Password updated successfully" });
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

    // Also create a VMSUser for the vendor manager login
    if (req.body.password) {
      await VMSUser.create({
        name: vendor.name,
        email: vendor.email,
        password: req.body.password,
        role: "vendor_manager",
        isActive: vendor.isActive
      });
    }

    res.status(201).json(formatVendor(vendor));
  } catch (error) {
    next(error);
  }
});

// Update vendor
router.put("/:id", async (req, res, next) => {
  try {
    const oldVendor = await Vendor.findById(req.params.id);
    if (!oldVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const plainPassword = req.body.password;

    // Handle password hashing manually for Vendor because findByIdAndUpdate bypasses pre('save')
    if (plainPassword) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(plainPassword, salt);
    } else {
      delete req.body.password; // Don't overwrite with empty
    }

    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    // Sync with VMSUser so Vendor Manager can log in
    const vmsUser = await VMSUser.findOne({ email: oldVendor.email });
    if (vmsUser) {
      vmsUser.name = vendor.name;
      vmsUser.email = vendor.email;
      vmsUser.isActive = vendor.isActive;
      // VMSUser pre-save hook handles hashing, so we pass the plain password
      if (plainPassword) {
        vmsUser.password = plainPassword;
      }
      await vmsUser.save();
    } else if (plainPassword) {
      // If VMSUser didn't exist but password is provided, create it
      await VMSUser.create({
        name: vendor.name,
        email: vendor.email,
        password: plainPassword,
        role: "vendor_manager",
        isActive: vendor.isActive
      });
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
