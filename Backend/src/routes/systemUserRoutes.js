import express from "express";
import SystemUser from "../models/SystemUser.js";

const router = express.Router();

const pickUser = (body) => {
  const data = {};
  for (const key of ["name", "email", "role", "mobile", "status"]) {
    if (body[key] !== undefined) data[key] = typeof body[key] === "string" ? body[key].trim() : body[key];
  }
  return data;
};

router.get("/", async (_req, res, next) => {
  try {
    const users = await SystemUser.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await SystemUser.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = pickUser(req.body);
    if (!data.name || !data.email) {
      return res.status(400).json({ message: "Name and email are required" });
    }
    const user = await SystemUser.create(data);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const user = await SystemUser.findByIdAndUpdate(req.params.id, pickUser(req.body), {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const user = await SystemUser.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
