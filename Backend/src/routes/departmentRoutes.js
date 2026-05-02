import express from "express";
import Department from "../models/Department.js";

const router = express.Router();

// GET all departments
router.get("/", async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    next(err);
  }
});

// POST new department
router.post("/", async (req, res, next) => {
  try {
    const { name, shortName, status } = req.body;
    const department = new Department({ name, shortName, status });
    await department.save();
    res.status(201).json(department);
  } catch (err) {
    next(err);
  }
});

// PUT update department
router.put("/:id", async (req, res, next) => {
  try {
    const { name, shortName, status } = req.body;
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, shortName, status },
      { new: true, runValidators: true }
    );
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json(department);
  } catch (err) {
    next(err);
  }
});

// DELETE department
router.delete("/:id", async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json({ message: "Department deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
