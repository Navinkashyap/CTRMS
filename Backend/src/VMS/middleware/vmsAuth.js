import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_key_123";

// Verifies the JWT issued by /api/vms/auth/* and attaches the decoded payload to req.vmsAuth.
// Any route mounted behind this middleware requires a valid "Authorization: Bearer <token>" header.
export default function vmsAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication token is required" });
  }

  try {
    req.vmsAuth = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
