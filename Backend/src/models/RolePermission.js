import mongoose from "mongoose";

// One document per role name, holding the actions (Role Action Mapping) and
// menus (Role Menu Permission) that role is allowed.
const RolePermissionSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, unique: true, trim: true },
    actions: { type: [String], default: [] },
    menus: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("RolePermission", RolePermissionSchema);
