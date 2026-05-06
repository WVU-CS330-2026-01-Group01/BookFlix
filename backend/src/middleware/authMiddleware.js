const jwt = require("jsonwebtoken");

const env = require("../config/env");

// Required-session guard for write operations and private profile data.
function authMiddleware(request, response, next) {
  const token = request.cookies?.[env.authCookieName];

  if (!token) {
    return response.status(403).json({ error: "Access denied." });
  }

  try {
    request.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return response.status(401).json({ error: "Invalid token." });
  }
}

// Optional-session guard for public reads that can still return caller-specific
// state, such as a user's current vote on a pair.
function optionalAuth(request, response, next) {
  const token = request.cookies?.[env.authCookieName];
  if (token) {
    try {
      request.user = jwt.verify(token, env.jwtSecret);
    } catch {
      request.user = null;
    }
  }
  return next();
}

module.exports = { authMiddleware, optionalAuth };
