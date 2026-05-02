const jwt = require("jsonwebtoken");

const env = require("../config/env");

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

// Decodes the auth cookie if present; never rejects. Use on routes
// that return public data but enrich the response when the caller
// is logged in.
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
