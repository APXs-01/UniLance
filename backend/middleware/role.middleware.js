// Member 4 - Role Middleware (Role-Based Access Control)

// ─── Authorize specific roles ──────────────────────────────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

// ─── Shorthand role guards ─────────────────────────────────────────────────────
const isAdmin      = authorize("admin");
const isFreelancer = authorize("freelancer");
const isBuyer      = authorize("buyer");
const isFreelancerOrAdmin = authorize("freelancer", "admin");
const isBuyerOrAdmin      = authorize("buyer", "admin");

module.exports = { authorize, isAdmin, isFreelancer, isBuyer, isFreelancerOrAdmin, isBuyerOrAdmin };
