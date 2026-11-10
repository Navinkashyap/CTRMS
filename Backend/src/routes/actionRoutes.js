import express from "express";
import Action from "../models/Action.js";
import RolePermission from "../models/RolePermission.js";

const router = express.Router();

// Actions the panel shipped with as hardcoded data (Action page + Role Action
// Mapping page). Inserted once when the collection is first read while empty.
const DEFAULT_ACTIONS = [
  { action: "Download Document", description: "Allow to download documents only to mapped Role." },
  { action: "Preferred", description: "Allow to update Preferred / Non Preffered" },
  { action: "View Profile From Search", description: "Allow to view profile from search" },
  { action: "View Service From Search", description: "Allow to view service from search" },
  { action: "Translation Language Approve", description: "Allow to approve translation language pair and rate detail in translation service" },
  { action: "Translation Language Delete", description: "Allow to delete translation language pair and rate detail in translation service" },
  { action: "Translation Language Add More", description: "Allow to Add More translation language pair and rate detail in translation service" },
  { action: "Translation References Check", description: "Allow to Check/Approve references detail in translation service" },
  { action: "Translation References Delete", description: "Allow to delete references detail in translation service" },
  { action: "Translation References Add More", description: "Allow to Add More references detail in translation service" },
  { action: "Translation Submit", description: "Allow to submit translation service" },
  { action: "Profile Edit", description: "Allow to edit own profile" },
  { action: "Vendor Profile Edit", description: "Allow to edit vendor profile" },
  { action: "View Vendor Profile From User List", description: "Allow to view vendor profile from user list" },
];

const seedIfEmpty = async () => {
  if ((await Action.estimatedDocumentCount()) > 0) return;
  try {
    await Action.insertMany(DEFAULT_ACTIONS, { ordered: false });
  } catch (err) {
    if (err?.code !== 11000 && !err?.writeErrors) throw err;
  }
};

const pickAction = (body) => {
  const data = {};
  if (body.action !== undefined) data.action = String(body.action).trim();
  if (body.description !== undefined) data.description = String(body.description).trim();
  if (body.status !== undefined) data.status = body.status;
  return data;
};

router.get("/", async (_req, res, next) => {
  try {
    await seedIfEmpty();
    const actions = await Action.find().sort({ createdAt: 1 });
    res.json(actions);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const action = await Action.findById(req.params.id);
    if (!action) return res.status(404).json({ message: "Action not found" });
    res.json(action);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = pickAction(req.body);
    if (!data.action) return res.status(400).json({ message: "Action name is required" });
    const action = await Action.create(data);
    res.status(201).json(action);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const existing = await Action.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Action not found" });

    const oldName = existing.action;
    Object.assign(existing, pickAction(req.body));
    await existing.save();

    // Role permissions store action names, so rename them there too.
    if (oldName !== existing.action) {
      await RolePermission.updateMany(
        { actions: oldName },
        { $set: { "actions.$": existing.action } }
      );
    }

    res.json(existing);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const action = await Action.findByIdAndDelete(req.params.id);
    if (!action) return res.status(404).json({ message: "Action not found" });
    await RolePermission.updateMany({}, { $pull: { actions: action.action } });
    res.json({ message: "Action deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
