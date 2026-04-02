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

module.exports = { authMiddleware };
