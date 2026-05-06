const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const env = require("../config/env");
const { authMiddleware } = require("../middleware/authMiddleware");
const { getPool } = require("../config/database");

function getCookieOptions() {
  // Keep auth tokens in an HTTP-only cookie so React never has to store JWTs in
  // localStorage or manually attach Authorization headers.
  return {
    httpOnly: true,
    sameSite: env.authCookieSameSite,
    secure: env.nodeEnv === "production" || env.authCookieSameSite === "none",
    maxAge: env.authCookieMaxAgeMs,
  };
}

function createAuthRouter() {
  const router = express.Router();

  router.post("/register", async (request, response) => {
    const { email, username, password } = request.body ?? {};

    if (!email || !username || !password) {
      return response.status(400).json({ error: "Email, username, and password are required." });
    }

    try {
      // Usernames and email addresses are both login-critical identifiers, so
      // registration treats either collision as a conflict.
      const [existingRows] = await getPool().execute(
        "SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1",
        [username, email],
      );

      if (existingRows.length > 0) {
        return response.status(409).json({ error: "Username or email already exists." });
      }

      // Password hashes are the only credential material stored in MySQL.
      const passwordHash = await bcrypt.hash(password, 10);

      await getPool().execute(
        "INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)",
        [email, username, passwordHash],
      );

      return response.status(201).json({ ok: true, message: "User registered successfully." });
    } catch (error) {
      console.error("Error during registration:", error);
      return response.status(500).json({ error: "Failed to register user." });
    }
  });

  router.post("/login", async (request, response) => {
    const { username, password } = request.body ?? {};

    if (!username || !password) {
      return response.status(400).json({ error: "Username and password are required." });
    }

    try {
      const [rows] = await getPool().execute(
        "SELECT id, username, password_hash, pfp_index FROM users WHERE username = ? LIMIT 1",
        [username],
      );

      const user = rows[0];

      if (!user?.password_hash) {
        return response.status(401).json({ error: "Invalid credentials." });
      }

      const passwordMatches = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatches) {
        return response.status(401).json({ error: "Invalid credentials." });
      }

      // The cookie lifetime and JWT expiry intentionally match so the browser
      // does not keep an expired token around after the session window closes.
      const token = jwt.sign(
        { id: user.id, username: user.username },
        env.jwtSecret,
        { expiresIn: Math.floor(env.authCookieMaxAgeMs / 1000) },
      );

      response.cookie(env.authCookieName, token, getCookieOptions());

      return response.json({
        ok: true,
        user: {
          id: user.id,
          username: user.username,
          pfp_index: user.pfp_index,
        },
      });
    } catch (error) {
      console.error("Error during login:", error);
      return response.status(500).json({ error: "Failed to login." });
    }
  });

  router.get("/test", authMiddleware, async (request, response) => {
    // Session verification returns the freshest profile fields, including the
    // selected avatar index, instead of trusting the older JWT payload.
    const [rows] = await getPool().execute(
      "SELECT id, username, pfp_index FROM users WHERE id = ? LIMIT 1",
      [request.user.id],
    );
    
    response.json({
      ok: true,
      user: rows[0] ?? null,
    });
  });

  router.post("/logout", (request, response) => {
    // Clearing the cookie is enough to end the stateless JWT session.
    response.clearCookie(env.authCookieName, {
      httpOnly: true,
      sameSite: env.authCookieSameSite,
      secure: env.nodeEnv === "production",
    });

    response.json({ ok: true, message: "Logged out." });
  });

  return router;
}

module.exports = { createAuthRouter };
