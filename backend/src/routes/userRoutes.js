const express = require("express");
const { getPool } = require("../config/database");
const { authMiddleware } = require("../middleware/authMiddleware");

function createUserRouter() {
  const router = express.Router();

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