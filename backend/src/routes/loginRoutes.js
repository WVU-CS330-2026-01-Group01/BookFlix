const express = require("express");
const { getPool } = require("../config/database");

function createLoginRouter() {
  const router = express.Router();

  router.post("/login", async (request, response) => {
    try {
      const { username, password } = request.body;

      const [users] = await getPool().execute(
        `SELECT username FROM pair_data.user WHERE username = ? AND password = ?`,
        [username, password]
      );
      if (users.length === 0) {
        return response.status(401).json({ error: "Invalid username or password" });
      }

      response.json({ ok: true, username: users[0].username });
    } catch (error) {
      console.error("DB error:", error);
      response.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = { createLoginRouter };