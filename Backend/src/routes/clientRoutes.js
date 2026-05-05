import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import Client from "../models/Client.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });


const formatClient = (client) => ({
  _id: client._id,
  domain: client.domain,
  status: client.status,
  membership: client.membership,
  membershipCode: client.membershipCode,
  name: client.name,
  website: client.website,
  email: client.email,
  phone: client.phone,
  address: client.address,
  city: client.city,
  state: client.state,
  zip: client.zip,
  country: client.country,
  currency: client.currency,
  registrationDate: client.registrationDate
    ? new Date(client.registrationDate).toISOString().split("T")[0]
    : "",
  createdBy: client.createdBy,
  documents: client.documents || [],
  createdAt: client.createdAt,
  updatedAt: client.updatedAt,
});

router.get("/", async (_req, res, next) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients.map(formatClient));
  } catch (error) {
    next(error);
  }
});

router.get("/next-membership-code", async (_req, res, next) => {
  try {
    const latestClient = await Client.findOne({
      membershipCode: /^MEM-\d+$/,
    })
      .sort({ membershipCode: -1 })
      .lean();

    const currentNumber = latestClient?.membershipCode
      ? Number(latestClient.membershipCode.split("-")[1])
      : 0;

    res.json({
      membershipCode: `MEM-${String(currentNumber + 1).padStart(3, "0")}`,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.json(formatClient(client));
  } catch (error) {
    return next(error);
  }
});

router.post("/", upload.array("documents"), async (req, res, next) => {
  try {
    const clientData = { ...req.body };
    if (req.files && req.files.length > 0) {
      clientData.documents = req.files.map((file) => ({
        name: file.originalname,
        url: `/uploads/${file.filename}`,
      }));
    }
    const client = await Client.create(clientData);
    res.status(201).json(formatClient(client));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", upload.array("documents"), async (req, res, next) => {
  try {
    const clientData = { ...req.body };
    
    // If the request body sends existing documents as string (e.g. JSON.stringify)
    if (typeof clientData.existingDocuments === 'string') {
      try {
        clientData.documents = JSON.parse(clientData.existingDocuments);
      } catch (e) {
        clientData.documents = [];
      }
      delete clientData.existingDocuments;
    } else if (Array.isArray(clientData.existingDocuments)) {
      clientData.documents = clientData.existingDocuments;
      delete clientData.existingDocuments;
    } else {
      clientData.documents = [];
    }

    if (req.files && req.files.length > 0) {
      const newDocs = req.files.map((file) => ({
        name: file.originalname,
        url: `/uploads/${file.filename}`,
      }));
      clientData.documents = [...clientData.documents, ...newDocs];
    }

    const client = await Client.findByIdAndUpdate(req.params.id, clientData, {
      new: true,
      runValidators: true,
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.json(formatClient(client));
  } catch (error) {
    return next(error);
  }
});

export default router;
