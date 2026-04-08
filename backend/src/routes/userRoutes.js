const express = require("express");
const { getPool } = require("../config/database");
const { authMiddleware } = require("../middleware/authMiddleware");
const { request } = require("../app");

function createUserRouter() {
  const router = express.Router();

  router.post("/signup", async (request, response) => {
    try {
      const { username, email, password } = request.body;

      const [existing] = await getPool().execute(
        `SELECT username FROM pair_data.user WHERE username = ? OR email = ?`,
        [username, email]
      );
      if (existing.length > 0) {
        return response.status(400).json({ error: "Username or email already exists" });
      }
    

      const [result] = await getPool().execute(
        `INSERT INTO pair_data.user (username, email, password) VALUES (?, ?, ?)`,
        [username, email, password]
      );
      response.json({ ok: true, userId: result.insertId });
    } catch (error) {
      console.error("DB error:", error);
      response.status(500).json({ error: error.message });
    }
  });

  router.post("/pfp", authMiddleware, async (request, response) => {
    try { 
      await getPool().execute(
        'UPDATE authdb.users SET pfp_index = ? WHERE username = ?',
        [request.body.pfp_index, request.user.username]
       );
      response.json({ ok: true });
    } catch (error) {
      console.error("DB error:", error);
      response.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = { createUserRouter };