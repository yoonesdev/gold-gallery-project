
const { isUserAdmin } = require("../repositories/UserRepository");

function requireAdmin(req, res, next) {
  if (!Number.isSafeInteger(req.userId) || req.userId <= 0) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  try {
    const admin = isUserAdmin(req.userId);

    if (!admin) {
      return res.status(403).json({
        message: "Admin access required.",
      });
    }

    return next();
  } catch (error) {
    console.error("Admin authorization error:", error);

    return res.status(500).json({
      message: "An unexpected error occurred.",
    });
  }
}

module.exports = requireAdmin;
