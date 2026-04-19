import express from "express";

import Client from "../models/Client.js";

const router = express.Router();

const formatClient = (client) => ({
  _id: client._id,
  domain: client.domain,
  status: client.status,
  membershipCode: client.membershipCode,
  name: client.name,
  website: client.website,
  email: client.email,
  phone: client.phone,
  address: client.address,
  city: client.city,
  country: client.country,
  currency: client.currency,
  registrationDate: client.registrationDate
    ? new Date(client.registrationDate).toISOString().split("T")[0]
    : "",
  createdBy: client.createdBy,
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

router.post("/", async (req, res, next) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(formatClient(client));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
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
