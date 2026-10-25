
const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  // 1. Read the Authorization header
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  // 2. Make sure the server has its JWT secret
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is not configured.");

    return res.status(500).json({
      message: "An unexpected error occurred.",
    });
  }

  // 3. Verify the token
  try {
    const payload = jwt.verify(token, secret);
    const userId = Number(payload.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(401).json({
        message: "Invalid or expired token.",
      });
    }

    // 4. Make the authenticated user's ID available to the route
    req.userId = userId;

    return next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
}

module.exports = requireAuth;