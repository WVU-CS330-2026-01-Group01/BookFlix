const express = require("express");
const { getPool } = require("../config/database");
const { authMiddleware } = require("../middleware/authMiddleware");

function createUserRouter() {
  const router = express.Router();

  // get and update user bio (stored in authdb.users.bio, VARCHAR 500)
  router.get("/bio", authMiddleware, async (request, response) => {
    try {
      const [rows] = await getPool().execute(
        'SELECT bio FROM authdb.users WHERE username = ?',
        [request.user.username]
      );
      response.json({ ok: true, bio: rows[0]?.bio ?? "" });
    } catch (error) {
      console.error("DB error:", error);
      response.status(500).json({ error: error.message });
    }
  });

  router.post("/bio", authMiddleware, async (request, response) => {
    try {
      await getPool().execute(
        'UPDATE authdb.users SET bio = ? WHERE username = ?',
        [request.body.bio ?? "", request.user.username]
      );
      response.json({ ok: true });
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