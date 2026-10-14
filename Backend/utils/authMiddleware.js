import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "nexaai_default_secret_jwt_key_2026";

// Middleware to strictly enforce valid JWT authentication
export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Access token missing",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Invalid or expired token",
    });
  }
};

// Middleware to optionally extract user from JWT if present
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      req.userId = decoded.userId;
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
};
