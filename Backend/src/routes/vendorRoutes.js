import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Vendor from "../models/Vendor.js";
import VMSUser from "../VMS/models/VMSUser.js";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error('Only images, PDFs and documents are allowed'));
  }
});

// Every uploadable document slot on the vendor profile
const DOCUMENT_FIELDS = [
  'panDocument',
  'aadhaarDocument',
  'resume',
  'gstDocument',
  'ndaDocument',
  'otherDocument',
];

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
  profilePicture: vendor.profilePicture,
  panDocument: vendor.panDocument,
  aadhaarDocument: vendor.aadhaarDocument,
  resume: vendor.resume,
  gstDocument: vendor.gstDocument,
  ndaDocument: vendor.ndaDocument,
  otherDocument: vendor.otherDocument,
  approvalStatus: vendor.approvalStatus || "Pending",
  approvalRemark: vendor.approvalRemark || "",
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
    // Documents are uploaded separately, but the profile form may also send the
    // current values back when saving Personal details.
    DOCUMENT_FIELDS.forEach((field) => {
      updates[field] = req.body[field];
    });
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

// Upload documents (profile pic + every document slot on the profile)
router.post("/code/:code/upload", upload.fields(
  ['profilePicture', ...DOCUMENT_FIELDS].map((name) => ({ name, maxCount: 1 }))
), async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ code: req.params.code });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const files = req.files || {};
    const updates = {};
    for (const field of ['profilePicture', ...DOCUMENT_FIELDS]) {
      if (files[field] && files[field][0]) {
        updates[field] = `/uploads/${files[field][0].filename}`;
      }
    }

    Object.assign(vendor, updates);
    await vendor.save();
    res.json(formatVendor(vendor));
  } catch (error) {
    next(error);
  }
});

// Remove a single uploaded document
router.delete("/code/:code/document/:field", async (req, res, next) => {
  try {
    const { field } = req.params;
    if (!['profilePicture', ...DOCUMENT_FIELDS].includes(field)) {
      return res.status(400).json({ message: "Unknown document field" });
    }

    const vendor = await Vendor.findOne({ code: req.params.code });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor[field] = "";
    await vendor.save();
    res.json(formatVendor(vendor));
  } catch (error) {
    next(error);
  }
});

// Vendor Manager approval decision on a vendor (Approve Vendor list / service review)
router.put("/code/:code/approval", async (req, res, next) => {
  try {
    const { approvalStatus, approvalRemark } = req.body;
    if (!["Pending", "Approved", "Rejected"].includes(approvalStatus)) {
      return res.status(400).json({ message: "approvalStatus must be 'Pending', 'Approved' or 'Rejected'" });
    }

    const vendor = await Vendor.findOne({ code: req.params.code });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.approvalStatus = approvalStatus;
    vendor.approvalRemark = approvalStatus === "Rejected" ? (approvalRemark || "") : "";
    await vendor.save();

    res.json(formatVendor(vendor));
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

    // If name is provided but firstName/lastName are not, derive them from name
    // This keeps Personal Details in sync when edits come from different UIs
    if (req.body.name && !req.body.firstName && !req.body.lastName) {
      const parts = req.body.name.trim().split(/\s+/);
      // Check if first part is a title (Mr., Mrs., Ms., Dr.)
      const titles = ['Mr.', 'Mrs.', 'Ms.', 'Dr.'];
      if (titles.includes(parts[0])) {
        req.body.title = parts[0];
        req.body.firstName = parts[1] || '';
        req.body.lastName = parts.slice(2).join(' ') || '';
      } else {
        req.body.firstName = parts[0] || '';
        req.body.lastName = parts.slice(1).join(' ') || '';
      }
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
