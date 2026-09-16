import { getCurrentUser } from "../../lib/authApi";

export const isSalesManager = () => getCurrentUser()?.role === "sales_manager";

// superadmin (and any role other than sales_manager) always has full access;
// a sales_manager is gated by the permission flags an admin set on them.
export const hasSalesPermission = (module, action) => {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.role !== "sales_manager") return true;
  return Boolean(user.permissions?.[module]?.[action]);
};
