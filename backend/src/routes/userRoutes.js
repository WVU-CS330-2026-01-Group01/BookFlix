const express = require("express");
const { getPool } = require("../config/database");

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

  return router;
}

module.exports = { createUserRouter };