import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// Verifies the JWT issued by /api/auth/login and attaches the account to
// req.user. Used only by the Sales routes for now (see routes/salesRoutes.js) —
// the rest of the admin API does not require a token today, so adding this
// here does not change any existing behaviour.
export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_super_secret_key_123"
    );
    const user = await Admin.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Account no longer exists" });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({ message: "Account is inactive. Contact your admin." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Restricts a route to specific roles, e.g. requireRole("superadmin").
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission to perform this action" });
  }
  next();
};

// Gates an action behind a permission flag set on the account, e.g.
// requirePermission("clients", "edit"). Anyone who isn't a sales_manager
// (superadmin and any other existing role) always passes — the flags only
// ever restrict the sales_manager role.
export const requirePermission = (module, action) => (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (user.role !== "sales_manager") {
    return next();
  }

  const allowed = Boolean(user.permissions?.[module]?.[action]);
  if (!allowed) {
    return res.status(403).json({
      message: `You do not have permission to ${action} ${module}. Ask your admin to enable it.`,
    });
  }

  next();
};
